import { useEffect, useState } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { Activity, Edit, Trash2, Calendar, MessageSquare, Phone, Mail, FileText, Smartphone } from "lucide-react";
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
import { format } from "date-fns";

export function BrokerActivities() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const data = await brokerPortalService.getActivities();
            setActivities(data);
        } catch (error) {
            toast.error("Failed to load activities");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        // if endpoints for delete activity exist in crm, else we might not have it implemented.
        // Assuming user hasn't explicitly mentioned DELETE activities, we will just show a toast for now.
        toast.error("Activity deletion requires admin permission");
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'CALL': return <Phone className="h-3.5 w-3.5 mr-1.5" />;
            case 'EMAIL': return <Mail className="h-3.5 w-3.5 mr-1.5" />;
            case 'MEETING': return <Calendar className="h-3.5 w-3.5 mr-1.5" />;
            case 'NOTE': return <FileText className="h-3.5 w-3.5 mr-1.5" />;
            case 'SMS': return <Smartphone className="h-3.5 w-3.5 mr-1.5" />;
            default: return <MessageSquare className="h-3.5 w-3.5 mr-1.5" />;
        }
    };

    const getActivityBadgeVariant = (type: string) => {
        const variants: Record<string, string> = {
            CALL: 'bg-blue-500/10 text-blue-600 border-none hover:bg-blue-500/20',
            EMAIL: 'bg-indigo-500/10 text-indigo-600 border-none hover:bg-indigo-500/20',
            MEETING: 'bg-emerald-500/10 text-emerald-600 border-none hover:bg-emerald-500/20',
            NOTE: 'bg-amber-500/10 text-amber-600 border-none hover:bg-amber-500/20',
            SMS: 'bg-cyan-500/10 text-cyan-600 border-none hover:bg-cyan-500/20',
            OTHER: 'bg-slate-500/10 text-slate-600 border-none',
        };
        return variants[type] || variants['OTHER'];
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Activity className="w-6 h-6 text-primary" />
                        Activities Log
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        View and manage all communications and activities associated with leads
                    </p>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[140px]">Date</TableHead>
                                <TableHead className="w-[140px]">Type</TableHead>
                                <TableHead>Lead ID</TableHead>
                                <TableHead className="max-w-[300px]">Content</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        Loading activities...
                                    </TableCell>
                                </TableRow>
                            ) : activities.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No recent activities found. Interactions added to leads will appear here.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                activities.map((activity: any) => (
                                    <TableRow key={activity.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-mono text-sm text-muted-foreground flex flex-col gap-0.5">
                                            <span>{format(new Date(activity.happened_at), 'MMM dd, yyyy')}</span>
                                            <span className="text-[11px] text-muted-foreground/70">{format(new Date(activity.happened_at), 'h:mm a')}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`px-2 py-[2px] rounded-md ${getActivityBadgeVariant(activity.type)}`}>
                                                <div className="flex items-center">
                                                    {getActivityIcon(activity.type)}
                                                    {activity.type}
                                                </div>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            #{activity.lead}
                                        </TableCell>
                                        <TableCell className="max-w-[300px]">
                                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                                {activity.content || <span className="italic opacity-50">No details provided</span>}
                                            </p>
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
                                                    onClick={() => handleDelete(activity.id)}
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
