import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { BrokerSidebar } from "./BrokerSidebar";
import { BrokerHeader } from "./BrokerHeader";

export function BrokerPortalLayout() {
    const isMobile = useIsMobile();
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <BrokerSidebar
                mobileOpen={sidebarOpen}
                setMobileOpen={setSidebarOpen}
                collapsed={sidebarCollapsed}
                onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <div className="flex flex-col flex-1 overflow-hidden">
                <BrokerHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950/50">
                    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 min-h-[calc(100vh-3.5rem)]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
