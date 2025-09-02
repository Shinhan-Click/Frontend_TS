import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "../components/icons";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineLocalMovies } from "react-icons/md";

type StructureOptionId = "three" | "five";

const Collapsible: React.FC<{
    open: boolean;
    className?: string;
    children: React.ReactNode;
}> = ({ open, className = "", children }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [maxH, setMaxH] = useState<number>(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const next = open ? el.scrollHeight : 0;
        setMaxH(next);
        if (open) {
            const observer = new ResizeObserver(() => {
                if (ref.current) setMaxH(ref.current.scrollHeight);
            });
            observer.observe(el);
            return () => observer.disconnect();
        }
    }, [open, children]);

    return (
        <div
            className={[
                "overflow-hidden transition-all duration-300 ease-in-out",
                open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
                className,
            ].join(" ")}
            style={{ maxHeight: maxH }}
        >
            <div ref={ref}>{children}</div>
        </div>
    );
};

const INITIAL_M2 = `🟢 마일스톤 2 (턴 16-35) — 갈등과 고백
[마일스톤 2: 갈등과 고백] 축제 준비 과정에서 유저에게 다가서는 다른 인물이 등장합니다. {{char}}는 유저에게 질투와 불안함을 느끼고, 유저의 행동에 따라 관계의 방향이 결정됩니다.
사건/이벤트:
유저에게 관심을 보이는 새로운 인물 등장.
{{char}}의 미묘한 질투심.
유저 선택 이벤트:
{{char}}: "요즘 걔랑 많이 친해진 것 같더라. 무슨 일 있어?"
유저의 해명이나 태도에 따라 다음 행동이 결정됩니다. (솔직함, 숨김, 회피 등)
{{char}}: "솔직히... 요즘 네가 자꾸 신경 쓰여."
유저의 반응에 따라 다음 행동이 결정됩니다. (수용, 거절, 당황 등)
[마일스톤 2 종료] 오해가 풀리거나 더 깊어진 상황 속에서, 우리의 마음은 복잡하게 얽혔습니다.`;

