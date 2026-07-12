import { randomUUID } from 'crypto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import {
  StorageService,
  UploadedFile,
  UploadFileParams,
} from './storage.service.interface';

@Injectable()
export class MinioStorageService implements StorageService, OnModuleInit {
  private readonly logger = new Logger(MinioStorageService.name);
  private readonly client: Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>('MINIO_BUCKET');
    this.publicUrl = this.configService.getOrThrow<string>('MINIO_PUBLIC_URL');

    this.client = new Client({
      endPoint: this.configService.getOrThrow<string>('MINIO_ENDPOINT'),
      port: this.configService.get<number>('MINIO_PORT', 9000),
      useSSL: this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.getOrThrow<string>('MINIO_ROOT_USER'),
      secretKey: this.configService.getOrThrow<string>('MINIO_ROOT_PASSWORD'),
    });
  }

  async onModuleInit(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket).catch(() => false);
    if (!exists) {
      this.logger.warn(
        `Bucket "${this.bucket}" not found — it should have been created by docker-compose's minio-init service.`,
      );
    }
  }

  async upload({ buffer, originalName, mimeType, folder }: UploadFileParams): Promise<UploadedFile> {
    const extension = originalName.includes('.') ? originalName.split('.').pop() : '';
    const key = `${folder}/${randomUUID()}${extension ? `.${extension}` : ''}`;

    await this.client.putObject(this.bucket, key, buffer, buffer.length, {
      'Content-Type': mimeType,
    });

    return { key, url: `${this.publicUrl}/${this.bucket}/${key}` };
  }

  async delete(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }
}
