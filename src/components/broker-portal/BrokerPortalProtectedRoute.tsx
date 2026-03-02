import { Navigate } from "react-router-dom";
import { brokerPortalService } from "@/services/brokerPortalService";

interface BrokerPortalProtectedRouteProps {
    children: React.ReactNode;
}

export function BrokerPortalProtectedRoute({ children }: BrokerPortalProtectedRouteProps) {
    const isAuthenticated = brokerPortalService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/broker-portal/login" replace />;
    }

    return <>{children}</>;
}
