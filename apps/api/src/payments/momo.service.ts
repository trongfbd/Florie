import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentMethod } from '@prisma/client';
import type {
  CreatePaymentUrlParams,
  PaymentCallbackResult,
  PaymentGatewayService,
} from './payment-gateway.interface';

interface MomoCreateResponse {
  payUrl?: string;
  message?: string;
  resultCode?: number;
}

interface MomoIpnPayload {
  partnerCode?: string;
  orderId?: string;
  requestId?: string;
  amount?: number | string;
  orderInfo?: string;
  orderType?: string;
  transId?: number | string;
  resultCode?: number | string;
  message?: string;
  payType?: string;
  responseTime?: number | string;
  extraData?: string;
  signature?: string;
}

/**
 * MoMo (https://business.momo.vn, sandbox under "Test") — wallet-based
 * payment popular with younger customers. Get sandbox MOMO_PARTNER_CODE /
 * MOMO_ACCESS_KEY / MOMO_SECRET_KEY from their test merchant portal. Left
 * blank, isConfigured() is false and this gateway is refused at checkout —
 * same "not configured" pattern as GeminiService.
 */
@Injectable()
export class MomoService implements PaymentGatewayService {
  readonly provider = PaymentMethod.MOMO;
  private readonly logger = new Logger(MomoService.name);

  private readonly partnerCode?: string;
  private readonly accessKey?: string;
  private readonly secretKey?: string;
  private readonly endpoint: string;
  private readonly webUrl: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.partnerCode =
      this.configService.get<string>('MOMO_PARTNER_CODE') || undefined;
    this.accessKey =
      this.configService.get<string>('MOMO_ACCESS_KEY') || undefined;
    this.secretKey =
      this.configService.get<string>('MOMO_SECRET_KEY') || undefined;
    this.endpoint = this.configService.get<string>(
      'MOMO_ENDPOINT',
      'https://test-payment.momo.vn/v2/gateway/api/create',
    );
    this.webUrl = this.configService.get<string>(
      'WEB_PUBLIC_URL',
      'http://localhost:3000',
    );
    this.apiUrl = this.configService.get<string>(
      'API_PUBLIC_URL',
      'http://localhost:4000',
    );
  }

  isConfigured(): boolean {
    return !!this.partnerCode && !!this.accessKey && !!this.secretKey;
  }

  async createPaymentUrl({
    orderNumber,
    amount,
    orderInfo,
  }: CreatePaymentUrlParams): Promise<string> {
    const requestId = `${orderNumber}-${Date.now()}`;
    const redirectUrl = `${this.webUrl}/dat-hang-thanh-cong/${orderNumber}`;
    const ipnUrl = `${this.apiUrl}/api/v1/payments/momo/ipn`;
    const requestType = 'captureWallet';
    const extraData = '';
    const roundedAmount = Math.round(amount);

    // Field order here is fixed by MoMo's spec — do not reorder.
    const rawSignature =
      `accessKey=${this.accessKey}&amount=${roundedAmount}&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}&orderId=${orderNumber}&orderInfo=${orderInfo}` +
      `&partnerCode=${this.partnerCode}&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey!)
      .update(rawSignature)
      .digest('hex');

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerCode: this.partnerCode,
        accessKey: this.accessKey,
        requestId,
        amount: String(roundedAmount),
        orderId: orderNumber,
        orderInfo,
        redirectUrl,
        ipnUrl,
        extraData,
        requestType,
        signature,
        lang: 'vi',
      }),
    });

    const data = (await response.json()) as MomoCreateResponse;
    if (!data.payUrl) {
      this.logger.warn(
        `MoMo create failed for ${orderNumber}: ${data.message}`,
      );
      throw new Error(data.message ?? 'Không tạo được link thanh toán MoMo');
    }
    return data.payUrl;
  }

  /** Verifies the signature on an IPN POST body and reports the outcome. */
  verifyIpn(body: MomoIpnPayload): PaymentCallbackResult {
    // Field order here is fixed by MoMo's IPN spec — different from the
    // create-request signature above. Do not reorder.
    const raw =
      `accessKey=${this.accessKey}&amount=${body.amount}&extraData=${body.extraData}` +
      `&message=${body.message}&orderId=${body.orderId}&orderInfo=${body.orderInfo}` +
      `&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}` +
      `&requestId=${body.requestId}&responseTime=${body.responseTime}` +
      `&resultCode=${body.resultCode}&transId=${body.transId}`;
    const expected = crypto
      .createHmac('sha256', this.secretKey ?? '')
      .update(raw)
      .digest('hex');

    const validSignature = !!body.signature && expected === body.signature;
    const success = validSignature && Number(body.resultCode) === 0;

    return {
      orderNumber: body.orderId ?? '',
      success,
      transactionRef: String(body.transId ?? ''),
      message: validSignature ? 'OK' : 'Invalid signature',
    };
  }
}
