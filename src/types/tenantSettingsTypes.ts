// Tenant Settings Types for Real Estate White-label/Branding

export interface TenantSettings {
  tenant_id: string;
  company_name?: string;
  tagline?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  subdomain?: string;
  custom_domain?: string;
  support_email?: string;
  support_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  pdf_header_text?: string;
  pdf_footer_text?: string;
  signature_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateTenantSettingsPayload {
  company_name?: string;
  tagline?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  subdomain?: string;
  custom_domain?: string;
  support_email?: string;
  support_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  pdf_header_text?: string;
  pdf_footer_text?: string;
  signature_url?: string;
}
