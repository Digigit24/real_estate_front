// src/services/bookingService.ts
import { crmClient } from '@/lib/client';
import { authClient } from '@/lib/client';
import { API_CONFIG, buildQueryString } from '@/lib/apiConfig';
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

class BookingService {
  // ==================== BOOKINGS ====================

  async getBookings(params?: BookingsQueryParams): Promise<BookingsResponse> {
    try {
      const queryString = buildQueryString(params);
      const response = await crmClient.get<BookingsResponse>(
        `${API_CONFIG.BOOKINGS.LIST}${queryString}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch bookings';
      throw new Error(message);
    }
  }

  async getBooking(id: number): Promise<Booking> {
    try {
      const response = await crmClient.get<Booking>(
        API_CONFIG.BOOKINGS.DETAIL.replace(':id', id.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch booking';
      throw new Error(message);
    }
  }

  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    try {
      const response = await crmClient.post<Booking>(
        API_CONFIG.BOOKINGS.CREATE,
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create booking';
      throw new Error(message);
    }
  }

  async updateBooking(id: number, payload: UpdateBookingPayload): Promise<Booking> {
    try {
      const response = await crmClient.patch<Booking>(
        API_CONFIG.BOOKINGS.UPDATE.replace(':id', id.toString()),
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update booking';
      throw new Error(message);
    }
  }

  async getMilestones(bookingId: number): Promise<PaymentMilestone[]> {
    try {
      const response = await crmClient.get<PaymentMilestone[]>(
        API_CONFIG.BOOKINGS.MILESTONES.replace(':id', bookingId.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch milestones';
      throw new Error(message);
    }
  }

  async markMilestonePaid(bookingId: number, milestoneId: number, payload: MarkMilestonePaidPayload): Promise<PaymentMilestone> {
    try {
      const url = API_CONFIG.BOOKINGS.MARK_PAID
        .replace(':id', bookingId.toString())
        .replace(':mid', milestoneId.toString());
      const response = await crmClient.post<PaymentMilestone>(url, payload);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to mark milestone as paid';
      throw new Error(message);
    }
  }

  async getBookingSummary(): Promise<BookingSummary> {
    try {
      const response = await crmClient.get<BookingSummary>(API_CONFIG.BOOKINGS.SUMMARY);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch booking summary';
      throw new Error(message);
    }
  }

  async getUpcomingPayments(): Promise<UpcomingPayment[]> {
    try {
      const response = await crmClient.get<UpcomingPayment[]>(API_CONFIG.BOOKINGS.UPCOMING_PAYMENTS);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch upcoming payments';
      throw new Error(message);
    }
  }

  async getDemandLetterData(bookingId: number): Promise<any> {
    try {
      const response = await crmClient.get(
        API_CONFIG.BOOKINGS.DEMAND_LETTER_DATA.replace(':id', bookingId.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch demand letter data';
      throw new Error(message);
    }
  }

  async getReceiptData(bookingId: number, milestoneId: number): Promise<any> {
    try {
      const url = API_CONFIG.BOOKINGS.RECEIPT_DATA
        .replace(':id', bookingId.toString())
        .replace(':mid', milestoneId.toString());
      const response = await crmClient.get(url);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch receipt data';
      throw new Error(message);
    }
  }

  // ==================== PAYMENT PLAN TEMPLATES ====================

  async getPaymentPlanTemplates(): Promise<PaymentPlanTemplatesResponse> {
    try {
      const response = await authClient.get<PaymentPlanTemplatesResponse>(
        API_CONFIG.PAYMENT_PLAN_TEMPLATES.LIST
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch payment plan templates';
      throw new Error(message);
    }
  }

  async createPaymentPlanTemplate(payload: CreatePaymentPlanTemplatePayload): Promise<PaymentPlanTemplate> {
    try {
      const response = await authClient.post<PaymentPlanTemplate>(
        API_CONFIG.PAYMENT_PLAN_TEMPLATES.CREATE,
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create payment plan template';
      throw new Error(message);
    }
  }

  async updatePaymentPlanTemplate(id: number, payload: UpdatePaymentPlanTemplatePayload): Promise<PaymentPlanTemplate> {
    try {
      const response = await authClient.patch<PaymentPlanTemplate>(
        API_CONFIG.PAYMENT_PLAN_TEMPLATES.UPDATE.replace(':id', id.toString()),
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update payment plan template';
      throw new Error(message);
    }
  }

  async deletePaymentPlanTemplate(id: number): Promise<void> {
    try {
      await authClient.delete(
        API_CONFIG.PAYMENT_PLAN_TEMPLATES.DELETE.replace(':id', id.toString())
      );
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete payment plan template';
      throw new Error(message);
    }
  }

  async setDefaultTemplate(id: number): Promise<void> {
    try {
      await authClient.post(
        API_CONFIG.PAYMENT_PLAN_TEMPLATES.SET_DEFAULT.replace(':id', id.toString())
      );
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to set default template';
      throw new Error(message);
    }
  }

  async previewMilestones(payload: PreviewMilestonesPayload): Promise<MilestonePreview[]> {
    try {
      const response = await authClient.post<MilestonePreview[]>(
        API_CONFIG.PAYMENT_PLAN_TEMPLATES.PREVIEW,
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to preview milestones';
      throw new Error(message);
    }
  }
}

export const bookingService = new BookingService();
