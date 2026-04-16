export type InitOnlinePaymentInput = {
  orderId: string;
  amount: number;
  orderDescription: string;
  returnUrl: string;
  ipnUrl?: string;
  clientIp?: string;
};

export type InitOnlinePaymentResult = {
  redirectUrl: string;
};

export interface IPaymentGatewayStrategy {
  readonly gatewayCode: string;
  buildPaymentUrl(input: InitOnlinePaymentInput): Promise<InitOnlinePaymentResult>;
}
