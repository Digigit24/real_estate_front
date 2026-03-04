import { crmClient } from "@/lib/client";
import { API_CONFIG } from "@/lib/apiConfig";

class BrokerAdminService {
    // ==================== BROKER ADMIN MANAGEMENT ====================
    async getNetworkBrokers(params?: any): Promise<any> {
        const response = await crmClient.get(API_CONFIG.BROKERS.LIST, { params: params || {} });
        return response.data?.results || response.data || [];
    }

    async createNetworkBroker(payload: any): Promise<any> {
        const response = await crmClient.post(API_CONFIG.BROKERS.CREATE, payload);
        return response.data;
    }

    async updateNetworkBroker(id: number, payload: any): Promise<any> {
        const url = API_CONFIG.BROKERS.UPDATE.replace(':id', id.toString());
        const response = await crmClient.patch(url, payload);
        return response.data;
    }

    async getBrokerLeaderboard(params?: any): Promise<any> {
        const response = await crmClient.get(API_CONFIG.BROKERS.LEADERBOARD, { params: params || {} });
        return response.data?.results || response.data || [];
    }

    async getBrokerLeads(id: number): Promise<any> {
        const url = API_CONFIG.BROKERS.BROKER_LEADS.replace(':id', id.toString());
        const response = await crmClient.get(url);
        return response.data?.results || response.data || [];
    }

    async getBrokerCommissions(id: number): Promise<any> {
        const url = API_CONFIG.BROKERS.BROKER_COMMISSIONS.replace(':id', id.toString());
        const response = await crmClient.get(url);
        return response.data?.results || response.data || [];
    }

    async getAllCommissions(params?: any): Promise<any> {
        const response = await crmClient.get(API_CONFIG.BROKERS.COMMISSIONS, { params: params || {} });
        return response.data?.results || response.data || [];
    }

    async createCommission(payload: any): Promise<any> {
        const response = await crmClient.post(API_CONFIG.BROKERS.COMMISSIONS, payload);
        return response.data;
    }

    async markCommissionPaid(id: number, payload?: any): Promise<any> {
        const url = API_CONFIG.BROKERS.COMMISSION_MARK_PAID.replace(':id', id.toString());
        const response = await crmClient.post(url, payload || {});
        return response.data;
    }
}

export const brokerAdminService = new BrokerAdminService();
