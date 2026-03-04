import { useEffect, useState } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, PlayCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export function BrokerTasks() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const data = await brokerPortalService.getTasks();
            setTasks(data);
        } catch (error) {
            console.error("Failed to load tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: number, currentStatus: string) => {
        // Toggle simple statuses for demonstration
        const nextStatus = currentStatus === 'TODO' ? 'IN_PROGRESS' : currentStatus === 'IN_PROGRESS' ? 'DONE' : 'TODO';
        try {
            await brokerPortalService.updateTask(id, { status: nextStatus });
            fetchTasks();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading tasks...</p>
            </div>
        </div>
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DONE': return <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 inline" />;
            case 'IN_PROGRESS': return <PlayCircle className="w-4 h-4 text-blue-500 mr-2 inline" />;
            default: return <Clock className="w-4 h-4 text-amber-500 mr-2 inline" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DONE': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer shadow-sm">Done</Badge>;
            case 'IN_PROGRESS': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer shadow-sm">In Progress</Badge>;
            default: return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer shadow-sm">To Do</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight">
                        Task Management
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Manage your workflow and track task progress.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-xl px-5">+ New Task</Button>
            </div>

            <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-slate-600 font-semibold py-4">Task Details</TableHead>
                                <TableHead className="text-slate-600 font-semibold py-4">Lead / Project</TableHead>
                                <TableHead className="text-slate-600 font-semibold py-4">Due Date</TableHead>
                                <TableHead className="text-slate-600 font-semibold py-4 text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-slate-500 py-12">
                                        No tasks found. Create a new task to get started!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tasks.map((task: any) => (
                                    <TableRow key={task.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <TableCell className="font-medium text-gray-900 py-4">
                                            <div className="flex items-center">
                                                {getStatusIcon(task.status)}
                                                {task.title}
                                            </div>
                                            {task.description && <div className="text-sm font-normal text-slate-500 mt-1 pl-6 line-clamp-1">{task.description}</div>}
                                        </TableCell>
                                        <TableCell className="text-gray-700 py-4">{task.lead_name || task.lead || 'General'}</TableCell>
                                        <TableCell className="text-gray-700 py-4 font-medium">
                                            {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No Due Date'}
                                        </TableCell>
                                        <TableCell className="text-right py-4">
                                            <div onClick={() => handleStatusChange(task.id, task.status)}>
                                                {getStatusBadge(task.status)}
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
