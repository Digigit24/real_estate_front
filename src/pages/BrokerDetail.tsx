// src/pages/BrokerDetail.tsx
import { CommissionFormDrawer } from '@/components/brokers/CommissionFormDrawer';
import { DataTable, DataTableColumn } from '@/components/DataTable';
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
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBrokers } from '@/hooks/useBrokers';
import { useCurrency } from '@/hooks/useCurrency';
import type { Commission, CreateBrokerPayload, CreateCommissionPayload, UpdateCommissionPayload } from '@/types/brokerTypes';
import {
    BROKER_STATUS_COLORS,
    BROKER_STATUS_LABELS,
    BrokerStatusEnum,
    COMMISSION_STATUS_COLORS,
    CommissionStatusEnum,
} from '@/types/brokerTypes';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Banknote,
    Building2,
    CheckCircle,
    Edit,
    FileText,
    Mail,
    MapPin,
    Pencil,
    Percent,
    Phone,
    Trash2,
    Users,
    XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export function BrokerDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const brokerId = id ? parseInt(id) : null;

    const {
        useBroker,
        useBrokerLeads,
        useBrokerCommissions,
        updateBroker,
        createCommission,
        updateCommission,
        deleteCommission,
        markCommissionPaid,
        isLoading: isMutating,
    } = useBrokers();
    const { formatCurrency } = useCurrency();

    const { data: broker, isLoading: brokerLoading, mutate: refreshBroker } = useBroker(brokerId);
    const { data: leads, isLoading: leadsLoading, mutate: refreshLeads } = useBrokerLeads(brokerId);
    const { data: commissions, isLoading: commissionsLoading, mutate: refreshCommissions } = useBrokerCommissions(brokerId);

    // Edit drawer state
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [createCommissionDrawerOpen, setCreateCommissionDrawerOpen] = useState(false);
    const [commissionToEdit, setCommissionToEdit] = useState<Commission | null>(null);

    // Delete confirmation
    const [deleteCommissionDialogOpen, setDeleteCommissionDialogOpen] = useState(false);
    const [commissionToDelete, setCommissionToDelete] = useState<Commission | null>(null);

    const handleEditSubmit = useCallback(
        async (data: CreateBrokerPayload) => {
            if (!brokerId) return;
            try {
                await updateBroker(brokerId, data);
                toast.success('Broker updated successfully');
                setEditDrawerOpen(false);
                refreshBroker();
            } catch (err: any) {
                toast.error(err.message || 'Failed to update broker');
            }
        },
        [brokerId, updateBroker, refreshBroker]
    );

    const handleApprove = useCallback(async () => {
        if (!brokerId) return;
        try {
            await updateBroker(brokerId, { status: BrokerStatusEnum.ACTIVE });
            toast.success('Broker approved');
            refreshBroker();
        } catch (err: any) {
            toast.error(err.message || 'Failed to approve broker');
        }
    }, [brokerId, updateBroker, refreshBroker]);

    const handleReject = useCallback(async () => {
        if (!brokerId) return;
        try {
            await updateBroker(brokerId, { status: BrokerStatusEnum.REJECTED });
            toast.success('Broker rejected');
            refreshBroker();
        } catch (err: any) {
            toast.error(err.message || 'Failed to reject broker');
        }
    }, [brokerId, updateBroker, refreshBroker]);

    const handleMarkPaid = useCallback(
        async (commissionId: number) => {
            try {
                const today = new Date().toISOString().split('T')[0];
                await markCommissionPaid(commissionId, today);
                toast.success('Commission marked as paid');
                refreshCommissions();
            } catch (err: any) {
                toast.error(err.message || 'Failed to mark commission as paid');
            }
        },
        [markCommissionPaid, refreshCommissions]
    );

    const handleCommissionFormSubmit = useCallback(
        async (data: CreateCommissionPayload | UpdateCommissionPayload) => {
            try {
                if (commissionToEdit) {
                    await updateCommission(commissionToEdit.id, data as UpdateCommissionPayload);
                    toast.success('Commission updated successfully');
                } else {
                    await createCommission(data as CreateCommissionPayload);
                    toast.success('Commission created successfully');
                }
                setCreateCommissionDrawerOpen(false);
                setCommissionToEdit(null);
                refreshCommissions();
            } catch (err: any) {
                toast.error(err.message || 'Failed to save commission');
            }
        },
        [createCommission, updateCommission, commissionToEdit, refreshCommissions]
    );

    const handleDeleteCommissionConfirm = useCallback((commission: Commission) => {
        setCommissionToDelete(commission);
        setDeleteCommissionDialogOpen(true);
    }, []);

    const handleDeleteCommission = useCallback(async () => {
        if (!commissionToDelete) return;
        try {
            await deleteCommission(commissionToDelete.id);
            toast.success('Commission deleted successfully');
            setDeleteCommissionDialogOpen(false);
            setCommissionToDelete(null);
            refreshCommissions();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete commission');
        }
    }, [commissionToDelete, deleteCommission, refreshCommissions]);

    // Leads table columns
    const leadColumns: DataTableColumn<any>[] = [
        {
            header: 'Lead Name',
            key: 'name',
            cell: (lead) => (
                <div className="flex flex-col">
                    <span className="font-medium">{lead.name || lead.first_name || 'N/A'}</span>
                    {lead.email && (
                        <span className="text-xs text-muted-foreground">{lead.email}</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Phone',
            key: 'phone',
            cell: (lead) => <span className="text-sm">{lead.phone || 'N/A'}</span>,
        },
        {
            header: 'Status',
            key: 'status_name',
            cell: (lead) => (
                <Badge variant="outline" className="text-xs">
                    {lead.status_name || lead.status || 'N/A'}
                </Badge>
            ),
        },
        {
            header: 'Source',
            key: 'source',
            cell: (lead) => (
                <span className="text-sm text-muted-foreground">{lead.source || 'Broker'}</span>
            ),
        },
        {
            header: 'Date',
            key: 'created_at',
            cell: (lead) => (
                <span className="text-sm text-muted-foreground">
                    {lead.created_at ? format(new Date(lead.created_at), 'dd MMM yyyy') : '-'}
                </span>
            ),
        },
    ];

    // Commission table columns
    const commissionColumns: DataTableColumn<Commission>[] = [
        {
            header: 'Booking / Unit',
            key: 'booking',
            cell: (commission) => (
                <div className="flex flex-col">
                    <span className="font-medium">
                        {commission.unit_number || `Booking #${commission.booking}`}
                    </span>
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
            header: 'Amount',
            key: 'amount',
            cell: (commission) => (
                <span className="text-sm font-semibold">
                    {formatCurrency(commission.amount || '0')}
                </span>
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
                    {commission.status}
                </Badge>
            ),
        },
        {
            header: 'Paid Date',
            key: 'paid_date',
            cell: (commission) => (
                <span className="text-sm text-muted-foreground">
                    {commission.paid_date ? format(new Date(commission.paid_date), 'dd MMM yyyy') : '-'}
                </span>
            ),
        },
        {
            header: 'Actions',
            key: 'actions',
            cell: (commission) => (
                <div className="flex gap-2 items-center">
                    {commission.status === CommissionStatusEnum.PENDING && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleMarkPaid(commission.id)}
                            disabled={isMutating}
                        >
                            Mark Paid
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            setCommissionToEdit(commission);
                            setCreateCommissionDrawerOpen(true);
                        }}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    {commission.status === CommissionStatusEnum.PENDING && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteCommissionConfirm(commission)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    // Mobile card renderers
    const renderLeadMobileCard = (lead: any) => (
        <>
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{lead.name || lead.first_name || 'N/A'}</h3>
                    <p className="text-xs text-muted-foreground">{lead.phone || 'N/A'}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                    {lead.status_name || lead.status || 'N/A'}
                </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <div>
                    <p className="text-muted-foreground text-xs">Source</p>
                    <p className="font-medium">{lead.source || 'Broker'}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs">Date</p>
                    <p className="font-medium">
                        {lead.created_at ? format(new Date(lead.created_at), 'dd MMM') : '-'}
                    </p>
                </div>
            </div>
        </>
    );

    const renderCommissionMobileCard = (commission: Commission, actions: any) => (
        <>
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                        {commission.unit_number || `Booking #${commission.booking}`}
                    </h3>
                    <p className="text-xs text-muted-foreground">{commission.lead_name || 'N/A'}</p>
                </div>
                <Badge
                    variant="secondary"
                    style={{
                        backgroundColor: `${COMMISSION_STATUS_COLORS[commission.status]}20`,
                        color: COMMISSION_STATUS_COLORS[commission.status],
                    }}
                    className="border text-xs"
                >
                    {commission.status}
                </Badge>
            </div>
            <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                <span className="text-sm font-semibold">{formatCurrency(commission.amount || '0')}</span>
                <div className="flex gap-2">
                    {commission.status === CommissionStatusEnum.PENDING && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleMarkPaid(commission.id)}
                        >
                            Mark Paid
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2"
                        onClick={() => {
                            setCommissionToEdit(commission);
                            setCreateCommissionDrawerOpen(true);
                        }}
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    {commission.status === CommissionStatusEnum.PENDING && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteCommissionConfirm(commission)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>
        </>
    );

    if (brokerLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (!broker) {
        return (
            <div className="p-6 text-center py-16">
                <p className="text-muted-foreground">Broker not found.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/brokers')}>
                    Back to Brokers
                </Button>
            </div>
        );
    }

    const totalCommission = commissions?.reduce(
        (sum, c) => sum + parseFloat(c.amount || '0'),
        0
    ) || 0;
    const paidCommission = commissions
        ?.filter((c) => c.status === CommissionStatusEnum.PAID)
        .reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0) || 0;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate('/brokers')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold">{broker.name}</h1>
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
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5 flex-wrap">
                            {broker.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5" /> {broker.phone}
                                </span>
                            )}
                            {broker.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" /> {broker.email}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-11 sm:ml-0">
                    {broker.status === BrokerStatusEnum.PENDING && (
                        <>
                            <Button size="sm" onClick={handleApprove} disabled={isMutating}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleReject}
                                disabled={isMutating}
                            >
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                Reject
                            </Button>
                        </>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditDrawerOpen(true)}
                    >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                    </Button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                            <Building2 className="h-3.5 w-3.5" /> Company
                        </div>
                        <p className="font-semibold text-sm">{broker.company_name || 'N/A'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                            <Percent className="h-3.5 w-3.5" /> Commission Rate
                        </div>
                        <p className="font-semibold text-sm">{broker.commission_rate}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                            <MapPin className="h-3.5 w-3.5" /> City
                        </div>
                        <p className="font-semibold text-sm">{broker.city || 'N/A'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                            <FileText className="h-3.5 w-3.5" /> RERA Number
                        </div>
                        <p className="font-semibold text-sm">{broker.rera_number || 'N/A'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-5 pb-4 text-center">
                        <p className="text-2xl font-bold">{leads?.length || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Leads Submitted</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4 text-center">
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(paidCommission.toString())}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Commission Paid</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4 text-center">
                        <p className="text-2xl font-bold text-amber-600">
                            {formatCurrency(totalCommission.toString())}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Total Commission</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs: Leads & Commissions */}
            <Tabs defaultValue="leads" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="leads" className="gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Leads ({leads?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="commissions" className="gap-1.5">
                        <Banknote className="h-3.5 w-3.5" />
                        Commissions ({commissions?.length || 0})
                    </TabsTrigger>
                </TabsList>

                <div className="flex justify-end mb-2">
                    <Button size="sm" onClick={() => {
                        setCommissionToEdit(null);
                        setCreateCommissionDrawerOpen(true);
                    }}>
                        Add Commission
                    </Button>
                </div>

                <TabsContent value="leads">
                    <div className="border rounded-lg overflow-hidden">
                        <DataTable
                            rows={leads || []}
                            isLoading={leadsLoading}
                            columns={leadColumns}
                            renderMobileCard={renderLeadMobileCard}
                            getRowId={(lead) => lead.id}
                            getRowLabel={(lead) => lead.name || lead.first_name || 'Lead'}
                            emptyTitle="No leads submitted"
                            emptySubtitle="This broker hasn't submitted any leads yet"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="commissions">
                    <div className="border rounded-lg overflow-hidden">
                        <DataTable
                            rows={commissions || []}
                            isLoading={commissionsLoading}
                            columns={commissionColumns}
                            renderMobileCard={renderCommissionMobileCard}
                            getRowId={(commission) => commission.id}
                            getRowLabel={(commission) => commission.broker_name || `Commission #${commission.id}`}
                            emptyTitle="No commissions"
                            emptySubtitle="No commissions recorded for this broker"
                            onRowClick={(commission) => navigate(`/brokers/commissions/${commission.id}`)}
                        />
                    </div>
                </TabsContent>
            </Tabs>

            {/* Timestamps */}
            {(broker.created_at || broker.updated_at) && (
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    {broker.created_at && (
                        <span>Created: {format(new Date(broker.created_at), 'dd MMM yyyy, hh:mm a')}</span>
                    )}
                    {broker.updated_at && (
                        <span>Updated: {format(new Date(broker.updated_at), 'dd MMM yyyy, hh:mm a')}</span>
                    )}
                </div>
            )}

            <AlertDialog open={deleteCommissionDialogOpen} onOpenChange={setDeleteCommissionDialogOpen}>
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
                            onClick={handleDeleteCommission}
                            disabled={isMutating}
                        >
                            {isMutating ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <CommissionFormDrawer
                open={createCommissionDrawerOpen}
                onOpenChange={(open) => {
                    setCreateCommissionDrawerOpen(open);
                    if (!open) setTimeout(() => setCommissionToEdit(null), 300);
                }}
                commission={commissionToEdit}
                mode={commissionToEdit ? 'edit' : 'create'}
                onSubmit={handleCommissionFormSubmit}
                isSubmitting={isMutating}
            />
        </div>
    );
}
