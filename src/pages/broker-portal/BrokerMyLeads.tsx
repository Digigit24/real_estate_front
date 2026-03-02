import { useEffect, useState } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { BrokerLead } from "@/types/brokerPortalTypes";
import { Users, Filter } from "lucide-react";
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

export function BrokerMyLeads() {
    const [leads, setLeads] = useState<BrokerLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        brokerPortalService.getMyLeads().then(data => {
            setLeads(data);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, []);

    const filteredLeads = leads.filter((lead) =>
        lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.project_interested.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.mobile_number.includes(searchTerm)
    );

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">My Leads</h1>
                    <p className="text-slate-400 mt-1">Manage and track your submitted leads.</p>
                </div>
            </div>

            <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40">
                    <div className="relative w-full sm:w-96">
                        <Input
                            placeholder="Search by name, project, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-indigo-500/50 focus:border-indigo-400"
                        />
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </Button>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64"><p className="text-slate-400 animate-pulse">Loading leads...</p></div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-900/80 border-b border-slate-800">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-slate-400 font-medium">Date</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Customer</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Project</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Budget</TableHead>
                                    <TableHead className="text-slate-400 font-medium">BHK</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLeads.length === 0 ? (
                                    <TableRow className="hover:bg-slate-800/30 border-slate-800/50">
                                        <TableCell colSpan={6} className="text-center text-slate-500 py-16">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Users className="w-10 h-10 text-slate-600" />
                                                <p>No leads found matching your criteria.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <TableRow key={lead.id} className="hover:bg-slate-800/40 border-slate-800/50 transition-colors cursor-pointer group">
                                            <TableCell className="text-slate-400 whitespace-nowrap">
                                                {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-200">
                                                {lead.customer_name}
                                                <div className="text-xs text-slate-500 mt-0.5 group-hover:text-indigo-400 transition-colors">{lead.mobile_number}</div>
                                            </TableCell>
                                            <TableCell className="text-slate-300">{lead.project_interested}</TableCell>
                                            <TableCell className="text-slate-300">{lead.budget_range}</TableCell>
                                            <TableCell className="text-slate-300">{lead.bhk_preference}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                                                    {lead.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>
        </div>
    );
}
