import { crmClient } from '@/lib/client';
import { API_CONFIG, buildQueryString } from '@/lib/apiConfig';
import {
  Payment,
  PaymentsResponse,
  PaymentsQueryParams,
  CreatePaymentPayload,
  UpdatePaymentPayload,
} from '@/types/paymentTypes';

class PaymentService {
  async getPayments(params?: PaymentsQueryParams): Promise<PaymentsResponse> {
    try {
      const queryString = buildQueryString(params);
      const response = await crmClient.get<PaymentsResponse>(
        `${API_CONFIG.PAYMENTS_ADHOC.LIST}${queryString}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch payments';
      throw new Error(message);
    }
  }

  async getPayment(id: number): Promise<Payment> {
    try {
      const response = await crmClient.get<Payment>(
        API_CONFIG.PAYMENTS_ADHOC.DETAIL.replace(':id', id.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch payment';
      throw new Error(message);
    }
  }

  async createPayment(data: CreatePaymentPayload): Promise<Payment> {
    try {
      const response = await crmClient.post<Payment>(
        API_CONFIG.PAYMENTS_ADHOC.CREATE,
        data
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create payment';
      throw new Error(message);
    }
  }

  async updatePayment(id: number, data: UpdatePaymentPayload): Promise<Payment> {
    try {
      const response = await crmClient.patch<Payment>(
        API_CONFIG.PAYMENTS_ADHOC.UPDATE.replace(':id', id.toString()),
        data
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update payment';
      throw new Error(message);
    }
  }
}

export const paymentService = new PaymentService();
