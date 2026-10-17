import { Navigate, Outlet } from 'react-router-dom';

type ProtectedRouteProps = {
    isAuthenticated: boolean;
    isLoading: boolean;
    redirectPath?: string;
    children?: React.ReactNode;
};

export const ProtectedRoute = ({
    isAuthenticated,
    isLoading,
    redirectPath = '/login',
    children,
}: ProtectedRouteProps) => {
    if (isLoading) {
        return <p>Checking authentication...</p>;
    }
    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }
    return children ? <>{children}</> : <Outlet />;
};
