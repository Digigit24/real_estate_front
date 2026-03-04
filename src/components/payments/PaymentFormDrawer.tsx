// src/components/payments/PaymentFormDrawer.tsx
import { BookingSelect } from '@/components/BookingSelect';
import { LeadSelect } from '@/components/LeadSelect';
import { DrawerActionButton, SideDrawer } from '@/components/SideDrawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { CreatePaymentPayload, Payment } from '@/types/paymentTypes';
import {
    PAYMENT_STATUS_LABELS,
    PAYMENT_TYPE_LABELS,
    PaymentStatusEnum,
    PaymentTypeEnum,
} from '@/types/paymentTypes';
import { useCallback, useEffect, useState } from 'react';

interface PaymentFormDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment?: Payment | null;
    onSubmit: (data: CreatePaymentPayload) => Promise<void>;
    isSubmitting?: boolean;
}

interface FormData {
    lead: string;
    booking: string;
    amount: string;
    type: PaymentTypeEnum;
    status: PaymentStatusEnum;
    reference_no: string;
    payment_date: string;
    notes: string;
}

const defaultFormData: FormData = {
    lead: '',
    booking: '',
    amount: '',
    type: PaymentTypeEnum.ADVANCE,
    status: PaymentStatusEnum.PENDING,
    reference_no: '',
    payment_date: '',
    notes: '',
};

export function PaymentFormDrawer({
    open,
    onOpenChange,
    payment,
    onSubmit,
    isSubmitting = false,
}: PaymentFormDrawerProps) {
    const isEditing = !!payment;
    const [formData, setFormData] = useState<FormData>(defaultFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    useEffect(() => {
        if (payment) {
            setFormData({
                lead: payment.lead?.toString() || '',
                booking: payment.booking?.toString() || '',
                amount: payment.amount || '',
                type: payment.type || PaymentTypeEnum.ADVANCE,
                status: payment.status || PaymentStatusEnum.PENDING,
                reference_no: payment.reference_no || '',
                payment_date: payment.payment_date || '',
                notes: payment.notes || '',
            });
        } else {
            setFormData(defaultFormData);
        }
        setErrors({});
    }, [payment, open]);

    const handleChange = (field: keyof FormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        if (!formData.amount.trim()) newErrors.amount = 'Amount is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(async () => {
        if (!validate()) return;

        const payload: CreatePaymentPayload = {
            amount: formData.amount.trim(),
            type: formData.type,
            ...(formData.status && { status: formData.status }),
            ...(formData.lead && { lead: parseInt(formData.lead) }),
            ...(formData.booking && { booking: parseInt(formData.booking) }),
            ...(formData.reference_no && { reference_no: formData.reference_no.trim() }),
            ...(formData.payment_date && { date: formData.payment_date }),
            ...(formData.notes && { notes: formData.notes.trim() }),
        };

        await onSubmit(payload);
    }, [formData, validate, onSubmit]);

    const drawerTitle = isEditing ? 'Edit Payment' : 'Add Payment';
    const drawerDescription = isEditing
        ? 'Update payment record details.'
        : 'Record a new payment entry.';

    const footerButtons: DrawerActionButton[] = [
        {
            label: 'Cancel',
            onClick: () => onOpenChange(false),
            variant: 'outline',
            disabled: isSubmitting,
        },
        {
            label: isEditing ? 'Save Changes' : 'Add Payment',
            onClick: handleSubmit,
            variant: 'default',
            loading: isSubmitting,
        },
    ];

    return (
        <SideDrawer
            open={open}
            onOpenChange={onOpenChange}
            title={drawerTitle}
            description={drawerDescription}
            mode={isEditing ? 'edit' : 'create'}
            size="md"
            footerButtons={footerButtons}
            footerAlignment="right"
            resizable={true}
            storageKey="payment-drawer-width"
        >
            <div className="space-y-6">
                {/* Amount & Type */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Payment Details</h4>

                    <div className="space-y-2">
                        <Label htmlFor="payment-amount">Amount *</Label>
                        <Input
                            id="payment-amount"
                            value={formData.amount}
                            onChange={handleChange('amount')}
                            placeholder="e.g. 500000"
                            type="number"
                            className={errors.amount ? 'border-destructive' : ''}
                        />
                        {errors.amount && (
                            <p className="text-xs text-destructive">{errors.amount}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment-type">Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(val) => setFormData((prev) => ({ ...prev, type: val as PaymentTypeEnum }))}
                        >
                            <SelectTrigger id="payment-type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(PaymentTypeEnum).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {PAYMENT_TYPE_LABELS[type]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment-status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val as PaymentStatusEnum }))}
                        >
                            <SelectTrigger id="payment-status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(PaymentStatusEnum).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {PAYMENT_STATUS_LABELS[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* References */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">References</h4>

                    {/* Lead — reusable combobox */}
                    <div className="space-y-2">
                        <Label>Lead</Label>
                        <LeadSelect
                            value={formData.lead}
                            onChange={(leadId) => setFormData((prev) => ({ ...prev, lead: leadId }))}
                        />
                    </div>

                    {/* Booking — reusable combobox */}
                    <div className="space-y-2">
                        <Label>Booking</Label>
                        <BookingSelect
                            value={formData.booking}
                            onChange={(bookingId) => setFormData((prev) => ({ ...prev, booking: bookingId }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment-ref">Reference Number</Label>
                        <Input
                            id="payment-ref"
                            value={formData.reference_no}
                            onChange={handleChange('reference_no')}
                            placeholder="e.g. TXN-12345"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment-date">Payment Date</Label>
                        <Input
                            id="payment-date"
                            type="date"
                            value={formData.payment_date}
                            onChange={handleChange('payment_date')}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <Label htmlFor="payment-notes">Notes</Label>
                    <Textarea
                        id="payment-notes"
                        value={formData.notes}
                        onChange={handleChange('notes')}
                        placeholder="Additional notes..."
                        rows={3}
                    />
                </div>
            </div>
        </SideDrawer>
    );
}
