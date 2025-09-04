import React, { useLayoutEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  onClose?: () => void;
}

const TRANSITION_MS = 300;
const MAX_LEN = 500;
const FALLBACK_TEXT = "병합 결과가 비어 있습니다. 잠시 후 다시 시도해주세요.";

function formatMergedPrompt(raw?: string): string {
  if (!raw) return FALLBACK_TEXT;

  let s = raw.trim();

  // 1) "## 제목 - 불릿시작" 이 한 줄에 붙어있는 경우 분리
  //    예) "## 금지사항 - 수련 완료 전 ..." -> "## 금지사항\n- 수련 완료 전 ..."
  s = s.replace(/^(\s*##\s+[^\n-]+?)\s+-\s+/gm, (_m, heading) => `${heading}\n- `);

  // 2) 첫 번째 '# '는 유지. 그 외 '## ' 앞에는 항상 빈 줄 1개 삽입
  //    (문자열 어디서든 '## ' 이전의 공백/개행을 통일해 '\n## '로)
  s = s.replace(/\s*##\s/g, '\n## ');

  // 3) 불릿 시작 전에는 개행 없이 바로 이어지도록 
  //    (기존 공백/개행을 제거하고 '\n- '로 맞춤)
  s = s.replace(/\s*-\s/g, '\n- ');

  // 4) 2개 이상 연속 개행은 최대 1개로 축약 (줄 띄움 한 번씩만)
  s = s.replace(/\n{2,}/g, '\n');

  return s.trim();
}

const UserNoteMergeResult: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const incomingText: string | undefined = (location.state as any)?.mergedText;
  const firstUserNoteId: number | undefined = (location.state as any)?.firstUserNoteId;
  const secondUserNoteId: number | undefined = (location.state as any)?.secondUserNoteId;
  const firstTitle: string | undefined = (location.state as any)?.firstTitle;
  const secondTitle: string | undefined = (location.state as any)?.secondTitle;

  const initialFormatted = useMemo(
    () => formatMergedPrompt(incomingText ?? FALLBACK_TEXT),
    [incomingText]
  );

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [text, setText] = useState<string>(initialFormatted);

  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const autoResize = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = "auto";
    el.style.overflowY = "hidden";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => setOpen(true), 0);
    return () => clearTimeout(t);
  }, []);

  useLayoutEffect(() => {
    autoResize();
  }, [text, autoResize]);

  React.useEffect(() => {
    const handleResize = () => autoResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [autoResize]);

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_LEN);
    setText(val);
  };

  const handleInput = useCallback(() => {
    autoResize();
  }, [autoResize]);

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

        <main className="flex-1 overflow-y-auto px-[15px] pb-36 bg-[#141924]">
          <div className="flex items-start gap-2 px-3 py-3 ml-[7px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21" fill="none" className="flex-shrink-0 mt-[2px]">
              <path d="M7.01241 10.859L9.51241 13.359L14.5124 8.35897M19.0957 10.859C19.0957 15.4613 15.3648 19.1923 10.7624 19.1923C6.16004 19.1923 2.42908 15.4613 2.42908 10.859C2.42908 6.25659 6.16004 2.52563 10.7624 2.52563C15.3648 2.52563 19.0957 6.25659 19.0957 10.859Z" stroke="#44CA48" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div className="text-[#44CA48] font-['Pretendard'] text-[17px] font-semibold leading-[141.2%] ml-[7px]">병합이 완료되었습니다.</div>
              <div className="mt-[2px] self-stretch text-[rgba(223,225,234,0.61)] font-['Pretendard'] text-[14px] font-normal leading-[142.9%] tracking-[0.203px] ml-[-20px]">병합된 노트를 검토하고 수정이 필요한 부분을 수정해주세요.</div>
            </div>
          </div>

          <h2 className="mt-[30px] text-[#F8F8FA] font-['Pretendard'] text-[17px] font-semibold leading-[141.2%]">병합결과</h2>

          <div className="relative mt-2 mr-[2px]">
            <textarea
              ref={taRef}
              value={text}
              onChange={handleChange}
              onInput={handleInput}
              rows={1}
              className="w-full resize-none rounded-[6px] bg-[#283143] text-[#F8F8FA] placeholder:text-white/40 px-4 py-3 font-['Pretendard'] text-[16px] font-normal leading-[150%] tracking-[0.091px] outline-none border border-[#404E6A] focus:border-[#6F4ACD] transition-all duration-150 overflow-hidden flex-1 self-stretch"
              placeholder="병합된 내용을 검토하고 수정해주세요"
              style={{ 
                boxSizing: "border-box", 
                overflowY: "hidden",
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE/Edge
                WebkitAppearance: "none"
              }}
            />
            <div className="flex justify-end mt-2">
              <span className="text-[12px] text-[#FFF]">
                {text.length}/{MAX_LEN}
              </span>
            </div>
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