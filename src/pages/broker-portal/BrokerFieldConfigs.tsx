import { useEffect, useState } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { Settings, Plus, Edit, Trash2 } from "lucide-react";
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

export function BrokerFieldConfigs() {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const data = await brokerPortalService.getFieldConfigs();
            setConfigs(data);
        } catch (error) {
            toast.error("Failed to load field configurations");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        toast.error("Contact admin to delete configurations");
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Settings className="w-6 h-6 text-primary" />
                        Dynamic Field Configuration
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage custom data fields required for lead submissions
                    </p>
                </div>
                <div className="flex justify-end">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Field
                    </Button>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead>Field Label</TableHead>
                                <TableHead className="w-[150px]">Machine Key</TableHead>
                                <TableHead className="w-[120px]">Type</TableHead>
                                <TableHead className="w-[120px]">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        Loading configurations...
                                    </TableCell>
                                </TableRow>
                            ) : configs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No dynamic fields have been configured yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                configs.map((field: any) => (
                                    <TableRow key={field.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium text-foreground">
                                            {field.label}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm text-muted-foreground">
                                            {field.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-muted text-muted-foreground border-border/50 uppercase text-[10px] tracking-wider font-semibold">
                                                {field.field_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2 text-xs">
                                                {field.is_required && (
                                                    <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded-sm font-medium">Required</span>
                                                )}
                                                {!field.is_required && (
                                                    <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-sm font-medium">Optional</span>
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
                                                    onClick={() => handleDelete(field.id)}
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
