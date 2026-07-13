import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { ReportDateRangeDto } from './report-date-range.dto';

const GROUP_BY_OPTIONS = ['day', 'week', 'month'] as const;
export type RevenueGroupBy = (typeof GROUP_BY_OPTIONS)[number];

export class RevenueSeriesQueryDto extends ReportDateRangeDto {
  @ApiPropertyOptional({ enum: GROUP_BY_OPTIONS, default: 'day' })
  @IsOptional()
  @IsIn(GROUP_BY_OPTIONS)
  groupBy: RevenueGroupBy = 'day';
}
