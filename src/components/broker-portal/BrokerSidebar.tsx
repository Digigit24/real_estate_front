import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    UserCircle,
    FilePlus,
    X,
    Rocket,
    PanelLeftClose,
    PanelLeft,
    ClipboardList,
    Activity,
    Settings,
    Building2,
    Grid3X3,
    CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MenuItem {
    id: string;
    label: string;
    icon: LucideIcon;
    path: string;
}

interface MenuSection {
    label?: string;
    items: MenuItem[];
}

const menuSections: MenuSection[] = [
    {
        items: [
            {
                id: "dashboard",
                label: "Dashboard",
                icon: LayoutDashboard,
                path: "/broker-portal",
            },
        ],
    },
    {
        label: "LEADS MANAGEMENT",
        items: [
            { id: "my-leads", label: "My Leads", icon: Users, path: "/broker-portal/my-leads" },
            { id: "submit-lead", label: "Submit Lead", icon: FilePlus, path: "/broker-portal/submit-lead" },
        ],
    },
    {
        label: "STATUS & ACTIVITIES",
        items: [
            { id: "statuses", label: "Pipeline Statuses", icon: ClipboardList, path: "/broker-portal/statuses" },
            { id: "activities", label: "Activities Log", icon: Activity, path: "/broker-portal/activities" },
            { id: "fields", label: "Field Configs", icon: Settings, path: "/broker-portal/field-configs" },
        ],
    },
    {
        label: "WORKFLOW",
        items: [
            { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/broker-portal/tasks" },
            { id: "meetings", label: "Meetings", icon: Users, path: "/broker-portal/meetings" },
        ],
    },
    {
        label: "INVENTORY",
        items: [
            { id: "projects", label: "Projects", icon: Building2, path: "/broker-portal/inventory" },
            { id: "units", label: "All Units", icon: Grid3X3, path: "/broker-portal/inventory/units" },
        ],
    },
    {
        label: "BOOKINGS & FINANCE",
        items: [
            { id: "bookings", label: "Bookings", icon: CreditCard, path: "/broker-portal/bookings" },
            { id: "payments", label: "Payments Ledger", icon: CreditCard, path: "/broker-portal/payments" },
        ],
    },
    {
        label: "NETWORK",
        items: [
            { id: "network", label: "Network Directory", icon: Users, path: "/broker-portal/network" },
        ],
    },
    {
        label: "ACCOUNT",
        items: [
            { id: "profile", label: "Profile", icon: UserCircle, path: "/broker-portal/me" },
        ],
    },
];

interface BrokerSidebarProps {
    collapsed?: boolean;
    onCollapse?: () => void;
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
}

export function BrokerSidebar({
    collapsed = false,
    onCollapse,
    mobileOpen = false,
    setMobileOpen,
}: BrokerSidebarProps) {
    const location = useLocation();

    const isActive = (path?: string) => {
        if (!path) return false;
        if (path === "/broker-portal") {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const closeMobileSidebar = () => {
        if (setMobileOpen) setMobileOpen(false);
    };

    const renderMenuItem = (item: MenuItem) => {
        return (
            <Link
                key={item.id}
                to={item.path || "#"}
                onClick={closeMobileSidebar}
            >
                <div
                    className={cn(
                        "flex items-center gap-3 h-9 px-3 rounded-lg text-[13px] font-medium transition-all duration-150",
                        "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                        isActive(item.path) &&
                        "text-foreground sidebar-active -ml-0.5 pl-[10px]",
                        collapsed && "justify-center px-2"
                    )}
                >
                    <item.icon className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        isActive(item.path) && "sidebar-active-icon"
                    )} />
                    {!collapsed && (
                        <span className="flex-1 text-left">{item.label}</span>
                    )}
                </div>
            </Link>
        );
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo Area */}
            <div className="h-14 flex items-center justify-center px-4 border-b border-border/40 relative">
                {!collapsed && (
                    <div className="flex items-center justify-center flex-1 gap-2 text-primary">
                        <Rocket className="w-5 h-5" />
                        <span className="font-bold text-sm tracking-wide">Broker Portal</span>
                    </div>
                )}
                {collapsed && (
                    <div className="w-7 h-7 flex items-center justify-center mx-auto text-primary">
                        <Rocket className="w-5 h-5" />
                    </div>
                )}
                {mobileOpen && setMobileOpen && (
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden absolute right-3 p-1.5 rounded-md hover:bg-accent"
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-2">
                <nav className="space-y-1">
                    {menuSections.map((section, sectionIdx) => {
                        return (
                            <div key={sectionIdx} className={cn(sectionIdx > 0 && "pt-4")}>
                                {/* Section Label */}
                                {section.label && !collapsed && (
                                    <div className="px-3 pb-2">
                                        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase">
                                            {section.label}
                                        </span>
                                    </div>
                                )}
                                {section.label && collapsed && (
                                    <div className="flex justify-center pb-2">
                                        <div className="w-5 h-px bg-border" />
                                    </div>
                                )}

                                <div className="space-y-0.5">
                                    {section.items.map(renderMenuItem)}
                                </div>
                            </div>
                        );
                    })}
                </nav>
            </ScrollArea>

            {/* Collapse Button */}
            {!mobileOpen && onCollapse && (
                <div className="p-3 border-t border-border/40">
                    <button
                        onClick={onCollapse}
                        className={cn(
                            "w-full flex items-center gap-3 h-9 px-3 rounded-lg text-[13px] font-medium transition-all duration-150",
                            "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                            collapsed && "justify-center"
                        )}
                    >
                        {collapsed ? (
                            <PanelLeft className="h-[18px] w-[18px] shrink-0" />
                        ) : (
                            <>
                                <PanelLeftClose className="h-[18px] w-[18px] shrink-0" />
                                <span>Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && setMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            {setMobileOpen && (
                <aside
                    className={cn(
                        "fixed top-0 left-0 h-full w-64 bg-background border-r border-border/40 z-50 transition-transform duration-300 lg:hidden shadow-xl",
                        mobileOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <SidebarContent />
                </aside>
            )}

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "h-screen bg-background border-r border-border/40 transition-all duration-300 hidden lg:block",
                    collapsed ? "w-16" : "w-60"
                )}
            >
                <SidebarContent />
            </aside>
        </>
    );
}
