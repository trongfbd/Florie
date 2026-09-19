import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentMethod } from '@prisma/client';
import type {
  CreatePaymentUrlParams,
  PaymentCallbackResult,
  PaymentGatewayService,
} from './payment-gateway.interface';

interface ZalopayCreateResponse {
  return_code: number;
  return_message: string;
  order_url?: string;
}

function formatYyMmDd(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(date.getFullYear()).slice(2)}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

/**
 * ZaloPay (https://sb-openapi.zalopay.vn sandbox) — fits well alongside the
 * Zalo chat channel this shop already uses. Get sandbox ZALOPAY_APP_ID /
 * ZALOPAY_KEY1 / ZALOPAY_KEY2 from their sandbox portal; the callback URL
 * (apiUrl + /api/v1/payments/zalopay/callback) also needs to be registered
 * in the ZaloPay merchant dashboard itself, not just here — ZaloPay doesn't
 * accept it per-request the way VNPay/MoMo do. Left blank, isConfigured()
 * is false and this gateway is refused at checkout.
 */
@Injectable()
export class ZalopayService implements PaymentGatewayService {
  readonly provider = PaymentMethod.ZALOPAY;
  private readonly logger = new Logger(ZalopayService.name);

  private readonly appId?: string;
  private readonly key1?: string;
  private readonly key2?: string;
  private readonly endpoint: string;
  private readonly webUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get<string>('ZALOPAY_APP_ID') || undefined;
    this.key1 = this.configService.get<string>('ZALOPAY_KEY1') || undefined;
    this.key2 = this.configService.get<string>('ZALOPAY_KEY2') || undefined;
    this.endpoint = this.configService.get<string>(
      'ZALOPAY_ENDPOINT',
      'https://sb-openapi.zalopay.vn/v2/create',
    );
    this.webUrl = this.configService.get<string>(
      'WEB_PUBLIC_URL',
      'http://localhost:3000',
    );
  }

  isConfigured(): boolean {
    return !!this.appId && !!this.key1 && !!this.key2;
  }

  async createPaymentUrl({
    orderNumber,
    amount,
    orderInfo,
  }: CreatePaymentUrlParams): Promise<string> {
    const appTransId = `${formatYyMmDd(new Date())}_${orderNumber}`;
    const appTime = Date.now();
    const item = '[]';
    const embedData = JSON.stringify({
      redirecturl: `${this.webUrl}/dat-hang-thanh-cong/${orderNumber}`,
    });
    const roundedAmount = Math.round(amount);
    const appUser = 'guest';

    const macInput = `${this.appId}|${appTransId}|${appUser}|${roundedAmount}|${appTime}|${embedData}|${item}`;
    const mac = crypto
      .createHmac('sha256', this.key1!)
      .update(macInput)
      .digest('hex');

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        app_id: this.appId!,
        app_trans_id: appTransId,
        app_user: appUser,
        app_time: String(appTime),
        amount: String(roundedAmount),
        item,
        description: orderInfo,
        embed_data: embedData,
        bank_code: '',
        mac,
      }).toString(),
    });

    const data = (await response.json()) as ZalopayCreateResponse;
    if (data.return_code !== 1 || !data.order_url) {
      this.logger.warn(
        `ZaloPay create failed for ${orderNumber}: ${data.return_message}`,
      );
      throw new Error(
        data.return_message || 'Không tạo được link thanh toán ZaloPay',
      );
    }
    return data.order_url;
  }

  /** Verifies the mac on a callback POST body ({ data, mac }) and reports the outcome. */
  verifyCallback(body: { data?: string; mac?: string }): PaymentCallbackResult {
    const validSignature =
      !!body.data &&
      !!body.mac &&
      crypto
        .createHmac('sha256', this.key2 ?? '')
        .update(body.data)
        .digest('hex') === body.mac;

    if (!validSignature) {
      return {
        orderNumber: '',
        success: false,
        transactionRef: '',
        message: 'Invalid mac',
      };
    }

    const parsed = JSON.parse(body.data!) as {
      app_trans_id?: string;
      zp_trans_id?: number | string;
    };
    const appTransId = parsed.app_trans_id ?? '';
    const orderNumber = appTransId.includes('_')
      ? appTransId.split('_').slice(1).join('_')
      : appTransId;

    return {
      orderNumber,
      success: true,
      transactionRef: String(parsed.zp_trans_id ?? ''),
      message: 'OK',
    };
  }
}
