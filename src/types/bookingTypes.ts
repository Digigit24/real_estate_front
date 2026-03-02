// Booking Types based on Real Estate Backend API

// ==================== ENUMS ====================

export enum BookingStatusEnum {
  DRAFT = 'DRAFT',
  TOKEN_PAID = 'TOKEN_PAID',
  AGREEMENT_DONE = 'AGREEMENT_DONE',
  REGISTERED = 'REGISTERED',
  CANCELLED = 'CANCELLED',
}

export enum MilestoneStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED',
}

export enum PaymentPlanTypeEnum {
  '20_80' = '20_80',
  CONSTRUCTION_LINKED = 'CONSTRUCTION_LINKED',
  CUSTOM = 'CUSTOM',
}

export const BOOKING_STATUS_COLORS: Record<BookingStatusEnum, string> = {
  [BookingStatusEnum.DRAFT]: '#94A3B8',
  [BookingStatusEnum.TOKEN_PAID]: '#F59E0B',
  [BookingStatusEnum.AGREEMENT_DONE]: '#3B82F6',
  [BookingStatusEnum.REGISTERED]: '#8B5CF6',
  [BookingStatusEnum.CANCELLED]: '#EF4444',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatusEnum, string> = {
  [BookingStatusEnum.DRAFT]: 'Draft',
  [BookingStatusEnum.TOKEN_PAID]: 'Token Paid',
  [BookingStatusEnum.AGREEMENT_DONE]: 'Agreement Done',
  [BookingStatusEnum.REGISTERED]: 'Registered',
  [BookingStatusEnum.CANCELLED]: 'Cancelled',
};

export const MILESTONE_STATUS_COLORS: Record<MilestoneStatusEnum, string> = {
  [MilestoneStatusEnum.PENDING]: '#94A3B8',
  [MilestoneStatusEnum.PAID]: '#22C55E',
  [MilestoneStatusEnum.PARTIALLY_PAID]: '#F59E0B',
  [MilestoneStatusEnum.OVERDUE]: '#EF4444',
  [MilestoneStatusEnum.WAIVED]: '#6B7280',
};

export const PAYMENT_PLAN_OPTIONS = ['20_80', 'CONSTRUCTION_LINKED', 'CUSTOM'] as const;

// ==================== INTERFACES ====================

export interface PaymentMilestone {
  id: number;
  milestone_name: string;
  due_date: string;
  amount: string;
  percentage: string;
  status: MilestoneStatusEnum;
  received_amount?: string;
  received_date?: string;
  reference_no?: string;
  notes?: string;
}

export interface Booking {
  id: number;
  lead: number;
  lead_name?: string;
  lead_phone?: string;
  unit: number;
  unit_number?: string;
  tower_name?: string;
  project_name?: string;
  booking_date: string;
  token_amount: string;
  total_amount: string;
  payment_plan_type: string;
  status: BookingStatusEnum;
  total_collected?: string;
  total_pending?: string;
  remarks?: string;
  milestones?: PaymentMilestone[];
  created_at?: string;
  updated_at?: string;
}

export interface BookingSummary {
  total_bookings: number;
  total_value: number;
  collected: number;
  pending: number;
  overdue?: number;
}

export interface UpcomingPayment {
  booking_id: number;
  lead_name: string;
  unit_number: string;
  milestone_name: string;
  due_date: string;
  amount: string;
  status: MilestoneStatusEnum;
}

export interface PaymentPlanTemplateStage {
  name: string;
  percentage: number;
  days_from_booking: number;
}

export interface PaymentPlanTemplate {
  id: number;
  name: string;
  plan_type: string;
  is_default?: boolean;
  stages: PaymentPlanTemplateStage[];
  created_at?: string;
  updated_at?: string;
}

export interface MilestonePreview {
  milestone_name: string;
  due_date: string;
  amount: string;
  percentage: string;
}

// ==================== API PAYLOADS ====================

export interface CreateBookingPayload {
  lead: number;
  unit: number;
  booking_date: string;
  token_amount: string;
  total_amount: string;
  payment_plan_type: string;
  remarks?: string;
  milestones?: {
    milestone_name: string;
    due_date: string;
    amount: string;
    percentage: string;
  }[];
}

export type UpdateBookingPayload = Partial<CreateBookingPayload>;

export interface MarkMilestonePaidPayload {
  received_amount: string;
  received_date: string;
  reference_no?: string;
  notes?: string;
}

export interface CreatePaymentPlanTemplatePayload {
  name: string;
  plan_type: string;
  stages: PaymentPlanTemplateStage[];
}

export type UpdatePaymentPlanTemplatePayload = Partial<CreatePaymentPlanTemplatePayload>;

export interface PreviewMilestonesPayload {
  template_id: number;
  booking_date: string;
  total_amount: string;
}

// ==================== QUERY PARAMS ====================

export interface BookingsQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: BookingStatusEnum;
  lead?: number;
  unit?: number;
}

// ==================== API RESPONSES ====================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type BookingsResponse = PaginatedResponse<Booking>;
export type PaymentPlanTemplatesResponse = PaginatedResponse<PaymentPlanTemplate>;
