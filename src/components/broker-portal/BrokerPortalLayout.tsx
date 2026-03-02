import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { brokerPortalService } from "@/services/brokerPortalService";
import { LayoutDashboard, Users, UserCircle, LogOut, FilePlus, Menu, X, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BrokerPortalLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const profile = brokerPortalService.getProfileFromStorage();

    const handleLogout = () => {
        brokerPortalService.logout();
        navigate("/broker-portal/login");
    };

    const menuItems = [
        { name: "Dashboard", path: "/broker-portal", icon: <LayoutDashboard size={20} /> },
        { name: "My Leads", path: "/broker-portal/my-leads", icon: <Users size={20} /> },
        { name: "Submit Lead", path: "/broker-portal/submit-lead", icon: <FilePlus size={20} /> },
        { name: "Profile", path: "/broker-portal/me", icon: <UserCircle size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden relative selection:bg-indigo-500/30">
            {/* Background aesthetic */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-black pointer-events-none z-0" />
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none z-0" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Mobile Sidebar Toggle */}
            <div className="absolute top-4 left-4 z-50 md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-300 hover:text-white">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/60 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex items-center h-20 px-6 border-b border-slate-800/60">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Rocket size={28} className="animate-pulse duration-3000" />
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            Celiyo Broker
                        </h1>
                    </div>
                </div>

                <div className="p-4 flex flex-col h-[calc(100vh-5rem)] justify-between">
                    <nav className="space-y-2 relative z-10">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                end={item.path === "/broker-portal"}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive
                                        ? "bg-indigo-500/10 text-indigo-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-indigo-500/20"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                    }`
                                }
                            >
                                {item.icon}
                                <span className="font-medium tracking-wide">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mt-auto space-y-4 relative z-10">
                        {profile && (
                            <div className="px-4 py-3 bg-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-md">
                                <p className="text-sm font-semibold text-white truncate max-w-[180px]">
                                    {profile.first_name} {profile.last_name}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">{profile.approval_status}</p>
                            </div>
                        )}
                        <Button
                            variant="default"
                            className="w-full justify-start gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all duration-300 rounded-xl h-12"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-10 scroll-smooth">
                <div className="container mx-auto px-4 py-8 md:px-8 max-w-7xl relative z-10 min-h-screen">
                    <Outlet />
                </div>
            </main>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
