import { useState, useCallback } from 'react';
import { useBrokers } from '@/hooks/useBrokers';
import { BrokerFormDrawer } from '@/components/brokers/BrokerFormDrawer';
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
import { Plus, Search, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { Broker, CreateBrokerPayload, BrokersQueryParams } from '@/types/brokerTypes';
import {
  BrokerStatusEnum,
  BROKER_STATUS_COLORS,
  BROKER_STATUS_LABELS,
} from '@/types/brokerTypes';
import { DataTable, DataTableColumn } from '@/components/DataTable';

export function Brokers() {
  const {
    useBrokersList,
    createBroker,
    updateBroker,
    deleteBroker,
    isLoading: isMutating,
  } = useBrokers();

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brokerToDelete, setBrokerToDelete] = useState<Broker | null>(null);

  // Build query params
  const queryParams: BrokersQueryParams = {
    page: currentPage,
    page_size: 50,
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? (statusFilter as BrokerStatusEnum) : undefined,
  };

  const {
    data: brokersData,
    error: brokersError,
    isLoading,
    mutate: refreshBrokers,
  } = useBrokersList(queryParams);

  const brokers = brokersData?.results || [];
  const totalCount = brokersData?.count || 0;
  const hasNext = !!brokersData?.next;
  const hasPrevious = !!brokersData?.previous;

  // Handlers
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedBroker(null);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((broker: Broker) => {
    setSelectedBroker(broker);
    setDrawerOpen(true);
  }, []);

  const handleView = useCallback((broker: Broker) => {
    setSelectedBroker(broker);
    setDrawerOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback((broker: Broker) => {
    setBrokerToDelete(broker);
    setDeleteDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async (data: CreateBrokerPayload) => {
    try {
      if (selectedBroker) {
        await updateBroker(selectedBroker.id, data);
        toast.success('Broker updated successfully');
      } else {
        await createBroker(data);
        toast.success('Broker added successfully');
      }
      setDrawerOpen(false);
      refreshBrokers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save broker');
    }
  }, [selectedBroker, createBroker, updateBroker, refreshBrokers]);

  const handleDelete = useCallback(async () => {
    if (!brokerToDelete) return;
    try {
      await deleteBroker(brokerToDelete.id);
      toast.success('Broker deleted successfully');
      setDeleteDialogOpen(false);
      setBrokerToDelete(null);
      refreshBrokers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete broker');
    }
  }, [brokerToDelete, deleteBroker, refreshBrokers]);

  const handleDeleteFromTable = useCallback(async (broker: Broker) => {
    handleDeleteConfirm(broker);
  }, [handleDeleteConfirm]);

  // DataTable columns
  const columns: DataTableColumn<Broker>[] = [
    {
      header: 'Name',
      key: 'name',
      cell: (broker) => (
        <div className="flex flex-col">
          <span className="font-medium">{broker.name}</span>
          {broker.email && (
            <span className="text-xs text-muted-foreground">{broker.email}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Phone',
      key: 'phone',
      cell: (broker) => (
        <span className="text-sm">{broker.phone}</span>
      ),
    },
    {
      header: 'Company',
      key: 'company_name',
      cell: (broker) => (
        <span className="text-sm">{broker.company_name || 'N/A'}</span>
      ),
    },
    {
      header: 'Commission Rate',
      key: 'commission_rate',
      cell: (broker) => (
        <span className="text-sm font-medium">{broker.commission_rate}%</span>
      ),
    },
    {
      header: 'City',
      key: 'city',
      cell: (broker) => (
        <span className="text-sm">{broker.city || 'N/A'}</span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      cell: (broker) => (
        <Badge
          variant="secondary"
          style={{
            backgroundColor: `${BROKER_STATUS_COLORS[broker.status]}20`,
            color: BROKER_STATUS_COLORS[broker.status],
            borderColor: `${BROKER_STATUS_COLORS[broker.status]}40`,
          }}
          className="border text-xs font-medium"
        >
          {BROKER_STATUS_LABELS[broker.status]}
        </Badge>
      ),
    },
  ];

  // Mobile card renderer
  const renderMobileCard = (broker: Broker, actions: any) => (
    <>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            {broker.name}
          </h3>
          <p className="text-xs text-muted-foreground">{broker.phone}</p>
        </div>
        <Badge
          variant="secondary"
          style={{
            backgroundColor: `${BROKER_STATUS_COLORS[broker.status]}20`,
            color: BROKER_STATUS_COLORS[broker.status],
            borderColor: `${BROKER_STATUS_COLORS[broker.status]}40`,
          }}
          className="border text-xs font-medium"
        >
          {BROKER_STATUS_LABELS[broker.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Company</p>
          <p className="font-medium truncate">{broker.company_name || 'N/A'}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Commission</p>
          <p className="font-medium">{broker.commission_rate}%</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">City</p>
          <p className="font-medium">{broker.city || 'N/A'}</p>
        </div>
        {broker.rera_number && (
          <div>
            <p className="text-muted-foreground text-xs">RERA</p>
            <p className="font-medium truncate">{broker.rera_number}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        {actions.view && (
          <Button size="sm" variant="outline" onClick={actions.view} className="flex-1">
            View
          </Button>
        )}
        {actions.edit && (
          <Button size="sm" variant="outline" onClick={actions.edit} className="flex-1">
            Edit
          </Button>
        )}
        {actions.askDelete && (
          <Button size="sm" variant="destructive" onClick={actions.askDelete}>
            Delete
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
          <h1 className="text-lg font-semibold">Brokers</h1>
          <p className="text-sm text-muted-foreground">
            Manage channel partners
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Broker
        </Button>
      </div>

      {/* Toolbar: Search + Status Filter + Refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brokers..."
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
            {Object.values(BrokerStatusEnum).map((status) => (
              <SelectItem key={status} value={status}>
                {BROKER_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => refreshBrokers()}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      {isLoading && brokers.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : brokersError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-destructive">{brokersError.message}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => refreshBrokers()}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <DataTable
            rows={brokers}
            isLoading={isLoading}
            columns={columns}
            renderMobileCard={renderMobileCard}
            getRowId={(broker) => broker.id}
            getRowLabel={(broker) => broker.name}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteFromTable}
            emptyTitle="No brokers found"
            emptySubtitle="Try adjusting your search or filters, or add a new broker"
          />

          {/* Pagination */}
          {!isLoading && brokers.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Showing {brokers.length} of {totalCount} broker(s)
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

      {/* Form Drawer */}
      <BrokerFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        broker={selectedBroker}
        onSubmit={handleSubmit}
        isSubmitting={isMutating}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Broker</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{brokerToDelete?.name}"? This action cannot be undone.
              All associated commissions will also be affected.
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
