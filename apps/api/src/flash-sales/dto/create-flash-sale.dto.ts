import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { FlashSaleItemInputDto } from './flash-sale-item-input.dto';

export class CreateFlashSaleDto {
  @ApiProperty({ example: 'Flash Sale 8/3' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsDateString()
  startAt: string;

  @ApiProperty()
  @IsDateString()
  endAt: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: [FlashSaleItemInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FlashSaleItemInputDto)
  items: FlashSaleItemInputDto[];
}
