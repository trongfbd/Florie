import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { VnpayService } from './vnpay.service';
import { MomoService } from './momo.service';
import { ZalopayService } from './zalopay.service';
import type {
  CreatePaymentUrlParams,
  PaymentGatewayService,
} from './payment-gateway.interface';

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: 'COD',
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
  ZALOPAY: 'ZaloPay',
};

@Injectable()
export class PaymentsService {
  private readonly gateways: Map<PaymentMethod, PaymentGatewayService>;

  constructor(vnpay: VnpayService, momo: MomoService, zalopay: ZalopayService) {
    this.gateways = new Map<PaymentMethod, PaymentGatewayService>([
      [PaymentMethod.VNPAY, vnpay],
      [PaymentMethod.MOMO, momo],
      [PaymentMethod.ZALOPAY, zalopay],
    ]);
  }

  isOnlineMethod(method: PaymentMethod): boolean {
    return this.gateways.has(method);
  }

  getGateway(method: PaymentMethod): PaymentGatewayService | undefined {
    return this.gateways.get(method);
  }

  /** Throws a clean 503 if `method` is online but not configured — call this
   *  BEFORE creating an order, so an unusable gateway never leaves an
   *  orphaned order behind with no way to pay it. */
  assertAvailable(method: PaymentMethod): void {
    const gateway = this.gateways.get(method);
    if (gateway && !gateway.isConfigured()) {
      throw new ServiceUnavailableException(
        `Cổng thanh toán ${PAYMENT_METHOD_LABELS[method]} chưa được cấu hình trên máy chủ`,
      );
    }
  }

  async createPaymentUrl(
    method: PaymentMethod,
    params: CreatePaymentUrlParams,
  ): Promise<string> {
    const gateway = this.gateways.get(method);
    if (!gateway) {
      throw new Error(`Không hỗ trợ phương thức thanh toán ${method}`);
    }
    this.assertAvailable(method);
    return gateway.createPaymentUrl(params);
  }
}
