import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

const SORTABLE_FIELDS = ['createdAt'] as const;
export type PopupSortField = (typeof SORTABLE_FIELDS)[number];

export class QueryPopupDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  sortBy: PopupSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
