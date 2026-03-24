import { Navigate, Outlet } from "react-router-dom";

const TOKEN_KEY = "nps_token";

export default function ProtectedRoute() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

