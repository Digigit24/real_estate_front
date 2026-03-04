// src/pages/Payments.tsx
import { DataTable, DataTableColumn } from '@/components/DataTable';
import { PaymentFormDrawer } from '@/components/payments/PaymentFormDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { usePayments } from '@/hooks/usePayments';
import type { CreatePaymentPayload, Payment, PaymentsQueryParams } from '@/types/paymentTypes';
import {
    PAYMENT_STATUS_COLORS,
    PAYMENT_STATUS_LABELS,
    PAYMENT_TYPE_LABELS,
    PaymentStatusEnum,
    PaymentTypeEnum,
} from '@/types/paymentTypes';
import { format } from 'date-fns';
import { Banknote, Plus, RefreshCw, Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

const PAYMENT_TYPE_BADGE_COLORS: Record<PaymentTypeEnum, string> = {
    [PaymentTypeEnum.INVOICE]: '#3B82F6',
    [PaymentTypeEnum.REFUND]: '#8B5CF6',
    [PaymentTypeEnum.ADVANCE]: '#14B8A6',
    [PaymentTypeEnum.OTHER]: '#6B7280',
};

export function PaymentsPage() {
    const {
        usePaymentsList,
        createPayment,
        updatePayment,
        isLoading: isMutating,
    } = usePayments();
    const { formatCurrency } = useCurrency();

    // Search & filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    // Build query params
    const queryParams: PaymentsQueryParams = {
        page: currentPage,
        page_size: 50,
        search: searchQuery || undefined,
        type: typeFilter !== 'all' ? (typeFilter as PaymentTypeEnum) : undefined,
        status: statusFilter !== 'all' ? (statusFilter as PaymentStatusEnum) : undefined,
    };

    const {
        data: paymentsData,
        error: paymentsError,
        isLoading,
        mutate: refreshPayments,
    } = usePaymentsList(queryParams);

    const payments = paymentsData?.results || [];
    const totalCount = paymentsData?.count || 0;
    const hasNext = !!paymentsData?.next;
    const hasPrevious = !!paymentsData?.previous;

    // Handlers
    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    }, []);

    const handleTypeFilter = useCallback((value: string) => {
        setTypeFilter(value);
        setCurrentPage(1);
    }, []);

    const handleStatusFilter = useCallback((value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    }, []);

    const handleCreate = useCallback(() => {
        setSelectedPayment(null);
        setDrawerOpen(true);
    }, []);

    const handleEdit = useCallback((payment: Payment) => {
        setSelectedPayment(payment);
        setDrawerOpen(true);
    }, []);

    const handleView = useCallback((payment: Payment) => {
        setSelectedPayment(payment);
        setDrawerOpen(true);
    }, []);

    const handleSubmit = useCallback(async (data: CreatePaymentPayload) => {
        try {
            if (selectedPayment) {
                await updatePayment(selectedPayment.id, data);
                toast.success('Payment updated successfully');
            } else {
                await createPayment(data);
                toast.success('Payment recorded successfully');
            }
            setDrawerOpen(false);
            refreshPayments();
        } catch (err: any) {
            toast.error(err.message || 'Failed to save payment');
        }
    }, [selectedPayment, createPayment, updatePayment, refreshPayments]);

    // DataTable columns
    const columns: DataTableColumn<Payment>[] = [
        {
            header: 'Lead',
            key: 'lead_name',
            cell: (payment) => (
                <div className="flex flex-col">
                    <span className="font-medium">
                        {payment.lead_name || (payment.lead ? `Lead #${payment.lead}` : 'N/A')}
                    </span>
                </div>
            ),
        },
        {
            header: 'Type',
            key: 'type',
            cell: (payment) => (
                <Badge
                    variant="secondary"
                    style={{
                        backgroundColor: `${PAYMENT_TYPE_BADGE_COLORS[payment.type]}15`,
                        color: PAYMENT_TYPE_BADGE_COLORS[payment.type],
                        borderColor: `${PAYMENT_TYPE_BADGE_COLORS[payment.type]}30`,
                    }}
                    className="border text-xs font-medium"
                >
                    {PAYMENT_TYPE_LABELS[payment.type]}
                </Badge>
            ),
        },
        {
            header: 'Amount',
            key: 'amount',
            cell: (payment) => (
                <span className="text-sm font-semibold">
                    {formatCurrency(payment.amount || '0')}
                </span>
            ),
        },
        {
            header: 'Reference',
            key: 'reference_no',
            cell: (payment) => (
                <span className="text-sm text-muted-foreground">
                    {payment.reference_no || '-'}
                </span>
            ),
        },
        {
            header: 'Status',
            key: 'status',
            cell: (payment) => (
                <Badge
                    variant="secondary"
                    style={{
                        backgroundColor: `${PAYMENT_STATUS_COLORS[payment.status]}20`,
                        color: PAYMENT_STATUS_COLORS[payment.status],
                        borderColor: `${PAYMENT_STATUS_COLORS[payment.status]}40`,
                    }}
                    className="border text-xs font-medium"
                >
                    {PAYMENT_STATUS_LABELS[payment.status]}
                </Badge>
            ),
        },
        {
            header: 'Date',
            key: 'payment_date',
            cell: (payment) => (
                <span className="text-sm text-muted-foreground">
                    {payment.payment_date
                        ? format(new Date(payment.payment_date), 'dd MMM yyyy')
                        : payment.created_at
                            ? format(new Date(payment.created_at), 'dd MMM yyyy')
                            : '-'}
                </span>
            ),
        },
    ];

    // Mobile card renderer
    const renderMobileCard = (payment: Payment, actions: any) => (
        <>
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                        {payment.lead_name || (payment.lead ? `Lead #${payment.lead}` : 'Payment')}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {payment.reference_no || 'No reference'}
                    </p>
                </div>
                <Badge
                    variant="secondary"
                    style={{
                        backgroundColor: `${PAYMENT_STATUS_COLORS[payment.status]}20`,
                        color: PAYMENT_STATUS_COLORS[payment.status],
                        borderColor: `${PAYMENT_STATUS_COLORS[payment.status]}40`,
                    }}
                    className="border text-xs font-medium"
                >
                    {PAYMENT_STATUS_LABELS[payment.status]}
                </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                    <p className="text-muted-foreground text-xs">Type</p>
                    <p className="font-medium">{PAYMENT_TYPE_LABELS[payment.type]}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs">Amount</p>
                    <p className="font-semibold">{formatCurrency(payment.amount || '0')}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs">Date</p>
                    <p className="font-medium">
                        {payment.payment_date
                            ? format(new Date(payment.payment_date), 'dd MMM')
                            : '-'}
                    </p>
                </div>
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
            </div>
        </>
    );

    return (
        <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold">Payments</h1>
                    <p className="text-sm text-muted-foreground">
                        Track and manage all payment records
                    </p>
                </div>
                <Button size="sm" onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Payment
                </Button>
            </div>

            {/* Toolbar: Search + Type Filter + Status Filter + Refresh */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search payments..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="pl-9 h-9"
                    />
                </div>

                <Select value={typeFilter} onValueChange={handleTypeFilter}>
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.values(PaymentTypeEnum).map((type) => (
                            <SelectItem key={type} value={type}>
                                {PAYMENT_TYPE_LABELS[type]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.values(PaymentStatusEnum).map((status) => (
                            <SelectItem key={status} value={status}>
                                {PAYMENT_STATUS_LABELS[status]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => refreshPayments()}
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            {isLoading && payments.length === 0 ? (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                </div>
            ) : paymentsError ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-sm text-destructive">{paymentsError.message}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => refreshPayments()}
                    >
                        <RefreshCw className="h-4 w-4 mr-1.5" />
                        Retry
                    </Button>
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <DataTable
                        rows={payments}
                        isLoading={isLoading}
                        columns={columns}
                        renderMobileCard={renderMobileCard}
                        getRowId={(payment) => payment.id}
                        getRowLabel={(payment) => payment.lead_name || `Payment #${payment.id}`}
                        onView={handleView}
                        onEdit={handleEdit}
                        emptyTitle="No payments found"
                        emptySubtitle="Try adjusting your search or filters, or add a new payment"
                    />

                    {/* Pagination */}
                    {!isLoading && payments.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
                            <p className="text-xs text-muted-foreground">
                                Showing {payments.length} of {totalCount} payment(s)
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
            <PaymentFormDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                payment={selectedPayment}
                onSubmit={handleSubmit}
                isSubmitting={isMutating}
            />
        </div>
    );
}
