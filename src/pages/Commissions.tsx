import { useState, useCallback } from 'react';
import { useBrokers } from '@/hooks/useBrokers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, RefreshCw, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import type { Commission, CommissionsQueryParams } from '@/types/brokerTypes';
import {
  CommissionStatusEnum,
  COMMISSION_STATUS_COLORS,
} from '@/types/brokerTypes';
import { DataTable, DataTableColumn } from '@/components/DataTable';

const COMMISSION_STATUS_LABELS: Record<CommissionStatusEnum, string> = {
  [CommissionStatusEnum.PENDING]: 'Pending',
  [CommissionStatusEnum.PAID]: 'Paid',
  [CommissionStatusEnum.CANCELLED]: 'Cancelled',
};

export function Commissions() {
  const {
    useCommissionsList,
    markCommissionPaid,
    isLoading: isMutating,
  } = useBrokers();

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Mark as paid confirmation
  const [paidDialogOpen, setPaidDialogOpen] = useState(false);
  const [commissionToMark, setCommissionToMark] = useState<Commission | null>(null);

  // Build query params
  const queryParams: CommissionsQueryParams = {
    page: currentPage,
    page_size: 50,
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? (statusFilter as CommissionStatusEnum) : undefined,
  };

  const {
    data: commissionsData,
    error: commissionsError,
    isLoading,
    mutate: refreshCommissions,
  } = useCommissionsList(queryParams);

  const commissions = commissionsData?.results || [];
  const totalCount = commissionsData?.count || 0;
  const hasNext = !!commissionsData?.next;
  const hasPrevious = !!commissionsData?.previous;

  // Handlers
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handleMarkAsPaidConfirm = useCallback((commission: Commission) => {
    setCommissionToMark(commission);
    setPaidDialogOpen(true);
  }, []);

  const handleMarkAsPaid = useCallback(async () => {
    if (!commissionToMark) return;
    try {
      await markCommissionPaid(commissionToMark.id);
      toast.success('Commission marked as paid');
      setPaidDialogOpen(false);
      setCommissionToMark(null);
      refreshCommissions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark commission as paid');
    }
  }, [commissionToMark, markCommissionPaid, refreshCommissions]);

  // Format currency
  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // DataTable columns
  const columns: DataTableColumn<Commission>[] = [
    {
      header: 'Broker Name',
      key: 'broker_name',
      cell: (commission) => (
        <div className="flex flex-col">
          <span className="font-medium">{commission.broker_name || `Broker #${commission.broker}`}</span>
        </div>
      ),
    },
    {
      header: 'Lead',
      key: 'lead_name',
      cell: (commission) => (
        <span className="text-sm">{commission.lead_name || 'N/A'}</span>
      ),
    },
    {
      header: 'Unit',
      key: 'booking_unit',
      cell: (commission) => (
        <span className="text-sm">{commission.booking_unit || `Booking #${commission.booking}`}</span>
      ),
    },
    {
      header: 'Amount',
      key: 'amount',
      cell: (commission) => (
        <span className="text-sm font-medium">{formatAmount(commission.amount)}</span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      cell: (commission) => (
        <Badge
          variant="secondary"
          style={{
            backgroundColor: `${COMMISSION_STATUS_COLORS[commission.status]}20`,
            color: COMMISSION_STATUS_COLORS[commission.status],
            borderColor: `${COMMISSION_STATUS_COLORS[commission.status]}40`,
          }}
          className="border text-xs font-medium"
        >
          {COMMISSION_STATUS_LABELS[commission.status]}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      cell: (commission) => (
        <div>
          {commission.status === CommissionStatusEnum.PENDING && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsPaidConfirm(commission);
              }}
              disabled={isMutating}
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Mark as Paid
            </Button>
          )}
          {commission.status === CommissionStatusEnum.PAID && commission.paid_date && (
            <span className="text-xs text-muted-foreground">
              Paid {new Date(commission.paid_date).toLocaleDateString()}
            </span>
          )}
        </div>
      ),
    },
  ];

  // Mobile card renderer
  const renderMobileCard = (commission: Commission, actions: any) => (
    <>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {commission.broker_name || `Broker #${commission.broker}`}
          </h3>
          <p className="text-xs text-muted-foreground">
            {commission.lead_name || 'N/A'} - {commission.booking_unit || `Booking #${commission.booking}`}
          </p>
        </div>
        <Badge
          variant="secondary"
          style={{
            backgroundColor: `${COMMISSION_STATUS_COLORS[commission.status]}20`,
            color: COMMISSION_STATUS_COLORS[commission.status],
            borderColor: `${COMMISSION_STATUS_COLORS[commission.status]}40`,
          }}
          className="border text-xs font-medium"
        >
          {COMMISSION_STATUS_LABELS[commission.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Amount</p>
          <p className="font-medium">{formatAmount(commission.amount)}</p>
        </div>
        {commission.paid_date && (
          <div>
            <p className="text-muted-foreground text-xs">Paid Date</p>
            <p className="font-medium">{new Date(commission.paid_date).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {commission.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2">{commission.notes}</p>
      )}

      <div className="flex gap-2 pt-2">
        {commission.status === CommissionStatusEnum.PENDING && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkAsPaidConfirm(commission)}
            className="flex-1"
          >
            <DollarSign className="h-3 w-3 mr-1" />
            Mark as Paid
          </Button>
        )}
        {actions.view && (
          <Button size="sm" variant="outline" onClick={actions.view} className="flex-1">
            View
          </Button>
        )}
      </div>
    </>
  );

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Commissions</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage broker commissions
          </p>
        </div>
      </div>

      {/* Toolbar: Search + Status Filter + Refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search commissions..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9 h-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(CommissionStatusEnum).map((status) => (
              <SelectItem key={status} value={status}>
                {COMMISSION_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => refreshCommissions()}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      {isLoading && commissions.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : commissionsError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-destructive">{commissionsError.message}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => refreshCommissions()}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <DataTable
            rows={commissions}
            isLoading={isLoading}
            columns={columns}
            renderMobileCard={renderMobileCard}
            getRowId={(commission) => commission.id}
            getRowLabel={(commission) =>
              `${commission.broker_name || 'Broker'} - ${formatAmount(commission.amount)}`
            }
            emptyTitle="No commissions found"
            emptySubtitle="Commissions will appear here when brokers close deals"
          />

          {/* Pagination */}
          {!isLoading && commissions.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Showing {commissions.length} of {totalCount} commission(s)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  disabled={!hasPrevious}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  disabled={!hasNext}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mark as Paid Confirmation */}
      <AlertDialog open={paidDialogOpen} onOpenChange={setPaidDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Commission as Paid</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this commission of{' '}
              {commissionToMark ? formatAmount(commissionToMark.amount) : ''} for{' '}
              {commissionToMark?.broker_name || 'this broker'} as paid? This action will update
              the payment status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsPaid}>
              Mark as Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
