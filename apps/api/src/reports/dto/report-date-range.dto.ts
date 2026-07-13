import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ReportDateRangeDto {
  @ApiPropertyOptional({ description: 'Mặc định 30 ngày gần nhất nếu bỏ trống' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Mặc định là hôm nay nếu bỏ trống' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
