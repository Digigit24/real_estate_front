// src/hooks/useTenantSettings.ts
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { tenantSettingsService } from '@/services/tenantSettingsService';
import {
  TenantSettings,
  UpdateTenantSettingsPayload,
} from '@/types/tenantSettingsTypes';

export const useTenantSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useSettings = () => {
    return useSWR<TenantSettings>(
      ['tenant-settings'],
      () => tenantSettingsService.getSettings(),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const updateSettings = useCallback(async (payload: UpdateTenantSettingsPayload): Promise<TenantSettings> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await tenantSettingsService.updateSettings(payload);
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
    useSettings,
    updateSettings,
  };
};
