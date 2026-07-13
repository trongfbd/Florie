import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FlashSaleItemInputDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Giá sale (VND)' })
  @IsInt()
  @Min(0)
  salePrice: number;

  @ApiPropertyOptional({ description: 'Giới hạn số lượng bán với giá sale — để trống là không giới hạn' })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantityLimit?: number;
}
