import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import type { Response } from 'express';

@Injectable()
export class BackupsService {
  private readonly logger = new Logger(BackupsService.name);

  constructor(private readonly configService: ConfigService) {}

  /** libpq (pg_dump/psql) doesn't understand Prisma's `?schema=` query param — strip it. */
  private connectionString(): string {
    const raw = this.configService.getOrThrow<string>('DATABASE_URL');
    const url = new URL(raw);
    url.search = '';
    return url.toString();
  }

  streamDump(res: Response): void {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    const filename = `florie-backup-${timestamp}.sql`;

    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const child = spawn('pg_dump', [
      '--no-owner',
      '--no-privileges',
      '--clean',
      '--if-exists',
      this.connectionString(),
    ]);

    let stderr = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      this.logger.error(`pg_dump không thể khởi chạy: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({
          statusCode: 500,
          message: 'Không thể tạo bản sao lưu (pg_dump không khả dụng)',
        });
      } else {
        res.destroy();
      }
    });

    child.on('close', (code) => {
      if (code !== 0) {
        this.logger.error(
          `pg_dump thoát với mã ${code}: ${stderr.slice(0, 2000)}`,
        );
      }
      res.end();
    });

    child.stdout.pipe(res);
  }

  /**
   * pg_dump 17+ emits `SET transaction_timeout = 0;`, a parameter unknown to
   * PostgreSQL servers older than 17 (this project runs postgres:16-alpine).
   * Restoring a dump taken with a newer pg_dump client than the server
   * understands would otherwise abort on the very first statement.
   */
  private sanitizeForRestore(sqlBuffer: Buffer): Buffer {
    const sanitized = sqlBuffer
      .toString('utf-8')
      .replace(/^SET transaction_timeout = 0;\r?\n/m, '');
    return Buffer.from(sanitized, 'utf-8');
  }

  async restoreFromSql(sqlBuffer: Buffer): Promise<void> {
    const sanitized = this.sanitizeForRestore(sqlBuffer);

    return new Promise((resolve, reject) => {
      const child = spawn('psql', [
        this.connectionString(),
        '-v',
        'ON_ERROR_STOP=1',
      ]);

      let stderr = '';
      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.stdin.on('error', () => {
        // psql may close stdin early after ON_ERROR_STOP aborts; the real
        // failure reason is reported via the 'close' handler below.
      });

      child.on('error', (err) => {
        reject(
          new InternalServerErrorException(
            `Không thể chạy psql: ${err.message}`,
          ),
        );
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          this.logger.error(
            `psql restore thất bại (mã ${code}): ${stderr.slice(0, 4000)}`,
          );
          reject(
            new InternalServerErrorException(
              `Khôi phục thất bại, vui lòng kiểm tra file sao lưu. Chi tiết: ${stderr.slice(0, 500) || 'không rõ nguyên nhân'}`,
            ),
          );
        }
      });

      child.stdin.write(sanitized);
      child.stdin.end();
    });
  }
}
