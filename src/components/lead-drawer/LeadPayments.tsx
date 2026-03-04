import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePayments } from '@/hooks/usePayments';
import type { CreatePaymentPayload } from '@/types/paymentTypes';
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  PaymentStatusEnum,
  PaymentTypeEnum,
} from '@/types/paymentTypes';
import { format, parseISO } from 'date-fns';
import { Calendar, IndianRupee, Loader2, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface LeadPaymentsProps {
  leadId: number;
}

export const LeadPayments: React.FC<LeadPaymentsProps> = ({ leadId }) => {
  const { usePaymentsList, createPayment, isLoading: isMutating } = usePayments();

  const {
    data: paymentsData,
    isLoading,
    mutate: refreshPayments,
  } = usePaymentsList({ lead: leadId, page_size: 50, ordering: '-created_at' });

  const payments = paymentsData?.results || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreatePaymentPayload>({
    lead: leadId,
    amount: '',
    type: PaymentTypeEnum.INVOICE,
    status: PaymentStatusEnum.PENDING,
    reference_no: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleOpenDialog = useCallback(() => {
    setFormData({
      lead: leadId,
      amount: '',
      type: PaymentTypeEnum.INVOICE,
      status: PaymentStatusEnum.PENDING,
      reference_no: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    });
    setDialogOpen(true);
  }, [leadId]);

  const handleCreate = useCallback(async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await createPayment(formData);
      toast.success('Payment created');
      setDialogOpen(false);
      refreshPayments();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create payment');
    }
  }, [formData, createPayment, refreshPayments]);

  const formatCurrency = (amount: string | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {payments.length} payment{payments.length !== 1 ? 's' : ''}
        </p>
        <Button onClick={handleOpenDialog} size="sm" className="h-7 text-xs px-2.5">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Payment
        </Button>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-card">
          <IndianRupee className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No payments recorded</p>
          <Button onClick={handleOpenDialog} variant="outline" size="sm" className="mt-3 h-7 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Record First Payment
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg bg-card divide-y divide-border/50">
          {payments.map((payment) => {
            const statusColor =
              PAYMENT_STATUS_COLORS[payment.status as PaymentStatusEnum] || '#6B7280';
            const statusLabel =
              PAYMENT_STATUS_LABELS[payment.status as PaymentStatusEnum] || payment.status;
            const typeLabel =
              PAYMENT_TYPE_LABELS[payment.type as PaymentTypeEnum] || payment.type;

            return (
              <div
                key={payment.id}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <div className="h-7 w-7 rounded-md bg-muted/70 flex items-center justify-center shrink-0">
                  <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatCurrency(payment.amount)}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-4 font-medium"
                      style={{
                        backgroundColor: `${statusColor}20`,
                        borderColor: statusColor,
                        color: statusColor,
                      }}
                    >
                      {statusLabel}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {typeLabel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    {payment.reference_no && (
                      <span>Ref: {payment.reference_no}</span>
                    )}
                    {payment.payment_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(parseISO(payment.payment_date), 'MMM dd, yyyy')}
                      </span>
                    )}
                    {!payment.payment_date && payment.created_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(parseISO(payment.created_at), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                  {payment.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {payment.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, type: val as PaymentTypeEnum }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PaymentTypeEnum).map((t) => (
                    <SelectItem key={t} value={t}>
                      {PAYMENT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: val as PaymentStatusEnum,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PaymentStatusEnum).map((s) => (
                    <SelectItem key={s} value={s}>
                      {PAYMENT_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reference_no">Reference No.</Label>
              <Input
                id="reference_no"
                placeholder="e.g. TXN-12345"
                value={formData.reference_no || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reference_no: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Optional notes"
                value={formData.notes || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isMutating}>
              {isMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadPayments;
