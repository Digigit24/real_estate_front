import { useEffect, useState } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { BrokerDashboardStats } from "@/types/brokerPortalTypes";
import { Users, IndianRupee, Activity, Clock, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function BrokerDashboard() {
    const [stats, setStats] = useState<BrokerDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        brokerPortalService.getDashboardStats().then(data => {
            setStats(data);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-slate-400 animate-pulse">Loading dashboard...</p></div>;
    if (!stats) return <div className="text-center text-red-400 mt-10">Failed to load stats. Please try again.</div>;

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">Overview Dashboard</h1>
                    <p className="text-slate-400 mt-1">Here's what's happening with your leads today.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-900/50 border-slate-800/60 backdrop-blur-xl hover:bg-slate-800/50 transition-colors shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Leads</p>
                                <h3 className="text-3xl font-bold text-white mt-2">{stats.total_leads}</h3>
                            </div>
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                                <Users className="text-indigo-400 w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800/60 backdrop-blur-xl hover:bg-slate-800/50 transition-colors shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Commission</p>
                                <h3 className="text-3xl font-bold text-emerald-400 mt-2">{formatCurrency(stats.total_commission)}</h3>
                            </div>
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                                <IndianRupee className="text-emerald-400 w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800/60 backdrop-blur-xl hover:bg-slate-800/50 transition-colors shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Paid Commission</p>
                                <h3 className="text-3xl font-bold text-blue-400 mt-2">{formatCurrency(stats.paid_commission)}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                                <CheckCircle2 className="text-blue-400 w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800/60 backdrop-blur-xl hover:bg-slate-800/50 transition-colors shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Pending Commission</p>
                                <h3 className="text-3xl font-bold text-amber-400 mt-2">{formatCurrency(stats.pending_commission)}</h3>
                            </div>
                            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
                                <Clock className="text-amber-400 w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-slate-200">Recent Leads</h2>
                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-900/80 border-b border-slate-800">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-slate-400 font-medium">Customer</TableHead>
                                        <TableHead className="text-slate-400 font-medium">Project</TableHead>
                                        <TableHead className="text-slate-400 font-medium">Budget</TableHead>
                                        <TableHead className="text-slate-400 font-medium text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.recent_leads.length === 0 ? (
                                        <TableRow className="hover:bg-slate-800/30 border-slate-800/50">
                                            <TableCell colSpan={4} className="text-center text-slate-500 py-8">No recent leads found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        stats.recent_leads.map((lead) => (
                                            <TableRow key={lead.id} className="hover:bg-slate-800/30 border-slate-800/50 transition-colors">
                                                <TableCell className="font-medium text-slate-200">
                                                    {lead.customer_name}
                                                    <div className="text-xs text-slate-500 mt-0.5">{lead.mobile_number}</div>
                                                </TableCell>
                                                <TableCell className="text-slate-300">{lead.project_interested}</TableCell>
                                                <TableCell className="text-slate-300">{lead.budget_range}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                                                        {lead.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-200">Leads by Status</h2>
                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md shadow-xl">
                        <CardContent className="p-6">
                            {Object.keys(stats.leads_by_status).length === 0 ? (
                                <p className="text-slate-500 text-center py-4">No data available for statuses.</p>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(stats.leads_by_status).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                                                <span className="text-slate-300 font-medium">{status}</span>
                                            </div>
                                            <span className="text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full text-sm">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
