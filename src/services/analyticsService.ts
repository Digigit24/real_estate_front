// src/services/analyticsService.ts
import { crmClient } from '@/lib/client';
import { API_CONFIG, buildQueryString } from '@/lib/apiConfig';
import {
  AnalyticsOverview,
  InventoryAnalytics,
  SalesFunnelAnalytics,
  RevenueAnalytics,
  AgentLeaderboardAnalytics,
  LeadSourceAnalytics,
  AnalyticsQueryParams,
} from '@/types/analyticsTypes';

class AnalyticsService {
  async getOverview(): Promise<AnalyticsOverview> {
    try {
      const response = await crmClient.get<AnalyticsOverview>(API_CONFIG.ANALYTICS.OVERVIEW);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch analytics overview';
      throw new Error(message);
    }
  }

  async getInventoryAnalytics(params?: AnalyticsQueryParams): Promise<InventoryAnalytics> {
    try {
      const queryString = buildQueryString(params);
      const response = await crmClient.get<InventoryAnalytics>(
        `${API_CONFIG.ANALYTICS.INVENTORY}${queryString}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch inventory analytics';
      throw new Error(message);
    }
  }

  async getSalesFunnel(params?: AnalyticsQueryParams): Promise<SalesFunnelAnalytics> {
    try {
      const queryString = buildQueryString(params);
      const response = await crmClient.get<SalesFunnelAnalytics>(
        `${API_CONFIG.ANALYTICS.SALES_FUNNEL}${queryString}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch sales funnel';
      throw new Error(message);
    }
  }

  async getRevenue(params?: AnalyticsQueryParams): Promise<RevenueAnalytics> {
    try {
      const queryString = buildQueryString(params);
      const response = await crmClient.get<RevenueAnalytics>(
        `${API_CONFIG.ANALYTICS.REVENUE}${queryString}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch revenue analytics';
      throw new Error(message);
    }
  }

  async getAgentLeaderboard(params?: AnalyticsQueryParams): Promise<AgentLeaderboardAnalytics> {
    try {
      const queryString = buildQueryString(params);
      const response = await crmClient.get<AgentLeaderboardAnalytics>(
        `${API_CONFIG.ANALYTICS.AGENT_LEADERBOARD}${queryString}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch agent leaderboard';
      throw new Error(message);
    }
  }

  async getLeadSources(params?: AnalyticsQueryParams): Promise<LeadSourceAnalytics> {
    try {
      const queryString = buildQueryString(params);
      const response = await crmClient.get<LeadSourceAnalytics>(
        `${API_CONFIG.ANALYTICS.LEAD_SOURCES}${queryString}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch lead sources analytics';
      throw new Error(message);
    }
  }
}

export const analyticsService = new AnalyticsService();
