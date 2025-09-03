// src/components/WelcomeModal.jsx
import { useEffect } from "react";

export default function WelcomeModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="mx-4 w-full max-w-md rounded-2xl bg-white shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold">Welcome to Book Store 📚</h2>
        <p className="mt-2 text-gray-600">
          회원가입 후 책을 장바구니에 담고, 결제 페이지에서 주문을 완료해보세요!
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            나중에 보기
          </button>
          <a
            href="/"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            onClick={onClose}
          >
            시작하기
          </a>
        </div>
      </div>
    </div>
  );
}
