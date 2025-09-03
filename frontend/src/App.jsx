// src/App.jsx
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Loading from "./components/Loading";
import Navbar from "./components/Navbar";
import WelcomeModal from "./components/WelcomeModal";

// 라우트 전환 시 페이지 상단으로 스크롤
function ScrollToTopOnRoute() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  // 부팅 로더(살짝 딜레이로 FOUC 방지)
  const [showBootLoader, setShowBootLoader] = useState(true);

  // 첫 방문 웰컴 모달
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowBootLoader(false), 600);
    return () => clearTimeout(t);
  }, []);

  // 첫 진입 시 한 번만 모달 표시 (닫으면 다시 안 뜸)
  useEffect(() => {
    try {
      const seen = localStorage.getItem("welcomeSeen");
      if (!seen) setShowWelcome(true);
    } catch {
      // SSR/프라이빗모드 대비: 읽기 실패 시에도 모달은 띄움
      setShowWelcome(true);
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem("welcomeSeen", "1");
    } catch {}
  };

  if (showBootLoader) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <ScrollToTopOnRoute />

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="max-w-screen-2xl mx-auto px-4">
          <Navbar />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-screen-2xl mx-auto px-4 py-8 font-primary">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-screen-2xl mx-auto px-4">
          <Footer />
        </div>
      </footer>

      {/* 처음 진입 모달 */}
      <WelcomeModal open={showWelcome} onClose={handleCloseWelcome} />
    </div>
  );
}
