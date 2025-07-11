import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import useUser from "../hooks/use-user";
import { ROUTES } from "../utils/routes";

export default function AppRoute({ isPrivate }: { isPrivate?: boolean }) {
    const { token, setToken } = useAuth();
    const { refreshToken } = useUser();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            try {
                if (!token) {
                    const res = await refreshToken();
                    setToken(res.data.token);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(true);
                }
            } catch (e) {
                console.error(e);
                setToken('');
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkToken();
    }, [token, setToken, refreshToken]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (isPrivate && !isAuthenticated) {
        return <Navigate to={ROUTES.login} replace />;
    }
    if (!isPrivate && isAuthenticated) {
        return <Navigate to={ROUTES.home} replace />;
    }

    return <Outlet />;
}
