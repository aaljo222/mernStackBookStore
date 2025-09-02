// src/routers/AdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { loading, user } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== "admin") return <Navigate to="/admin" replace />;
  return children ? children : <Outlet />;
}
