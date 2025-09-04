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
          <h1 className="text-[#F8F8FA] font-['Pretendard'] text-[17px] font-semibold leading-[141.2%]">병합 시 우선 적용할 유저노트를 선택해주세요.</h1>
          <p className="mt-2 self-stretch text-[rgba(223,225,234,0.61)] font-['Pretendard'] text-[14px] font-normal leading-[142.9%] tracking-[0.203px]">
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
                    "flex px-4 py-[10px] items-start gap-2 self-stretch rounded-[12px] w-full text-left mb-[20px] transition-colors mt-[-10px]",
                    selected 
                      ? "border border-[rgba(111,74,205,0.80)] bg-[rgba(174,111,255,0.12)]"
                      : "bg-[rgba(217,200,239,0.03)] border-none",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-[10px] ml-[8px]">
                   <span
                    aria-hidden
                    className={[
                          "mt-[2px] flex justify-center items-center",
                          "w-[20px] h-[20px] rounded-full",
                          selected ? "bg-[#6F4ACD]" : "bg-[#DADDE9]",
                          "shrink-0",
                        ].join(" ")}
                      >
                        {selected && <span className="block w-[7.692px] h-[7.692px] rounded-full bg-[#DADDE9] flex-shrink-0 aspect-square" />}
                        {!selected && <span className="block w-[7.692px] h-[7.692px] rounded-full bg-[#FFFFFF] flex-shrink-0 aspect-square" />}
                      </span>

                    <div className="min-w-0">
                      <div className="text-[#F8F8FA] font-['Pretendard'] text-[16px] font-semibold leading-[150%] tracking-[0.091px]">{opt.title}</div>
                      <div className="flex h-10 flex-col justify-center self-stretch overflow-hidden text-[rgba(223,225,234,0.61)] text-ellipsis font-['Pretendard'] text-[14px] font-normal leading-[142.9%] tracking-[0.203px] mt-[6px] line-clamp-2">{opt.description}</div>
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
              "w-[359px] ml-[8.5px] mb-[10px] h-[52px] rounded-[12px] border-none",
              selectedId ? "bg-[#6F4ACD]" : "bg-[#6F4ACD] opacity-60 cursor-not-allowed",
            ].join(" ")}
          >
            <span className="text-[#F8F8FA] font-feature-settings-['dlig'] font-['Pretendard'] text-[16px] font-semibold leading-[150%]">
              병합하기
            </span>
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