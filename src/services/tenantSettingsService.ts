// src/services/tenantSettingsService.ts
import { crmClient } from '@/lib/client';
import { API_CONFIG } from '@/lib/apiConfig';
import {
  TenantSettings,
  UpdateTenantSettingsPayload,
} from '@/types/tenantSettingsTypes';

class TenantSettingsService {
  async getSettings(): Promise<TenantSettings> {
    try {
      const response = await crmClient.get<TenantSettings>(
        API_CONFIG.TENANT_SETTINGS.GET
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch tenant settings';
      throw new Error(message);
    }
  }

  async updateSettings(payload: UpdateTenantSettingsPayload): Promise<TenantSettings> {
    try {
      const response = await crmClient.patch<TenantSettings>(
        API_CONFIG.TENANT_SETTINGS.UPDATE,
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update tenant settings';
      throw new Error(message);
    }
  }

  async replaceSettings(payload: UpdateTenantSettingsPayload): Promise<TenantSettings> {
    try {
      const response = await crmClient.put<TenantSettings>(
        API_CONFIG.TENANT_SETTINGS.UPDATE,
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update tenant settings';
      throw new Error(message);
    }
  }
}

export const tenantSettingsService = new TenantSettingsService();
