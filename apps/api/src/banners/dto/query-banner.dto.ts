import { ApiPropertyOptional } from '@nestjs/swagger';
import { BannerPosition } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

const SORTABLE_FIELDS = ['displayOrder', 'createdAt'] as const;
export type BannerSortField = (typeof SORTABLE_FIELDS)[number];

export class QueryBannerDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: BannerPosition })
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'displayOrder' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  sortBy: BannerSortField = 'displayOrder';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'asc';
}
