import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class UpdatePaymentDto {
  @ApiProperty({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({
    description: 'VND — set/update when marking as deposited',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  depositAmount?: number;
}
