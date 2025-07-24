import { useAuth } from "../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../utils/routes";

export default function AppRoute({ isPrivate }: { isPrivate?: boolean }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary"></div>
                    <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-primary/50 animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (isPrivate && !isAuthenticated) {
        return <Navigate to={ROUTES.login} replace />;
    }
    if (!isPrivate && isAuthenticated) {
        return <Navigate to={ROUTES.home} replace />;
    }

    return <Outlet />;
}
