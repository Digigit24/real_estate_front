import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { brokerPortalService } from "@/services/brokerPortalService";
import { CreditCard, Plus, Eye, Search, Layers, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BrokerBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [upcoming, setUpcoming] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bRes, sRes, uRes] = await Promise.all([
                brokerPortalService.getBookings(),
                brokerPortalService.getBookingsSummary(),
                brokerPortalService.getUpcomingPayments()
            ]);
            setBookings(Array.isArray(bRes) ? bRes : []);
            setSummary(sRes || {});
            setUpcoming(Array.isArray(uRes) ? uRes : []);
        } catch (error) {
            toast.error("Failed to load bookings data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredBookings = bookings.filter(b =>
        (b.lead_name && b.lead_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.unit_number && b.unit_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'CONFIRMED': return <Badge className="bg-emerald-500/15 text-emerald-600 border-none hover:bg-emerald-500/25">Confirmed</Badge>;
            case 'DRAFT': return <Badge className="bg-slate-500/15 text-slate-600 border-none hover:bg-slate-500/25">Draft</Badge>;
            case 'PENDING_APPROVAL': return <Badge className="bg-amber-500/15 text-amber-600 border-none hover:bg-amber-500/25">Pending</Badge>;
            case 'CANCELLED': return <Badge className="bg-rose-500/15 text-rose-600 border-none hover:bg-rose-500/25">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-primary" />
                        Bookings & Payments
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage lead unit allocations, track payment plans and milestones.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Booking
                    </Button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border/50 shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-muted-foreground text-sm font-medium mb-1">Total Bookings</div>
                        <div className="text-2xl font-bold">{summary?.total || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-emerald-600/80 text-sm font-medium mb-1">Confirmed</div>
                        <div className="text-2xl font-bold text-emerald-600">{summary?.confirmed || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-amber-500/5 border-amber-500/20 shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-amber-600/80 text-sm font-medium mb-1">Pending</div>
                        <div className="text-2xl font-bold text-amber-600">{summary?.pending || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden group">
                    <CardContent className="p-4 relative z-10">
                        <div className="text-muted-foreground text-sm font-medium mb-1">Upcoming Milestones</div>
                        <div className="text-2xl font-bold text-primary">{upcoming.length}</div>
                    </CardContent>
                    <Calendar className="absolute -right-4 -bottom-4 w-16 h-16 text-primary/10 group-hover:scale-110 transition-transform" />
                </Card>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-muted/50 border border-border/50">
                    <TabsTrigger value="all">All Bookings</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming Payments ({upcoming.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                    <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
                        <div className="p-4 border-b border-border/50">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by lead or unit..."
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
                                        <TableHead>Booking ID</TableHead>
                                        <TableHead>Lead</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total Price</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                                Loading registry...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredBookings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                                No bookings found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredBookings.map((b: any) => (
                                            <TableRow key={b.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-mono text-sm text-muted-foreground">
                                                    #{b.id}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {b.lead_name || `Lead #${b.lead_id || b.lead}`}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="border-border/50 bg-card">{b.unit_number || `Unit #${b.unit_id || b.unit}`}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(b.status)}
                                                </TableCell>
                                                <TableCell className="text-right font-mono font-medium text-foreground">
                                                    ${parseFloat(b.total_amount_calculated || '0').toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-primary">
                                                        <Eye className="w-4 h-4 mr-1.5" />
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="upcoming" className="mt-4">
                    <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead>Booking</TableHead>
                                        <TableHead>Milestone</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                Loading upcoming payments...
                                            </TableCell>
                                        </TableRow>
                                    ) : upcoming.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground flex flex-col items-center justify-center border-none">
                                                <div className="text-emerald-500 bg-emerald-500/10 p-3 rounded-full mb-2 mt-8">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <span>No upcoming payments due in the next 30 days.</span>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        upcoming.map((u: any) => (
                                            <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-mono text-sm">
                                                    <span className="text-muted-foreground mr-2">Booking</span>
                                                    #{u.booking_id || u.booking}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {u.name || `Milestone #${u.id}`}
                                                </TableCell>
                                                <TableCell className="text-amber-500 font-medium whitespace-nowrap">
                                                    {u.due_date ? format(new Date(u.due_date), 'MMM dd, yyyy') : 'TBD'}
                                                </TableCell>
                                                <TableCell className="font-mono text-foreground font-semibold">
                                                    ${parseFloat(u.amount || '0').toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge className="bg-amber-500/10 text-amber-600 border-none">
                                                        Pending
                                                    </Badge>
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
