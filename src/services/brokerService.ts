// src/services/brokerService.ts
import { crmClient } from '@/lib/client';
import { API_CONFIG, buildQueryString } from '@/lib/apiConfig';
import {
  Broker,
  BrokersResponse,
  Commission,
  CommissionsResponse,
  BrokerLeaderboardResponse,
  BrokersQueryParams,
  CommissionsQueryParams,
  CreateBrokerPayload,
  UpdateBrokerPayload,
  UpdateCommissionPayload,
} from '@/types/brokerTypes';

class BrokerService {
  // ==================== BROKERS ====================

  async getBrokers(params?: BrokersQueryParams): Promise<BrokersResponse> {
    try {
      const queryString = buildQueryString(params);
      const response = await crmClient.get<BrokersResponse>(
        `${API_CONFIG.BROKERS.LIST}${queryString}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch brokers';
      throw new Error(message);
    }
  }

  async getBroker(id: number): Promise<Broker> {
    try {
      const response = await crmClient.get<Broker>(
        API_CONFIG.BROKERS.DETAIL.replace(':id', id.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch broker';
      throw new Error(message);
    }
  }

  async createBroker(payload: CreateBrokerPayload): Promise<Broker> {
    try {
      const response = await crmClient.post<Broker>(
        API_CONFIG.BROKERS.CREATE,
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create broker';
      throw new Error(message);
    }
  }

  async updateBroker(id: number, payload: UpdateBrokerPayload): Promise<Broker> {
    try {
      const response = await crmClient.patch<Broker>(
        API_CONFIG.BROKERS.UPDATE.replace(':id', id.toString()),
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update broker';
      throw new Error(message);
    }
  }

  async deleteBroker(id: number): Promise<void> {
    try {
      await crmClient.delete(
        API_CONFIG.BROKERS.DELETE.replace(':id', id.toString())
      );
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete broker';
      throw new Error(message);
    }
  }

  async getLeaderboard(): Promise<BrokerLeaderboardResponse> {
    try {
      const response = await crmClient.get<BrokerLeaderboardResponse>(
        API_CONFIG.BROKERS.LEADERBOARD
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch leaderboard';
      throw new Error(message);
    }
  }

  async getBrokerLeads(brokerId: number): Promise<any[]> {
    try {
      const response = await crmClient.get(
        API_CONFIG.BROKERS.BROKER_LEADS.replace(':id', brokerId.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch broker leads';
      throw new Error(message);
    }
  }

  async getBrokerCommissions(brokerId: number): Promise<Commission[]> {
    try {
      const response = await crmClient.get<Commission[]>(
        API_CONFIG.BROKERS.BROKER_COMMISSIONS.replace(':id', brokerId.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch broker commissions';
      throw new Error(message);
    }
  }

  // ==================== COMMISSIONS ====================

  async getCommissions(params?: CommissionsQueryParams): Promise<CommissionsResponse> {
    try {
      const queryString = buildQueryString(params);
      const response = await crmClient.get<CommissionsResponse>(
        `${API_CONFIG.BROKERS.COMMISSIONS}${queryString}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch commissions';
      throw new Error(message);
    }
  }

  async updateCommission(id: number, payload: UpdateCommissionPayload): Promise<Commission> {
    try {
      const response = await crmClient.patch<Commission>(
        API_CONFIG.BROKERS.COMMISSION_DETAIL.replace(':id', id.toString()),
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update commission';
      throw new Error(message);
    }
  }

  async markCommissionPaid(id: number): Promise<Commission> {
    try {
      const response = await crmClient.post<Commission>(
        API_CONFIG.BROKERS.COMMISSION_MARK_PAID.replace(':id', id.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to mark commission as paid';
      throw new Error(message);
    }
  }
}

export const brokerService = new BrokerService();
