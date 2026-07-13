import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

export class CreateVoucherDto {
  @ApiProperty({ example: 'FLORIE10' })
  @IsString()
  @MinLength(3)
  @Matches(/^[A-Z0-9_-]+$/, { message: 'Mã voucher chỉ gồm chữ hoa, số, - và _' })
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ description: 'Phần trăm (0-100) hoặc số tiền cố định (VND) tuỳ discountType' })
  @IsInt()
  @Min(1)
  discountValue: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({ description: 'Giảm tối đa (VND) — chỉ áp dụng cho loại PERCENTAGE' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiProperty()
  @IsDateString()
  startAt: string;

  @ApiProperty()
  @IsDateString()
  endAt: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
