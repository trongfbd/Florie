import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CustomerJwtAuthGuard } from '../customer-auth/guards/customer-jwt-auth.guard';
import { CurrentCustomer } from '../customer-auth/decorators/current-customer.decorator';
import type { AuthenticatedCustomer } from '../customer-auth/types/customer-jwt-payload.type';
import { VoucherClaimsService } from './voucher-claims.service';

@ApiTags('voucher-claims')
@Public()
@UseGuards(CustomerJwtAuthGuard)
@Controller('storefront/vouchers')
export class VoucherClaimsController {
  constructor(private readonly voucherClaimsService: VoucherClaimsService) {}

  @Post('claim/:popupId')
  @ApiOperation({ summary: 'Nhận voucher từ popup khuyến mãi vào tài khoản (yêu cầu đăng nhập)' })
  claim(@Param('popupId') popupId: string, @CurrentCustomer() customer: AuthenticatedCustomer) {
    return this.voucherClaimsService.claim(popupId, customer.id);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Danh sách voucher đã nhận vào tài khoản' })
  mine(@CurrentCustomer() customer: AuthenticatedCustomer) {
    return this.voucherClaimsService.listForCustomer(customer.id);
  }
}
