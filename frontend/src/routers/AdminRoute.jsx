// src/routers/AdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // or <FullPageSpinner/>
  if (!user || user.role !== "admin") return <Navigate to="/admin" replace />;
  return children ? children : <Outlet />;
}
