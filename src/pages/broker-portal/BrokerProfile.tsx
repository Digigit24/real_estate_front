import { useEffect, useState } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { BrokerProfile as IBrokerProfile } from "@/types/brokerPortalTypes";
import { Mail, Phone, Building, ShieldCheck, Asterisk, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function BrokerProfile() {
    const [profile, setProfile] = useState<IBrokerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        brokerPortalService.getProfile().then(data => {
            setProfile(data);
            setLoading(false);
        }).catch(() => {
            // Fallback to local storage if API fails but token exists
            const fallback = brokerPortalService.getProfileFromStorage();
            if (fallback) setProfile(fallback);
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse font-medium">Loading profile...</p>
            </div>
        </div>
    );

    if (!profile) return <div className="text-center text-red-500 mt-10 font-medium bg-red-50 p-6 rounded-xl">Failed to load profile. Please try again.</div>;

    const initials = profile.first_name?.[0] + (profile.last_name?.[0] || "");

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight">My Profile</h1>
                <p className="text-muted-foreground mt-1.5 font-medium">Manage your professional information and credentials.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Avatar & Status */}
                <div className="col-span-1 border border-slate-200/60 bg-white/80 shadow-lg relative overflow-hidden flex flex-col items-center p-8 rounded-2xl h-fit">
                    <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-br from-indigo-50 to-purple-50 pointer-events-none" />

                    <Avatar className="w-32 h-32 border-4 border-white shadow-xl relative z-10 bg-indigo-100 mb-6">
                        <AvatarFallback className="text-4xl text-indigo-700 font-bold bg-indigo-50">{initials}</AvatarFallback>
                    </Avatar>

                    <h2 className="text-2xl font-bold text-slate-900 text-center">{profile.first_name} {profile.last_name}</h2>
                    <p className="text-indigo-600 font-semibold mb-6 text-center">{profile.agency_name}</p>

                    <div className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm ${profile.approval_status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            profile.approval_status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        <ShieldCheck size={18} />
                        {profile.approval_status}
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <Card className="bg-white border border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                            <CardTitle className="text-lg font-bold text-slate-800">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-5 group">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-100 group-hover:scale-105 transition-all shadow-sm">
                                    <Mail className="text-indigo-600 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</p>
                                    <p className="text-slate-900 font-medium text-[15px]">{profile.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 group">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-100 group-hover:scale-105 transition-all shadow-sm">
                                    <Phone className="text-indigo-600 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</p>
                                    <p className="text-slate-900 font-medium text-[15px]">{profile.phone || "Not provided"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 group">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-100 group-hover:scale-105 transition-all shadow-sm">
                                    <Building className="text-indigo-600 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Agency Name</p>
                                    <p className="text-slate-900 font-medium text-[15px]">{profile.agency_name}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold text-slate-800">Security Credentials</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex items-center gap-5">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                                <Asterisk className="text-slate-600 w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Password</p>
                                <p className="text-slate-900 font-medium text-[15px] tracking-widest">••••••••••••</p>
                            </div>
                            <Button variant="outline" className="border-slate-200 hover:bg-slate-50 hover:text-indigo-600 rounded-xl shadow-sm text-sm font-semibold px-4 h-10">
                                <KeyRound className="w-4 h-4 mr-2" /> Change
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
