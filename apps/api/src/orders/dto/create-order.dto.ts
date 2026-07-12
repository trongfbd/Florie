import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { OrderSource, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Existing customer account, if any' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Required when customerId is omitted (guest order)' })
  @IsOptional()
  @IsString()
  guestName?: string;

  @ApiPropertyOptional({ description: 'Required when customerId is omitted (guest order)' })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @ApiProperty()
  @IsString()
  recipientName: string;

  @ApiProperty()
  @IsString()
  recipientPhone: string;

  @ApiProperty()
  @IsString()
  deliveryAddress: string;

  @ApiProperty()
  @IsDateString()
  deliveryDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardMessage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.COD })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ default: 0, description: 'VND' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  shippingFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voucherCode?: string;

  @ApiPropertyOptional({ enum: OrderSource, default: OrderSource.DIRECT })
  @IsOptional()
  @IsEnum(OrderSource)
  source?: OrderSource;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1)
  items: CreateOrderItemDto[];
}
