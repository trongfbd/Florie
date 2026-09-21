import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AddOrderImageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altText?: string;
}
