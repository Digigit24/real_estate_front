import { useEffect, useState } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export function BrokerMyCommissions() {
    const [commissions, setCommissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommissions = async () => {
            try {
                const data = await brokerPortalService.getMyCommissions();
                setCommissions(Array.isArray(data) ? data : []);
            } catch (error) {
                toast.error("Failed to load commissions");
                setCommissions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCommissions();
    }, []);

    const totalEarned = commissions
        .filter((c) => c.status === "PAID")
        .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

    const totalPending = commissions
        .filter((c) => c.status !== "PAID")
        .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse font-medium">Loading commissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-primary" />
                    My Commissions
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Track your earned and pending commissions
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Total Commissions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(totalEarned + totalPending)}</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Paid
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalEarned)}</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Commissions Table */}
            <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead>#</TableHead>
                                <TableHead>Booking</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {commissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No commissions found yet. Submit leads to earn commissions!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                commissions.map((comm: any, idx: number) => (
                                    <TableRow key={comm.id || idx} className="hover:bg-muted/30">
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            #{comm.id || idx + 1}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {comm.booking ? `Booking #${comm.booking}` : "Manual Entry"}
                                        </TableCell>
                                        <TableCell className="font-mono font-bold text-foreground">
                                            {formatCurrency(parseFloat(comm.amount || 0))}
                                        </TableCell>
                                        <TableCell>
                                            {comm.status === "PAID" ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none">Paid</Badge>
                                            ) : (
                                                <Badge className="bg-amber-500/10 text-amber-600 border-none">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {comm.created_at
                                                ? new Date(comm.created_at).toLocaleDateString()
                                                : "—"}
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
