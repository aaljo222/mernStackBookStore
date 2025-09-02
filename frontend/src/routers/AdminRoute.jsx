// src/routes/AdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function isAdminToken(token) {
  if (!token) return false;
  try {
    const payload = jwtDecode(token); // { id, email, role, exp, iat }
    // 만료 체크
    if (payload?.exp && payload.exp * 1000 <= Date.now()) return false;
    // 역할 체크
    return payload?.role === "admin";
  } catch {
    return false;
  }
}

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!isAdminToken(token)) {
    // 로그인 페이지가 /admin 이라면 그대로 두세요
    return <Navigate to="/admin" replace />;
  }
  return children ? children : <Outlet />;
};

export default AdminRoute;
