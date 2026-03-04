import { useEffect, useState } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Wallet } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export function BrokerPayments() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const data = await brokerPortalService.getPayments();
            setPayments(data);
        } catch (error) {
            console.error("Failed to load payments", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading payments ledger...</p>
            </div>
        </div>
    );

    const formatCurrency = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num || 0);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'PAID':
            case 'SUCCESS':
                return <Badge className="bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200">Completed</Badge>;
            case 'PENDING':
                return <Badge className="bg-amber-100 text-amber-700 shadow-sm border border-amber-200">Pending</Badge>;
            case 'FAILED':
            case 'CANCELLED':
                return <Badge className="bg-rose-100 text-rose-700 shadow-sm border border-rose-200">Failed</Badge>;
            default:
                return <Badge className="bg-slate-100 text-slate-700 shadow-sm border border-slate-200">{status || 'Unknown'}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        const typeStr = (type || '').toUpperCase();
        if (typeStr.includes('REFUND')) return <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50">Refund</Badge>;
        if (typeStr.includes('ADVANCE')) return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Advance</Badge>;
        return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Invoice</Badge>;
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 tracking-tight">
                        Payments Ledger
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Track your invoices, refunds, and advances seamlessly.</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-xl px-5">
                    <Wallet className="w-4 h-4 mr-2" /> Request Layout
                </Button>
            </div>

            <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-slate-600 font-semibold py-4">Reference / Description</TableHead>
                                <TableHead className="text-slate-600 font-semibold py-4">Date</TableHead>
                                <TableHead className="text-slate-600 font-semibold py-4">Type</TableHead>
                                <TableHead className="text-slate-600 font-semibold py-4">Amount</TableHead>
                                <TableHead className="text-slate-600 font-semibold py-4 text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-slate-500 py-12">
                                        No payment records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment: any) => (
                                    <TableRow key={payment.id} className="hover:bg-emerald-50/30 transition-colors">
                                        <TableCell className="font-medium text-gray-900 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 border border-slate-200">
                                                    <DollarSign className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{payment.reference_number || `TRX-${payment.id}`}</div>
                                                    <div className="text-sm font-normal text-slate-500 mt-0.5 line-clamp-1">{payment.description || 'General Payment'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-700 py-4 font-medium">
                                            {payment.created_at ? format(new Date(payment.created_at), 'MMM dd, yyyy') : '-'}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {getTypeBadge(payment.type || payment.payment_type)}
                                        </TableCell>
                                        <TableCell className="text-gray-900 py-4 font-bold">
                                            {formatCurrency(payment.amount_total || payment.amount)}
                                        </TableCell>
                                        <TableCell className="text-right py-4">
                                            {getStatusBadge(payment.status)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
