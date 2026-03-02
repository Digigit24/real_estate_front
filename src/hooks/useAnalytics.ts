// src/hooks/useAnalytics.ts
import { useState } from 'react';
import useSWR from 'swr';
import { analyticsService } from '@/services/analyticsService';
import {
  AnalyticsOverview,
  InventoryAnalytics,
  SalesFunnelAnalytics,
  RevenueAnalytics,
  AgentLeaderboardAnalytics,
  LeadSourceAnalytics,
  AnalyticsQueryParams,
} from '@/types/analyticsTypes';

export const useAnalytics = () => {
  const [error, setError] = useState<string | null>(null);

  const useOverview = () => {
    return useSWR<AnalyticsOverview>(
      ['analytics-overview'],
      () => analyticsService.getOverview(),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useInventoryAnalytics = (params?: AnalyticsQueryParams) => {
    return useSWR<InventoryAnalytics>(
      ['analytics-inventory', params],
      () => analyticsService.getInventoryAnalytics(params),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useSalesFunnel = (params?: AnalyticsQueryParams) => {
    return useSWR<SalesFunnelAnalytics>(
      ['analytics-sales-funnel', params],
      () => analyticsService.getSalesFunnel(params),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useRevenue = (params?: AnalyticsQueryParams) => {
    return useSWR<RevenueAnalytics>(
      ['analytics-revenue', params],
      () => analyticsService.getRevenue(params),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useAgentLeaderboard = (params?: AnalyticsQueryParams) => {
    return useSWR<AgentLeaderboardAnalytics>(
      ['analytics-agent-leaderboard', params],
      () => analyticsService.getAgentLeaderboard(params),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useLeadSources = (params?: AnalyticsQueryParams) => {
    return useSWR<LeadSourceAnalytics>(
      ['analytics-lead-sources', params],
      () => analyticsService.getLeadSources(params),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  return {
    error,
    useOverview,
    useInventoryAnalytics,
    useSalesFunnel,
    useRevenue,
    useAgentLeaderboard,
    useLeadSources,
  };
};
