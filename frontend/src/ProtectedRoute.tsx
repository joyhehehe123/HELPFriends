import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useToast } from "./components/toast/Toast";

type ProtectedRouteProps = {
    isAuthenticated: boolean;
    isLoading: boolean;
    redirectPath?: string;
    children?: React.ReactNode;
};

export const ProtectedRoute = ({
    isAuthenticated,
    isLoading,
    redirectPath = "/login",
    children,
}: ProtectedRouteProps) => {
    const { showToast } = useToast();
    const blocked = !isLoading && !isAuthenticated;

    useEffect(() => {
        if (blocked) showToast('Please log in to continue');
    }, [blocked, showToast]);

    if (isLoading) {
        return <p>Checking authentication...</p>;
    }
    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }
    return children ? <>{children}</> : <Outlet />;
};
