// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  // 회원가입
  const registerUser = async (email, password) => {
    const { data } = await api.post("/auth/register", { email, password });
    // 백엔드가 { user, accessToken } 형태로 준다고 가정
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.accessToken);
    setUser(data.user);
  };

  // 로그인
  const loginUser = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.accessToken);
    setUser(data.user);
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  // 토큰 만료 등 처리(선택)
  useEffect(() => {
    // 필요시 /auth/me 같은 헬스 호출로 세션 확인
  }, []);

  return (
    <AuthContext.Provider value={{ user, registerUser, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
