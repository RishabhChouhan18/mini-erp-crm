import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "../context/AuthContext";
import type { User } from "../types/auth";

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: User["role"][];
}

const RoleRoute = ({
  children,
  allowedRoles,
}: RoleRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (
    !user ||
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
};

export default RoleRoute;