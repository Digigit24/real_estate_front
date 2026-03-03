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

    async getLead(id: number): Promise<any> {
        this.applyPortalToken();
        try {
            const url = API_CONFIG.BROKER_PORTAL.LEAD_DETAIL.replace(':id', id.toString());
            const response = await brokerClient.get(url);
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to fetch lead details');
        }
    }

    async updateLead(id: number, payload: any): Promise<any> {
        this.applyPortalToken();
        try {
            const url = API_CONFIG.BROKER_PORTAL.LEAD_DETAIL.replace(':id', id.toString());
            const response = await brokerClient.patch(url, payload);
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to update lead');
        }
    }

    async deleteLead(id: number): Promise<any> {
        this.applyPortalToken();
        try {
            const url = API_CONFIG.BROKER_PORTAL.LEAD_DETAIL.replace(':id', id.toString());
            const response = await brokerClient.delete(url);
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to delete lead');
        }
    }

    async addActivity(id: number, payload: any): Promise<any> {
        this.applyPortalToken();
        try {
            const url = API_CONFIG.BROKER_PORTAL.LEAD_ACTIVITY.replace(':id', id.toString());
            const response = await brokerClient.post(url, payload);
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to add activity');
        }
    }

    async moveToStatus(id: number, statusId: number): Promise<any> {
        this.applyPortalToken();
        try {
            const url = API_CONFIG.BROKER_PORTAL.LEAD_MOVE_STATUS.replace(':id', id.toString());
            const response = await brokerClient.post(url, { status_id: statusId });
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to move lead to status');
        }
    }

    async bulkDelete(leadIds: number[]): Promise<any> {
        this.applyPortalToken();
        try {
            const response = await brokerClient.post(API_CONFIG.BROKER_PORTAL.LEAD_BULK_DELETE, { lead_ids: leadIds });
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to delete multiple leads');
        }
    }

    async bulkUpdateStatus(leadIds: number[], statusId: number): Promise<any> {
        this.applyPortalToken();
        try {
            const response = await brokerClient.post(API_CONFIG.BROKER_PORTAL.LEAD_BULK_STATUS, { lead_ids: leadIds, status_id: statusId });
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to update multiple lead statuses');
        }
    }

    async bulkAssign(leadIds: number[], assignedTo: number): Promise<any> {
        this.applyPortalToken();
        try {
            const response = await brokerClient.post(API_CONFIG.BROKER_PORTAL.LEAD_BULK_ASSIGN, { lead_ids: leadIds, assigned_to: assignedTo });
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to assign multiple leads');
        }
    }

    async exportLeads(params?: any): Promise<any> {
        this.applyPortalToken();
        try {
            const response = await brokerClient.get(API_CONFIG.BROKER_PORTAL.LEAD_EXPORT, { params, responseType: 'blob' });
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to export leads');
        }
    }

    async importLeadsBulk(file: File): Promise<any> {
        this.applyPortalToken();
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await brokerClient.post(API_CONFIG.BROKER_PORTAL.LEAD_IMPORT_BULK, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to import leads');
        }
    }

    // ==================== STATUSES ====================
    async getStatuses(): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.get(API_CONFIG.BROKER_PORTAL.STATUSES);
        return response.data?.results || response.data || [];
    }

    async createStatus(payload: any): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.post(API_CONFIG.BROKER_PORTAL.STATUSES, payload);
        return response.data;
    }

    async updateStatus(id: number, payload: any): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.STATUS_DETAIL.replace(':id', id.toString());
        const response = await brokerClient.patch(url, payload);
        return response.data;
    }

    async deleteStatus(id: number): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.STATUS_DETAIL.replace(':id', id.toString());
        const response = await brokerClient.delete(url);
        return response.data;
    }

    async initializeDefaultStatuses(): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.post(API_CONFIG.BROKER_PORTAL.STATUS_INIT);
        return response.data;
    }

    // ==================== ACTIVITIES ====================
    async getActivities(): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.get(API_CONFIG.BROKER_PORTAL.ACTIVITIES);
        return response.data?.results || response.data || [];
    }

    async createActivity(payload: any): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.post(API_CONFIG.BROKER_PORTAL.ACTIVITIES, payload);
        return response.data;
    }

    async updateActivity(id: number, payload: any): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.ACTIVITY_DETAIL.replace(':id', id.toString());
        const response = await brokerClient.patch(url, payload);
        return response.data;
    }

    // ==================== FIELD CONFIGS ====================
    async getFieldConfigs(): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.get(API_CONFIG.BROKER_PORTAL.FIELD_CONFIGS);
        return response.data?.results || response.data || [];
    }

    async createFieldConfig(payload: any): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.post(API_CONFIG.BROKER_PORTAL.FIELD_CONFIGS, payload);
        return response.data;
    }

    async updateFieldConfig(id: number, payload: any): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.FIELD_CONFIG_DETAIL.replace(':id', id.toString());
        const response = await brokerClient.patch(url, payload);
        return response.data;
    }

    // ==================== INVENTORY ====================
    async getProjects(params?: any): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.get(API_CONFIG.BROKER_PORTAL.PROJECTS, { params: params || {} });
        return response.data?.results || response.data || [];
    }

    async getProjectSummary(id: number): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.PROJECT_INVENTORY_SUMMARY.replace(':id', id.toString());
        const response = await brokerClient.get(url);
        return response.data;
    }

    async getTowers(params?: any): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.get(API_CONFIG.BROKER_PORTAL.TOWERS, { params: params || {} });
        return response.data?.results || response.data || [];
    }

    async getTowerUnitGrid(id: number): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.TOWER_UNIT_GRID.replace(':id', id.toString());
        const response = await brokerClient.get(url);
        return response.data;
    }

    async getUnits(params?: any): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.get(API_CONFIG.BROKER_PORTAL.UNITS, { params: params || {} });
        return response.data?.results || response.data || [];
    }

    async reserveUnit(id: number, payload: any): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.UNIT_RESERVE.replace(':id', id.toString());
        const response = await brokerClient.post(url, payload);
        return response.data;
    }

    async releaseUnit(id: number): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.UNIT_RELEASE.replace(':id', id.toString());
        const response = await brokerClient.post(url);
        return response.data;
    }

    async calculateUnitPrice(payload: any): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.post(API_CONFIG.BROKER_PORTAL.UNIT_PRICE_CALCULATOR, payload);
        return response.data;
    }

    async suggestUnits(params?: any): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.get(API_CONFIG.BROKER_PORTAL.UNIT_SUGGEST, { params: params || {} });
        return response.data?.results || response.data || [];
    }

    // ==================== BOOKINGS ====================
    async getBookings(params?: any): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.get(API_CONFIG.BROKER_PORTAL.BOOKINGS, { params: params || {} });
        return response.data?.results || response.data || [];
    }

    async createBooking(payload: any): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.post(API_CONFIG.BROKER_PORTAL.BOOKINGS, payload);
        return response.data;
    }

    async getBooking(id: number): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.BOOKING_DETAIL.replace(':id', id.toString());
        const response = await brokerClient.get(url);
        return response.data;
    }

    async updateBooking(id: number, payload: any): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.BOOKING_DETAIL.replace(':id', id.toString());
        const response = await brokerClient.patch(url, payload);
        return response.data;
    }

    async getBookingMilestones(id: number): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.BOOKING_MILESTONES.replace(':id', id.toString());
        const response = await brokerClient.get(url);
        return response.data?.results || response.data || [];
    }

    async markMilestonePaid(bookingId: number, milestoneId: number, payload?: any): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.BOOKING_MILESTONE_MARK_PAID
            .replace(':id', bookingId.toString())
            .replace(':mid', milestoneId.toString());
        const response = await brokerClient.post(url, payload || {});
        return response.data;
    }

    async getDemandLetterData(id: number): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.BOOKING_DEMAND_LETTER.replace(':id', id.toString());
        const response = await brokerClient.get(url);
        return response.data;
    }

    async getReceiptData(bookingId: number, milestoneId: number): Promise<any> {
        this.applyPortalToken();
        const url = API_CONFIG.BROKER_PORTAL.BOOKING_RECEIPT
            .replace(':id', bookingId.toString())
            .replace(':mid', milestoneId.toString());
        const response = await brokerClient.get(url);
        return response.data;
    }

    async getBookingsSummary(): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.get(API_CONFIG.BROKER_PORTAL.BOOKING_SUMMARY);
        return response.data;
    }

    async getUpcomingPayments(): Promise<any> {
        this.applyPortalToken();
        const response = await brokerClient.get(API_CONFIG.BROKER_PORTAL.BOOKING_UPCOMING_PAYMENTS);
        return response.data?.results || response.data || [];
    }
}

export const brokerPortalService = new BrokerPortalService();
