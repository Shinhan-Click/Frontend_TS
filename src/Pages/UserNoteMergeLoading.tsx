// UserNoteMergeLoading.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCheckCircle } from "react-icons/fa";

interface Props { onClose?: () => void; }
const TRANSITION_MS = 300;

const UserNoteMergeLoading: React.FC<Props> = ({ onClose }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [closing, setClosing] = useState(false);
    const [progress, setProgress] = useState(25);
    const [noteName, setNoteName] = useState("");

    useEffect(() => {
        const t = setTimeout(() => setOpen(true), 0);
        return () => clearTimeout(t);
    }, []);

    // 데모용 자동 증가 (실제에선 API 상태로 교체)
    useEffect(() => {
        if (progress >= 100) return;
        const id = setInterval(() => setProgress((p) => Math.min(100, p + 5)), 300);
        return () => clearInterval(id);
    }, [progress]);

    const handleCloseWithSlide = () => {
        setClosing(true);
        setOpen(false);
        setTimeout(() => { onClose?.(); navigate(-1); }, TRANSITION_MS);
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
                {/* HEADER */}
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

                {/* MAIN */}
                <main
                    className={[
                        "flex-1 overflow-y-auto px-[20px]",
                        "bg-[radial-gradient(60%_40%_at_50%_55%,rgba(111,74,205,0.15),transparent_70%)]",
                    ].join(" ")}
                >
                    {/* 상단 안내 */}
                    {isDone ? (
                        <section className="mt-[12px] flex flex-col items-center text-center">
                            <h1 className="text-[20px] font-bold text-[#FFF]">유저노트 병합 완료</h1>
                            <p className="mt-3 text-[14px] leading-6 text-[#F8F8FA]">
                                유저노트 병합이 완료되었습니다.<br />
                                병합한 유저노트의 이름을 작성해주세요.
                            </p>
                            <div className="mt-[10px] flex items-center gap-2">
                                <FaRegCheckCircle className="w-[20px] h-[20px] mt-[2px] text-[#7C5CFF]" />
                                <span className="ml-[6px] text-[14px] text-[#B9A8FF]">100% 완료</span>
                            </div>

                            {/* 이름 입력: 텍스트 #FFF, 밑변만 회색 */}
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
                            <p className="mt-3 text-[14px] leading-6 text-[#F8F8FA]">
                                두 개의 유저노트를 병합 중입니다.<br />
                                완성된 유저노트는 내 유저노트에 추가됩니다.
                            </p>
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

                    {/* 카드 영역 */}
                    {isDone ? (
                        // ✅ 100%일 때: 카드 겹치고, 좌/우 기울기, 제목 숨김
                        <section className="mt-[56px] relative h-[200px] flex items-center justify-center">
                            {/* 왼쪽 카드 (앞쪽) */}
                            <div
                                className={[
                                    "absolute w-[130px] h-[160px] rounded-[11px] overflow-hidden shadow-xl",
                                    "left-1/2 -translate-x-[90%] rotate-[-3deg]",
                                    "bg-[#0E1420] z-20",
                                ].join(" ")}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600&auto=format&fit=crop"
                                    alt="금단의 기숙사"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* 중앙 아이콘 — 완료에선 숨김 */}

                            {/* 오른쪽 카드 (뒤쪽) */}
                            <div
                                className={[
                                    "absolute w-[130px] h-[160px] rounded-[11px] overflow-hidden shadow-xl flex items-center justify-center",
                                    "left-1/2 -translate-x-[10%] rotate-[3deg]",
                                    "bg-[#000000]/25",
                                    "z-10",
                                ].join(" ")}
                            >
                                <div className="text-3xl font-black text-[#5D6B88] tracking-wider">WHIF</div>
                            </div>
                        </section>
                    ) : (
                        // ⏳ 로딩 중: 카드 원래 자리(나란히), 제목 표시, 중앙 오버레이 아이콘 표시
                        <section className="mt-[56px] flex items-end justify-center gap-[12px] relative">
                            {/* 왼쪽 카드 */}
                            <div className="relative">
                                <div className="w-[130px] h-[160px] rounded-[11px] overflow-hidden shadow-xl bg-[#0E1420]">
                                    <img
                                        src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600&auto=format&fit=crop"
                                        alt="금단의 기숙사"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="mt-[7px] text-center text-[14px] text-[#FFF] font-semibold">금단의 기숙사</div>
                            </div>

                            {/* 중앙 오버레이 아이콘 (로딩 중에만) */}
                            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-6 z-30">
                                <div
                                    className="w-[45px] h-[45px] mb-[80px] rounded-full shadow-xl flex items-center justify-center"
                                    style={{ backgroundColor: "rgba(111,74,205,0.9)" }}
                                >
                                    <svg className="w-6 h-6 text-[#FFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeWidth="1" d="M7 7h5v5H7zM12 12h5v5h-5z" />
                                    </svg>
                                </div>
                            </div>

                            {/* 오른쪽 카드 */}
                            <div className="relative">
                                <div className="w-[130px] h-[160px] rounded-[11px] overflow-hidden shadow-xl bg-[#1E2432] flex items-center justify-center">
                                    <div className="text-3xl font-black text-[#5D6B88] tracking-wider">WHIF</div>
                                </div>
                                <div className="mt-[7px] text-center text-[14px] text-[#FFF] font-semibold">로맨틱 코미디 톤</div>
                            </div>
                        </section>
                    )}
                </main>

                {/* FOOTER — 기존 버튼 유지 */}
                {isDone ? (
                    <footer className="flex-shrink-0 px-5 pb-5 pt-3 bg-[#0F1622]">
                        <button
                            type="button"
                            disabled={!noteName.trim()}
                            className={[
                                "w-[360px] h-[52px] mb-[10px] ml-[8px] rounded-[12px] font-semibold border-none",
                                noteName.trim()
                                    ? "bg-[#6F4ACD] text-[#FFF]"
                                    : "bg-[#6F4ACD] text-white opacity-50 cursor-not-allowed",
                            ].join(" ")}
                        >
                            저장하기
                        </button>
                    </footer>
                ) : (
                    <footer className="flex-shrink-0 py-6 bg-[#0F1622]">
                        <div className="flex justify-center">
                            <button type="button" className="bg-transparent text-[14px] text-white/90 underline underline-offset-4 border-none">
                                압축 취소
                            </button>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default UserNoteMergeLoading;