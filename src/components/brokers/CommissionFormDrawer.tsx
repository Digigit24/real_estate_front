// src/components/brokers/CommissionFormDrawer.tsx
import { BookingSelect } from '@/components/BookingSelect';
import { BrokerSelect } from '@/components/BrokerSelect';
import { LeadSelect } from '@/components/LeadSelect';
import { SideDrawer } from '@/components/SideDrawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useBookings } from '@/hooks/useBookings';
import type { Commission, CreateCommissionPayload, UpdateCommissionPayload } from '@/types/brokerTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const commissionSchema = z.object({
    broker: z.coerce.number().min(1, 'Broker is required'),
    booking: z.coerce.number().min(1, 'Booking is required'),
    lead_id: z.coerce.number().min(1, 'Lead is required'),
    commission_rate: z.string().min(1, 'Commission rate is required'),
    commission_amount: z.string().min(1, 'Commission amount is required'),
    notes: z.string().optional(),
});

type CommissionFormData = z.infer<typeof commissionSchema>;

interface CommissionFormDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    commission?: Commission | null;
    mode?: 'create' | 'edit';
    onSubmit: (data: any) => Promise<void>;
    isSubmitting?: boolean;
}

export function CommissionFormDrawer({
    open,
    onOpenChange,
    commission,
    mode = 'create',
    onSubmit,
    isSubmitting = false,
}: CommissionFormDrawerProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CommissionFormData>({
        resolver: zodResolver(commissionSchema),
        defaultValues: {
            broker: 0,
            booking: 0,
            lead_id: 0,
            commission_rate: '',
            commission_amount: '',
            notes: '',
        },
    });

    const brokerValue = watch('broker');
    const bookingValue = watch('booking');
    const leadValue = watch('lead_id');
    const commissionRate = watch('commission_rate');

    const { useBooking } = useBookings();
    const { data: bookingData } = useBooking(bookingValue || null);

    useEffect(() => {
        if (bookingData?.total_amount && commissionRate) {
            const rate = parseFloat(commissionRate);
            const totalAmount = parseFloat(bookingData.total_amount);
            if (!isNaN(rate) && !isNaN(totalAmount)) {
                const amount = (totalAmount * rate) / 100;
                setValue('commission_amount', amount.toFixed(2), { shouldValidate: true });
            }
        }
    }, [bookingData?.total_amount, commissionRate, setValue]);

    useEffect(() => {
        if (open) {
            if (commission && mode === 'edit') {
                reset({
                    broker: commission.broker || 0,
                    booking: commission.booking || 0,
                    lead_id: commission.lead_id || 0,
                    commission_rate: commission.commission_rate?.toString() || '',
                    commission_amount: commission.commission_amount?.toString() || commission.amount?.toString() || '',
                    notes: commission.notes || '',
                });
            } else {
                reset({
                    broker: 0,
                    booking: 0,
                    lead_id: 0,
                    commission_rate: '',
                    commission_amount: '',
                    notes: '',
                });
            }
        }
    }, [open, commission, mode, reset]);

    const onFormSubmit = async (data: CommissionFormData) => {
        const payload: CreateCommissionPayload | UpdateCommissionPayload = {
            broker: data.broker,
            booking: data.booking,
            lead_id: data.lead_id,
            commission_rate: data.commission_rate,
            commission_amount: data.commission_amount,
            notes: data.notes || undefined,
        };
        await onSubmit(payload);
    };

    return (
        <SideDrawer
            open={open}
            onOpenChange={onOpenChange}
            title={mode === 'edit' ? "Edit Commission" : "Add Commission"}
            description={mode === 'edit' ? "Update commission details." : "Create a commission record for a broker booking."}
            mode={mode}
            size="md"
            footerButtons={[
                {
                    label: 'Cancel',
                    variant: 'outline',
                    onClick: () => onOpenChange(false),
                    disabled: isSubmitting,
                },
                {
                    label: mode === 'edit' ? 'Save Changes' : 'Create Commission',
                    onClick: handleSubmit(onFormSubmit),
                    loading: isSubmitting,
                    disabled: isSubmitting,
                },
            ]}
        >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Broker & Booking Information</h4>

                    <div className="space-y-2">
                        <Label>Broker *</Label>
                        <BrokerSelect
                            value={brokerValue ? brokerValue.toString() : ''}
                            onChange={(brokerId) => setValue('broker', brokerId ? parseInt(brokerId) : 0, { shouldValidate: true })}
                        />
                        {errors.broker && (
                            <p className="text-xs text-destructive">{errors.broker.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Booking *</Label>
                        <BookingSelect
                            value={bookingValue ? bookingValue.toString() : ''}
                            onChange={(bookingId) => setValue('booking', bookingId ? parseInt(bookingId) : 0, { shouldValidate: true })}
                        />
                        {errors.booking && (
                            <p className="text-xs text-destructive">{errors.booking.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Lead *</Label>
                        <LeadSelect
                            value={leadValue ? leadValue.toString() : ''}
                            onChange={(leadId) => setValue('lead_id', leadId ? parseInt(leadId) : 0, { shouldValidate: true })}
                        />
                        {errors.lead_id && (
                            <p className="text-xs text-destructive">{errors.lead_id.message}</p>
                        )}
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Financial Details</h4>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="commission_rate">Commission Rate (%) *</Label>
                            <Input
                                id="commission_rate"
                                {...register('commission_rate')}
                                placeholder="e.g. 7"
                            />
                            {errors.commission_rate && (
                                <p className="text-xs text-destructive">{errors.commission_rate.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="commission_amount">Amount *</Label>
                            <Input
                                id="commission_amount"
                                {...register('commission_amount')}
                                placeholder="e.g. 768470.9"
                            />
                            {errors.commission_amount && (
                                <p className="text-xs text-destructive">{errors.commission_amount.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Additional Info</h4>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            {...register('notes')}
                            placeholder="Any additional notes about this commission..."
                            rows={3}
                        />
                    </div>
                </div>
            </form>
        </SideDrawer>
    );
}
