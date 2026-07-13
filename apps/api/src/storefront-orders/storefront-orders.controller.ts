import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CustomerJwtAuthGuard } from '../customer-auth/guards/customer-jwt-auth.guard';
import { OptionalCustomerAuthGuard } from '../customer-auth/guards/optional-customer-auth.guard';
import { CurrentCustomer } from '../customer-auth/decorators/current-customer.decorator';
import type { AuthenticatedCustomer } from '../customer-auth/types/customer-jwt-payload.type';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { StorefrontOrdersService } from './storefront-orders.service';
import { CreateStorefrontOrderDto } from './dto/create-storefront-order.dto';
import { TrackOrderDto } from './dto/track-order.dto';

@ApiTags('storefront-orders')
@Controller('storefront/orders')
export class StorefrontOrdersController {
  constructor(private readonly storefrontOrdersService: StorefrontOrdersService) {}

  @Public()
  @UseGuards(OptionalCustomerAuthGuard)
  @Post()
  @ApiOperation({ summary: '[Public] Đặt hàng — hoạt động cho cả khách vãng lai và khách đã đăng nhập' })
  create(
    @Body() dto: CreateStorefrontOrderDto,
    @CurrentCustomer() customer: AuthenticatedCustomer | undefined,
  ) {
    return this.storefrontOrdersService.create(dto, customer);
  }

  @Public()
  @Get('track')
  @ApiOperation({ summary: '[Public] Tra cứu đơn hàng bằng mã đơn + số điện thoại' })
  track(@Query() dto: TrackOrderDto) {
    return this.storefrontOrdersService.track(dto);
  }

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Get('mine')
  @ApiOperation({ summary: 'Lịch sử đơn hàng của khách đang đăng nhập' })
  myOrders(@CurrentCustomer() customer: AuthenticatedCustomer, @Query() query: PaginationQueryDto) {
    return this.storefrontOrdersService.myOrders(customer.id, query);
  }
}
