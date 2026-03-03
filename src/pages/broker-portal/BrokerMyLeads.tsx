import { useEffect, useState, useRef } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { BrokerLead } from "@/types/brokerPortalTypes";
import {
    Users, Filter, Search, MoreVertical, Edit, Trash2, Tag,
    MessageSquare, Download, Upload, Plus, PhoneCall
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function BrokerMyLeads() {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedLeads, setSelectedLeads] = useState<number[]>([]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const data = await brokerPortalService.getMyLeads();
            setLeads(data);
        } catch (error) {
            toast.error("Failed to load leads");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const filteredLeads = Array.isArray(leads) ? leads.filter((lead: any) => {
        const name = (lead.customer_name || lead.first_name || lead.name || "").toString().toLowerCase();
        const phone = (lead.mobile_number || lead.phone || "").toString().toLowerCase();
        const project = (lead.project_interested || lead.project?.name || "").toString().toLowerCase();
        const search = searchTerm.toLowerCase();

        return name.includes(search) || project.includes(search) || phone.includes(search);
    }) : [];

    const toggleSelectLead = (id: number) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(leadId => leadId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedLeads.length === filteredLeads.length && filteredLeads.length > 0) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(filteredLeads.map((l: any) => l.id));
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) return;
        try {
            await brokerPortalService.bulkDelete(selectedLeads);
            toast.success("Leads deleted successfully");
            setLeads(leads.filter((l: any) => !selectedLeads.includes(l.id)));
            setSelectedLeads([]);
        } catch (error) {
            toast.error("Failed to delete leads");
        }
    };

    const handleBulkMoveStatus = async (statusId: number) => {
        try {
            await brokerPortalService.bulkUpdateStatus(selectedLeads, statusId);
            toast.success("Leads status updated");
            fetchLeads();
            setSelectedLeads([]);
        } catch (error) {
            toast.error("Failed to update statuses");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this lead?")) return;
        try {
            await brokerPortalService.deleteLead(id);
            toast.success("Lead deleted successfully");
            setLeads(leads.filter(l => l.id !== id));
        } catch (error) {
            toast.error("Failed to delete lead");
        }
    };

    const handleExport = async () => {
        try {
            toast.info("Preparing export...");
            const blob = await brokerPortalService.exportLeads({ format: 'csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("Export successful!");
        } catch (error) {
            toast.error("Failed to export leads");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            toast.info("Importing leads...");
            await brokerPortalService.importLeadsBulk(file);
            toast.success("Leads imported successfully");
            fetchLeads();
        } catch (error) {
            toast.error("Failed to import leads");
        } finally {
            event.target.value = '';
        }
    };

    const handleMoveStatus = async (id: number, statusId: number) => {
        try {
            await brokerPortalService.moveToStatus(id, statusId);
            toast.success("Lead status updated");
            fetchLeads();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleAddActivity = async (id: number) => {
        const note = window.prompt("Enter activity notes (e.g., Called client):");
        if (!note) return;
        try {
            await brokerPortalService.addActivity(id, { note, activity_type: 'CALL' });
            toast.success("Activity logged");
            fetchLeads();
        } catch (error) {
            toast.error("Failed to add activity");
        }
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight">My Leads</h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Manage and track your submitted leads.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={handleExport} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm rounded-xl">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button onClick={handleImportClick} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm rounded-xl">
                        <Upload className="w-4 h-4 mr-2" /> Import
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                    />
                    <Button onClick={() => navigate('/broker-portal/submit-lead')} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 rounded-xl">
                        <Plus className="w-4 h-4 mr-2" /> New Lead
                    </Button>
                </div>
            </div>

            <Card className="bg-white border border-slate-200/60 shadow-lg rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-[200px] -z-10 pointer-events-none"></div>
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, project, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border-slate-200 pl-9 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all rounded-xl shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {selectedLeads.length > 0 && (
                            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 animate-in slide-in-from-bottom-2 fade-in">
                                <span className="text-sm font-medium text-indigo-700">{selectedLeads.length} Selected</span>
                                <Button onClick={() => handleBulkMoveStatus(2)} variant="ghost" size="sm" className="h-8 text-indigo-700 hover:bg-indigo-100">
                                    <Tag className="w-4 h-4 mr-1.5" /> Move Status
                                </Button>
                                <Button onClick={handleBulkDelete} variant="ghost" size="sm" className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700">
                                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                                </Button>
                            </div>
                        )}
                        <Button variant="outline" className="w-full sm:w-auto border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-700 rounded-xl shadow-sm">
                            <Filter className="w-4 h-4 mr-2" /> Filter Leads
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-muted-foreground animate-pulse font-medium">Loading leads...</p>
                            </div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-white border-b border-slate-100">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-12 py-4 px-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </TableHead>
                                    <TableHead className="text-slate-600 font-semibold py-4">Date</TableHead>
                                    <TableHead className="text-slate-600 font-semibold py-4">Customer Details</TableHead>
                                    <TableHead className="text-slate-600 font-semibold py-4">Project</TableHead>
                                    <TableHead className="text-slate-600 font-semibold py-4">Budget</TableHead>
                                    <TableHead className="text-slate-600 font-semibold py-4">Status</TableHead>
                                    <TableHead className="text-right py-4 font-semibold text-slate-600">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLeads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-slate-500 py-16">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                                    <Users className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <p className="font-medium text-lg text-slate-600">No leads found</p>
                                                <p className="text-sm text-slate-400">Try adjusting your search criteria</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLeads.map((lead: any) => {
                                        const name = lead.customer_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.name || '-';
                                        const phone = lead.mobile_number || lead.phone || '-';
                                        const project = lead.project_interested || lead.project?.name || '-';
                                        const budget = lead.budget_range || lead.budget || '-';
                                        const status = typeof lead.status === 'object' ? lead.status?.name : (lead.status || 'New');
                                        const isSelected = selectedLeads.includes(lead.id);

                                        return (
                                            <TableRow key={lead.id} className={`${isSelected ? 'bg-indigo-50/50' : ''} hover:bg-indigo-50/30 transition-colors cursor-pointer group border-b border-slate-100/50`} onClick={() => toggleSelectLead(lead.id)}>
                                                <TableCell className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectLead(lead.id)}
                                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-slate-600 whitespace-nowrap font-medium py-4">
                                                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-900 py-4">
                                                    {name}
                                                    <div className="text-sm font-normal text-slate-500 mt-1 hover:text-indigo-600 transition-colors">{phone}</div>
                                                </TableCell>
                                                <TableCell className="text-slate-700 font-medium py-4">{project}</TableCell>
                                                <TableCell className="text-slate-700 font-medium py-4">
                                                    <span className="bg-slate-100/80 text-slate-700 px-3 py-1 rounded-md text-sm">{budget}</span>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm px-3 py-1 font-semibold rounded-lg hover:bg-emerald-100">
                                                        {status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right py-4" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreVertical className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[200px] border-slate-100 shadow-xl rounded-xl">
                                                            <DropdownMenuLabel className="font-semibold text-slate-700">Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator className="bg-slate-100" />
                                                            <DropdownMenuItem className="cursor-pointer hover:bg-slate-50 hover:text-indigo-600" onClick={() => handleAddActivity(lead.id)}>
                                                                <PhoneCall className="mr-2 h-4 w-4" /> Log Activity
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="cursor-pointer hover:bg-slate-50 hover:text-indigo-600">
                                                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="cursor-pointer hover:bg-slate-50 hover:text-indigo-600" onClick={() => handleMoveStatus(lead.id, 2)}>
                                                                <Tag className="mr-2 h-4 w-4" /> Mark as Followed Up
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-100" />
                                                            <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 focus:text-red-700 focus:bg-red-50" onClick={() => handleDelete(lead.id)}>
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>
        </div>
    );
}
