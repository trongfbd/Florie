import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderChannel, OrderStatus, PaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

const SORTABLE_FIELDS = ['createdAt', 'deliveryDate', 'total'] as const;
export type OrderSortField = (typeof SORTABLE_FIELDS)[number];

export class QueryOrderDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by order number, recipient name, or phone',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ enum: OrderChannel })
  @IsOptional()
  @IsEnum(OrderChannel)
  channel?: OrderChannel;

  @ApiPropertyOptional({
    description:
      'Only orders past their deliveryDate that are not COMPLETED/CANCELLED/DELIVERY_FAILED. Takes precedence over deliveryDateFrom/To and status when combined.',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  overdue?: boolean;

  @ApiPropertyOptional({
    description: 'Only orders not yet fully PAID (UNPAID or DEPOSITED)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unpaidOnly?: boolean;

  @ApiPropertyOptional({
    description:
      'Only orders with at least one item missing a cost price (costPrice)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  missingCostPrice?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({
    description: 'Filter orders that applied this voucher',
  })
  @IsOptional()
  @IsString()
  voucherId?: string;

  @ApiPropertyOptional({ description: 'Delivery date range start (inclusive)' })
  @IsOptional()
  @IsDateString()
  deliveryDateFrom?: string;

  @ApiPropertyOptional({ description: 'Delivery date range end (inclusive)' })
  @IsOptional()
  @IsDateString()
  deliveryDateTo?: string;

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  sortBy: OrderSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
