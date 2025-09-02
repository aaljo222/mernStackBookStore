// src/context/AuthContext.jsx (핵심만)
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 브라우저 로컬영속성
    setPersistence(auth, browserLocalPersistence).then(() => {
      return onAuthStateChanged(auth, (user) => {
        setCurrentUser(user || null);
        setLoading(false);
      });
    });
  }, [auth]);

  const logout = () => auth.signOut();

  return (
    <AuthContext.Provider value={{ currentUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