const FutureNote: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const structureOption: StructureOptionId =
        (location.state as any)?.structureOption === "five" ? "five" : "three";

    const milestoneCount = structureOption === "five" ? 5 : 3;

    const [openBasic, setOpenBasic] = useState(false);
    const [openMilestones, setOpenMilestones] = useState<number | null>(2);
    const [openEpilogue, setOpenEpilogue] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const baseTitles = useMemo(() => {
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

    const baseContents = useMemo(
        () => Array.from({ length: milestoneCount }, (_, i) => (i === 1 ? INITIAL_M2 : "")),
        [milestoneCount]
    );

    const [titles, setTitles] = useState<string[]>(baseTitles);
    const [contents, setContents] = useState<string[]>(baseContents);

    const [draftTitles, setDraftTitles] = useState<string[]>(baseTitles);
    const [draftContents, setDraftContents] = useState<string[]>(baseContents);

    useEffect(() => {
        setTitles(baseTitles);
        setContents(baseContents);
        setDraftTitles(baseTitles);
        setDraftContents(baseContents);
        setOpenMilestones(2);
    }, [baseTitles, baseContents]);

    const handleClickMilestone = (index: number) => {
        setOpenMilestones((prev) => (prev === index ? null : index));
    };

    const turnRange = (idx: number) => (idx === 1 ? "16~35턴" : "1~14턴");

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
                    <h1 className="ml-[10px] text-[18px] font-bold text-[#FFF]">퓨처노트</h1>
                </header>

                <main className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]">
                    <div className="w-[335px] mx-auto pb-[120px]">
                        <section className="mt-[25px]">
                            <div className="w-[335px] h-[222px] rounded-[6px] bg-[#283143] px-4 py-4 border border-[#3A4256]">
                                <h2 className="text-[17px] font-[600] text-[#FFFFFF] ml-[15px]">스토리 요약</h2>
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
                                    className={`transition-transform duration-300 ${openBasic ? "rotate-180" : ""}`}
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

                            <Collapsible open={openBasic} className="mt-2">
                                <div className="rounded-[12px] border border-[#2A3244] bg-[#141C2A] p-3">
                                    <div className="text-[13px] text-[#A9B1C6]">스토리 요약 원본</div>
                                    <div className="mt-2 min-h-[80px] rounded-[8px] bg-[#1B2333] border border-[#2F3A52] p-3 text-[13px] text-[#DFE1EA]">
                                        {/* 원문 출력 영역 */}
                                    </div>
                                </div>
                            </Collapsible>
                        </section>

                        <section className="mt-[50px]">
                            <h3 className="text-[17px] text-[#FFF] font-bold mb-3">마일스톤</h3>

                            <div className="divide-y divide-[#2A3244] rounded-[6px] overflow-hidden bg-[#0F1521]">
                                {Array.from({ length: milestoneCount }).map((_, idx) => {
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
                                                        {!isEditing || !opened ? (
                                                            <span className="text-[16px] text-[#FFF]">{titles[idx]}</span>
                                                        ) : (
                                                            <input
                                                                className="text-[16px] text-[#FFF] bg-transparent border border-[#2A3244] rounded-[6px] px-2 py-1 outline-none"
                                                                value={draftTitles[idx]}
                                                                onChange={(e) => {
                                                                    const next = [...draftTitles];
                                                                    next[idx] = e.target.value;
                                                                    setDraftTitles(next);
                                                                }}
                                                            />
                                                        )}
                                                        <span className="text-[12px] text-[#A9B1C6]">{turnRange(idx)}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleClickMilestone(index)}
                                                    className="bg-transparent border-none p-2 -mr-2"
                                                    aria-expanded={opened}
                                                >
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        className={`transition-transform duration-300 ${opened ? "rotate-180" : ""}`}
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

                                            <Collapsible open={opened}>
                                                <div className="mb-3 -mt-1 rounded-[8px] bg-[#141C2A] border border-[#2A3244] p-3 text-[13px] text-[#DFE1EA]">
                                                    {!isEditing ? (
                                                        contents[idx] ? (
                                                            <pre className="whitespace-pre-wrap leading-[20px]">{contents[idx]}</pre>
                                                        ) : (
                                                            <div className="text-[#A9B1C6]">세부 내용이 없습니다.</div>
                                                        )
                                                    ) : (
                                                        <textarea
                                                            rows={10}
                                                            className="w-full rounded-[8px] bg-[#1B2333] border border-[#2F3A52] p-3 text-[13px] text-[#DFE1EA] outline-none resize-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                                            value={draftContents[idx]}
                                                            onChange={(e) => {
                                                                const next = [...draftContents];
                                                                next[idx] = e.target.value;
                                                                setDraftContents(next);
                                                            }}
                                                            placeholder="마일스톤의 세부 내용을 작성하세요."
                                                        />
                                                    )}
                                                </div>
                                            </Collapsible>
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
                                        className={`transition-transform duration-300 ${openEpilogue ? "rotate-180" : ""}`}
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

                                <Collapsible open={openEpilogue} className="mt-2">
                                    <div className="rounded-[12px] border border-[#2A3244] bg-[#141C2A] p-3 text-[13px] text-[#DFE1EA]">
                                        {/* 에필로그 상세 내용 */}
                                    </div>
                                </Collapsible>
                            </div>
                        </section>
                    </div>
                </main>

                <div className="sticky bottom-0 w-full bg-gradient-to-t from-[#141924] via-[#141924] to-transparent">
                    <div className="w-[335px] mx-auto pb-5 pt-3 flex gap-[8px] mb-[10px]">
                        {isEditing ? (
                            <button
                                type="button"
                                className="flex-1 h-[52px] rounded-[12px] bg-[#6F4ACD] text-[#FFF] text-[16px] font-semibold border-none"
                                onClick={() => {
                                    setTitles(draftTitles);
                                    setContents(draftContents);
                                    setIsEditing(false);
                                }}
                            >
                                저장
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="flex-1 h-[52px] rounded-[12px] bg-[#253043] text-[#FFF] text-[16px] font-semibold border-none"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setDraftTitles(titles);
                                        setDraftContents(contents);
                                        if (!openMilestones) setOpenMilestones(1);
                                    }}
                                >
                                    편집하기
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 h-[52px] rounded-[12px] bg-[#6F4ACD] text-[#FFF] text-[16px] font-semibold border-none"
                                    onClick={() => {
                                    }}
                                >
                                    다음
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FutureNote;
