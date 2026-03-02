import { useState, useCallback } from 'react';
import { SideDrawer } from '@/components/SideDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MilestonePaymentDialog } from './MilestonePaymentDialog';
import { format } from 'date-fns';
import { CheckCircle, Clock, AlertTriangle, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from '@/hooks/useCurrency';
import { useBookings } from '@/hooks/useBookings';
import type {
  Booking,
  PaymentMilestone,
  MarkMilestonePaidPayload,
} from '@/types/bookingTypes';
import {
  BookingStatusEnum,
  MilestoneStatusEnum,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  MILESTONE_STATUS_COLORS,
} from '@/types/bookingTypes';

interface BookingDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number | null;
  onRefresh?: () => void;
}

export function BookingDetailDrawer({
  open,
  onOpenChange,
  bookingId,
  onRefresh,
}: BookingDetailDrawerProps) {
  const { useBooking, useMilestones, markMilestonePaid, isLoading: isMutating } = useBookings();
  const { formatCurrency } = useCurrency();

  const { data: booking, isLoading: bookingLoading, mutate: refreshBooking } = useBooking(bookingId);
  const { data: milestones, isLoading: milestonesLoading, mutate: refreshMilestones } = useMilestones(bookingId);

  // Milestone payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<PaymentMilestone | null>(null);

  const handleMarkPaid = useCallback((milestone: PaymentMilestone) => {
    setSelectedMilestone(milestone);
    setPaymentDialogOpen(true);
  }, []);

  const handlePaymentSubmit = useCallback(async (payload: MarkMilestonePaidPayload) => {
    if (!bookingId || !selectedMilestone) return;
    try {
      await markMilestonePaid(bookingId, selectedMilestone.id, payload);
      toast.success('Milestone marked as paid');
      setPaymentDialogOpen(false);
      setSelectedMilestone(null);
      refreshBooking();
      refreshMilestones();
      onRefresh?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record payment');
    }
  }, [bookingId, selectedMilestone, markMilestonePaid, refreshBooking, refreshMilestones, onRefresh]);

  const getMilestoneStatusIcon = (status: MilestoneStatusEnum) => {
    switch (status) {
      case MilestoneStatusEnum.PAID:
        return <CheckCircle className="h-3.5 w-3.5" />;
      case MilestoneStatusEnum.OVERDUE:
        return <AlertTriangle className="h-3.5 w-3.5" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const isLoading = bookingLoading || milestonesLoading;

  return (
    <>
      <SideDrawer
        open={open}
        onOpenChange={onOpenChange}
        title={booking ? `Booking #${booking.id}` : 'Booking Details'}
        description={booking ? `${booking.lead_name || 'Lead'} - ${booking.unit_number || `Unit ${booking.unit}`}` : undefined}
        mode="view"
        isLoading={isLoading}
        loadingText="Loading booking details..."
        size="lg"
        resizable={true}
        storageKey="booking-detail-drawer-width"
        footerButtons={[
          {
            label: 'Close',
            variant: 'outline',
            onClick: () => onOpenChange(false),
          },
        ]}
      >
        {booking && (
          <div className="space-y-6">
            {/* Booking Status */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
              <Badge
                style={{
                  backgroundColor: BOOKING_STATUS_COLORS[booking.status] || '#94A3B8',
                  color: '#fff',
                }}
              >
                {BOOKING_STATUS_LABELS[booking.status] || booking.status}
              </Badge>
            </div>

            <Separator />

            {/* Booking Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Booking Information</h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Lead</p>
                  <p className="font-medium mt-0.5">{booking.lead_name || `Lead #${booking.lead}`}</p>
                  {booking.lead_phone && (
                    <p className="text-xs text-muted-foreground">{booking.lead_phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Unit</p>
                  <p className="font-medium mt-0.5">{booking.unit_number || `Unit #${booking.unit}`}</p>
                  {booking.tower_name && (
                    <p className="text-xs text-muted-foreground">{booking.tower_name}</p>
                  )}
                </div>
                {booking.project_name && (
                  <div>
                    <p className="text-xs text-muted-foreground">Project</p>
                    <p className="font-medium mt-0.5">{booking.project_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Booking Date</p>
                  <p className="font-medium mt-0.5">
                    {booking.booking_date
                      ? format(new Date(booking.booking_date), 'dd MMM yyyy')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Plan</p>
                  <p className="font-medium mt-0.5">
                    {booking.payment_plan_type === '20_80'
                      ? '20:80 Plan'
                      : booking.payment_plan_type === 'CONSTRUCTION_LINKED'
                      ? 'Construction Linked'
                      : booking.payment_plan_type || '-'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Financial Summary */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Financial Summary</h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Token Amount</p>
                  <p className="font-semibold mt-0.5">
                    {formatCurrency(booking.token_amount || '0')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-semibold mt-0.5">
                    {formatCurrency(booking.total_amount || '0')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Collected</p>
                  <p className="font-semibold mt-0.5 text-green-600">
                    {formatCurrency(booking.total_collected || '0')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="font-semibold mt-0.5 text-amber-600">
                    {formatCurrency(booking.total_pending || '0')}
                  </p>
                </div>
              </div>
            </div>

            {/* Remarks */}
            {booking.remarks && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Remarks</h4>
                  <p className="text-sm">{booking.remarks}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Payment Milestones */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Banknote className="h-4 w-4" />
                  Payment Milestones
                </h4>
                <span className="text-xs text-muted-foreground">
                  {milestones?.length || 0} milestones
                </span>
              </div>

              {milestonesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : milestones && milestones.length > 0 ? (
                <div className="space-y-2">
                  {milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${MILESTONE_STATUS_COLORS[milestone.status]}20`,
                              color: MILESTONE_STATUS_COLORS[milestone.status],
                            }}
                          >
                            {getMilestoneStatusIcon(milestone.status)}
                            {milestone.status}
                          </span>
                        </div>
                        {(milestone.status === MilestoneStatusEnum.PENDING ||
                          milestone.status === MilestoneStatusEnum.OVERDUE ||
                          milestone.status === MilestoneStatusEnum.PARTIALLY_PAID) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleMarkPaid(milestone)}
                          >
                            Mark as Paid
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{milestone.milestone_name}</span>
                        <span className="font-semibold">
                          {formatCurrency(milestone.amount || '0')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Due: {milestone.due_date
                            ? format(new Date(milestone.due_date), 'dd MMM yyyy')
                            : '-'}
                        </span>
                        <span>{milestone.percentage}%</span>
                      </div>

                      {milestone.received_amount && (
                        <div className="flex items-center justify-between text-xs text-green-600 pt-1 border-t">
                          <span>
                            Received: {formatCurrency(milestone.received_amount)}
                            {milestone.received_date &&
                              ` on ${format(new Date(milestone.received_date), 'dd MMM yyyy')}`}
                          </span>
                          {milestone.reference_no && (
                            <span className="text-muted-foreground">
                              Ref: {milestone.reference_no}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">No milestones found</p>
                </div>
              )}
            </div>

            {/* Timestamps */}
            {(booking.created_at || booking.updated_at) && (
              <>
                <Separator />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {booking.created_at && (
                    <span>
                      Created: {format(new Date(booking.created_at), 'dd MMM yyyy, hh:mm a')}
                    </span>
                  )}
                  {booking.updated_at && (
                    <span>
                      Updated: {format(new Date(booking.updated_at), 'dd MMM yyyy, hh:mm a')}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </SideDrawer>

      {/* Milestone Payment Dialog */}
      <MilestonePaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        milestone={selectedMilestone}
        onSubmit={handlePaymentSubmit}
        isSubmitting={isMutating}
      />
    </>
  );
}
