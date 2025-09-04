import React, { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Props { onClose?: () => void; }

const TRANSITION_MS = 300;
const API_BASE = "/api";

function useUserNoteImage(userNoteId?: number) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!!userNoteId);
  const [error, setError] = useState<string | null>(null);
  const cacheKey = useMemo(() => (userNoteId ? `usernote_img_${userNoteId}` : null), [userNoteId]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (!userNoteId) { setLoading(false); return; }
      try {
        if (cacheKey) {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) { if (!alive) return; setUrl(cached); setLoading(false); return; }
        }
        setLoading(true);
        const res = await fetch(`${API_BASE}/usernote/${userNoteId}/image`, {
          method: "GET",
          headers: { accept: "*/*" },
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const imageUrl: string | undefined = data?.result?.userNoteImageUrl;
        if (!alive) return;
        if (imageUrl) {
          setUrl(imageUrl);
          if (cacheKey) sessionStorage.setItem(cacheKey, imageUrl);
        } else {
          setUrl(null);
        }
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "image fetch error");
        setUrl(null);
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, [userNoteId, cacheKey]);

  return { url, loading, error };
}

const UserNoteImage: React.FC<{
  userNoteId?: number;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
}> = ({ userNoteId, alt, className, fallback }) => {
  const { url, loading } = useUserNoteImage(userNoteId);
  if (loading) return <div className={["animate-pulse bg-[#202635]", className ?? ""].join(" ")} />;
  if (!url) return <div className={["bg-[#0E1420] flex items-center justify-center", className ?? ""].join(" ")}>{fallback ?? <div className="text-xs text-[#5D6B88]">NO IMAGE</div>}</div>;
  return <img src={url} alt={alt ?? "user note"} className={className} />;
};

