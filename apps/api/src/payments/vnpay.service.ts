import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentMethod } from '@prisma/client';
import type {
  CreatePaymentUrlParams,
  PaymentCallbackResult,
  PaymentGatewayService,
} from './payment-gateway.interface';

function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = obj[key];
  }
  return sorted;
}

function formatVnpayDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

/**
 * VNPay (https://sandbox.vnpayment.vn) — the most common gateway for
 * Vietnamese SMEs. Get sandbox VNPAY_TMN_CODE / VNPAY_HASH_SECRET at
 * sandbox.vnpayment.vn (free, no business verification needed for sandbox).
 * Left blank, isConfigured() is false and PaymentsService refuses to build
 * a payment URL for this method — same "not configured" pattern as
 * GeminiService.
 */
@Injectable()
export class VnpayService implements PaymentGatewayService {
  readonly provider = PaymentMethod.VNPAY;

  private readonly tmnCode?: string;
  private readonly hashSecret?: string;
  private readonly payUrl: string;
  private readonly webUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.tmnCode =
      this.configService.get<string>('VNPAY_TMN_CODE') || undefined;
    this.hashSecret =
      this.configService.get<string>('VNPAY_HASH_SECRET') || undefined;
    this.payUrl = this.configService.get<string>(
      'VNPAY_PAY_URL',
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    );
    this.webUrl = this.configService.get<string>(
      'WEB_PUBLIC_URL',
      'http://localhost:3000',
    );
  }

  isConfigured(): boolean {
    return !!this.tmnCode && !!this.hashSecret;
  }

  createPaymentUrl({
    orderNumber,
    amount,
    orderInfo,
    ipAddr,
  }: CreatePaymentUrlParams): string {
    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode!,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderNumber,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: String(Math.round(amount) * 100),
      vnp_ReturnUrl: `${this.webUrl}/dat-hang-thanh-cong/${orderNumber}`,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: formatVnpayDate(new Date()),
    };

    const sorted = sortObject(params);
    const signData = new URLSearchParams(sorted).toString();
    const secureHash = crypto
      .createHmac('sha512', this.hashSecret!)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    const query = new URLSearchParams({
      ...sorted,
      vnp_SecureHash: secureHash,
    });
    return `${this.payUrl}?${query.toString()}`;
  }

  /** Verifies the signature on an IPN/return query and reports the outcome. */
  verifyCallback(query: Record<string, string>): PaymentCallbackResult {
    const { vnp_SecureHash, ...rest } = query;
    delete rest.vnp_SecureHashType;
    const sorted = sortObject(rest);
    const signData = new URLSearchParams(sorted).toString();
    const expected = crypto
      .createHmac('sha512', this.hashSecret ?? '')
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    const validSignature = !!vnp_SecureHash && expected === vnp_SecureHash;
    const success =
      validSignature &&
      query.vnp_ResponseCode === '00' &&
      query.vnp_TransactionStatus === '00';

    return {
      orderNumber: query.vnp_TxnRef ?? '',
      success,
      transactionRef: query.vnp_TransactionNo ?? '',
      message: validSignature ? 'OK' : 'Invalid signature',
    };
  }
}
