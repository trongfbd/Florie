import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class ImportMaterialDto {
  @ApiProperty({ description: 'Quantity received, in the material\'s unit' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'VND per unit' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  unitCost: number;

  @ApiPropertyOptional({ description: 'Defaults to the material\'s current supplier if omitted' })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
