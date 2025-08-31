import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type MergeOption = {
  id: string;          // 'my:123' 또는 'liked:45'
  title: string;
  description: string;
  meta: string;        // createdAt 또는 @author
  kind: 'my' | 'liked';
  rawId: number;
};

interface Props {
  onClose?: () => void;
  onConfirm?: (selectedId: string) => void;
}

const TRANSITION_MS = 300;

const UserNoteSelectPriorityBeforeMerging: React.FC<Props> = ({ onClose, onConfirm }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const options: MergeOption[] = ((location.state as any)?.options || []) as MergeOption[];
  const selectedForMerge: string[] = ((location.state as any)?.selectedForMerge || []) as string[];
  const draft = (location.state as any)?.draft;
  const fromSearch = (location.state as any)?.fromSearch ?? '';

  const [selectedId, setSelectedId] = useState<string | null>(options[0]?.id ?? null);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 0);
    return () => clearTimeout(t);
  }, []);

  const handleConfirmInternal = () => {
    if (!selectedId || selectedForMerge.length !== 2) return;

    // 우선 선택된 항목 → first, 나머지 → second
    const firstKey = selectedId;
    const secondKey = selectedForMerge.find((k) => k !== firstKey)!;

    const firstRaw = options.find((o) => o.id === firstKey)?.rawId;
    const secondRaw = options.find((o) => o.id === secondKey)?.rawId;
    if (!firstRaw || !secondRaw) return;

    onConfirm?.(selectedId);

    // 로딩 화면으로 이동하면서 병합 파라미터 전달
    navigate("/UserNoteMergeLoading", {
      state: {
        firstUserNoteId: firstRaw,
        secondUserNoteId: secondRaw,
        // UI에 쓰고 싶으면 함께 전달
        firstTitle: options.find(o => o.id === firstKey)?.title,
        secondTitle: options.find(o => o.id === secondKey)?.title,
        draft,
        fromSearch,
      },
    });
  };

  const handleCloseWithSlide = () => {
    setClosing(true);
    setOpen(false);
    setTimeout(() => {
      onClose?.();
      // 병합 선택 화면으로 복귀(선택 유지)
      navigate("/ChattingUserNote", {
        state: { mode: "merge-select", selectedForMerge },
        replace: true,
      });
    }, TRANSITION_MS);
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
          <h1 className="text-[16px] leading-6 text-[#FFF]">병합 시 우선 적용할 유저노트를 선택해주세요.</h1>
          <p className="mt-2 text-[12px] text-[#DFE1EA]/60 leading-5">
            병합 과정에서 일부 내용이 생략될 수 있습니다.
            <br />
            이때 더 중요하게 보존하고 싶은 유저노트를 선택해주세요.
          </p>

          <div className="mt-[40px] space-y-3">
            {options.map((opt) => {
              const selected = selectedId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSelectedId(opt.id)}
                  className={[
                    "w-full text-left rounded-[12px] px-4 py-4 mb-[20px] transition-colors",
                    "bg-white/5",
                    selected ? "ring-1 ring-[#6F4ACD]/80 bg-[#AE6FFF]/12 border-none"
                             : "ring-white/10 bg-[#D9C8EF]/4 border-none",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-[10px]">
                    <span
                      aria-hidden
                      className={[
                        "mt-[2px] inline-flex items-center justify-center",
                        "w-[22px] h-[22px] rounded-full",
                        selected ? "bg-[#6F4ACD]" : "bg-white/10",
                        selected ? "ring-1 ring-[#6F4ACD]" : "ring-1 ring-[#FFF]/80",
                        "shrink-0",
                      ].join(" ")}
                    >
                      {selected && <span className="block w-[10px] h-[10px] rounded-full bg-[#DADDE9]" />}
                    </span>

                    <div className="min-w-0">
                      <div className="text-[15px] text-[#FFF] font-semibold">{opt.title}</div>
                      <p className="mt-1 text-[12px] text-[#FFF]/65 leading-5 line-clamp-2">{opt.description}</p>
                      <div className="mt-2 text-[11px] text-[#9CA3AF]">{opt.meta}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </main>

        <footer className="flex-shrink-0 px-5 pb-5 pt-3 bg-[#0F1622]">
          <button
            type="button"
            onClick={handleConfirmInternal}
            disabled={!selectedId}
            className={[
              "w-[359px] ml-[8.5px] mb-[10px] h-[52px] rounded-[12px] font-semibold border-none",
              selectedId ? "bg-[#6F4ACD] text-[#FFF]" : "bg-[#6F4ACD] text-[#FFF] opacity-60 cursor-not-allowed",
            ].join(" ")}
          >
            병합하기
          </button>
        </footer>
      </div>

      <style>{`
        .line-clamp-2{
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
        }
      `}</style>
    </div>
  );
};

export default UserNoteSelectPriorityBeforeMerging;