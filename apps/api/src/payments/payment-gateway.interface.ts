import { PaymentMethod } from '@prisma/client';

export interface CreatePaymentUrlParams {
  orderNumber: string;
  amount: number; // VND, whole units (not x100)
  orderInfo: string;
  ipAddr: string;
}

export interface PaymentCallbackResult {
  orderNumber: string;
  success: boolean;
  transactionRef: string;
  message: string;
}

// One implementation per gateway (VnpayService, MomoService, ZalopayService)
// — mirrors the StorageService interface pattern (apps/api/src/storage) so
// a new gateway is a new class, not a change to existing call sites.
export interface PaymentGatewayService {
  readonly provider: PaymentMethod;
  isConfigured(): boolean;
  createPaymentUrl(params: CreatePaymentUrlParams): Promise<string> | string;
}
