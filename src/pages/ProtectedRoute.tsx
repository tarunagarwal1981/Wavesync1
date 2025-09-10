import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export interface ProtectedRouteProps {
  isAuthenticated: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, redirectTo = "/login" }) => {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default ProtectedRoute;

