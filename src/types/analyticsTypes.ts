// Analytics Types based on Real Estate Backend API

export interface AnalyticsOverview {
  inventory: {
    total: number;
    available: number;
    reserved: number;
    booked: number;
    registered: number;
    sold: number;
  };
  leads: {
    total: number;
    new_today: number;
    won: number;
    conversion_rate: number;
  };
  revenue: {
    total_bookings: number;
    total_value: number;
    collected: number;
    pending: number;
  };
  activity: {
    site_visits_last_7_days: number;
    payments_due_next_7_days: number;
  };
}

export interface InventoryAnalytics {
  project_id?: number;
  project_name?: string;
  total: number;
  available: number;
  reserved: number;
  booked: number;
  registered: number;
  sold: number;
  blocked: number;
}

export interface SalesFunnelStage {
  id: number;
  name: string;
  color_hex: string;
  lead_count: number;
  conversion_rate?: number;
}

export interface SalesFunnelAnalytics {
  stages: SalesFunnelStage[];
  total_leads: number;
  overall_conversion_rate: number;
}

export interface MonthlyTrend {
  month: string;
  bookings: number;
  value: number;
}

export interface RevenueAnalytics {
  total_bookings: number;
  total_value: number;
  collected: number;
  pending: number;
  overdue: number;
  monthly_trend: MonthlyTrend[];
}

export interface AgentLeaderboardEntry {
  rank: number;
  user_id: string;
  name?: string;
  leads_assigned: number;
  site_visits: number;
  bookings: number;
  conversion_rate: number;
}

export interface AgentLeaderboardAnalytics {
  period_days: number;
  count: number;
  results: AgentLeaderboardEntry[];
}

export interface LeadSourceROI {
  source: string;
  leads: number;
  site_visits: number;
  bookings: number;
  visit_rate: number;
  booking_rate: number;
}

export interface LeadSourceAnalytics {
  period_days: number;
  results: LeadSourceROI[];
}

// ==================== QUERY PARAMS ====================

export interface AnalyticsQueryParams {
  project_id?: number;
  days?: number;
  from_date?: string;
  to_date?: string;
}
