import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ enum: ['ok', 'error'], example: 'ok' })
  status: 'ok' | 'error';

  @ApiProperty({ example: '2026-07-12T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 'florie-api' })
  service: string;

  @ApiProperty({ enum: ['connected', 'disconnected'], example: 'connected' })
  database: 'connected' | 'disconnected';
}
