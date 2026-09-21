import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiPropertyOptional({
    description: 'Exactly one of productId/comboId/customName is required',
  })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Exactly one of productId/comboId/customName is required',
  })
  @IsOptional()
  @IsString()
  comboId?: string;

  @ApiPropertyOptional({
    description:
      'Custom line item name (e.g. "Bó hoa theo mẫu khách gửi") — admin-created orders only, rejected on the public storefront checkout',
  })
  @IsOptional()
  @IsString()
  customName?: string;

  @ApiPropertyOptional({
    description: 'VND — required together with customName',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  customPrice?: number;

  @ApiPropertyOptional({
    description: 'VND — giá vốn, dùng để tính lợi nhuận gộp ở Reports, không bắt buộc',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  customCostPrice?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;
}
