import React, { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaRegCheckCircle } from "react-icons/fa";

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
    }, 300);
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
          "flex flex-col",
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

        <main className={["flex-1 overflow-y-auto px-[20px]", "bg-[radial-gradient(60%_40%_at_50%_55%,rgba(111,74,205,0.15),transparent_70%)]"].join(" ")}>
          {isDone ? (
            <section className="mt-[12px] flex flex-col items-center text-center">
              <h1 className="text-[20px] font-bold text-[#FFF]">유저노트 병합 완료</h1>
              <p className="mt-3 text-[14px] leading-6 text-[#F8F8FA]">유저노트 병합이 완료되었습니다.<br />병합한 유저노트의 이름을 작성해주세요.</p>
              <div className="mt-[10px] flex items-center gap-2">
                <FaRegCheckCircle className="w-[20px] h-[20px] mt-[2px] text-[#7C5CFF]" />
                <span className="ml-[6px] text-[14px] text-[#B9A8FF]">100% 완료</span>
              </div>
              <div className="w-full max-w-[300px] mt-8">
                <input
                  value={noteName}
                  onChange={(e) => setNoteName(e.target.value)}
                  className="w-full h-[44px] bg-transparent text-[#FFF] placeholder:text-[#8C93A3] text-center outline-none box-border border-0 border-b border-b-[#5E6576] focus:ring-0"
                  placeholder="이름을 작성해주세요"
                />
              </div>
            </section>
          ) : (
            <section className="mt-[12px] flex flex-col items-center text-center">
              <h1 className="text-[20px] font-[500] text-[#FFF]">유저노트 병합 중...</h1>
              <p className="mt-3 text-[14px] leading-6 text-[#F8F8FA]">두 개의 유저노트를 병합 중입니다.<br />완성된 유저노트는 내 유저노트에 추가됩니다.</p>
              <div className="mt-[5px] flex items-center gap-2">
                <div className="relative w-6 h-6">
                  <svg viewBox="0 0 36 36" className="w-[20px] h-[20px] mt-[6px]">
                    <path d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
                    <path d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32" fill="none" stroke="#7C5CFF" strokeWidth="4" strokeDasharray={`${(progress / 100) * 100} 100`} strokeLinecap="round" />
                  </svg>
                </div>
                <span className="ml-[10px] text-[14px] text-[#B9A8FF]">{progress}% 완료</span>
              </div>
            </section>
          )}

          {isDone ? (
            <section className="mt-[56px] relative h-[220px] flex items-center justify-center">
              <div
                className={[
                  "absolute w-[160px] h-[190px] rounded-[14px] overflow-hidden",
                  "shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
                  "left-1/2 -translate-x-[88%] rotate-[-5deg] z-20",
                ].join(" ")}
              >
                <UserNoteImage
                  userNoteId={firstUserNoteId}
                  alt={firstTitle ?? "선택 1"}
                  className="w-full h-full object-cover"
                  fallback={<div className="w-full h-full bg-[#0E1420]" />}
                />
              </div>

              <div
                className={[
                  "absolute w-[160px] h-[190px] rounded-[14px] overflow-hidden",
                  "shadow-[0_20px_60px_rgba(0,0,0,0.25)]",
                  "left-1/2 -translate-x-[8%] rotate-[5deg] z-10",
                ].join(" ")}
              >
                <UserNoteImage
                  userNoteId={secondUserNoteId}
                  alt={secondTitle ?? "선택 2"}
                  className="w-full h-full object-cover"
                  fallback={<div className="w-full h-full bg-[#1E2432]" />}
                />
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
                <div className="mt-[7px] text-center text-[14px] text-[#FFF] font-semibold line-clamp-1 max-w-[130px]">
                  {firstTitle ?? "선택 1"}
                </div>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-6 z-30">
                <div
                  className="w-[45px] h-[45px] mb-[80px] rounded-full shadow-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(111,74,205,0.9)" }}
                  aria-label="병합 중"
                >
                  <svg className="w-6 h-6 text-[#FFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" d="M7 7h5v5H7zM12 12h5v5h-5z" />
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
                <div className="mt-[7px] text-center text-[14px] text-[#FFF] font-semibold line-clamp-1 max-w-[130px]">
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