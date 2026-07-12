import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { MaterialType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateMaterialDto {
  @ApiProperty({ example: 'Hoa hồng đỏ Ecuador' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: MaterialType })
  @IsEnum(MaterialType)
  type: MaterialType;

  @ApiProperty({ example: 'bông', description: 'Đơn vị tính: bó, cuộn, cái, mét...' })
  @IsString()
  unit: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStockThreshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
