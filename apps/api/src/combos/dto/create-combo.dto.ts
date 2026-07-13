import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ComboItemInputDto } from './combo-item-input.dto';

export class CreateComboDto {
  @ApiProperty({ example: 'Combo Sinh Nhật Rực Rỡ' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ description: 'Auto-generated from name if omitted' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Giá bán combo (VND)' })
  @IsInt()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: [ComboItemInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ComboItemInputDto)
  items: ComboItemInputDto[];
}
