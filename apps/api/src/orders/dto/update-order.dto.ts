import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * Only logistics fields are editable after creation. Items/pricing/voucher
 * are fixed at creation time; status changes go through the dedicated
 * status-transition endpoint so stock/customer side effects stay consistent.
 */
export class UpdateOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

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
}
