// Ad-hoc Payment Types based on Real Estate Backend API

export enum PaymentTypeEnum {
  INVOICE = 'INVOICE',
  REFUND = 'REFUND',
  ADVANCE = 'ADVANCE',
  OTHER = 'OTHER',
}

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  CLEARED = 'CLEARED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export const PAYMENT_TYPE_LABELS: Record<PaymentTypeEnum, string> = {
  [PaymentTypeEnum.INVOICE]: 'Invoice',
  [PaymentTypeEnum.REFUND]: 'Refund',
  [PaymentTypeEnum.ADVANCE]: 'Advance',
  [PaymentTypeEnum.OTHER]: 'Other',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatusEnum, string> = {
  [PaymentStatusEnum.PENDING]: '#F59E0B',
  [PaymentStatusEnum.CLEARED]: '#22C55E',
  [PaymentStatusEnum.FAILED]: '#EF4444',
  [PaymentStatusEnum.CANCELLED]: '#6B7280',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatusEnum, string> = {
  [PaymentStatusEnum.PENDING]: 'Pending',
  [PaymentStatusEnum.CLEARED]: 'Cleared',
  [PaymentStatusEnum.FAILED]: 'Failed',
  [PaymentStatusEnum.CANCELLED]: 'Cancelled',
};

export interface Payment {
  id: number;
  lead?: number;
  lead_name?: string;
  booking?: number;
  amount: string;
  type: PaymentTypeEnum;
  status: PaymentStatusEnum;
  reference_no?: string;
  notes?: string;
  payment_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Payment[];
}

export interface PaymentsQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  type?: PaymentTypeEnum;
  status?: PaymentStatusEnum;
  lead?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface CreatePaymentPayload {
  lead?: number;
  booking?: number;
  amount: string;
  type: PaymentTypeEnum;
  status?: PaymentStatusEnum;
  reference_no?: string;
  notes?: string;
  payment_date?: string;
}

export interface UpdatePaymentPayload extends Partial<CreatePaymentPayload> {}
