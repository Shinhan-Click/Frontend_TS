import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  onClose?: () => void;
}

const TRANSITION_MS = 300;
const MAX_LEN = 500;
const FALLBACK_TEXT = "병합 결과가 비어 있습니다. 잠시 후 다시 시도해주세요.";

const UserNoteMergeResult: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const incomingText: string | undefined = (location.state as any)?.mergedText;
  const firstUserNoteId: number | undefined = (location.state as any)?.firstUserNoteId;
  const secondUserNoteId: number | undefined = (location.state as any)?.secondUserNoteId;
  const firstTitle: string | undefined = (location.state as any)?.firstTitle;
  const secondTitle: string | undefined = (location.state as any)?.secondTitle;

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [text, setText] = useState<string>(incomingText ?? FALLBACK_TEXT);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 0);
    return () => clearTimeout(t);
  }, []);

  const handleCloseWithSlide = () => {
    setClosing(true);
    setOpen(false);
    setTimeout(() => {
      onClose?.();
      navigate("/ChattingUserNote", { state: { mode: "merge-select" }, replace: true });
    }, TRANSITION_MS);
  };

  const handleConfirm = () => {
    navigate("/UserNoteMergeLoading", {
      state: {
        fromResult: true,
        mergedText: text,
        firstUserNoteId,
        secondUserNoteId,
        firstTitle,
        secondTitle,
      },
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div
        className={[
          "relative w-[375px] h-[896px] bg-[#0F1622] text-white rounded-sm overflow-hidden flex flex-col",
          "transform transition-transform duration-300 ease-out will-change-transform",
          open && !closing ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <header className="flex items-center h-[56px] px-[13px] py-[15px]">
          <button
            type="button"
            aria-label="닫기"
            onClick={handleCloseWithSlide}
            className="w-[40px] h-[40px] flex items-center justify-center rounded-md text-[#FFF] bg-[#141924] border-none"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-[15px] pb-36">
          <div className="flex items-start gap-2 px-3 py-3">
            <svg className="w-[20px] h-[20px] flex-shrink-0 mt-[2px] text-[#22C55E]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div className="text-[17px] font-semibold text-[#22C55E]">병합이 완료되었습니다.</div>
              <div className="mt-[2px] text-[14px] text-[#DFE1EA]/60">병합된 노트를 검토하고 수정이 필요한 부분을 수정해주세요.</div>
            </div>
          </div>

          <h2 className="mt-[30px] text-[17px] font-bold text-[#FFF]">병합결과</h2>

          <div className="relative mt-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
              className="w-full h-[280px] resize-none rounded-[6px] bg-[#283143] text-[#F8F8FA] placeholder:text-white/40 px-4 py-3 text-[16px] leading-6 outline-none border border-[#404E6A] focus:border-[#6F4ACD] overflow-y-scroll no-scrollbar"
              placeholder="병합된 내용을 검토하고 수정해주세요"
            />
            <style>{`
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <span className="absolute bottom-3 right-[0px] text-[12px] text-[#FFF]">
              {text.length}/{MAX_LEN}
            </span>
          </div>
        </main>

        <footer className="flex-shrink-0 px-5 pb-5 pt-3 bg-[#0F1622]">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-[359px] ml-[8.5px] mb-[10px] h-[52px] rounded-[12px] font-semibold border-none bg-[#6F4ACD] text-[#FFF]"
          >
            저장하기
          </button>
        </footer>
      </div>
    </div>
  );
};

export default UserNoteMergeResult;