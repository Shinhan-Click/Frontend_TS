// src/pages/FutureNote.tsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "../components/icons";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineLocalMovies } from "react-icons/md";

type StructureOptionId = "three" | "five";

const FutureNote: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 이전 단계에서 넘겨줄 수 있는 선택값 (없으면 3막 기본)
    const structureOption: StructureOptionId =
        (location.state as any)?.structureOption === "five" ? "five" : "three";

    const milestoneCount = structureOption === "five" ? 5 : 3;

    // 아코디언 상태
    const [openBasic, setOpenBasic] = useState(false);
    const [openMilestones, setOpenMilestones] = useState<number | null>(null);
    const [openEpilogue, setOpenEpilogue] = useState(false);

    // 마일스톤 타이틀
    const milestoneTitles = useMemo(() => {
        if (milestoneCount === 5) {
            return [
                "우연한 만남과 설렘",
                "갈등의 싹과 첫 균열",
                "클라이맥스와 결정적 순간",
                "후폭풍과 시련",
                "극복과 새로운 균형",
            ];
        }
        return ["우연한 만남과 설렘", "갈등과 고백", "클라이맥스와 결정적 순간"];
    }, [milestoneCount]);

    return (
        <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
            <div className="w-[375px] h-[896px] bg-[#141924] text-white flex flex-col overflow-hidden">
                <header className="flex-shrink-0 h-[34px] mt-[25px] flex items-center px-[20.5px]">
                    <button
                        className="bg-transparent border-none outline-none p-0 m-0 cursor-pointer"
                        aria-label="뒤로가기"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeftIcon className="w-[24px] h-[24px] text-[#FFF] mt-[5px]" />
                    </button>
                    <h1 className="ml-[10px] text-[18px] font-bold text-[#FFF]">
                        퓨처노트
                    </h1>
                </header>

                <main className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
                    <div className="w-[335px] mx-auto pb-[120px]">
                        <section className="mt-[25px]">
                            <div className="w-[335px] h-[222px] rounded-[6px] bg-[#283143] px-4 py-4 border border-[#3A4256]">
                                <h2 className="text-[17px] font-[600] text-[#FFFFFF] ml-[15px]">
                                    스토리 요약
                                </h2>
                                <p className="mt-2 text-[13px] leading-[20px] text-[#C9D0E3]">
                                    {/* 요약문 내용 (지금은 비워둬도 됨) */}
                                </p>
                            </div>
                        </section>

                        <section className="mt-[25px]">
                            <button
                                type="button"
                                onClick={() => setOpenBasic((v) => !v)}
                                className="w-full h-[45px] flex items-center justify-between px-3 py-3 rounded-[6px] bg-[#0F1521] border border-[#2A3244]"
                            >
                                <span className="flex items-center gap-[5px] text-[15px] text-[#FFF]">
                                    <IoSettingsOutline className="w-[20px] h-[20px]" />
                                    기본 설정
                                </span>
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className={`transition-transform ${openBasic ? "rotate-180" : ""
                                        }`}
                                >
                                    <path
                                        d="M6 9l6 6 6-6"
                                        stroke="#C9D0E3"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>

                            {openBasic && (
                                <div className="mt-2 rounded-[12px] border border-[#2A3244] bg-[#141C2A] p-3">
                                    <div className="text-[13px] text-[#A9B1C6]">스토리 요약 원본</div>
                                    <div className="mt-2 min-h-[80px] rounded-[8px] bg-[#1B2333] border border-[#2F3A52] p-3 text-[13px] text-[#DFE1EA]">
                                        {/* 원문 출력 영역 */}
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="mt-[50px]">
                            <h3 className="text-[17px] text-[#FFF] font-bold mb-3">
                                마일스톤
                            </h3>

                            <div className="divide-y divide-[#2A3244] rounded-[6px] overflow-hidden bg-[#0F1521]">
                                {milestoneTitles.map((title, idx) => {
                                    const index = idx + 1;
                                    const opened = openMilestones === index;
                                    return (
                                        <div key={index} className="px-3">
                                            <div className="flex items-center justify-between py-[10px]">
                                                <div className="flex items-center gap-[7px]">
                                                    <span className="inline-flex w-[24px] h-[24px] items-center justify-center rounded-[8px] bg-[#6F4ACD] text-[12px] text-[#FFF] font-bold">
                                                        {index}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <span className="text-[16px] text-[#FFF]">
                                                            {title}
                                                        </span>
                                                        <span className="text-[12px] text-[#A9B1C6]">
                                                            1~14턴
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenMilestones(opened ? null : index)
                                                    }
                                                    className="bg-transparent border-none p-2 -mr-2"
                                                    aria-expanded={opened}
                                                >
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        className={`transition-transform ${opened ? "rotate-180" : ""
                                                            }`}
                                                    >
                                                        <path
                                                            d="M6 9l6 6 6-6"
                                                            stroke="#C9D0E3"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>

                                            {opened && (
                                                <div className="mb-3 -mt-1 rounded-[8px] bg-[#141C2A] border border-[#2A3244] p-3 text-[13px] text-[#DFE1EA]">
                                                    {/* 마일스톤 상세 내용 */}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-[20px]">
                                <button
                                    type="button"
                                    onClick={() => setOpenEpilogue((v) => !v)}
                                    className="w-full h-[45px] flex items-center justify-between px-3 py-3 rounded-[12px] bg-[#141924] border-none"
                                >
                                    <span className="flex items-center gap-[5px] text-[15px] text-[#FFF]">
                                        <MdOutlineLocalMovies className="w-[20px] h-[20px]" />
                                        에필로그(엔딩)
                                    </span>
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className={`transition-transform ${openEpilogue ? "rotate-180" : ""
                                            }`}
                                    >
                                        <path
                                            d="M6 9l6 6 6-6"
                                            stroke="#C9D0E3"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>

                                {openEpilogue && (
                                    <div className="mt-2 rounded-[12px] border border-[#2A3244] bg-[#141C2A] p-3 text-[13px] text-[#DFE1EA]">
                                        {/* 에필로그 상세 내용 */}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </main>

                <div className="sticky bottom-0 w-full bg-gradient-to-t from-[#141924] via-[#141924] to-transparent">
                    <div className="w-[335px] mx-auto pb-5 pt-3 flex gap-[8px] mb-[10px]">
                        <button
                            type="button"
                            className="flex-1 h-[52px] rounded-[12px] bg-[#253043] text-[#FFF] text-[16px] font-semibold border-none"
                        >
                            편집하기
                        </button>
                        <button
                            type="button"
                            className="flex-1 h-[52px] rounded-[12px] bg-[#6F4ACD] text-[#FFF] text-[16px] font-semibold border-none"
                        >
                            다음
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FutureNote;