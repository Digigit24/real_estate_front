import { useState } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function BrokerSubmitLead() {
    const [formData, setFormData] = useState({
        customer_name: "",
        mobile_number: "",
        email: "",
        project_interested: "",
        budget_range: "",
        bhk_preference: "",
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await brokerPortalService.submitLead(formData);
            toast({
                title: "Lead Submitted",
                description: "Your lead has been successfully submitted and is under review.",
            });
            setFormData({
                customer_name: "",
                mobile_number: "",
                email: "",
                project_interested: "",
                budget_range: "",
                bhk_preference: "",
                notes: "",
            });
        } catch (error: any) {
            toast({
                title: "Submission Failed",
                description: error.message || "Could not submit lead.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight">Submit New Lead</h1>
                <p className="text-muted-foreground mt-1.5 font-medium">Register a new client inquiry into the system.</p>
            </div>

            <Card className="bg-white border border-slate-200/60 shadow-lg rounded-2xl overflow-hidden relative">
                {/* Visual effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-[200px] pointer-events-none -z-10" />

                <CardContent className="p-8 relative z-10 w-full">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="customer_name" className="text-slate-700 font-semibold">Customer Name</Label>
                                <Input
                                    id="customer_name"
                                    value={formData.customer_name}
                                    onChange={handleChange}
                                    required
                                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/20 focus:border-indigo-400 h-12 rounded-xl shadow-sm transition-all"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mobile_number" className="text-slate-700 font-semibold">Mobile Number</Label>
                                <Input
                                    id="mobile_number"
                                    value={formData.mobile_number}
                                    onChange={handleChange}
                                    required
                                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/20 focus:border-indigo-400 h-12 rounded-xl shadow-sm transition-all"
                                    placeholder="+91 9876543210"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/20 focus:border-indigo-400 h-12 rounded-xl shadow-sm transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="project_interested" className="text-slate-700 font-semibold">Project Interested</Label>
                                <Input
                                    id="project_interested"
                                    value={formData.project_interested}
                                    onChange={handleChange}
                                    required
                                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/20 focus:border-indigo-400 h-12 rounded-xl shadow-sm transition-all"
                                    placeholder="Nova Residences"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budget_range" className="text-slate-700 font-semibold">Budget Range</Label>
                                <Input
                                    id="budget_range"
                                    value={formData.budget_range}
                                    onChange={handleChange}
                                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/20 focus:border-indigo-400 h-12 rounded-xl shadow-sm transition-all"
                                    placeholder="1.5Cr - 2.0Cr"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bhk_preference" className="text-slate-700 font-semibold">BHK Preference</Label>
                                <Input
                                    id="bhk_preference"
                                    value={formData.bhk_preference}
                                    onChange={handleChange}
                                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/20 focus:border-indigo-400 h-12 rounded-xl shadow-sm transition-all"
                                    placeholder="3 BHK"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-slate-700 font-semibold">Additional Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/20 focus:border-indigo-400 min-h-[120px] rounded-xl shadow-sm transition-all"
                                placeholder="Any special requirements or instructions..."
                            />
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button
                                type="submit"
                                className="w-full sm:w-auto px-8 bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 relative overflow-hidden group"
                                disabled={loading}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" /> Submit Lead</>}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
