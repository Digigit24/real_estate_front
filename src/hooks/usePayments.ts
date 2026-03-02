import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { paymentService } from '@/services/paymentService';
import {
  Payment,
  PaymentsResponse,
  PaymentsQueryParams,
  CreatePaymentPayload,
  UpdatePaymentPayload,
} from '@/types/paymentTypes';

export const usePayments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usePaymentsList = (params?: PaymentsQueryParams) => {
    return useSWR<PaymentsResponse>(
      ['payments', params],
      () => paymentService.getPayments(params),
      {
        revalidateOnFocus: false,
        keepPreviousData: true,
        onError: (err) => setError(err.message),
      }
    );
  };

  const usePayment = (id: number | null) => {
    return useSWR<Payment>(
      id ? ['payment', id] : null,
      () => paymentService.getPayment(id!),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const createPayment = useCallback(async (data: CreatePaymentPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await paymentService.createPayment(data);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePayment = useCallback(async (id: number, data: UpdatePaymentPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await paymentService.updatePayment(id, data);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    usePaymentsList,
    usePayment,
    createPayment,
    updatePayment,
  };
};
