import { useEffect } from "react";

export default function WelcomeModal({ open, onClose }) {
  // 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* 배경 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* 카드 */}
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100"
        >
          ✕
        </button>

        <h3 className="mb-2 text-xl font-semibold">Welcome to Book Store 📚</h3>
        <p className="mb-4 text-gray-600">
          AI 도구가 없었으면 감히 시도도 하지 못했을것입니다. 업무를하면서 수학
          공부를 병행하고 틈틈히 이런 도전이 감히 엄두가 나지 않습니다 업무가
          없이 본업이 개발이라면 그 개발하는시간에 이런 도전을 하지만 주말과
          업무 후에 이런 것을 할수 없습니다 . Mongodb(Backend nosql ) 을
          사용하면서 firebase 로 완성되어 있는 github 코드를 실행하면서 너무
          안되어 local에서 되었는데 결국 backend의 외부 db를 사용하는것은 유로
          결재가 필요하여 vercel에서 처음에는 backend와 frontend 2개의
          프로젝트를 생성하고 접근하려고 했는데 cors 에 막혀서 결국 하나의
          프로젝트를 통해 구현하였습니다. 이런 삽질의 과정을 통해 시스템을
          이해하게 되고 경험은 하나 하나 쌓입니다. 코딩과 개발 실력을 키우셔서
          향후 AI를 잘활용하여 본인의 역량을 극대화하세요
        </p>

        <div className="flex items-center justify-between gap-2">
          <button
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            onClick={onClose}
          >
            확인
          </button>
          <button
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            onClick={() => {
              localStorage.setItem("skip_welcome_modal", "1");
              onClose();
            }}
          >
            다시 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
