import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

const SORTABLE_FIELDS = ['name', 'startAt', 'endAt', 'createdAt'] as const;
export type FlashSaleSortField = (typeof SORTABLE_FIELDS)[number];

export class QueryFlashSaleDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'startAt' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  sortBy: FlashSaleSortField = 'startAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
