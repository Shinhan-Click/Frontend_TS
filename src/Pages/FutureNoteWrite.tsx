import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "../components/icons";

const MAX_BODY = 500;

type TurnOptionId = "short" | "normal" | "long";
type StructureOptionId = "three" | "five";

const FutureNoteWrite: React.FC = () => {
    const navigate = useNavigate();

    const [overview, setOverview] = useState("");
    const [turnOption, setTurnOption] = useState<TurnOptionId | null>(null);
    const [structureOption, setStructureOption] = useState<StructureOptionId | null>(null);

    const canProceed = overview.trim().length > 0 && turnOption && structureOption;

    return (
        <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
            <div className="w-[375px] h-[896px] bg-[#141924] text-gray-200 flex flex-col overflow-hidden">
                <header className="flex-shrink-0 h-[34px] mt-[25px] flex items-center px-[20.5px]">
                    <button
                        className="bg-transparent border-none outline-none p-0 m-0 cursor-pointer"
                        aria-label="뒤로가기"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeftIcon className="w-[24px] h-[24px] text-[#FFF]" />
                    </button>
                    <h1 className="ml-[10px] text-[18px] font-bold text-[#FFF]">퓨처노트</h1>
                </header>

                <main className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
                    <div className="w-[335px] mx-auto pb-4">
                        <div className="mt-[55px]">
                            <label className="block text-[17px] font-semibold text-[#FFF] mb-[10px]">
                                스토리 개요 작성 <span className="text-[#F24C4C]">*</span>
                            </label>
                            <div className="relative mr-[5px]">
                                <textarea
                                    rows={10}
                                    maxLength={MAX_BODY}
                                    value={overview}
                                    onChange={(e) => setOverview(e.target.value)}
                                    placeholder="만들고 싶은 이야기의 줄거리, 주요 사건, 엔딩 등을 자유롭게 작성해주세요."
                                    className="w-full h-[247px] bg-[#283143] text-[#FFF] placeholder-gray-500 border border-[rgba(100,116,139,0.4)] rounded-[6px] px-4 py-3 outline-none resize-none"
                                />
                                <div className="mt-1.5 text-right text-[13px] text-[#FFF]">
                                    {overview.length}/{MAX_BODY}
                                </div>
                            </div>
                        </div>

                        <div className="my-[24px] h-px bg-[#2A3244]" aria-hidden />

                        <section className="mt-2">
                            <h2 className="text-[17px] font-semibold text-[#FFF]">
                                플레이 턴 수 <span className="text-[#F24C4C]">*</span>
                            </h2>
                            <p className="text-[12px] text-[#DFE1EA]/61 mt-1">
                                스토리를 플레이할 수 있는 최대 턴 수입니다. <br />대화의 흐름에 따라 턴 수는 유동적으로 설정됩니다.
                            </p>

                            <div className="mt-3 flex flex-col gap-[6px]">
                                <button
                                    type="button"
                                    aria-pressed={turnOption === "short"}
                                    onClick={() => setTurnOption("short")}
                                    className={[
                                        "w-full h-[70px] text-left rounded-[12px] px-4 py-3 transition-colors border",
                                        turnOption === "short"
                                            ? "border-[#6F4ACD] bg-[#AE6FFF1F]"
                                            : "border-[#232B3D] bg-[#1B2233] hover:bg-[#1F2636]"
                                    ].join(" ")}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-[#20283A]">📄</span>
                                        <span className="text-[16px] font-semibold text-[#FFF]">단편 스토리</span>
                                    </div>
                                    <p className="ml-[20px] text-[14px] text-[#DFE1EA]/61">50~75턴 사이에서 적용됩니다.</p>
                                </button>

                                <button
                                    type="button"
                                    aria-pressed={turnOption === "normal"}
                                    onClick={() => setTurnOption("normal")}
                                    className={[
                                        "w-full text-left rounded-[12px] px-4 py-3 transition-colors border",
                                        turnOption === "normal"
                                            ? "border-[#6F4ACD] bg-[#AE6FFF1F]"
                                            : "border-[#232B3D] bg-[#1B2233] hover:bg-[#1F2636]"
                                    ].join(" ")}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-[#20283A]">📚</span>
                                        <span className="text-[16px] font-semibold text-[#FFF]">일반 스토리</span>
                                    </div>
                                    <p className="ml-[20px] text-[14px] text-[#DFE1EA]/61">76~100턴 사이에 적용됩니다.</p>
                                </button>

                                <button
                                    type="button"
                                    aria-pressed={turnOption === "long"}
                                    onClick={() => setTurnOption("long")}
                                    className={[
                                        "w-full text-left rounded-[12px] px-4 py-3 transition-colors border",
                                        turnOption === "long"
                                            ? "border-[#6F4ACD] bg-[#AE6FFF1F]"
                                            : "border-[#232B3D] bg-[#1B2233] hover:bg-[#1F2636]"
                                    ].join(" ")}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-[#20283A]">📖</span>
                                        <span className="text-[16px] font-semibold text-[#FFF]">장편 스토리</span>
                                    </div>
                                    <p className="ml-[20px] text-[14px] text-[#DFE1EA]/61">101~125턴 사이에 적용됩니다.</p>
                                </button>
                            </div>
                        </section>

                        <section className="mt-[30px]">
                            <h2 className="text-[17px] font-semibold text-[#FFF]">
                                스토리 구조 <span className="text-[#F24C4C]">*</span>
                            </h2>
                            <p className="text-[12px] text-[#DFE1EA]/61 mt-1">
                                전체 스토리 속에 들어가는 마일스톤 갯수는 <br />막의 구조에 따라 설정됩니다.
                            </p>

                            <div className="mt-3 flex flex-col gap-[6px]">
                                <button
                                    type="button"
                                    aria-pressed={structureOption === "three"}
                                    onClick={() => setStructureOption("three")}
                                    className={[
                                        "w-full text-left rounded-[12px] px-4 py-3 transition-colors border",
                                        structureOption === "three"
                                            ? "border-[#6F4ACD] bg-[#AE6FFF1F]"
                                            : "border-[#232B3D] bg-[#1B2233] hover:bg-[#1F2636]"
                                    ].join(" ")}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-[#20283A]">🎬</span>
                                        <span className="text-[14px] font-semibold text-[#FFF]">3막 구조</span>
                                    </div>
                                    <p className="mt-1 ml-8 text-[12px] text-[#A9B1C6]">발단–위기–결말의 캐주얼한 구조를 가집니다.</p>
                                </button>

                                <button
                                    type="button"
                                    aria-pressed={structureOption === "five"}
                                    onClick={() => setStructureOption("five")}
                                    className={[
                                        "w-full text-left rounded-[12px] px-4 py-3 transition-colors border",
                                        structureOption === "five"
                                            ? "border-[#6F4ACD] bg-[#AE6FFF1F]"
                                            : "border-[#232B3D] bg-[#1B2233] hover:bg-[#1F2636]"
                                    ].join(" ")}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-[#20283A]">🎞️</span>
                                        <span className="text-[14px] font-semibold text-[#FFF]">5막 구조</span>
                                    </div>
                                    <p className="mt-1 ml-8 text-[12px] text-[#A9B1C6]">발단–전개–위기–절정–결말의 구조를 가집니다.</p>
                                </button>
                            </div>
                        </section>

                        <div className="h-6" />
                    </div>
                </main>

                <footer className="flex-shrink-0 px-4 pb-4 mt-[20px]">
                    <button
                        type="button"
                        className={`w-[360px] h-[52px] ml-[8px] mb-[8px] rounded-[12px] border-none font-semibold text-[16px] ${canProceed
                            ? "bg-[#6F4ACD] text-[#FFF] hover:bg-[#5A3A9E]"
                            : "bg-[#6F4ACD] text-[#FFF] opacity-70 cursor-not-allowed"
                            }`}
                        disabled={!canProceed}
                        onClick={() => {
                        }}
                    >
                        시나리오 변환
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default FutureNoteWrite;
