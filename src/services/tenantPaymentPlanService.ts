import { crmClient } from '@/lib/client';
import { API_CONFIG } from '@/lib/apiConfig';

export interface PaymentPlanTemplate {
    id: number;
    name: string;
    description?: string;
    is_default: boolean;
    milestones: {
        id?: number;
        name: string;
        percentage: number;
        due_days_after_booking?: number;
    }[];
}

class TenantPaymentPlanService {
    async getTemplates(): Promise<PaymentPlanTemplate[]> {
        const response = await crmClient.get(API_CONFIG.PAYMENT_PLAN_TEMPLATES.LIST);
        return response.data?.results || response.data || [];
    }

    async createTemplate(payload: any): Promise<PaymentPlanTemplate> {
        const response = await crmClient.post(API_CONFIG.PAYMENT_PLAN_TEMPLATES.CREATE, payload);
        return response.data;
    }

    async updateTemplate(id: number, payload: any): Promise<PaymentPlanTemplate> {
        const url = API_CONFIG.PAYMENT_PLAN_TEMPLATES.UPDATE.replace(':id', id.toString());
        const response = await crmClient.patch(url, payload);
        return response.data;
    }

    async deleteTemplate(id: number): Promise<void> {
        const url = API_CONFIG.PAYMENT_PLAN_TEMPLATES.DELETE.replace(':id', id.toString());
        await crmClient.delete(url);
    }
}

export const tenantPaymentPlanService = new TenantPaymentPlanService();
