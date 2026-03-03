// Broker Types based on Real Estate Backend API

// ==================== ENUMS ====================

export enum BrokerStatusEnum {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED',
}

export enum CommissionStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export const BROKER_STATUS_COLORS: Record<BrokerStatusEnum, string> = {
  [BrokerStatusEnum.PENDING]: '#F59E0B',
  [BrokerStatusEnum.ACTIVE]: '#22C55E',
  [BrokerStatusEnum.INACTIVE]: '#6B7280',
  [BrokerStatusEnum.REJECTED]: '#EF4444',
};

export const BROKER_STATUS_LABELS: Record<BrokerStatusEnum, string> = {
  [BrokerStatusEnum.PENDING]: 'Pending',
  [BrokerStatusEnum.ACTIVE]: 'Active',
  [BrokerStatusEnum.INACTIVE]: 'Inactive',
  [BrokerStatusEnum.REJECTED]: 'Rejected',
};

export const COMMISSION_STATUS_COLORS: Record<CommissionStatusEnum, string> = {
  [CommissionStatusEnum.PENDING]: '#F59E0B',
  [CommissionStatusEnum.PAID]: '#22C55E',
  [CommissionStatusEnum.CANCELLED]: '#EF4444',
};

// ==================== INTERFACES ====================

export interface Broker {
  id: number;
  name: string;
  phone: string;
  email?: string;
  company_name?: string;
  rera_number?: string;
  commission_rate: string;
  city?: string;
  status: BrokerStatusEnum;
  created_at?: string;
  updated_at?: string;
}

export interface Commission {
  id: number;
  broker: number;
  broker_name?: string;
  booking: number;
  booking_unit?: string;
  lead_name?: string;
  amount: string;
  status: CommissionStatusEnum;
  paid_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BrokerLeaderboardEntry {
  rank: number;
  broker_id: number;
  name: string;
  bookings_count: number;
  total_commission: string;
  leads_count: number;
}

// ==================== API PAYLOADS ====================

export interface CreateBrokerPayload {
  name: string;
  phone: string;
  email?: string;
  company_name?: string;
  rera_number?: string;
  commission_rate: string;
  city?: string;
  status?: BrokerStatusEnum;
  owner_user_id?: string | number;
}

export type UpdateBrokerPayload = Partial<CreateBrokerPayload>;

export interface UpdateCommissionPayload {
  status?: CommissionStatusEnum;
  notes?: string;
}

// ==================== QUERY PARAMS ====================

export interface BrokersQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: BrokerStatusEnum;
  city?: string;
}

export interface CommissionsQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: CommissionStatusEnum;
  broker?: number;
}

// ==================== API RESPONSES ====================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type BrokersResponse = PaginatedResponse<Broker>;
export type CommissionsResponse = PaginatedResponse<Commission>;

export interface BrokerLeaderboardResponse {
  count: number;
  results: BrokerLeaderboardEntry[];
}