const UserNoteMergeLoading: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const firstUserNoteId: number | undefined = (location.state as any)?.firstUserNoteId;
  const secondUserNoteId: number | undefined = (location.state as any)?.secondUserNoteId;
  const firstTitle: string | undefined = (location.state as any)?.firstTitle;
  const secondTitle: string | undefined = (location.state as any)?.secondTitle;

  const incomingDraft = (location.state as any)?.draft;
  const fromSearch = (location.state as any)?.fromSearch;

  const fromResult: boolean = Boolean((location.state as any)?.fromResult);
  const mergedTextFromResult: string | undefined = (location.state as any)?.mergedText;

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(fromResult ? 100 : 10);
  const [noteName, setNoteName] = useState("");

  const ticking = useRef<number | null>(null);
  const doneRef = useRef(fromResult);

  const { url: firstImgUrl } = useUserNoteImage(firstUserNoteId);
  const { url: secondImgUrl } = useUserNoteImage(secondUserNoteId);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    ticking.current = window.setInterval(() => {
      setProgress((p) => (p < 95 ? Math.min(95, p + 3) : p));
    }, 800);
    return () => { if (ticking.current) clearInterval(ticking.current); };
  }, []);

  useEffect(() => {
    if (fromResult) return;
    const run = async () => {
      if (firstUserNoteId == null || secondUserNoteId == null) { navigate(-1); return; }
      try {
        const res = await fetch(`${API_BASE}/usernote/merge`, {
          method: "POST",
          headers: { "Content-Type": "application/json", accept: "*/*" },
          credentials: "include",
          body: JSON.stringify({ firstUserNoteId, secondUserNoteId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const mergedText: string | undefined = data?.result?.mergedPrompt;

        navigate("/UserNoteMergeResult", {
          state: { mergedText, firstTitle, secondTitle, firstUserNoteId, secondUserNoteId, draft: incomingDraft, fromSearch },
          replace: true,
        });
      } catch {
        navigate("/UserNoteMergeResult", {
          state: {
            mergedText: "병합에 실패했습니다. 잠시 후 다시 시도해주세요.",
            firstTitle, secondTitle, firstUserNoteId, secondUserNoteId, draft: incomingDraft, fromSearch,
          },
          replace: true,
        });
      }
    };
    run();
  }, [fromResult, firstUserNoteId, secondUserNoteId, navigate, firstTitle, secondTitle, incomingDraft, fromSearch]);

  const handleCloseWithSlide = () => {
    setClosing(true);
    setOpen(false);
    setTimeout(() => { onClose?.(); navigate(-1); }, TRANSITION_MS);
  };

  const handleSave = async () => {
    if (!noteName.trim()) return;
    const body = {
      title: noteName.trim(),
      prompt: mergedTextFromResult ?? "",
      firstUserNoteImageUrl: firstImgUrl ?? "",
      secondUserNoteImageUrl: secondImgUrl ?? "",
    };
    try {
      const res = await fetch(`${API_BASE}/usernote/merge/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
      navigate("/ChattingUserNote" + (fromSearch ?? ""), {
        state: { draft: incomingDraft, fromSearch },
        replace: true,
      });
    } catch {}
  };

  const isDone = progress >= 100;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
    <div
      className={[
        "relative w-[375px] h-[896px] bg-[#141924] text-white rounded-sm overflow-hidden",
        "flex flex-col", // 여기에 scrollbar-hide 추가
        "transform transition-transform duration-300 ease-out will-change-transform",
        open && !closing ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
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

        <main 
            className={[
              "flex-1 overflow-hidden", // 여기가 현재 코드
              "bg-[radial-gradient(60%_40%_at_50%_55%,rgba(111,74,205,0.15),transparent_70%)]"
            ].join(" ")}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
          {isDone ? (
            <section className="mt-[12px] flex flex-col items-center text-center">
              <h1 className="self-stretch text-[#F8F8FA] text-center font-['Pretendard'] text-[20px] font-semibold leading-[140%] tracking-[-0.24px]">유저노트 병합 완료</h1>
              <p className="mt-3 text-[#F8F8FA] text-center font-['Pretendard'] text-[14px] font-normal leading-[142.9%] mt-[10px]">유저노트 병합이 완료되었습니다.<br />병합한 유저노트의 이름을 작성해주세요.</p>
              <div className="mt-[10px] flex items-center gap-2">
              <div className="relative mt-[-10px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21" fill="none" className="mt-[-33px]">
                  <path d="M10.7415 0.446045C16.2643 0.446045 20.7415 4.9232 20.7415 10.446C20.7415 15.9689 16.2643 20.446 10.7415 20.446C5.21861 20.446 0.741455 15.9689 0.741455 10.446C0.741455 4.9232 5.21861 0.446045 10.7415 0.446045ZM10.7415 2.44604C6.32318 2.44604 2.74146 6.02777 2.74146 10.446C2.74146 14.8643 6.32318 18.446 10.7415 18.446C15.1597 18.446 18.7415 14.8643 18.7415 10.446C18.7415 6.02777 15.1597 2.44604 10.7415 2.44604Z" fill="#B093F9"/>
                </svg>
    
                  {/* 추가이미지3 (체크 아이콘) - 원형 아이콘 중앙에 겹침 */}
                  <div className="absolute w-[10px] h-[10px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-[-10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 11 11" fill="none" className="w-full h-full">
                      <g clipPath="url(#clip0_2224_17134)">
                        <path d="M9.07487 2.94604L4.49154 7.52938L2.4082 5.44605" stroke="#B093F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_2224_17134">
                          <rect width="10" height="10" fill="white" transform="translate(0.741455 0.446045)"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </div>
                <span className="ml-[10px] text-[#B093F9] text-center font-['Pretendard'] text-[14px] font-medium leading-[142.9%] tracking-[0.203px] mt-[-20px]">100% 완료</span>
              </div>
              <div className="w-full max-w-[300px] mt-">
                <input
                  value={noteName}
                  onChange={(e) => setNoteName(e.target.value)}
                  maxLength={20}
                  className="w-full h-[44px] bg-transparent text-[#FFF] text-center outline-none box-border border-0 border-b border-b-[#5E6576] focus:ring-0 placeholder:text-[rgba(223,225,234,0.61)] placeholder:font-['Pretendard'] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[142.9%] placeholder:tracking-[0.203px] mt-[70px]"
                  placeholder="이름을 작성해주세요"
                />
              </div>
            </section>
          ) : (
            <section className="mt-[12px] flex flex-col items-center text-center">
              <h1 className="self-stretch text-[#F8F8FA] text-center font-['Pretendard'] text-[20px] font-semibold leading-[140%] tracking-[-0.24px]">유저노트 병합 중...</h1>
              <p className="mt-3 text-[#F8F8FA] text-center font-['Pretendard'] text-[14px] font-normal leading-[142.9%]">두 개의 유저노트를 병합 중입니다.<br />완성된 유저노트는 내 유저노트에 추가됩니다.</p>
              <div className="mt-[5px] flex items-center gap-2">
                <div className="relative w-6 h-6">
                  <svg viewBox="0 0 36 36" className="w-[20px] h-[20px] mt-[6px]">
                    <path d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
                    <path d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32" fill="none" stroke="#7C5CFF" strokeWidth="4" strokeDasharray={`${(progress / 100) * 100} 100`} strokeLinecap="round" />
                  </svg>
                </div>
                <span className="ml-[10px] text-[#B093F9] text-center font-['Pretendard'] text-[14px] font-medium leading-[142.9%] tracking-[0.203px]">{progress}% 완료</span>
              </div>
            </section>
          )}

          {isDone ? (
              <section className="mt-[-7px] relative h-[220px] flex items-center justify-center">
                {/* 배경 이미지 1 (맨 뒤) */}
                <div className="absolute w-[200px] h-[138.272px] z-0"
                    style={{ 
                      position: "absolute",
                      bottom: "1.133px",
                      borderRadius: "8.588px 8.588px 14.314px 14.314px",
                      background: "linear-gradient(180deg, #34415E -18.04%, #141924 105.72%)",
                      boxShadow: "0 5.726px 5.726px 0 rgba(0, 0, 0, 0.03)"
                    }}>
                </div>
                
                {/* 선택1 이미지 */}
                <div className="absolute w-[98.765px] h-[118.519px] flex-shrink-0 rounded-[8.588px] overflow-hidden z-20 ml-[-25px] mt-[-8px]"
                    style={{ 
                      transform: "rotate(-3.037deg)",
                      boxShadow: "4.294px 5.726px 5.726px 0 rgba(0, 0, 0, 0.25)",
                      left: "calc(50% - 60px)"
                    }}>
                  <UserNoteImage
                    userNoteId={firstUserNoteId}
                    alt={firstTitle ?? "선택 1"}
                    className="w-full h-full object-cover"
                    fallback={<div className="w-full h-full bg-[#0E1420]" />}
                  />
                </div>

                {/* 선택2 이미지 */}
                <div className="absolute w-[98.765px] h-[118.519px] flex-shrink-0 rounded-[8.588px] overflow-hidden z-10 mt-[15px] mr-[-27px]"
                    style={{ 
                      transform: "rotate(5.061deg)",
                      boxShadow: "0 5.726px 5.726px 0 rgba(0, 0, 0, 0.25)",
                      right: "calc(50% - 60px)"
                    }}>
                  <UserNoteImage
                    userNoteId={secondUserNoteId}
                    alt={secondTitle ?? "선택 2"}
                    className="w-full h-full object-cover"
                    fallback={<div className="w-full h-full bg-[#1E2432]" />}
                  />
                </div>

                {/* 추가 이미지2 (맨 앞) */}
                <div className="absolute bottom-0 w-[430px] h-[150px] z-30 mt-[120px] ml-[200px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="103.704" viewBox="0 0 430 133" fill="none" className="w-full h-full" preserveAspectRatio="none">
                  <foreignObject x="0.689832" y="0.136432" width="228.628" height="137.52">
                    <div style={{
                      backdropFilter: "blur(6.17px)",
                      clipPath: "url(#bgblur_0_2757_1602_clip_path)",
                      height: "100%",
                      width: "100%"
                    }}></div>
                  </foreignObject>
                  <g filter="url(#filter0_d_2757_1602)">
                    <path d="M15.0037 43.8402C15.0037 40.6781 17.5671 38.1147 20.7292 38.1147H48.7469C55.2049 38.1147 61.2164 34.8195 64.6903 29.3754V29.3754C67.7781 24.5363 73.1217 21.6072 78.8622 21.6072L209.278 21.6072C212.44 21.6072 215.004 24.1706 215.004 27.3327V110.997C215.004 118.902 208.595 125.311 200.69 125.311H29.3175C21.4122 125.311 15.0037 118.902 15.0037 110.997V43.8402Z" fill="url(#paint0_linear_2757_1602)" fillOpacity="0.25" />
                  </g>
                  <defs>
                    <filter id="filter0_d_2757_1602" x="0.689832" y="0.136432" width="228.628" height="137.52" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                      <feOffset dy="-7.15692"/>
                      <feGaussianBlur stdDeviation="7.15692"/>
                      <feComposite in2="hardAlpha" operator="out"/>
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2757_1602"/>
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2757_1602" result="shape"/>
                    </filter>
                    <clipPath id="bgblur_0_2757_1602_clip_path" transform="translate(-0.689832 -0.136432)">
                      <path d="M15.0037 43.8402C15.0037 40.6781 17.5671 38.1147 20.7292 38.1147H48.7469C55.2049 38.1147 61.2164 34.8195 64.6903 29.3754V29.3754C67.7781 24.5363 73.1217 21.6072 78.8622 21.6072L209.278 21.6072C212.44 21.6072 215.004 24.1706 215.004 27.3327V110.997C215.004 118.902 208.595 125.311 200.69 125.311H29.3175C21.4122 125.311 15.0037 118.902 15.0037 110.997V438402Z"/>
                    </clipPath>
                    <linearGradient id="paint0_linear_2757_1602" x1="115.004" y1="21.6072" x2="115.004" y2="123.063" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#263B69"/>
                      <stop offset="1" stopColor="#273450"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              </section>
            ) : (
            <section className="mt-[56px] flex items-end justify-center gap-[12px] relative">
              <div className="relative">
                <div className="w-[130px] h-[160px] rounded-[11px] overflow-hidden shadow-xl">
                  <UserNoteImage
                    userNoteId={firstUserNoteId}
                    alt={firstTitle ?? "선택 1"}
                    className="w-full h-full object-cover"
                    fallback={<div className="w-full h-full bg-[#0E1420]" />}
                  />
                </div>
                <div className="mt-[7px] self-stretch text-[#F8F8FA] text-center font-['Pretendard'] text-[14px] font-semibold leading-[157.14%] tracking-[0.203px] line-clamp-1 max-w-[130px]">
                  {firstTitle ?? "선택 1"}
                </div>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-6 z-30">
                <div
                  className="w-[45px] h-[45px] mb-[80px] rounded-full shadow-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(111,74,205,0.9)" }}
                  aria-label="병합 중"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                    <path d="M2.25171 5.47832C2.25171 4.35822 2.25171 3.79816 2.4697 3.37034C2.66144 2.99402 2.9674 2.68805 3.34373 2.49631C3.77155 2.27832 4.3316 2.27832 5.45171 2.27832H13.0517C14.1718 2.27832 14.7319 2.27832 15.1597 2.49631C15.536 2.68805 15.842 2.99402 16.0337 3.37034C16.2517 3.79816 16.2517 4.35822 16.2517 5.47832V13.0783C16.2517 14.1984 16.2517 14.7585 16.0337 15.1863C15.842 15.5626 15.536 15.8686 15.1597 16.0603C14.7319 16.2783 14.1718 16.2783 13.0517 16.2783H5.45171C4.3316 16.2783 3.77155 16.2783 3.34373 16.0603C2.9674 15.8686 2.66144 15.5626 2.4697 15.1863C2.25171 14.7585 2.25171 14.1984 2.25171 13.0783V5.47832Z" fill="white" fillOpacity="0.3"/>
                    <path d="M8.25171 11.4783C8.25171 10.3582 8.25171 9.79816 8.4697 9.37034C8.66144 8.99402 8.9674 8.68805 9.34373 8.49631C9.77155 8.27832 10.3316 8.27832 11.4517 8.27832H19.0517C20.1718 8.27832 20.7319 8.27832 21.1597 8.49631C21.536 8.68805 21.842 8.99402 22.0337 9.37034C22.2517 9.79816 22.2517 10.3582 22.2517 11.4783V19.0783C22.2517 20.1984 22.2517 20.7585 22.0337 21.1863C21.842 21.5626 21.536 21.8686 21.1597 22.0603C20.7319 22.2783 20.1718 22.2783 19.0517 22.2783H11.4517C10.3316 22.2783 9.77155 22.2783 9.34373 22.0603C8.9674 21.8686 8.66144 21.5626 8.4697 21.1863C8.25171 20.7585 8.25171 20.1984 8.25171 19.0783V11.4783Z" fill="white" fillOpacity="0.3"/>
                    <path d="M2.25171 5.47832C2.25171 4.35822 2.25171 3.79816 2.4697 3.37034C2.66144 2.99402 2.9674 2.68805 3.34373 2.49631C3.77155 2.27832 4.3316 2.27832 5.45171 2.27832H13.0517C14.1718 2.27832 14.7319 2.27832 15.1597 2.49631C15.536 2.68805 15.842 2.99402 16.0337 3.37034C16.2517 3.79816 16.2517 4.35822 16.2517 5.47832V13.0783C16.2517 14.1984 16.2517 14.7585 16.0337 15.1863C15.842 15.5626 15.536 15.8686 15.1597 16.0603C14.7319 16.2783 14.1718 16.2783 13.0517 16.2783H5.45171C4.3316 16.2783 3.77155 16.2783 3.34373 16.0603C2.9674 15.8686 2.66144 15.5626 2.4697 15.1863C2.25171 14.7585 2.25171 14.1984 2.25171 13.0783V5.47832Z" stroke="#F8F8FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.25171 11.4783C8.25171 10.3582 8.25171 9.79816 8.4697 9.37034C8.66144 8.99402 8.9674 8.68805 9.34373 8.49631C9.77155 8.27832 10.3316 8.27832 11.4517 8.27832H19.0517C20.1718 8.27832 20.7319 8.27832 21.1597 8.49631C21.536 8.68805 21.842 8.99402 22.0337 9.37034C22.2517 9.79816 22.2517 10.3582 22.2517 11.4783V19.0783C22.2517 20.1984 22.2517 20.7585 22.0337 21.1863C21.842 21.5626 21.536 21.8686 21.1597 22.0603C20.7319 22.2783 20.1718 22.2783 19.0517 22.2783H11.4517C10.3316 22.2783 9.77155 22.2783 9.34373 22.0603C8.9674 21.8686 8.66144 21.5626 8.4697 21.1863C8.25171 20.7585 8.25171 20.1984 8.25171 19.0783V11.4783Z" stroke="#F8F8FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="relative">
                <div className="w-[130px] h-[160px] rounded-[11px] overflow-hidden shadow-xl">
                  <UserNoteImage
                    userNoteId={secondUserNoteId}
                    alt={secondTitle ?? "선택 2"}
                    className="w-full h-full object-cover"
                    fallback={<div className="w-full h-full bg-[#1E2432]" />}
                  />
                </div>
                <div className="mt-[7px] self-stretch text-[#F8F8FA] text-center font-['Pretendard'] text-[14px] font-semibold leading-[157.14%] tracking-[0.203px] line-clamp-1 max-w-[130px]">
                  {secondTitle ?? "선택 2"}
                </div>
              </div>
            </section>
          )}
        </main>

        {!isDone ? (
          <footer className="flex-shrink-0 py-6 bg-[#0F1622]">
            <div className="flex justify-center">
              <button type="button" className="bg-transparent text-[14px] text-white/90 underline underline-offset-4 border-none" onClick={handleCloseWithSlide}>
                병합 취소
              </button>
            </div>
          </footer>
        ) : (
          <footer className="flex-shrink-0 px-5 pb-5 pt-3 bg-[#0F1622]">
            <button
              type="button"
              disabled={!noteName.trim()}
              onClick={handleSave}
              className={["w-[360px] h-[52px] mb-[10px] ml-[8px] rounded-[12px] font-semibold border-none", noteName.trim() ? "bg-[#6F4ACD] text-[#FFF]" : "bg-[#6F4ACD] text-white opacity-50 cursor-not-allowed"].join(" ")}
            >
              저장하기
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default UserNoteMergeLoading;