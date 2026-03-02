// src/pages/BookingDetail.tsx
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookings } from '@/hooks/useBookings';
import { useCurrency } from '@/hooks/useCurrency';
import { BookingFormDrawer } from '@/components/bookings/BookingFormDrawer';
import { MilestonePaymentDialog } from '@/components/bookings/MilestonePaymentDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Pencil,
  User,
  Home,
  Calendar,
  Banknote,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  Booking,
  PaymentMilestone,
  CreateBookingPayload,
  MarkMilestonePaidPayload,
} from '@/types/bookingTypes';
import {
  BookingStatusEnum,
  MilestoneStatusEnum,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  MILESTONE_STATUS_COLORS,
} from '@/types/bookingTypes';

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookingId = id ? parseInt(id) : null;

  const {
    useBooking,
    useMilestones,
    updateBooking,
    markMilestonePaid,
    isLoading: isMutating,
  } = useBookings();
  const { formatCurrency } = useCurrency();

  const { data: booking, isLoading: bookingLoading, mutate: refreshBooking } = useBooking(bookingId);
  const { data: milestones, isLoading: milestonesLoading, mutate: refreshMilestones } = useMilestones(bookingId);

  // Edit drawer state
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  // Milestone payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<PaymentMilestone | null>(null);

  const handleEditSubmit = useCallback(
    async (data: CreateBookingPayload) => {
      if (!bookingId) return;
      try {
        await updateBooking(bookingId, data);
        toast.success('Booking updated');
        setEditDrawerOpen(false);
        refreshBooking();
      } catch (err: any) {
        toast.error(err.message || 'Failed to update booking');
      }
    },
    [bookingId, updateBooking, refreshBooking]
  );

  const handleMarkPaid = useCallback((milestone: PaymentMilestone) => {
    setSelectedMilestone(milestone);
    setPaymentDialogOpen(true);
  }, []);

  const handlePaymentSubmit = useCallback(
    async (payload: MarkMilestonePaidPayload) => {
      if (!bookingId || !selectedMilestone) return;
      try {
        await markMilestonePaid(bookingId, selectedMilestone.id, payload);
        toast.success('Milestone marked as paid');
        setPaymentDialogOpen(false);
        setSelectedMilestone(null);
        refreshBooking();
        refreshMilestones();
      } catch (err: any) {
        toast.error(err.message || 'Failed to record payment');
      }
    },
    [bookingId, selectedMilestone, markMilestonePaid, refreshBooking, refreshMilestones]
  );

  const getMilestoneStatusIcon = (status: MilestoneStatusEnum) => {
    switch (status) {
      case MilestoneStatusEnum.PAID:
        return <CheckCircle className="h-4 w-4" />;
      case MilestoneStatusEnum.OVERDUE:
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (bookingLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 col-span-2" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6 text-center py-16">
        <p className="text-muted-foreground">Booking not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/bookings')}>
          Back to Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate('/bookings')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">
                Booking #{booking.id}
              </h1>
              <Badge
                style={{
                  backgroundColor: BOOKING_STATUS_COLORS[booking.status] || '#94A3B8',
                  color: '#fff',
                }}
              >
                {BOOKING_STATUS_LABELS[booking.status] || booking.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {booking.lead_name || `Lead #${booking.lead}`} - {booking.unit_number || `Unit #${booking.unit}`}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditDrawerOpen(true)}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Edit Booking
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buyer Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Buyer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Lead Name</p>
                <p className="font-medium mt-0.5">
                  {booking.lead_name || `Lead #${booking.lead}`}
                </p>
              </div>
              {booking.lead_phone && (
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium mt-0.5">{booking.lead_phone}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Booking Date</p>
                <p className="font-medium mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
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
              {booking.remarks && (
                <div>
                  <p className="text-xs text-muted-foreground">Remarks</p>
                  <p className="mt-0.5 text-muted-foreground">{booking.remarks}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unit Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Home className="h-4 w-4" />
              Unit Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Unit</p>
                <p className="font-medium mt-0.5">
                  {booking.unit_number || `Unit #${booking.unit}`}
                </p>
              </div>
              {booking.tower_name && (
                <div>
                  <p className="text-xs text-muted-foreground">Tower</p>
                  <p className="font-medium mt-0.5">{booking.tower_name}</p>
                </div>
              )}
              {booking.project_name && (
                <div>
                  <p className="text-xs text-muted-foreground">Project</p>
                  <p className="font-medium mt-0.5">{booking.project_name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
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

            {/* Progress bar */}
            {booking.total_amount && parseFloat(booking.total_amount) > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Payment Progress</span>
                  <span>
                    {Math.round(
                      (parseFloat(booking.total_collected || '0') /
                        parseFloat(booking.total_amount)) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (parseFloat(booking.total_collected || '0') /
                          parseFloat(booking.total_amount)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            Payment Schedule ({milestones?.length || 0} milestones)
          </h2>
        </div>

        {milestonesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : milestones && milestones.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Milestone
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Due Date
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      %
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Received
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((milestone) => (
                    <tr
                      key={milestone.id}
                      className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getMilestoneStatusIcon(milestone.status)}
                          <span className="font-medium">
                            {milestone.milestone_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {milestone.due_date
                          ? format(new Date(milestone.due_date), 'dd MMM yyyy')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(milestone.amount || '0')}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {milestone.percentage}%
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: MILESTONE_STATUS_COLORS[milestone.status],
                            color: MILESTONE_STATUS_COLORS[milestone.status],
                          }}
                          className="text-[10px]"
                        >
                          {milestone.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {milestone.received_amount ? (
                          <div>
                            <p className="font-medium text-green-600">
                              {formatCurrency(milestone.received_amount)}
                            </p>
                            {milestone.received_date && (
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(milestone.received_date), 'dd MMM yyyy')}
                              </p>
                            )}
                            {milestone.reference_no && (
                              <p className="text-xs text-muted-foreground">
                                Ref: {milestone.reference_no}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Banknote className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No payment milestones found for this booking.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timestamps */}
      {(booking.created_at || booking.updated_at) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
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
      )}

      {/* Edit Booking Drawer */}
      <BookingFormDrawer
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        booking={booking}
        onSubmit={handleEditSubmit}
        isSubmitting={isMutating}
      />

      {/* Milestone Payment Dialog */}
      <MilestonePaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        milestone={selectedMilestone}
        onSubmit={handlePaymentSubmit}
        isSubmitting={isMutating}
      />
    </div>
  );
}
