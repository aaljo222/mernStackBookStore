// src/routers/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // or <FullPageSpinner/>
  if (!user) return <Navigate to="/login" replace />;
  return children ? children : <Outlet />;
}
