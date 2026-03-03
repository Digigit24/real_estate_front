// src/App.tsx - CRM + WhatsApp Application
import { ModuleProtectedRoute } from "@/components/ModuleProtectedRoute";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UniversalHeader } from "@/components/UniversalHeader";
import { UniversalSidebar } from "@/components/UniversalSidebar";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { swrConfig } from "@/lib/swrConfig";
import { authService } from "@/services/authService";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import Campaigns from "./pages/Campaigns";
import Chats from "./pages/Chats";
import Contacts from "./pages/Contacts";
import { CRMActivities } from "./pages/CRMActivities";
import { CRMFieldConfigurations } from "./pages/CRMFieldConfigurations";
import { CRMLeads } from "./pages/CRMLeads";
import { CRMLeadStatuses } from "./pages/CRMLeadStatuses";
import { CRMTasks } from "./pages/CRMTasks";
import Dashboard from "./pages/Dashboard";
import FlowEditor from "./pages/FlowEditor";
import Flows from "./pages/Flows";
import Groups from "./pages/Groups";
import { LeadDetailsPage } from "./pages/LeadDetailsPage";
import Login from "./pages/Login";
import { Meetings } from "./pages/Meetings";
import NotFound from "./pages/NotFound";
import QRCodes from "./pages/QRCodes";
import Scheduling from "./pages/Scheduling";
import Templates from "./pages/Templates";
import WhatsAppOnboarding from "./pages/WhatsAppOnboarding";

import { ThemeSync } from "@/components/ThemeSync";
import { AdminSettings } from "./pages/AdminSettings";
import { Debug } from "./pages/Debug";
import Integrations from "./pages/Integrations";
import { Roles } from "./pages/Roles";
import { Users } from "./pages/Users";
import WorkflowEditor from "./pages/WorkflowEditor";
import { WorkflowLogs } from "./pages/WorkflowLogs";

// Real Estate Inventory
import { useFirstLogin } from "./hooks/useFirstLogin";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Projects } from "./pages/Projects";
import { TenantSettingsPage } from "./pages/TenantSettingsPage";
import { TowerUnitGrid } from "./pages/TowerUnitGrid";

// Bookings & Payments
import { BookingDetail } from "./pages/BookingDetail";
import { Bookings } from "./pages/Bookings";
import { PaymentsPage } from "./pages/Payments";

// Brokers
import { BrokerDetail } from "./pages/BrokerDetail";
import { Brokers } from "./pages/Brokers";
import { Commissions } from "./pages/Commissions";

// Broker Portal
import { BrokerPortalLayout } from "./components/broker-portal/BrokerPortalLayout";
import { BrokerPortalProtectedRoute } from "./components/broker-portal/BrokerPortalProtectedRoute";
import { BrokerDashboard } from "./pages/broker-portal/BrokerDashboard";
import { BrokerLogin } from "./pages/broker-portal/BrokerLogin";
import { BrokerMyLeads } from "./pages/broker-portal/BrokerMyLeads";
import { BrokerProfile } from "./pages/broker-portal/BrokerProfile";
import { BrokerPortalLayout } from "./components/broker-portal/BrokerPortalLayout";
import { BrokerPortalProtectedRoute } from "./components/broker-portal/BrokerPortalProtectedRoute";

// Analytics
import { Analytics } from "./pages/Analytics";

