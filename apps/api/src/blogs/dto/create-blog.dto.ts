import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ example: 'Cách bảo quản hoa tươi lâu hơn' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiPropertyOptional({ description: 'Auto-generated from title if omitted' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'Nội dung dạng Markdown' })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string;

  @ApiPropertyOptional({ enum: BlogStatus, default: BlogStatus.DRAFT })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;
}
