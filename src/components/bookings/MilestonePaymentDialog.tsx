import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { PaymentMilestone, MarkMilestonePaidPayload } from '@/types/bookingTypes';

const milestonePaymentSchema = z.object({
  received_amount: z.string().min(1, 'Received amount is required'),
  received_date: z.string().min(1, 'Received date is required'),
  reference_no: z.string().optional(),
  notes: z.string().optional(),
});

type MilestonePaymentFormData = z.infer<typeof milestonePaymentSchema>;

interface MilestonePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: PaymentMilestone | null;
  onSubmit: (payload: MarkMilestonePaidPayload) => Promise<void>;
  isSubmitting?: boolean;
}

export function MilestonePaymentDialog({
  open,
  onOpenChange,
  milestone,
  onSubmit,
  isSubmitting = false,
}: MilestonePaymentDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestonePaymentFormData>({
    resolver: zodResolver(milestonePaymentSchema),
    defaultValues: {
      received_amount: '',
      received_date: '',
      reference_no: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open && milestone) {
      reset({
        received_amount: milestone.amount || '',
        received_date: new Date().toISOString().split('T')[0],
        reference_no: '',
        notes: '',
      });
    }
  }, [open, milestone, reset]);

  const onFormSubmit = async (data: MilestonePaymentFormData) => {
    const payload: MarkMilestonePaidPayload = {
      received_amount: data.received_amount,
      received_date: data.received_date,
      reference_no: data.reference_no || undefined,
      notes: data.notes || undefined,
    };
    await onSubmit(payload);
  };

  if (!milestone) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Milestone as Paid</DialogTitle>
          <DialogDescription>
            Recording payment for: {milestone.milestone_name}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="received_amount">Received Amount *</Label>
            <Input
              id="received_amount"
              {...register('received_amount')}
              placeholder="e.g. 500000"
            />
            {errors.received_amount && (
              <p className="text-xs text-destructive">{errors.received_amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="received_date">Received Date *</Label>
            <Input
              id="received_date"
              type="date"
              {...register('received_date')}
            />
            {errors.received_date && (
              <p className="text-xs text-destructive">{errors.received_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_no">Reference Number</Label>
            <Input
              id="reference_no"
              {...register('reference_no')}
              placeholder="e.g. TXN-12345"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this payment..."
              rows={3}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onFormSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
