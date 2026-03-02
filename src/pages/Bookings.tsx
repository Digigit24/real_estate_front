// src/pages/Bookings.tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '@/hooks/useBookings';
import { useCurrency } from '@/hooks/useCurrency';
import { BookingFormDrawer } from '@/components/bookings/BookingFormDrawer';
import { BookingDetailDrawer } from '@/components/bookings/BookingDetailDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  RefreshCw,
  BookOpen,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { format } from 'date-fns';
import type {
  Booking,
  CreateBookingPayload,
  BookingsQueryParams,
} from '@/types/bookingTypes';
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
} from '@/types/bookingTypes';

export function Bookings() {
  const navigate = useNavigate();
  const {
    useBookingsList,
    useBookingSummary,
    createBooking,
    updateBooking,
    isLoading: isMutating,
  } = useBookings();
  const { formatCurrency } = useCurrency();

  const [searchQuery, setSearchQuery] = useState('');
  const [queryParams, setQueryParams] = useState<BookingsQueryParams>({
    page: 1,
    page_size: 50,
    ordering: '-created_at',
  });

  const {
    data: bookingsData,
    isLoading,
    mutate: refreshBookings,
  } = useBookingsList({
    ...queryParams,
    search: searchQuery || undefined,
  });

  const {
    data: summary,
    isLoading: summaryLoading,
  } = useBookingSummary();

  const bookings = bookingsData?.results || [];

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Detail drawer state
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailBookingId, setDetailBookingId] = useState<number | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  const handleCreate = useCallback(() => {
    setSelectedBooking(null);
    setDrawerOpen(true);
  }, []);

  const handleView = useCallback((booking: Booking) => {
    setDetailBookingId(booking.id);
    setDetailDrawerOpen(true);
  }, []);

  const handleViewDetail = useCallback((booking: Booking) => {
    navigate(`/bookings/${booking.id}`);
  }, [navigate]);

  const handleEdit = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback((booking: Booking) => {
    setBookingToDelete(booking);
    setDeleteDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (data: CreateBookingPayload) => {
      try {
        if (selectedBooking) {
          await updateBooking(selectedBooking.id, data);
          toast.success('Booking updated');
        } else {
          await createBooking(data);
          toast.success('Booking created');
        }
        setDrawerOpen(false);
        refreshBookings();
        mutate(['booking-summary']);
      } catch (err: any) {
        toast.error(err.message || 'Failed to save booking');
      }
    },
    [selectedBooking, createBooking, updateBooking, refreshBookings]
  );

  const handleDelete = useCallback(async () => {
    if (!bookingToDelete) return;
    // Note: The booking service does not expose a delete method.
    // This is a placeholder for future implementation.
    toast.error('Delete is not supported for bookings');
    setDeleteDialogOpen(false);
    setBookingToDelete(null);
  }, [bookingToDelete]);

  const handleDetailRefresh = useCallback(() => {
    refreshBookings();
    mutate(['booking-summary']);
  }, [refreshBookings]);

  const summaryCards = [
    {
      label: 'Total Bookings',
      value: summary?.total_bookings ?? 0,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Value',
      value: summary ? formatCurrency(summary.total_value) : '-',
      icon: IndianRupee,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Collected',
      value: summary ? formatCurrency(summary.collected) : '-',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Pending',
      value: summary ? formatCurrency(summary.pending) : '-',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Manage unit bookings and payment milestones
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Booking
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              {summaryLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-lg font-semibold">{card.value}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => refreshBookings()}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-sm font-medium">No bookings yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create your first booking to start tracking payments.
          </p>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Booking
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Lead Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Unit</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Project</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total Amount</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Collected</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Pending</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleView(booking)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{booking.lead_name || `Lead #${booking.lead}`}</p>
                        {booking.lead_phone && (
                          <p className="text-xs text-muted-foreground">{booking.lead_phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p>{booking.unit_number || `Unit #${booking.unit}`}</p>
                        {booking.tower_name && (
                          <p className="text-xs text-muted-foreground">{booking.tower_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {booking.project_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(booking.total_amount || '0')}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                      {formatCurrency(booking.total_collected || '0')}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-600 font-medium">
                      {formatCurrency(booking.total_pending || '0')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        style={{
                          backgroundColor: BOOKING_STATUS_COLORS[booking.status] || '#94A3B8',
                          color: '#fff',
                        }}
                        className="text-[10px]"
                      >
                        {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(booking);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Quick View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(booking);
                            }}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Full Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(booking);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConfirm(booking);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination info */}
          {bookingsData && bookingsData.count > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Showing {bookings.length} of {bookingsData.count} bookings
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  disabled={!bookingsData.previous}
                  onClick={() =>
                    setQueryParams((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  disabled={!bookingsData.next}
                  onClick={() =>
                    setQueryParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Drawer */}
      <BookingFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        booking={selectedBooking}
        onSubmit={handleSubmit}
        isSubmitting={isMutating}
      />

      {/* Detail Drawer */}
      <BookingDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        bookingId={detailBookingId}
        onRefresh={handleDetailRefresh}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the booking for "
              {bookingToDelete?.lead_name || `Lead #${bookingToDelete?.lead}`}"? This action
              cannot be undone. All associated milestones will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
