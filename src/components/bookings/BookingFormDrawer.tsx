import { LeadSelect } from '@/components/LeadSelect';
import { SideDrawer } from '@/components/SideDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { UnitSelect } from '@/components/UnitSelect';
import type { Booking, CreateBookingPayload } from '@/types/bookingTypes';
import { PAYMENT_PLAN_OPTIONS } from '@/types/bookingTypes';
import { UnitStatusEnum } from '@/types/inventoryTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

const PAYMENT_PLAN_LABELS: Record<string, string> = {
  '20_80': '20:80 Plan',
  CONSTRUCTION_LINKED: 'Construction Linked',
  CUSTOM: 'Custom',
};

const milestoneSchema = z.object({
  milestone_name: z.string().min(1, 'Name is required'),
  due_date: z.string().min(1, 'Due date is required'),
  amount: z.string().min(1, 'Amount is required'),
  percentage: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  order_index: z.number().optional(),
});

const bookingSchema = z.object({
  lead: z.coerce.number().min(1, 'Lead is required'),
  unit: z.coerce.number().min(1, 'Unit is required'),
  booking_date: z.string().min(1, 'Booking date is required'),
  token_amount: z.string().min(1, 'Token amount is required'),
  total_amount: z.string().min(1, 'Total amount is required'),
  payment_plan_type: z.string().min(1, 'Payment plan type is required'),
  remarks: z.string().optional(),
  milestones: z.array(milestoneSchema).optional(),
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
    control,
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
      milestones: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestones',
  });

  const paymentPlanType = watch('payment_plan_type');
  const leadValue = watch('lead');
  const unitValue = watch('unit');
  const totalAmount = watch('total_amount');

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
        milestones: booking.milestones?.map((m, i) => ({
          milestone_name: m.milestone_name,
          due_date: m.due_date,
          amount: m.amount,
          percentage: m.percentage || '',
          notes: m.notes || '',
          order_index: i,
        })) || [],
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
        milestones: [],
      });
    }
  }, [booking, reset]);

  const handleAddMilestone = () => {
    append({
      milestone_name: '',
      due_date: '',
      amount: '',
      percentage: '',
      notes: '',
      order_index: fields.length,
    });
  };

  // Auto-calculate percentage when amount or total changes
  const calculatePercentage = (amount: string): string => {
    const total = parseFloat(totalAmount || '0');
    const amt = parseFloat(amount || '0');
    if (total > 0 && amt > 0) {
      return ((amt / total) * 100).toFixed(1);
    }
    return '';
  };

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

    // Include milestones if any are defined
    if (data.milestones && data.milestones.length > 0) {
      payload.milestones = data.milestones.map((m, i) => ({
        milestone_name: m.milestone_name,
        due_date: m.due_date,
        amount: m.amount,
        percentage: m.percentage || calculatePercentage(m.amount),
        order_index: i,
        notes: m.notes,
      }));
    }

    await onSubmit(payload);
  };

  // Calculate milestone totals for the summary bar
  const milestonesWatch = watch('milestones') || [];
  const milestoneTotalAmount = milestonesWatch.reduce(
    (sum, m) => sum + (parseFloat(m?.amount || '0') || 0),
    0
  );
  const bookingTotal = parseFloat(totalAmount || '0') || 0;
  const milestonePct = bookingTotal > 0 ? ((milestoneTotalAmount / bookingTotal) * 100).toFixed(1) : '0';

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

          {/* Lead — searchable dropdown */}
          <div className="space-y-2">
            <Label>Lead *</Label>
            <LeadSelect
              value={leadValue ? leadValue.toString() : ''}
              onChange={(leadId) => setValue('lead', leadId ? parseInt(leadId) : 0, { shouldValidate: true })}
            />
            {errors.lead && (
              <p className="text-xs text-destructive">{errors.lead.message}</p>
            )}
          </div>

          {/* Unit — searchable dropdown (only AVAILABLE & RESERVED units) */}
          <div className="space-y-2">
            <Label>Unit *</Label>
            <UnitSelect
              value={unitValue ? unitValue.toString() : ''}
              onChange={(unitId) => setValue('unit', unitId ? parseInt(unitId) : 0, { shouldValidate: true })}
              statusFilter={[UnitStatusEnum.AVAILABLE, UnitStatusEnum.RESERVED]}
            />
            {errors.unit && (
              <p className="text-xs text-destructive">{errors.unit.message}</p>
            )}
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

        {/* Milestones Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Payment Milestones
              </h4>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                {paymentPlanType === 'CUSTOM'
                  ? 'Define custom milestones for this booking'
                  : 'Optional — leave empty to auto-generate from plan template'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleAddMilestone}
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>

          {fields.length > 0 && (
            <>
              {/* Summary bar */}
              {bookingTotal > 0 && (
                <div className="flex items-center justify-between bg-muted/50 dark:bg-muted/20 rounded-lg px-3 py-2 text-xs">
                  <span className="text-muted-foreground">
                    {fields.length} milestone{fields.length !== 1 ? 's' : ''}
                  </span>
                  <span className={`font-semibold ${parseFloat(milestonePct) > 100 ? 'text-destructive' : parseFloat(milestonePct) === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                    ₹{milestoneTotalAmount.toLocaleString('en-IN')} / ₹{bookingTotal.toLocaleString('en-IN')} ({milestonePct}%)
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative border border-border rounded-lg p-3 bg-card space-y-3"
                  >
                    {/* Remove button */}
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="text-xs font-medium text-muted-foreground">
                      Milestone {index + 1}
                    </div>

                    {/* Name + Due Date */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Name *</Label>
                        <Input
                          {...register(`milestones.${index}.milestone_name`)}
                          placeholder="e.g. On Booking"
                          className="h-8 text-sm"
                        />
                        {errors.milestones?.[index]?.milestone_name && (
                          <p className="text-[10px] text-destructive">
                            {errors.milestones[index]?.milestone_name?.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Due Date *</Label>
                        <Input
                          type="date"
                          {...register(`milestones.${index}.due_date`)}
                          className="h-8 text-sm"
                        />
                        {errors.milestones?.[index]?.due_date && (
                          <p className="text-[10px] text-destructive">
                            {errors.milestones[index]?.due_date?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount + Percentage */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Amount *</Label>
                        <Input
                          {...register(`milestones.${index}.amount`)}
                          placeholder="e.g. 1000000"
                          className="h-8 text-sm"
                        />
                        {errors.milestones?.[index]?.amount && (
                          <p className="text-[10px] text-destructive">
                            {errors.milestones[index]?.amount?.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Percentage</Label>
                        <Input
                          {...register(`milestones.${index}.percentage`)}
                          placeholder="Auto-calculated"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Notes</Label>
                      <Input
                        {...register(`milestones.${index}.notes`)}
                        placeholder="Optional notes"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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
