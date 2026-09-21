import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UpdateItemCostPriceDto {
  @ApiProperty({ description: 'VND — giá vốn của mục này trong đơn' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  costPrice: number;
}
