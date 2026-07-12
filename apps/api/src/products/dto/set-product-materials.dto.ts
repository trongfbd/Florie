import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsNumber, IsPositive, IsString, ValidateNested } from 'class-validator';

export class ProductMaterialItemDto {
  @ApiProperty()
  @IsString()
  materialId: string;

  @ApiProperty({ description: 'Quantity per unit of product, in the material\'s unit' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class SetProductMaterialsDto {
  @ApiProperty({ type: [ProductMaterialItemDto], description: 'Replaces the entire BOM for this product' })
  @ValidateNested({ each: true })
  @Type(() => ProductMaterialItemDto)
  @ArrayMinSize(0)
  materials: ProductMaterialItemDto[];
}
