import { useEffect, useState } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { BrokerDashboardStats } from "@/types/brokerPortalTypes";
import { Users, IndianRupee, Clock, CheckCircle2, Activity } from "lucide-react";
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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse font-medium">Loading dashboard...</p>
            </div>
        </div>
    );

    if (!stats) return <div className="text-center text-red-500 mt-10 font-medium bg-red-50 p-6 rounded-xl">Failed to load stats. Please try again.</div>;

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight">
                        Overview Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Here's what's happening with your leads and commissions today.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border border-indigo-100/50 hover:shadow-lg transition-all duration-300 shadow-sm rounded-2xl overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Leads</p>
                                <h3 className="text-4xl font-black text-gray-900 mt-3">{stats.total_leads}</h3>
                            </div>
                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center border border-indigo-200/50 shadow-inner">
                                <Users className="text-indigo-600 w-7 h-7" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-emerald-100/50 hover:shadow-lg transition-all duration-300 shadow-sm rounded-2xl overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Commission</p>
                                <h3 className="text-3xl font-black text-emerald-700 mt-3 tracking-tight">{formatCurrency(stats.total_commission)}</h3>
                            </div>
                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center border border-emerald-200/50 shadow-inner">
                                <IndianRupee className="text-emerald-600 w-7 h-7" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-blue-100/50 hover:shadow-lg transition-all duration-300 shadow-sm rounded-2xl overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Paid Commission</p>
                                <h3 className="text-3xl font-black text-blue-700 mt-3 tracking-tight">{formatCurrency(stats.paid_commission)}</h3>
                            </div>
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center border border-blue-200/50 shadow-inner">
                                <CheckCircle2 className="text-blue-600 w-7 h-7" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-amber-100/50 hover:shadow-lg transition-all duration-300 shadow-sm rounded-2xl overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending Comm.</p>
                                <h3 className="text-3xl font-black text-amber-600 mt-3 tracking-tight">{formatCurrency(stats.pending_commission)}</h3>
                            </div>
                            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center border border-amber-200/50 shadow-inner">
                                <Clock className="text-amber-600 w-7 h-7" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Recent Leads Activity</h2>
                        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full cursor-pointer hover:bg-indigo-100 transition-colors">View All Leads →</span>
                    </div>
                    <Card className="bg-white border border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-slate-600 font-semibold py-4">Customer Details</TableHead>
                                        <TableHead className="text-slate-600 font-semibold py-4">Project</TableHead>
                                        <TableHead className="text-slate-600 font-semibold py-4">Budget</TableHead>
                                        <TableHead className="text-slate-600 font-semibold py-4 text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.recent_leads.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-slate-500 py-12">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                        <Users className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                    <span className="font-medium">No recent leads found.</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        stats.recent_leads.map((lead: any) => {
                                            const name = lead.customer_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.name || '-';
                                            const phone = lead.mobile_number || lead.phone || '-';
                                            const project = lead.project_interested || lead.project?.name || '-';
                                            const budget = lead.budget_range || lead.budget || '-';
                                            const status = typeof lead.status === 'object' ? lead.status?.name : (lead.status || 'New');

                                            return (
                                                <TableRow key={lead.id} className="hover:bg-indigo-50/30 transition-colors">
                                                    <TableCell className="font-medium text-gray-900 py-4">
                                                        {name}
                                                        <div className="text-sm font-normal text-slate-500 mt-1">{phone}</div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-700 py-4 font-medium">{project}</TableCell>
                                                    <TableCell className="text-gray-700 py-4 font-medium">{budget}</TableCell>
                                                    <TableCell className="text-right py-4">
                                                        <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200 shadow-sm px-3 py-1 font-semibold rounded-lg">
                                                            {status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>

                <div className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">Leads by Status</h2>
                    <Card className="bg-white border border-slate-200/60 shadow-md rounded-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[100px] -z-10 opacity-60"></div>
                        <CardContent className="p-7">
                            {Object.keys(stats.leads_by_status).length === 0 ? (
                                <div className="text-center py-10 space-y-3">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                                        <Activity className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No data available.</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {Object.entries(stats.leads_by_status).map(([status, count], index) => {
                                        const colors = [
                                            { bg: 'bg-indigo-500', shadow: 'shadow-indigo-500/40' },
                                            { bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
                                            { bg: 'bg-blue-500', shadow: 'shadow-blue-500/40' },
                                            { bg: 'bg-amber-500', shadow: 'shadow-amber-500/40' },
                                            { bg: 'bg-purple-500', shadow: 'shadow-purple-500/40' },
                                            { bg: 'bg-pink-500', shadow: 'shadow-pink-500/40' },
                                        ];
                                        const color = colors[index % colors.length];

                                        return (
                                            <div key={status} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-3 h-3 rounded-full ${color.bg} shadow-md ${color.shadow} transition-transform group-hover:scale-125`} />
                                                    <span className="text-gray-700 font-semibold tracking-wide">{status}</span>
                                                </div>
                                                <span className="text-slate-700 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-xl text-sm font-bold shadow-sm">
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

