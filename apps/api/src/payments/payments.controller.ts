import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { VnpayService } from './vnpay.service';
import { MomoService } from './momo.service';
import { ZalopayService } from './zalopay.service';
import type { PaymentCallbackResult } from './payment-gateway.interface';

// Server-to-server (and browser return) endpoints the gateways call
// directly — never shown in Swagger, always @Public() since the gateway
// has no JWT of ours.
@ApiExcludeController()
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vnpay: VnpayService,
    private readonly momo: MomoService,
    private readonly zalopay: ZalopayService,
  ) {}

  @Public()
  @Get('vnpay/ipn')
  async vnpayIpn(@Query() query: Record<string, string>) {
    const result = this.vnpay.verifyCallback(query);

    if (!result.orderNumber) {
      return { RspCode: '01', Message: 'Order not found' };
    }

    const order = await this.prisma.order.findUnique({
      where: { orderNumber: result.orderNumber },
      select: { total: true, paymentStatus: true },
    });
    if (!order) {
      return { RspCode: '01', Message: 'Order not found' };
    }
    if (!result.success) {
      return { RspCode: '97', Message: 'Invalid signature' };
    }

    const vnpAmount = Number(query.vnp_Amount ?? 0) / 100;
    if (Math.round(vnpAmount) !== order.total) {
      return { RspCode: '04', Message: 'Invalid amount' };
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      return { RspCode: '02', Message: 'Order already confirmed' };
    }

    await this.markPaid(result);
    return { RspCode: '00', Message: 'Confirm Success' };
  }

  @Public()
  @Post('momo/ipn')
  @HttpCode(204)
  async momoIpn(@Body() body: Record<string, unknown>) {
    const result = this.momo.verifyIpn(body);
    await this.markPaid(result);
  }

  @Public()
  @Post('zalopay/callback')
  async zalopayCallback(@Body() body: { data?: string; mac?: string }) {
    const result = this.zalopay.verifyCallback(body);
    await this.markPaid(result);
    return result.success
      ? { return_code: 1, return_message: 'success' }
      : { return_code: 0, return_message: result.message };
  }

  private async markPaid(result: PaymentCallbackResult): Promise<void> {
    if (!result.success || !result.orderNumber) return;
    // updateMany (not update) so an unknown orderNumber or an already-PAID
    // order — a gateway retry, e.g. — is a silent no-op, not a 404 crash.
    await this.prisma.order.updateMany({
      where: {
        orderNumber: result.orderNumber,
        paymentStatus: { not: PaymentStatus.PAID },
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paymentTransactionRef: result.transactionRef,
      },
    });
  }
}
