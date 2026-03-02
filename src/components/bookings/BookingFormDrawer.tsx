import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SideDrawer } from '@/components/SideDrawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Booking, CreateBookingPayload } from '@/types/bookingTypes';
import { PAYMENT_PLAN_OPTIONS } from '@/types/bookingTypes';

const PAYMENT_PLAN_LABELS: Record<string, string> = {
  '20_80': '20:80 Plan',
  CONSTRUCTION_LINKED: 'Construction Linked',
  CUSTOM: 'Custom',
};

const bookingSchema = z.object({
  lead: z.coerce.number().min(1, 'Lead ID is required'),
  unit: z.coerce.number().min(1, 'Unit ID is required'),
  booking_date: z.string().min(1, 'Booking date is required'),
  token_amount: z.string().min(1, 'Token amount is required'),
  total_amount: z.string().min(1, 'Total amount is required'),
  payment_plan_type: z.string().min(1, 'Payment plan type is required'),
  remarks: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking | null;
  onSubmit: (data: CreateBookingPayload) => Promise<void>;
  isSubmitting?: boolean;
}

export function BookingFormDrawer({
  open,
  onOpenChange,
  booking,
  onSubmit,
  isSubmitting = false,
}: BookingFormDrawerProps) {
  const isEditing = !!booking;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      lead: 0,
      unit: 0,
      booking_date: '',
      token_amount: '',
      total_amount: '',
      payment_plan_type: '',
      remarks: '',
    },
  });

  const paymentPlanType = watch('payment_plan_type');

  useEffect(() => {
    if (booking) {
      reset({
        lead: booking.lead || 0,
        unit: booking.unit || 0,
        booking_date: booking.booking_date || '',
        token_amount: booking.token_amount || '',
        total_amount: booking.total_amount || '',
        payment_plan_type: booking.payment_plan_type || '',
        remarks: booking.remarks || '',
      });
    } else {
      reset({
        lead: 0,
        unit: 0,
        booking_date: '',
        token_amount: '',
        total_amount: '',
        payment_plan_type: '',
        remarks: '',
      });
    }
  }, [booking, reset]);

  const onFormSubmit = async (data: BookingFormData) => {
    const payload: CreateBookingPayload = {
      lead: data.lead,
      unit: data.unit,
      booking_date: data.booking_date,
      token_amount: data.token_amount,
      total_amount: data.total_amount,
      payment_plan_type: data.payment_plan_type,
      remarks: data.remarks || undefined,
    };
    await onSubmit(payload);
  };

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Booking' : 'New Booking'}
      mode={isEditing ? 'edit' : 'create'}
      size="md"
      footerButtons={[
        {
          label: 'Cancel',
          variant: 'outline',
          onClick: () => onOpenChange(false),
        },
        {
          label: isEditing ? 'Save Changes' : 'Create Booking',
          onClick: handleSubmit(onFormSubmit),
          loading: isSubmitting,
          disabled: isSubmitting,
        },
      ]}
    >
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        {/* Lead & Unit */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Booking Information</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="lead">Lead ID *</Label>
              <Input
                id="lead"
                type="number"
                {...register('lead')}
                placeholder="e.g. 101"
              />
              {errors.lead && (
                <p className="text-xs text-destructive">{errors.lead.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit ID *</Label>
              <Input
                id="unit"
                type="number"
                {...register('unit')}
                placeholder="e.g. 205"
              />
              {errors.unit && (
                <p className="text-xs text-destructive">{errors.unit.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_date">Booking Date *</Label>
            <Input
              id="booking_date"
              type="date"
              {...register('booking_date')}
            />
            {errors.booking_date && (
              <p className="text-xs text-destructive">{errors.booking_date.message}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Financial Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Financial Details</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="token_amount">Token Amount *</Label>
              <Input
                id="token_amount"
                {...register('token_amount')}
                placeholder="e.g. 500000"
              />
              {errors.token_amount && (
                <p className="text-xs text-destructive">{errors.token_amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_amount">Total Amount *</Label>
              <Input
                id="total_amount"
                {...register('total_amount')}
                placeholder="e.g. 5000000"
              />
              {errors.total_amount && (
                <p className="text-xs text-destructive">{errors.total_amount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_plan_type">Payment Plan Type *</Label>
            <Select
              value={paymentPlanType}
              onValueChange={(value) => setValue('payment_plan_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment plan" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_PLAN_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {PAYMENT_PLAN_LABELS[option] || option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payment_plan_type && (
              <p className="text-xs text-destructive">{errors.payment_plan_type.message}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Remarks */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Additional Info</h4>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              {...register('remarks')}
              placeholder="Any additional notes about this booking..."
              rows={3}
            />
          </div>
        </div>
      </form>
    </SideDrawer>
  );
}
