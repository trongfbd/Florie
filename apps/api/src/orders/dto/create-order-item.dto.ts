import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateOrderItemDto {
  @ApiPropertyOptional({ description: 'Exactly one of productId/comboId is required' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Exactly one of productId/comboId is required' })
  @IsOptional()
  @IsString()
  comboId?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;
}
