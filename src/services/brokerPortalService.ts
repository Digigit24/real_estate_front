// src/services/brokerPortalService.ts
import axios from 'axios';
import { API_CONFIG } from '@/lib/apiConfig';
import {
    BrokerAuthResponse,
    BrokerProfile,
    BrokerDashboardStats,
    BrokerSubmitLeadPayload,
    BrokerLead
} from '@/types/brokerPortalTypes';

export const BROKER_TOKEN_KEY = 'celiyo_broker_token';
export const BROKER_USER_KEY = 'celiyo_broker_profile';

const brokerClient = axios.create({
    baseURL: API_CONFIG.CRM_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

brokerClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(BROKER_TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

class BrokerPortalService {
    // ==================== AUTH ====================

    async registerBroker(payload: any): Promise<any> {
        try {
            // Typically, CRM client prepends /api, so we use crmClient or raw axios if token isn't required
            const response = await axios.post(
                `${API_CONFIG.CRM_BASE_URL}${API_CONFIG.BROKER_PORTAL.REGISTER}`,
                payload
            );
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Registration failed');
        }
    }

    async login(email: string, password: string): Promise<BrokerAuthResponse> {
        try {
            const response = await axios.post(
                `${API_CONFIG.CRM_BASE_URL}${API_CONFIG.BROKER_PORTAL.LOGIN}`,
                { email, password }
            );

            const data = response.data;
            if (data.token) {
                localStorage.setItem(BROKER_TOKEN_KEY, data.token);
                // Save the rest of the response schema as the broker profile
                const { token, ...brokerProfile } = data;
                localStorage.setItem(BROKER_USER_KEY, JSON.stringify(brokerProfile));
            }
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Login failed');
        }
    }

    async logout() {
        try {
            await brokerClient.post(API_CONFIG.BROKER_PORTAL.LOGOUT);
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem(BROKER_TOKEN_KEY);
            localStorage.removeItem(BROKER_USER_KEY);
        }
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem(BROKER_TOKEN_KEY);
    }

    getProfileFromStorage(): BrokerProfile | null {
        const raw = localStorage.getItem(BROKER_USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    applyPortalToken(token?: string) {
        // Obsolete: using brokerClient interceptor instead
    }

    // ==================== DASHBOARD & PROFILE ====================

    async getProfile(): Promise<BrokerProfile> {
        this.applyPortalToken();
        try {
            const response = await brokerClient.get<BrokerProfile>(API_CONFIG.BROKER_PORTAL.ME);
            localStorage.setItem(BROKER_USER_KEY, JSON.stringify(response.data));
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to fetch profile');
        }
    }

    async getDashboardStats(): Promise<BrokerDashboardStats> {
        this.applyPortalToken();
        try {
            // Simulating a combined call since user said Dashboard views leads + commissions summary.
            // E.g., either we have a dedicated dashboard endpoint or we merge.
            // Let's assume there's a dedicated /my-leads/ & /my-commissions/ and we aggregate.
            // But for simplicity, we mock a single dashboard call if the API doesn't have it,
            // or we just call the MY_LEADS and summarize. 
            // The prompt suggests: "GET /api/brokers/portal/my-leads/ + /my-commissions/ View leads + commission summary"

            const leadsRes = await brokerClient.get(API_CONFIG.BROKER_PORTAL.MY_LEADS);
            const commissionsRes = await brokerClient.get(API_CONFIG.BROKER_PORTAL.MY_COMMISSIONS);

            const leads = leadsRes.data?.results || leadsRes.data || [];
            const commissions = commissionsRes.data?.results || commissionsRes.data || [];

            let pendingComm = 0;
            let paidComm = 0;
            commissions.forEach((c: any) => {
                if (c.status === 'PAID') paidComm += parseFloat(c.amount || 0);
                else pendingComm += parseFloat(c.amount || 0);
            });

            const leadsByStatus: Record<string, number> = {};
            leads.forEach((l: any) => {
                const statusName = typeof l.status === 'object' ? l.status?.name : (l.status || 'New');
                leadsByStatus[statusName] = (leadsByStatus[statusName] || 0) + 1;
            });

            return {
                total_leads: leads.length,
                leads_by_status: leadsByStatus,
                total_commission: paidComm + pendingComm,
                paid_commission: paidComm,
                pending_commission: pendingComm,
                recent_leads: leads.slice(0, 5) // Latest 5
            };
        } catch (error: any) {
            throw new Error('Failed to fetch dashboard stats');
        }
    }

    // ==================== MY COMMISSIONS ====================

    async getMyCommissions(params?: any): Promise<any> {
        this.applyPortalToken();
        try {
            const response = await brokerClient.get(API_CONFIG.BROKER_PORTAL.MY_COMMISSIONS, { params: params || {} });
            return response.data?.results || response.data || [];
        } catch (error: any) {
            throw new Error('Failed to fetch your commissions');
        }
    }

    // ==================== LEADS ====================

    async getMyLeads(params?: any): Promise<any> {
        this.applyPortalToken();
        try {
            const queryParams = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, String(value));
                    }
                });
            }
            const queryString = queryParams.toString();
            // Use standard CRM Leads endpoint as per instructions
            const url = queryString ? `${API_CONFIG.BROKER_PORTAL.MY_LEADS}?${queryString}` : API_CONFIG.BROKER_PORTAL.MY_LEADS;
            const response = await brokerClient.get(url);
            return response.data?.results || response.data || [];
        } catch (error: any) {
            throw new Error('Failed to fetch your leads');
        }
    }

    async submitLead(payload: any): Promise<any> {
        this.applyPortalToken();
        try {
            // Check if endpoint is /crm/leads/
            const response = await brokerClient.post(API_CONFIG.BROKER_PORTAL.SUBMIT_LEAD, payload);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to submit lead');
        }
    }

    // NOTE: Only /brokers/portal/* endpoints are available for broker users.
    // Methods for /crm/*, /inventory/*, /bookings/*, /payments/*, /tasks/*, /meetings/*
    // have been removed because those endpoints require Admin JWT authentication
    // and will 401 with a broker session token.
    // When the backend adds more portal endpoints, add corresponding methods here.
}

export const brokerPortalService = new BrokerPortalService();
