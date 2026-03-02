import { useEffect, useState } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { BrokerProfile as IBrokerProfile } from "@/types/brokerPortalTypes";
import { UserCircle, Mail, Phone, Building, ShieldCheck, Asterisk } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-slate-400 animate-pulse">Loading profile...</p></div>;
    if (!profile) return <div className="text-center text-red-400 mt-10">Failed to load profile. Please try again.</div>;

    const initials = profile.first_name?.[0] + (profile.last_name?.[0] || "");

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">My Profile</h1>
                <p className="text-slate-400 mt-1">Manage your professional information and credentials.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Avatar & Status */}
                <Card className="col-span-1 bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col items-center p-8">
                    <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 pointer-events-none" />

                    <Avatar className="w-32 h-32 border-4 border-slate-800 shadow-xl relative z-10 bg-slate-800 mb-6">
                        <AvatarFallback className="text-4xl text-indigo-400 bg-slate-900">{initials}</AvatarFallback>
                    </Avatar>

                    <h2 className="text-2xl font-bold text-slate-100">{profile.first_name} {profile.last_name}</h2>
                    <p className="text-indigo-400 font-medium mb-6">{profile.agency_name}</p>

                    <div className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${profile.approval_status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            profile.approval_status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        <ShieldCheck size={16} />
                        {profile.approval_status}
                    </div>
                </Card>

                {/* Right Column - Details */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-xl">
                        <CardHeader className="border-b border-slate-800/60 pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-200">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                                    <Mail className="text-indigo-400 w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Email Address</p>
                                    <p className="text-slate-200 font-medium">{profile.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                                    <Phone className="text-indigo-400 w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Phone Number</p>
                                    <p className="text-slate-200 font-medium">{profile.phone || "Not provided"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                                    <Building className="text-indigo-400 w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Agency Name</p>
                                    <p className="text-slate-200 font-medium">{profile.agency_name}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-xl">
                        <CardHeader className="border-b border-slate-800/60 pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-200">Portal Security</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                                <Asterisk className="text-red-400 w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-500">Password</p>
                                <p className="text-slate-200 font-medium">••••••••••••</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
