import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
    onClose?: () => void;
}

const TRANSITION_MS = 300;

const UserNoteMergeLoading: React.FC<Props> = ({ onClose }) => {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setOpen(true), 0);
        return () => clearTimeout(t);
    }, []);

    const handleCloseWithSlide = () => {
        setClosing(true);
        setOpen(false);
        setTimeout(() => {
            onClose?.();
            navigate(-1);
        }, TRANSITION_MS);
    };

    const progress = 25;

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
                        <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <main
                    className={[
                        "flex-1 overflow-y-auto px-[20px] pb-[32px]",

                        "bg-[radial-gradient(60%_40%_at_50%_55%,rgba(111,74,205,0.15),transparent_70%)]",
                    ].join(" ")}
                >
                    <section className="mt-[12px] flex flex-col items-center text-center">
                        <h1 className="text-[20px] font-[500] text-[#FFF]">유저노트 병합 중...</h1>

                        <p className="mt-3 text-[14px] leading-6 text-[#F8F8FA]">
                            두 개의 유저노트를 병합 중입니다.
                            <br />
                            완성된 유저노트는 내 유저노트에 추가됩니다.
                        </p>

                        {/* 진행률 표시 (원형 링 + 퍼센트 텍스트) */}
                        <div className="mt-[5px] flex items-center gap-2">
                            <div className="relative w-6 h-6">
                                {/* 배경 링 */}
                                <svg viewBox="0 0 36 36" className="w-[20px] h-[20px] mt-[6px]">
                                    <path
                                        d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.12)"
                                        strokeWidth="4"
                                    />
                                    {/* 진행 링 (간단히 길이로 비율 표시) */}
                                    <path
                                        d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32"
                                        fill="none"
                                        stroke="#7C5CFF"
                                        strokeWidth="4"
                                        strokeDasharray={`${(progress / 100) * 100} 100`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                            <span className="ml-[10px] text-[14px] text-[#B9A8FF]">{progress}% 완료</span>
                        </div>
                    </section>

                    {/* 2) 이미지 섹션 */}
                    <section className="mt-[56px] flex items-end justify-center gap-[8px]">
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

                        <div className="absolute translate-y-[-20px] z-50">
                            <div className="w-[45px] h-[45px] mb-[55px] rounded-full bg-[#6F4ACDCC]/90 shadow-xl flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-[#FFF]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <path strokeWidth="1" d="M7 7h5v5H7zM12 12h5v5h-5z" />
                                </svg>
                            </div>
                        </div>


                        <div className="relative">
                            <div className="w-[130px] h-[160px] rounded-[11px] overflow-hidden shadow-xl bg-[#1E2432] flex items-center justify-center">
                                <div className="text-3xl font-black text-[#5D6B88] tracking-wider">WHIF</div>
                            </div>
                            <div className="mt-[7px] text-center text-[14px] text-[#FFF] font-semibold">로맨틱 코미디 톤</div>
                        </div>
                    </section>

                    <div className="mt-[120px] flex justify-center">
                        <button
                            type="button"
                            className="bg-[#6F4ACD1A]/10 text-[14px] text-[#FFF] underline underline-offset-4 border-none"
                        >
                            압축 취소
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserNoteMergeLoading;
