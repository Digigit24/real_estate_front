import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '@/hooks/useBookings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ExternalLink, Home, Calendar, IndianRupee } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  BookingStatusEnum,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
} from '@/types/bookingTypes';

interface LeadBookingsProps {
  leadId: number;
}

export const LeadBookings: React.FC<LeadBookingsProps> = ({ leadId }) => {
  const navigate = useNavigate();
  const { useBookingsList } = useBookings();

  const {
    data: bookingsData,
    isLoading,
  } = useBookingsList({ lead: leadId, page_size: 50 });

  const bookings = bookingsData?.results || [];

  const handleViewBooking = useCallback(
    (bookingId: number) => {
      navigate(`/bookings/${bookingId}`);
    },
    [navigate]
  );

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

  if (bookings.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-card">
        <Home className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">No bookings for this lead</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
      </p>
      <div className="border rounded-lg bg-card divide-y divide-border/50">
        {bookings.map((booking) => {
          const statusColor =
            BOOKING_STATUS_COLORS[booking.status as BookingStatusEnum] || '#6B7280';
          const statusLabel =
            BOOKING_STATUS_LABELS[booking.status as BookingStatusEnum] || booking.status;

          return (
            <div
              key={booking.id}
              className="flex items-center gap-3 px-3 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleViewBooking(booking.id)}
            >
              <div className="h-8 w-8 rounded-md bg-muted/70 flex items-center justify-center shrink-0">
                <Home className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {booking.unit_number || `Unit #${booking.unit}`}
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
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  {booking.project_name && (
                    <span className="truncate">
                      {booking.project_name}
                      {booking.tower_name ? ` / ${booking.tower_name}` : ''}
                    </span>
                  )}
                  {booking.booking_date && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(booking.booking_date), 'MMM dd, yyyy')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="flex items-center gap-1 font-medium text-green-600">
                    <IndianRupee className="h-3 w-3" />
                    {formatCurrency(booking.total_amount)}
                  </span>
                  {booking.total_collected && (
                    <span className="text-muted-foreground">
                      Collected: {formatCurrency(booking.total_collected)}
                    </span>
                  )}
                  {booking.total_pending && (
                    <span className="text-orange-600">
                      Pending: {formatCurrency(booking.total_pending)}
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadBookings;
