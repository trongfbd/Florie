import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BannerPosition } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({ example: 'Khuyến mãi 8/3' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ enum: BannerPosition, default: BannerPosition.HOME })
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endAt?: string;
}
