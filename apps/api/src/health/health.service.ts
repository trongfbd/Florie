import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthResponseDto> {
    const database = await this.pingDatabase();

    return {
      status: database === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      service: 'florie-api',
      database,
    };
  }

  private async pingDatabase(): Promise<'connected' | 'disconnected'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'connected';
    } catch (error) {
      this.logger.error(
        'Database health check failed',
        error instanceof Error ? error.stack : String(error),
      );
      return 'disconnected';
    }
  }
}
