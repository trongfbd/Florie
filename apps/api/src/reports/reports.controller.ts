import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportDateRangeDto } from './dto/report-date-range.dto';
import { RevenueSeriesQueryDto } from './dto/revenue-series-query.dto';
import { TopProductsQueryDto } from './dto/top-products-query.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Tổng quan doanh thu/chi phí/lợi nhuận trong khoảng thời gian' })
  getSummary(@Query() query: ReportDateRangeDto) {
    return this.reportsService.getSummary(query);
  }

  @Get('revenue-series')
  @ApiOperation({ summary: 'Doanh thu theo thời gian (ngày/tuần/tháng) — dữ liệu cho biểu đồ' })
  getRevenueSeries(@Query() query: RevenueSeriesQueryDto) {
    return this.reportsService.getRevenueSeries(query);
  }

  @Get('expenses-by-category')
  @ApiOperation({ summary: 'Tổng chi phí theo từng hạng mục' })
  getExpensesByCategory(@Query() query: ReportDateRangeDto) {
    return this.reportsService.getExpensesByCategory(query);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Sản phẩm bán chạy nhất theo số lượng' })
  getTopProducts(@Query() query: TopProductsQueryDto) {
    return this.reportsService.getTopProducts(query);
  }

  @Get('order-status-breakdown')
  @ApiOperation({ summary: 'Số lượng đơn hàng theo từng trạng thái' })
  getOrderStatusBreakdown(@Query() query: ReportDateRangeDto) {
    return this.reportsService.getOrderStatusBreakdown(query);
  }
}
