import { useEffect, useState } from "react";
import { brokerAdminService } from "@/services/brokerAdminService";
import { Users, Search, Target, TrendingUp, CheckCircle, XCircle, Award, Briefcase, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function BrokerNetwork() {
    const [brokers, setBrokers] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [commissions, setCommissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("network");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bRes, lRes, cRes] = await Promise.all([
                brokerAdminService.getNetworkBrokers(),
                brokerAdminService.getBrokerLeaderboard(),
                brokerAdminService.getAllCommissions()
            ]);
            setBrokers(Array.isArray(bRes) ? bRes : []);
            setLeaderboard(Array.isArray(lRes) ? lRes : []);
            setCommissions(Array.isArray(cRes) ? cRes : []);
        } catch (error) {
            toast.error("Failed to load network data");
            setBrokers([]);
            setLeaderboard([]);
            setCommissions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApproveBroker = async (id: number) => {
        try {
            await brokerAdminService.updateNetworkBroker(id, { status: "ACTIVE" });
            toast.success("Broker status updated to ACTIVE");
            fetchData();
        } catch (err: any) {
            toast.error(err.message || "Failed to update broker status");
        }
    };

    const handleMarkCommissionPaid = async (id: number) => {
        try {
            await brokerAdminService.markCommissionPaid(id);
            toast.success("Commission marked as paid!");
            fetchData();
        } catch (err: any) {
            toast.error(err.message || "Failed to mark commission as paid");
        }
    };

    const filteredBrokers = brokers.filter(b =>
        (b.name && b.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.email && b.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        Broker Network Manage
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Oversee broker applications, leaderboard performance, and commission payouts
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-muted/50 border border-border/50">
                    <TabsTrigger value="network">Network Directory</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                    <TabsTrigger value="commissions">Commissions Log</TabsTrigger>
                </TabsList>

                {/* Network Directory Tab */}
                <TabsContent value="network" className="mt-4 space-y-4">
                    <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
                        <div className="p-4 border-b border-border/50">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search brokers by name/email..."
                                    className="pl-9 bg-card"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead>Broker</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Manage</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading && brokers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Loading network...</TableCell>
                                        </TableRow>
                                    ) : filteredBrokers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No brokers correspond to this search.</TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredBrokers.map((broker: any) => (
                                            <TableRow key={broker.id} className="hover:bg-muted/30">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 bg-primary/10 border border-primary/20">
                                                            <AvatarFallback className="text-primary font-medium tracking-wide">
                                                                {broker.name ? broker.name.substring(0, 2).toUpperCase() : 'BR'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">{broker.name || "N/A"}</span>
                                                            <span className="text-xs text-muted-foreground">ID: #{broker.id}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div>{broker.email || "N/A"}</div>
                                                    <div className="text-muted-foreground text-xs">{broker.phone || "No phone"}</div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {broker.company_name ? (
                                                        <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {broker.company_name}</span>
                                                    ) : <span className="text-muted-foreground italic">Independent</span>}
                                                </TableCell>
                                                <TableCell>
                                                    {broker.status === 'ACTIVE' ? (
                                                        <Badge className="bg-emerald-500/15 text-emerald-600 border-none">Active</Badge>
                                                    ) : broker.status === 'PENDING' ? (
                                                        <Badge className="bg-amber-500/15 text-amber-600 border-none">Pending</Badge>
                                                    ) : (
                                                        <Badge variant="outline">{broker.status || 'UNKNOWN'}</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {broker.status !== 'ACTIVE' && (
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="h-8"
                                                            onClick={() => handleApproveBroker(broker.id)}
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                                            Approve
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>

                {/* Leaderboard Tab */}
                <TabsContent value="leaderboard" className="mt-4">
                    <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-border/50">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Award className="w-5 h-5 text-primary" />
                                Top Performers
                            </CardTitle>
                        </CardHeader>
                        <div className="overflow-x-auto p-4">
                            <div className="space-y-4">
                                {loading && leaderboard.length === 0 ? (
                                    <div className="text-center text-muted-foreground h-32 flex justify-center items-center">Loading leaderboard...</div>
                                ) : leaderboard.length === 0 ? (
                                    <div className="text-center text-muted-foreground h-32 flex justify-center items-center">No performance data yet.</div>
                                ) : (
                                    leaderboard.map((lb: any, index: number) => (
                                        <div key={lb.id || index} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:border-primary/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-100 text-amber-600 border border-amber-300' : index === 1 ? 'bg-slate-100 text-slate-500 border border-slate-300' : index === 2 ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-muted text-muted-foreground'}`}>
                                                    #{index + 1}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{lb.name || lb.broker_name || "Unknown Broker"}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" /> {lb.closures || lb.total_deals || 0} Deals Closed</span>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <span className="font-bold text-emerald-500 flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-500/70" /> ${parseFloat(lb.total_volume || lb.revenue || '0').toLocaleString()}</span>
                                                <span className="text-xs text-muted-foreground uppercase tracking-widest">Total Vol</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* Commissions Tab */}
                <TabsContent value="commissions" className="mt-4">
                    <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead>Comm ID</TableHead>
                                        <TableHead>Broker</TableHead>
                                        <TableHead>Booking Ref</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading && commissions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Loading commissions map...</TableCell>
                                        </TableRow>
                                    ) : commissions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No commission logs present.</TableCell>
                                        </TableRow>
                                    ) : (
                                        commissions.map((comm: any) => (
                                            <TableRow key={comm.id} className="hover:bg-muted/30">
                                                <TableCell className="font-mono text-xs text-muted-foreground">#{comm.id}</TableCell>
                                                <TableCell className="font-medium text-sm">
                                                    {comm.broker_name || `Broker ID #${comm.broker}`}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {comm.booking ? `Booking #${comm.booking}` : 'Manual Entry'}
                                                </TableCell>
                                                <TableCell className="font-mono font-bold text-foreground">
                                                    ${parseFloat(comm.amount || '0').toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {comm.status === 'PAID' ?
                                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none">Paid</Badge> :
                                                        <Badge className="bg-amber-500/10 text-amber-600 border-none">Pending</Badge>
                                                    }
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {comm.status !== 'PAID' && (
                                                        <Button variant="outline" size="sm" onClick={() => handleMarkCommissionPaid(comm.id)}>
                                                            <DollarSign className="w-3.5 h-3.5 mr-1" />
                                                            Mark Paid
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
