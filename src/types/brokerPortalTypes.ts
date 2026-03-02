// src/types/brokerPortalTypes.ts

export interface BrokerAuthResponse {
  token: string;
  broker: BrokerProfile;
}

export interface BrokerProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  agency_name: string;
  approval_status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  total_leads: number;
  total_commission_earned: number;
}

export interface BrokerDashboardStats {
  total_leads: number;
  leads_by_status: Record<string, number>;
  total_commission: number;
  paid_commission: number;
  pending_commission: number;
  recent_leads: BrokerLead[];
}

export interface BrokerLead {
  id: number;
  customer_name: string;
  mobile_number: string;
  email: string;
  project_interested: string;
  budget_range: string;
  bhk_preference: string;
  status: string;
  created_at: string;
  notes: string;
}

export interface BrokerSubmitLeadPayload {
  customer_name: string;
  mobile_number: string;
  email: string;
  project_interested: string;
  budget_range: string;
  bhk_preference: string;
  notes: string;
}
