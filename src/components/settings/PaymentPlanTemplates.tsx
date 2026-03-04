import { useState, useEffect } from "react";
import { tenantPaymentPlanService, PaymentPlanTemplate } from "@/services/tenantPaymentPlanService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, GripVertical, CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export function PaymentPlanTemplates() {
    const [templates, setTemplates] = useState<PaymentPlanTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Form state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [milestones, setMilestones] = useState<{ name: string, percentage: number }[]>([]);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data = await tenantPaymentPlanService.getTemplates();
            setTemplates(data);
        } catch (error) {
            toast.error("Failed to load templates");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (template?: PaymentPlanTemplate) => {
        if (template) {
            setEditingId(template.id);
            setName(template.name);
            setDescription(template.description || "");
            setMilestones(template.milestones.map(m => ({ name: m.name, percentage: m.percentage })));
        } else {
            setEditingId(null);
            setName("");
            setDescription("");
            setMilestones([{ name: "Booking Amount", percentage: 10 }]);
        }
        setIsOpen(true);
    };

    const handleAddMilestone = () => {
        setMilestones([...milestones, { name: "", percentage: 0 }]);
    };

    const handleRemoveMilestone = (index: number) => {
        setMilestones(milestones.filter((_, i) => i !== index));
    };

    const handleMilestoneChange = (index: number, field: string, value: string | number) => {
        const updated = [...milestones];
        updated[index] = { ...updated[index], [field]: value };
        setMilestones(updated);
    };

    const handleApplyPreset = (presetType: string) => {
        if (presetType === "20:80") {
            setName("20:80 Subvention Plan");
            setDescription("Pay 20% on booking, 80% on possession.");
            setMilestones([
                { name: "Booking Amount", percentage: 10 },
                { name: "Within 30 Days", percentage: 10 },
                { name: "On Possession", percentage: 80 }
            ]);
        } else if (presetType === "CLP") {
            setName("Construction Linked Plan (CLP)");
            setDescription("Standard construction-linked payment milestones.");
            setMilestones([
                { name: "Booking Amount", percentage: 10 },
                { name: "On Agreement", percentage: 20 },
                { name: "On Plinth Completion", percentage: 15 },
                { name: "On Slab 1", percentage: 10 },
                { name: "On Slab 2", percentage: 10 },
                { name: "On Brickwork", percentage: 15 },
                { name: "On Plastering", percentage: 15 },
                { name: "On Possession", percentage: 5 }
            ]);
        }
    };

    const handleSave = async () => {
        if (!name) {
            toast.error("Template name is required");
            return;
        }

        const totalPercentage = milestones.reduce((sum, m) => sum + Number(m.percentage), 0);
        if (totalPercentage !== 100) {
            toast.error(`Total percentage must equal 100%. Currently at ${totalPercentage}%`);
            return;
        }

        const payload = {
            name,
            description,
            milestones
        };

        try {
            if (editingId) {
                await tenantPaymentPlanService.updateTemplate(editingId, payload);
                toast.success("Template updated successfully");
            } else {
                await tenantPaymentPlanService.createTemplate(payload);
                toast.success("Template created successfully");
            }
            setIsOpen(false);
            fetchTemplates();
        } catch (error: any) {
            toast.error(error.message || "Failed to save template");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this template?")) return;
        try {
            await tenantPaymentPlanService.deleteTemplate(id);
            toast.success("Template deleted");
            fetchTemplates();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete template");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl border border-slate-200">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Payment Plan Templates</h2>
                    <p className="text-sm text-slate-500">Configure standardized payment plans like CLP, 20:80 for bookings.</p>
                </div>
                <Button onClick={() => handleOpenForm()} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-lg">
                    <Plus className="w-4 h-4 mr-2" /> New Template
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div></div>
            ) : templates.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 text-center text-slate-500 flex flex-col items-center">
                    <Save className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="font-medium">No templates configured yet.</p>
                    <p className="text-sm mt-1 mb-4">Click "New Template" to set up your first payment schedule.</p>
                    <Button variant="outline" onClick={() => handleOpenForm()}>Create Template</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <Card key={template.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[80px] -z-10 group-hover:scale-110 transition-transform"></div>
                            <CardHeader className="pb-3 border-b border-slate-100">
                                <CardTitle className="flex justify-between items-center text-lg">
                                    <span className="truncate pr-4">{template.name}</span>
                                    {template.is_default && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                    {template.description || "No description provided."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 bg-slate-50/50">
                                <div className="space-y-2 mb-4">
                                    <div className="text-xs font-semibold uppercase text-slate-500 mb-3 tracking-wider">Milestone Breakdown</div>
                                    {template.milestones.slice(0, 3).map((m, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <span className="text-slate-700 truncate mr-2">{m.name}</span>
                                            <Badge variant="outline" className="font-mono bg-white text-emerald-700 border-emerald-200">{m.percentage}%</Badge>
                                        </div>
                                    ))}
                                    {template.milestones.length > 3 && (
                                        <div className="text-xs text-slate-400 font-medium pt-1">+ {template.milestones.length - 3} more milestones</div>
                                    )}
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-slate-100">
                                    <Button variant="outline" size="sm" className="flex-1 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-600 bg-white" onClick={() => handleOpenForm(template)}>
                                        <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 bg-white" onClick={() => handleDelete(template.id)}>
                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Payment Plan Template" : "Create Payment Plan Template"}</DialogTitle>
                    </DialogHeader>

                    {!editingId && (
                        <div className="flex items-center gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-2">
                            <span className="text-sm font-semibold text-indigo-800">Quick Start:</span>
                            <Button size="sm" variant="outline" className="bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700" onClick={() => handleApplyPreset("CLP")}>Apply CLP Preset</Button>
                            <Button size="sm" variant="outline" className="bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700" onClick={() => handleApplyPreset("20:80")}>Apply 20:80 Preset</Button>
                        </div>
                    )}

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label>Template Name <span className="text-red-500">*</span></Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Standard Construction Linked Plan" />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief details about this payment structure..." />
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <Label className="text-base font-semibold">Payment Milestones</Label>
                                <Badge className={
                                    milestones.reduce((s, m) => s + Number(m.percentage), 0) === 100
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                }>
                                    Total: {milestones.reduce((s, m) => s + Number(m.percentage), 0)}%
                                </Badge>
                            </div>

                            <Table className="border rounded-lg overflow-hidden">
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-[40px]"></TableHead>
                                        <TableHead>Milestone Description</TableHead>
                                        <TableHead className="w-[120px] text-right">Percentage</TableHead>
                                        <TableHead className="w-[60px] text-right"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {milestones.map((m, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell><GripVertical className="w-4 h-4 text-slate-300" /></TableCell>
                                            <TableCell>
                                                <Input value={m.name} onChange={e => handleMilestoneChange(idx, 'name', e.target.value)} placeholder="e.g. Upon Plinth Completion" className="h-8" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="relative">
                                                    <Input type="number" min="0" max="100" value={m.percentage} onChange={e => handleMilestoneChange(idx, 'percentage', e.target.value)} className="h-8 pr-6 text-right font-mono" />
                                                    <span className="absolute right-2 top-1.5 text-slate-400 text-xs font-bold">%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md" onClick={() => handleRemoveMilestone(idx)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button variant="outline" size="sm" className="w-full text-slate-600 border-dashed hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50" onClick={handleAddMilestone}>
                                <Plus className="w-4 h-4 mr-2" /> Add Milestone
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                            <Save className="w-4 h-4 mr-2" /> Save Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
