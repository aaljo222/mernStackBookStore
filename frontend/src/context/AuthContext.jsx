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

  useEffect(() => {
    (async () => {
      try {
        // 로컬 토큰이 없을 때만 시도(콘솔 빨간줄 줄이기)
        if (!localStorage.getItem("token")) {
          const { data } = await api.post("/auth/refresh");
          if (data?.accessToken) {
            localStorage.setItem("token", data.accessToken);
            setUser(decode(data.accessToken));
          }
        }
      } catch {
        // 조용히 무시
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 로그인
  // src/context/AuthContext.jsx (loginUser만 교체)
  const loginUser = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.accessToken);
      setUser(decode(data.accessToken));
      return true;
    } catch (err) {
      // 서버에서 내려준 에러 메시지 노출
      const msg = err?.response?.data?.message || "Login failed";
      throw new Error(msg);
    }
  };

  // 회원가입(필요 시)
  const registerUser = async (email, password, name) => {
    const { data } = await api.post("/auth/register", {
      email,
      password,
      name,
    });
    localStorage.setItem("token", data.accessToken);
    setUser(decode(data.accessToken));
  };

  // 로그아웃
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        user, // null | { id, email, role, ... }
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
