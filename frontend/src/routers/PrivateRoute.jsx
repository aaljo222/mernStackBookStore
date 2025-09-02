// src/routes/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import jwtDecode from "jwt-decode";

function hasValidToken() {
  const t = localStorage.getItem("token");
  if (!t) return false;
  try {
    const p = jwtDecode(t);
    return !p?.exp || p.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

const PrivateRoute = ({ children }) => {
  if (!hasValidToken()) return <Navigate to="/login" replace />;
  return children ? children : <Outlet />;
};

export default PrivateRoute;
