// src/routers/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { loading, isLoggedIn } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children ? children : <Outlet />;
}
