import { useEffect, useState } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { ClipboardList, Plus, Edit, Trash2, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BrokerStatuses() {
    const [statuses, setStatuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStatuses = async () => {
        setLoading(true);
        try {
            const data = await brokerPortalService.getStatuses();
            setStatuses(data);
        } catch (error) {
            toast.error("Failed to load statuses");
        } finally {
            setLoading(false);
        }
    };

    const initializeDefaults = async () => {
        try {
            setLoading(true);
            await brokerPortalService.initializeDefaultStatuses();
            toast.success("Default statuses initialized!");
            fetchStatuses();
        } catch (error) {
            toast.error("Failed to initialize default statuses");
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this status?")) return;
        try {
            await brokerPortalService.deleteStatus(id);
            toast.success("Status deleted");
            fetchStatuses();
        } catch (error) {
            toast.error("Failed to delete status");
        }
    };

    useEffect(() => {
        fetchStatuses();
    }, []);

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-primary" />
                        Pipeline Statuses
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your lead pipeline stages and kanban columns
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={initializeDefaults}>
                        <Rocket className="w-4 h-4 mr-2" />
                        Seed Defaults
                    </Button>
                    {/* Add Create Status Dialog or Link naturally below */}
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Status
                    </Button>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[80px]">Order</TableHead>
                                <TableHead>Status Name</TableHead>
                                <TableHead>Properties</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        Loading pipeline stages...
                                    </TableCell>
                                </TableRow>
                            ) : statuses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        No status stages found. Create one or seed defaults to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                statuses.map((status: any) => (
                                    <TableRow key={status.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-mono text-muted-foreground">
                                            {status.order_index}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full border border-border"
                                                    style={{ backgroundColor: status.color_hex || '#6B7280' }}
                                                />
                                                <span className="font-medium text-foreground">
                                                    {status.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1.5 flex-wrap">
                                                {status.is_won && (
                                                    <Badge className="bg-emerald-500/15 text-emerald-600 border-none">Won</Badge>
                                                )}
                                                {status.is_lost && (
                                                    <Badge variant="destructive" className="bg-red-500/15 text-red-600 border-none">Lost</Badge>
                                                )}
                                                {!status.is_active && (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                                {status.is_active && !status.is_won && !status.is_lost && (
                                                    <Badge variant="outline" className="border-border/50">Active</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                    onClick={() => handleDelete(status.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
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
