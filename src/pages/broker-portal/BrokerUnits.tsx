import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { brokerPortalService } from "@/services/brokerPortalService";
import { Search, Filter, ShieldCheck, Box, Tag, Zap, Lock, ListTodo } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function BrokerUnits() {
    const [searchParams] = useSearchParams();
    const initialProjectId = searchParams.get("project") || "";

    const [units, setUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [bhkFilter, setBhkFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    // Reservation State
    const [isReserveOpen, setIsReserveOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<any>(null);
    const [leadId, setLeadId] = useState("");

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (initialProjectId) params.project = initialProjectId;
            if (statusFilter !== "ALL") params.status = statusFilter;
            if (bhkFilter !== "ALL") params.bhk = bhkFilter;

            const data = await brokerPortalService.getUnits(params);
            setUnits(data);
        } catch (error) {
            toast.error("Failed to load units");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, [initialProjectId, statusFilter, bhkFilter]);

    const handleReserve = async () => {
        if (!selectedUnit || !leadId) return toast.error("Please enter a valid Lead ID");
        try {
            await brokerPortalService.reserveUnit(selectedUnit.id, { lead_id: leadId });
            toast.success(`Unit ${selectedUnit.unit_number} reserved successfully`);
            setIsReserveOpen(false);
            setLeadId("");
            fetchUnits();
        } catch (error: any) {
            toast.error(error.message || "Failed to reserve unit");
        }
    };

    const handleRelease = async (id: number) => {
        if (!confirm("Are you sure you want to release this reservation?")) return;
        try {
            await brokerPortalService.releaseUnit(id);
            toast.success("Unit reservation released");
            fetchUnits();
        } catch (error: any) {
            toast.error(error.message || "Failed to release reservation");
        }
    };

    const filteredUnits = units.filter(u =>
        (u.unit_number && u.unit_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'AVAILABLE': return <Badge className="bg-emerald-500/15 text-emerald-600 border-none hover:bg-emerald-500/25">Available</Badge>;
            case 'BOOKED': return <Badge className="bg-amber-500/15 text-amber-600 border-none hover:bg-amber-500/25">Booked</Badge>;
            case 'SOLD': return <Badge className="bg-rose-500/15 text-rose-600 border-none hover:bg-rose-500/25">Sold</Badge>;
            case 'BLOCKED': return <Badge className="bg-slate-500/15 text-slate-600 border-none hover:bg-slate-500/25">Blocked</Badge>;
            default: return <Badge variant="outline">{status || 'Unknown'}</Badge>;
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Box className="w-6 h-6 text-primary" />
                        Unit Registry
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        View active units, block them for leads, and process properties
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search unit #..."
                            className="pl-9 bg-card border-border/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[140px] bg-card">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="AVAILABLE">Available</SelectItem>
                            <SelectItem value="BOOKED">Booked</SelectItem>
                            <SelectItem value="SOLD">Sold</SelectItem>
                            <SelectItem value="BLOCKED">Blocked</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={bhkFilter} onValueChange={setBhkFilter}>
                        <SelectTrigger className="w-full sm:w-[120px] bg-card">
                            <SelectValue placeholder="BHK" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All BHK</SelectItem>
                            <SelectItem value="1">1 BHK</SelectItem>
                            <SelectItem value="2">2 BHK</SelectItem>
                            <SelectItem value="3">3 BHK</SelectItem>
                            <SelectItem value="4">4+ BHK</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="border-border/50">
                        <Zap className="h-4 w-4 mr-2 text-primary" />
                        Suggest
                    </Button>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[120px]">Unit #</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tower/Floor</TableHead>
                                <TableHead>Specification</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                                            Loading unit matrix...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUnits.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        No corresponding units align with the current filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUnits.map((unit: any) => (
                                    <TableRow key={unit.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-bold text-foreground">
                                            {unit.unit_number}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(unit.status)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{unit.tower?.name || `Tower ${unit.tower_id || 'N/A'}`}</span>
                                                <span className="text-xs text-muted-foreground">Fl {unit.floor_number || '?'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {unit.bhk && <Badge variant="secondary" className="border-none">{unit.bhk} BHK</Badge>}
                                                {unit.super_built_up_area && <Badge variant="secondary" className="border-none">{unit.super_built_up_area} sqft</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium text-foreground">
                                            ${unit.base_price?.toLocaleString() || '0'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {unit.status === 'AVAILABLE' ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 hover:bg-emerald-500/10 hover:text-emerald-500 text-muted-foreground border border-border/50"
                                                        onClick={() => { setSelectedUnit(unit); setIsReserveOpen(true); }}
                                                    >
                                                        <ShieldCheck className="w-4 h-4 mr-1.5" />
                                                        Reserve
                                                    </Button>
                                                ) : unit.status === 'BOOKED' ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 hover:bg-amber-500/10 hover:text-amber-500 text-muted-foreground border border-border/50"
                                                        onClick={() => handleRelease(unit.id)}
                                                    >
                                                        <Lock className="w-4 h-4 mr-1.5" />
                                                        Release
                                                    </Button>
                                                ) : (
                                                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground border border-border/50 cursor-not-allowed opacity-50">
                                                        Unavailable
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Reserve Dialog */}
            <Dialog open={isReserveOpen} onOpenChange={setIsReserveOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reserve Unit {selectedUnit?.unit_number}</DialogTitle>
                        <DialogDescription>
                            Enter the Lead ID for the prospect to temporarily block this unit.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Lead ID (e.g. 1)"
                            value={leadId}
                            onChange={(e) => setLeadId(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReserveOpen(false)}>Cancel</Button>
                        <Button onClick={handleReserve}>Confirm Reservation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