import { RealtimeChatProvider } from "./context/RealtimeChatProvider";
import { WebSocketProvider } from "./context/WebSocketProvider";
import { OAuthCallback } from "./pages/OAuthCallback";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const AppLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // First login: auto-seed pipeline stages if empty
  useFirstLogin();

  return (
    <>
      <ThemeSync />
      <div className="flex h-screen overflow-hidden bg-background">
        <UniversalSidebar
          mobileOpen={sidebarOpen}
          setMobileOpen={setSidebarOpen}
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <UniversalHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              {/* CRM Routes */}
              <Route path="/crm/leads" element={<ModuleProtectedRoute requiredModule="crm"><CRMLeads /></ModuleProtectedRoute>} />
              <Route path="/crm/leads/:leadId" element={<ModuleProtectedRoute requiredModule="crm"><LeadDetailsPage /></ModuleProtectedRoute>} />
              <Route path="/crm/activities" element={<ModuleProtectedRoute requiredModule="crm"><CRMActivities /></ModuleProtectedRoute>} />
              <Route path="/crm/statuses" element={<ModuleProtectedRoute requiredModule="crm"><CRMLeadStatuses /></ModuleProtectedRoute>} />
              <Route path="/crm/settings" element={<ModuleProtectedRoute requiredModule="crm"><CRMFieldConfigurations /></ModuleProtectedRoute>} />
              <Route path="/crm/tasks" element={<ModuleProtectedRoute requiredModule="crm"><CRMTasks /></ModuleProtectedRoute>} />
              <Route path="/crm/meetings" element={<ModuleProtectedRoute requiredModule="crm"><Meetings /></ModuleProtectedRoute>} />
              <Route path="/crm/pipeline" element={<ModuleProtectedRoute requiredModule="crm"><Navigate to="/crm/leads" replace /></ModuleProtectedRoute>} />

              {/* Inventory Routes (Real Estate) */}
              <Route path="/inventory/projects" element={<ModuleProtectedRoute requiredModule="crm"><Projects /></ModuleProtectedRoute>} />
              <Route path="/inventory/projects/:id" element={<ModuleProtectedRoute requiredModule="crm"><ProjectDetail /></ModuleProtectedRoute>} />
              <Route path="/inventory/projects/:id/towers/:towerId" element={<ModuleProtectedRoute requiredModule="crm"><TowerUnitGrid /></ModuleProtectedRoute>} />

              {/* Bookings & Payments Routes */}
              <Route path="/bookings" element={<ModuleProtectedRoute requiredModule="crm"><Bookings /></ModuleProtectedRoute>} />
              <Route path="/bookings/:id" element={<ModuleProtectedRoute requiredModule="crm"><BookingDetail /></ModuleProtectedRoute>} />

              {/* Brokers Routes */}
              <Route path="/brokers" element={<ModuleProtectedRoute requiredModule="crm"><Brokers /></ModuleProtectedRoute>} />
              <Route path="/brokers/:id" element={<ModuleProtectedRoute requiredModule="crm"><BrokerDetail /></ModuleProtectedRoute>} />
              <Route path="/brokers/commissions" element={<ModuleProtectedRoute requiredModule="crm"><Commissions /></ModuleProtectedRoute>} />

              {/* Payments Route */}
              <Route path="/payments" element={<ModuleProtectedRoute requiredModule="crm"><PaymentsPage /></ModuleProtectedRoute>} />

              {/* Analytics Route */}
              <Route path="/analytics" element={<ModuleProtectedRoute requiredModule="crm"><Analytics /></ModuleProtectedRoute>} />

              {/* Tenant Settings (Real Estate) */}
              <Route path="/settings/tenant" element={<ModuleProtectedRoute requiredModule="crm"><TenantSettingsPage /></ModuleProtectedRoute>} />

              {/* WhatsApp Routes */}
              <Route path="/whatsapp/onboarding" element={<ModuleProtectedRoute requiredModule="whatsapp"><WhatsAppOnboarding /></ModuleProtectedRoute>} />
              <Route path="/whatsapp/contacts" element={<ModuleProtectedRoute requiredModule="whatsapp"><Contacts /></ModuleProtectedRoute>} />
              <Route path="/whatsapp/chats" element={<ModuleProtectedRoute requiredModule="whatsapp"><Chats /></ModuleProtectedRoute>} />
              <Route path="/whatsapp/groups" element={<ModuleProtectedRoute requiredModule="whatsapp"><Groups /></ModuleProtectedRoute>} />
              <Route path="/whatsapp/templates" element={<ModuleProtectedRoute requiredModule="whatsapp"><Templates /></ModuleProtectedRoute>} />
              <Route path="/whatsapp/campaigns" element={<ModuleProtectedRoute requiredModule="whatsapp"><Campaigns /></ModuleProtectedRoute>} />
              <Route path="/whatsapp/flows" element={<ModuleProtectedRoute requiredModule="whatsapp"><Flows /></ModuleProtectedRoute>} />
              <Route path="/whatsapp/flows/:flow_id" element={<ModuleProtectedRoute requiredModule="whatsapp"><FlowEditor /></ModuleProtectedRoute>} />
              <Route path="/whatsapp/qrcode" element={<ModuleProtectedRoute requiredModule="whatsapp"><QRCodes /></ModuleProtectedRoute>} />
              <Route path="/whatsapp/scheduling" element={<ModuleProtectedRoute requiredModule="whatsapp"><Scheduling /></ModuleProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/users" element={<ModuleProtectedRoute requiredModule="admin"><Users /></ModuleProtectedRoute>} />
              <Route path="/admin/roles" element={<ModuleProtectedRoute requiredModule="admin"><Roles /></ModuleProtectedRoute>} />
              <Route path="/admin/settings" element={<ModuleProtectedRoute requiredModule="admin"><AdminSettings /></ModuleProtectedRoute>} />
              <Route path="/admin/debug" element={<ModuleProtectedRoute requiredModule="admin"><Debug /></ModuleProtectedRoute>} />

              {/* Integration Routes */}
              <Route path="/integrations" element={<ModuleProtectedRoute requiredModule="integrations"><Integrations /></ModuleProtectedRoute>} />
              <Route path="/integrations/workflows/new" element={<ModuleProtectedRoute requiredModule="integrations"><WorkflowEditor /></ModuleProtectedRoute>} />
              <Route path="/integrations/workflows/:workflowId" element={<ModuleProtectedRoute requiredModule="integrations"><WorkflowEditor /></ModuleProtectedRoute>} />
              <Route path="/integrations/workflows/:workflowId/logs" element={<ModuleProtectedRoute requiredModule="integrations"><WorkflowLogs /></ModuleProtectedRoute>} />
              <Route path="/integrations/oauth/callback" element={<ModuleProtectedRoute requiredModule="integrations"><OAuthCallback /></ModuleProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
};

const App = () => {
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      authService.applyStoredPreferences();
    }
  }, [isAuthenticated]);

  return (
    <SWRConfig value={swrConfig}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <WebSocketProvider>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/login"
                  element={
                    isAuthenticated ? <Navigate to="/" replace /> : <Login />
                  }
                />

                {/* Broker Portal Auth Routes */}
                <Route path="/broker-portal/login" element={<BrokerLogin />} />
                <Route path="/broker-portal/register" element={<BrokerRegistration />} />

                {/* Broker Portal Protected Routes */}
                <Route
                  path="/broker-portal"
                  element={
                    <BrokerPortalProtectedRoute>
                      <BrokerPortalLayout />
                    </BrokerPortalProtectedRoute>
                  }
                >
                  <Route index element={<BrokerDashboard />} />
                  <Route path="my-leads" element={<BrokerMyLeads />} />
                  <Route path="submit-lead" element={<BrokerSubmitLead />} />
                  <Route path="statuses" element={<BrokerStatuses />} />
                  <Route path="activities" element={<BrokerActivities />} />
                  <Route path="field-configs" element={<BrokerFieldConfigs />} />
                  <Route path="inventory" element={<BrokerInventory />} />
                  <Route path="inventory/units" element={<BrokerUnits />} />
                  <Route path="bookings" element={<BrokerBookings />} />
                  <Route path="me" element={<BrokerProfile />} />
                </Route>

                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <RealtimeChatProvider>
                        <AppLayout />
                      </RealtimeChatProvider>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </WebSocketProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </SWRConfig>
  );
};

export default App;
