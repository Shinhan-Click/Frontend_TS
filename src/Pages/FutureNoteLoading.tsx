import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const FutureNoteLoading: React.FC = () => {
    const navigate = useNavigate();

    const progress = 0; // UI 전용: 0% 고정
    const size = 22;
    const stroke = 4;
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const dash = useMemo(() => circumference * (progress / 100), [circumference, progress]);

    return (
        <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
            <div className="w-[375px] h-[896px] bg-[#141924] text-gray-200 flex flex-col overflow-hidden">
                <header className="relative flex-shrink-0 h-[50px] flex items-center justify-start px-4 mt-[10px]">
                    <button
                        type="button"
                        aria-label="닫기"
                        onClick={() => navigate('/FutureNoteWrite')}
                        className="ml-[18px] text-[#FFF] hover:text-white bg-transparent border-none"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M6 6l12 12M18 6L6 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </header>

                <main className="flex-1 px-6 text-center flex flex-col items-center justify-start mt-[40px]">
                    <h2 className="text-[20px] font-bold text-[#FFF]">퓨처노트 생성 중…</h2>
                    <p className="mt-3 text-[13px] leading-[18px] text-[#F8F8FA]">
                        이 페이지에서 나갈 수 있습니다.
                        <br />
                        준비되면 알림을 통해 확인할 수 있습니다.
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-[6px]">
                        <div className="relative" aria-label={`진행률 ${progress}%`}>
                            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                                <circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={r}
                                    stroke="#1F2A44"
                                    strokeWidth={stroke}
                                    fill="none"
                                />
                                <circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={r}
                                    stroke="#B093F9"
                                    strokeWidth={stroke}
                                    strokeLinecap="round"
                                    fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference - dash}
                                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                                />
                            </svg>
                        </div>
                        <div className="text-left">
                            <div className="text-[14px] text-[#B093F9]">{progress}% 완료</div>
                        </div>
                    </div>

                    <div className="mt-[30px] flex items-center justify-center">
                        <img
                            src="/loading.png"
                            alt="로딩중"
                            className="w-[300px] h-[340px] object-contain"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mt-[100px] text-[16px] text-[#FFF] font-[400] underline underline-offset-4 decoration-white/60 bg-transparent border-none"
                    >
                        생성 중단
                    </button>
                </main>
            </div>
        </div>
    );
};

export default FutureNoteLoading;
