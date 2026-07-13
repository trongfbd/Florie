import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum GenerateContentType {
  PRODUCT_DESCRIPTION = 'PRODUCT_DESCRIPTION',
  BLOG_POST = 'BLOG_POST',
}

export class GenerateContentDto {
  @ApiProperty({ enum: GenerateContentType })
  @IsEnum(GenerateContentType)
  contentType: GenerateContentType;

  @ApiProperty({ description: 'Tên sản phẩm hoặc chủ đề bài viết', example: 'Bó hoa hồng đỏ Valentine' })
  @IsString()
  @MinLength(2)
  topic: string;

  @ApiPropertyOptional({ description: 'Từ khoá/ý muốn nhấn mạnh, cách nhau bởi dấu phẩy' })
  @IsOptional()
  @IsString()
  keywords?: string;
}
