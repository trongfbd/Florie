import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AddProductImageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altText?: string;
}
