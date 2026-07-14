import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import {
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
