// src/context/AuthContext.jsx  (JWT + 백엔드 /auth 사용)
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../lib/api"; // baseURL = import.meta.env.VITE_API_URL || "/api"

const AuthContext = createContext(null);

function decode(token) {
  try {
    const p = jwtDecode(token);
    if (p?.exp && p.exp * 1000 <= Date.now()) return null;
    return p; // { id, email, role, exp, iat ... }
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("token");
    return t ? decode(t) : null;
  });
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 refresh 쿠키로 access 갱신 시도
  useEffect(() => {
    (async () => {
      try {
        if (!user) {
          const { data } = await api.post("/auth/refresh"); // { accessToken }
          if (data?.accessToken) {
            localStorage.setItem("token", data.accessToken);
            setUser(decode(data.accessToken));
          }
        }
      } catch {/* refresh 없으면 무시 */}
      setLoading(false);
    })();
  }, []); // 한 번만

  // 로그인
  const loginUser = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    // { accessToken, user:{...} } 형태라고 가정
    localStorage.setItem("token", data.accessToken);
    setUser(decode(data.accessToken));
  };

  // 회원가입(필요 시)
  const registerUser = async (email, password, name) => {
    const { data } = await api.post("/auth/register", { email, password, name });
    localStorage.setItem("token", data.accessToken);
    setUser(decode(data.accessToken));
  };

  // 로그아웃
  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        user,                 // null | { id, email, role, ... }
        isLoggedIn: !!user,
        loginUser,
        registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
