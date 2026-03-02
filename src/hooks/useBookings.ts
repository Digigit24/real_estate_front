// src/hooks/useBookings.ts
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { bookingService } from '@/services/bookingService';
import {
  Booking,
  BookingsResponse,
  BookingSummary,
  UpcomingPayment,
  PaymentMilestone,
  PaymentPlanTemplate,
  PaymentPlanTemplatesResponse,
  MilestonePreview,
  BookingsQueryParams,
  CreateBookingPayload,
  UpdateBookingPayload,
  MarkMilestonePaidPayload,
  CreatePaymentPlanTemplatePayload,
  UpdatePaymentPlanTemplatePayload,
  PreviewMilestonesPayload,
} from '@/types/bookingTypes';

export const useBookings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== BOOKINGS QUERIES ====================

  const useBookingsList = (params?: BookingsQueryParams) => {
    return useSWR<BookingsResponse>(
      ['bookings', params],
      () => bookingService.getBookings(params),
      {
        revalidateOnFocus: false,
        keepPreviousData: true,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useBooking = (id: number | null) => {
    return useSWR<Booking>(
      id ? ['booking', id] : null,
      () => bookingService.getBooking(id!),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useBookingSummary = () => {
    return useSWR<BookingSummary>(
      ['booking-summary'],
      () => bookingService.getBookingSummary(),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useUpcomingPayments = () => {
    return useSWR<UpcomingPayment[]>(
      ['upcoming-payments'],
      () => bookingService.getUpcomingPayments(),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useMilestones = (bookingId: number | null) => {
    return useSWR<PaymentMilestone[]>(
      bookingId ? ['milestones', bookingId] : null,
      () => bookingService.getMilestones(bookingId!),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const usePaymentPlanTemplates = () => {
    return useSWR<PaymentPlanTemplatesResponse>(
      ['payment-plan-templates'],
      () => bookingService.getPaymentPlanTemplates(),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  // ==================== BOOKING MUTATIONS ====================

  const createBooking = useCallback(async (payload: CreateBookingPayload): Promise<Booking> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingService.createBooking(payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBooking = useCallback(async (id: number, payload: UpdateBookingPayload): Promise<Booking> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingService.updateBooking(id, payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markMilestonePaid = useCallback(async (bookingId: number, milestoneId: number, payload: MarkMilestonePaidPayload): Promise<PaymentMilestone> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingService.markMilestonePaid(bookingId, milestoneId, payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== TEMPLATE MUTATIONS ====================

  const createPaymentPlanTemplate = useCallback(async (payload: CreatePaymentPlanTemplatePayload): Promise<PaymentPlanTemplate> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingService.createPaymentPlanTemplate(payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePaymentPlanTemplate = useCallback(async (id: number, payload: UpdatePaymentPlanTemplatePayload): Promise<PaymentPlanTemplate> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingService.updatePaymentPlanTemplate(id, payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePaymentPlanTemplate = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await bookingService.deletePaymentPlanTemplate(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setDefaultTemplate = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await bookingService.setDefaultTemplate(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const previewMilestones = useCallback(async (payload: PreviewMilestonesPayload): Promise<MilestonePreview[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingService.previewMilestones(payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDemandLetterData = useCallback(async (bookingId: number): Promise<any> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingService.getDemandLetterData(bookingId);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReceiptData = useCallback(async (bookingId: number, milestoneId: number): Promise<any> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingService.getReceiptData(bookingId, milestoneId);
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
    // Queries
    useBookingsList,
    useBooking,
    useBookingSummary,
    useUpcomingPayments,
    useMilestones,
    usePaymentPlanTemplates,
    // Booking mutations
    createBooking,
    updateBooking,
    markMilestonePaid,
    getDemandLetterData,
    getReceiptData,
    // Template mutations
    createPaymentPlanTemplate,
    updatePaymentPlanTemplate,
    deletePaymentPlanTemplate,
    setDefaultTemplate,
    previewMilestones,
  };
};
