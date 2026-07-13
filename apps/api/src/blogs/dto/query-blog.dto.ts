import { ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus } from '@prisma/client';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

const SORTABLE_FIELDS = ['title', 'publishedAt', 'createdAt'] as const;
export type BlogSortField = (typeof SORTABLE_FIELDS)[number];

export class QueryBlogDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by title' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: BlogStatus })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  sortBy: BlogSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
