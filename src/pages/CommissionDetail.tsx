import { CommissionFormDrawer } from '@/components/brokers/CommissionFormDrawer';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBrokers } from '@/hooks/useBrokers';
import { useCurrency } from '@/hooks/useCurrency';
import {
    COMMISSION_STATUS_COLORS,
    COMMISSION_STATUS_LABELS,
    CommissionStatusEnum,
    CreateCommissionPayload,
    UpdateCommissionPayload,
} from '@/types/brokerTypes';
import { format } from 'date-fns';
import { ArrowLeft, Clock, DollarSign, Edit, MapPin, NotebookPen, Phone, Trash2, User } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export function CommissionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const commissionId = id ? parseInt(id) : null;

    const {
        useCommissionDetail,
        updateCommission,
        deleteCommission,
        markCommissionPaid,
        isLoading: isMutating,
    } = useBrokers();

    const { formatCurrency } = useCurrency();

    const { data: commission, isLoading: commissionLoading, mutate: refreshCommission } = useCommissionDetail(commissionId);

    // Edit drawer state
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);

    // Delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleEditSubmit = useCallback(
        async (data: CreateCommissionPayload | UpdateCommissionPayload) => {
            if (!commissionId) return;
            try {
                await updateCommission(commissionId, data as UpdateCommissionPayload);
                toast.success('Commission updated successfully');
                setEditDrawerOpen(false);
                refreshCommission();
            } catch (err: any) {
                toast.error(err.message || 'Failed to update commission');
            }
        },
        [commissionId, updateCommission, refreshCommission]
    );

    const handleMarkPaid = useCallback(async () => {
        if (!commissionId) return;
        try {
            const today = new Date().toISOString().split('T')[0];
            await markCommissionPaid(commissionId, today);
            toast.success('Commission marked as paid');
            refreshCommission();
        } catch (err: any) {
            toast.error(err.message || 'Failed to mark commission as paid');
        }
    }, [commissionId, markCommissionPaid, refreshCommission]);

    const handleDelete = useCallback(async () => {
        if (!commissionId) return;
        try {
            await deleteCommission(commissionId);
            toast.success('Commission deleted successfully');
            setDeleteDialogOpen(false);
            navigate('/brokers/commissions');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete commission');
        }
    }, [commissionId, deleteCommission, navigate]);

    if (commissionLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </div>
            </div>
        );
    }

    if (!commission) {
        return (
            <div className="p-6 text-center py-16">
                <p className="text-muted-foreground">Commission not found.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/brokers/commissions')}>
                    Back to Commissions
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate('/brokers/commissions')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold">
                                Commission #{commission.id}
                            </h1>
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
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-11 sm:ml-0">
                    {commission.status === CommissionStatusEnum.PENDING && (
                        <Button size="sm" variant="outline" onClick={handleMarkPaid} disabled={isMutating}>
                            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                            Mark Paid
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditDrawerOpen(true)}
                    >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                            Important Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Broker</p>
                                <p className="text-sm text-muted-foreground">
                                    {commission.broker_name || `Broker #${commission.broker}`}
                                </p>
                                {commission.broker_phone && (
                                    <p className="text-sm text-muted-foreground flex leading-none mt-1 items-center gap-1">
                                        <Phone className="h-3 w-3" /> {commission.broker_phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Booking & Project</p>
                                <p className="text-sm text-muted-foreground">
                                    Booking #{commission.booking}
                                </p>
                                {(commission.project_name || commission.unit_number) && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {commission.project_name} {commission.unit_number && `(Unit ${commission.unit_number})`}
                                    </p>
                                )}
                                {commission.booking_date && (
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Booked on: {format(new Date(commission.booking_date), 'dd MMM yyyy')}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Lead</p>
                                <p className="text-sm text-muted-foreground">
                                    {commission.lead_name || `Lead #${commission.lead_id || 'N/A'}`}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                            Financial Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <p className="text-sm font-medium text-muted-foreground">Commission Rate</p>
                            <p className="font-semibold">{commission.commission_rate}%</p>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                            <p className="text-sm font-medium text-muted-foreground">Commission Amount</p>
                            <p className="font-semibold text-lg text-primary">
                                {formatCurrency(commission.commission_amount || commission.amount || '0')}
                            </p>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                            <p className="text-sm font-medium text-muted-foreground">Paid Date</p>
                            <p className="font-semibold">
                                {commission.paid_date ? format(new Date(commission.paid_date), 'dd MMM yyyy') : '-'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {commission.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase flex items-center gap-2">
                            <NotebookPen className="w-4 h-4" /> Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{commission.notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Timestamps */}
            {(commission.created_at || commission.updated_at) && (
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    {commission.created_at && (
                        <span>Created: {format(new Date(commission.created_at), 'dd MMM yyyy, hh:mm a')}</span>
                    )}
                    {commission.updated_at && (
                        <span>Updated: {format(new Date(commission.updated_at), 'dd MMM yyyy, hh:mm a')}</span>
                    )}
                </div>
            )}

            {/* Edit Form */}
            <CommissionFormDrawer
                open={editDrawerOpen}
                onOpenChange={setEditDrawerOpen}
                commission={commission}
                mode="edit"
                onSubmit={handleEditSubmit}
                isSubmitting={isMutating}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Commission</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this commission record?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                            disabled={isMutating}
                        >
                            {isMutating ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
