import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Loading from "./components/Loading";
import Navbar from "./components/Navbar";

// 라우트 전환 시 스크롤 상단
function ScrollToTopOnRoute() {
  useEffect(() => {
    const handler = () => window.scrollTo({ top: 0, behavior: "instant" });
    window.addEventListener("hashchange", handler, { passive: true });
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return null;
}

export default function App() {
  // 짧은 지연 후 로더 표출(FOUC 방지)
  const [showBootLoader, setShowBootLoader] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowBootLoader(false), 600);
    return () => clearTimeout(t);
  }, []);

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
    </div>
  );
}
