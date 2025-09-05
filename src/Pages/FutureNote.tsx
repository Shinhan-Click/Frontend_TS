import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "../components/icons";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineLocalMovies } from "react-icons/md";

const Collapsible: React.FC<{ open: boolean; className?: string; children: React.ReactNode; }> = ({ open, className = "", children }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState<number>(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const next = open ? el.scrollHeight : 0;
    setMaxH(next);
    if (open) {
      const observer = new ResizeObserver(() => { if (ref.current) setMaxH(ref.current.scrollHeight); });
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, [open, children]);
  return (
    <div className={["overflow-hidden transition-all duration-300 ease-in-out", open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1", className].join(" ")} style={{ maxHeight: maxH }}>
      <div ref={ref}>{children}</div>
    </div>
  );
};

const FutureNote: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const reqFromState = (location as any).state?.formData?.requestBody;
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem("futureNoteState") || "{}"); } catch { return {}; }
  })();
  const requestBody = reqFromState || saved?.requestBody;

  const apiResult = (location as any).state?.apiResult;
  const formData = (location as any).state?.formData;

  const [savedState, setSavedState] = useState<any>(null);
  useEffect(() => {
    try {
      const s = localStorage.getItem("futureNoteState");
      if (s) setSavedState(JSON.parse(s));
    } catch (e) {
      console.error("Failed to parse saved state:", e);
    }
  }, []);

  const actualApiResult = apiResult || savedState?.apiResult;
  const actualFormData = formData || savedState;

  const milestones = useMemo(() => actualApiResult?.mileStones ?? [], [actualApiResult]);
  const endings = useMemo(() => actualApiResult?.endings ?? [], [actualApiResult]);
  const milestoneCount = milestones.length;

  const [openBasic, setOpenBasic] = useState(false);
  const [openMilestones, setOpenMilestones] = useState<number | null>(2);
  const [openEpilogue, setOpenEpilogue] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 기본설정: prompt만 편집/저장
  const initialPrompt = actualApiResult?.prompt || actualFormData?.story || "";
  const [promptOverride, setPromptOverride] = useState<string>(initialPrompt);
  const [promptDraft, setPromptDraft] = useState<string>(initialPrompt);
  const getPrompt = () => (promptOverride?.trim() ?? "") || "";

  // ⬇⬇ 중요: API 응답/저장값이 늦게 들어와도 prompt 동기화
  useEffect(() => {
    const nextPrompt =
      (actualApiResult?.prompt ?? "") ||
      (actualFormData?.story ?? "") ||
      "";
    if (!isEditing) {
      setPromptOverride(prev => (prev ? prev : nextPrompt));
      setPromptDraft(prev => (prev ? prev : nextPrompt));
    }
  }, [actualApiResult, actualFormData, isEditing]);

  // 마일스톤
  const [overrideTitles, setOverrideTitles] = useState<string[]>(
    Array.from({ length: milestoneCount }, (_, i) => milestones[i]?.title ?? "")
  );
  const [overrideContents, setOverrideContents] = useState<string[]>(
    Array.from({ length: milestoneCount }, (_, i) => milestones[i]?.content ?? "")
  );
  const [draftTitles, setDraftTitles] = useState<string[]>(
    Array.from({ length: milestoneCount }, (_, i) => milestones[i]?.title ?? "")
  );
  const [draftContents, setDraftContents] = useState<string[]>(
    Array.from({ length: milestoneCount }, (_, i) => milestones[i]?.content ?? "")
  );

  // 엔딩
  const [endingOverrides, setEndingOverrides] = useState<string[]>(
    endings.map((e: any) => e?.ending ?? "")
  );
  const [endingDrafts, setEndingDrafts] = useState<string[]>(
    endings.map((e: any) => e?.ending ?? "")
  );

  useEffect(() => {
    setOverrideTitles(Array.from({ length: milestoneCount }, (_, i) => overrideTitles[i] ?? (milestones[i]?.title ?? "")));
    setOverrideContents(Array.from({ length: milestoneCount }, (_, i) => overrideContents[i] ?? (milestones[i]?.content ?? "")));
    setDraftTitles(Array.from({ length: milestoneCount }, (_, i) => draftTitles[i] ?? (milestones[i]?.title ?? "")));
    setDraftContents(Array.from({ length: milestoneCount }, (_, i) => draftContents[i] ?? (milestones[i]?.content ?? "")));

    setEndingOverrides(endings.map((e: any, i: number) => endingOverrides[i] ?? (e?.ending ?? "")));
    setEndingDrafts(endings.map((e: any, i: number) => endingDrafts[i] ?? (e?.ending ?? "")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestoneCount, milestones, endings]);

  const handleClickMilestone = (index: number) => setOpenMilestones((prev) => (prev === index ? null : index));
  const getTurnLabel = (i: number) => {
    const ms = milestones[i];
    return ms?.startTurn && ms?.endTurn ? `${ms.startTurn}~${ms.endTurn}턴` : "";
  };
  const getTitle = (i: number) => (overrideTitles[i] && overrideTitles[i].trim()) || milestones[i]?.title || "";
  const getContent = (i: number) => (overrideContents[i] && overrideContents[i].trim()) || milestones[i]?.content || "";
  const getEnding = (i: number) => (endingOverrides[i] && endingOverrides[i].trim()) || (endings[i]?.ending ?? "");

  return (
    <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
      <div className="w-[375px] h-[896px] bg-[#141924] text-white flex flex-col overflow-hidden">
        <header className="flex-shrink-0 h-[34px] mt-[25px] flex items-center px-[20.5px]">
          <button className="bg-transparent border-none outline-none p-0 m-0 cursor-pointer" aria-label="뒤로가기" onClick={() => navigate(-1)}>
            <ArrowLeftIcon className="w-[24px] h-[24px] text-[#FFF] mt-[5px]" />
          </button>
          <h1 className="ml-[10px] text-[18px] font-bold text-[#FFF]">퓨처노트</h1>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]">
          <div className="w-[335px] mx-auto pb-[120px]">
            {/* 스토리 요약 (표시만) */}
            <section className="mt-[25px]">
              <div className="w-[335px] h-[222px] rounded-[6px] bg-[#283143] px-4 py-4 border border-[#3A4256]">
                <h2 className="text-[17px] font-[600] text-[#FFFFFF] ml-[15px]">스토리 요약</h2>
                <p className="mt-2 text-[13px] leading-[20px] text-[#C9D0E3]">
                  {actualApiResult?.summary || ""}
                </p>
              </div>
            </section>

            {/* 기본 설정: prompt만 노출/편집 */}
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-300 ${openBasic ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" stroke="#C9D0E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <Collapsible open={openBasic} className="mt-2">
                <div className="rounded-[12px] border border-[#2A3244] bg-[#141C2A] p-3">
                  <div className="mt-2 min-h-[80px] rounded-[8px] bg-[#1B2333] border border-[#2F3A52] p-3 text-[13px] text-[#DFE1EA]">
                    {!isEditing ? (
                      <pre className="whitespace-pre-wrap">{getPrompt()}</pre>
                    ) : (
                      <textarea
                        rows={10}
                        className="w-full rounded-[8px] bg-[#1B2333] border border-[#2F3A52] p-3 text-[13px] text-[#DFE1EA] outline-none resize-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        value={promptDraft}
                        onChange={(e) => setPromptDraft(e.target.value)}
                        placeholder="원본 프롬프트(또는 입력 스토리)를 입력하세요."
                      />
                    )}
                  </div>
                </div>
              </Collapsible>
            </section>

            {/* 마일스톤 */}
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
                          <span className="inline-flex w-[24px] h-[24px] items-center justify-center rounded-[8px] bg-[#6F4ACD] text-[12px] text-[#FFF] font-bold">{index}</span>
                          <div className="flex flex-col">
                            {!isEditing || !opened ? (
                              <span className="text-[16px] text-[#FFF]">{getTitle(idx)}</span>
                            ) : (
                              <input
                                className="text-[16px] text-[#FFF] bg-transparent border border-[#2A3244] rounded-[6px] px-2 py-1 outline-none"
                                value={draftTitles[idx]}
                                onChange={(e) => {
                                  const next = [...draftTitles]; next[idx] = e.target.value; setDraftTitles(next);
                                }}
                              />
                            )}
                            <span className="text-[12px] text-[#A9B1C6]">{getTurnLabel(idx)}</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleClickMilestone(index)} className="bg-transparent border-none p-2 -mr-2" aria-expanded={opened}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-300 ${opened ? "rotate-180" : ""}`}>
                            <path d="M6 9l6 6 6-6" stroke="#C9D0E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>

                      <Collapsible open={opened}>
                        <div className="mb-3 -mt-1 rounded-[8px] bg-[#141C2A] border border-[#2A3244] p-3 text-[13px] text-[#DFE1EA]">
                          {!isEditing ? (
                            getContent(idx) ? <pre className="whitespace-pre-wrap leading-[20px]">{getContent(idx)}</pre> : <div className="text-[#A9B1C6]">세부 내용이 없습니다.</div>
                          ) : (
                            <textarea
                              rows={10}
                              className="w-full rounded-[8px] bg-[#1B2333] border border-[#2F3A52] p-3 text-[13px] text-[#DFE1EA] outline-none resize-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                              value={draftContents[idx]}
                              onChange={(e) => {
                                const next = [...draftContents]; next[idx] = e.target.value; setDraftContents(next);
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

              {/* 에필로그(엔딩) */}
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-300 ${openEpilogue ? "rotate-180" : ""}`}>
                    <path d="M6 9l6 6 6-6" stroke="#C9D0E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <Collapsible open={openEpilogue} className="mt-2">
                  <div className="rounded-[12px] border border-[#2A3244] bg-[#141C2A] p-3 text-[13px] text-[#DFE1EA]">
                    {(endings.length > 0 || endingOverrides.length > 0) ? (
                      <div className="space-y-4">
                        {Array.from({ length: Math.max(endings.length, endingOverrides.length) }).map((_, i) => {
                          const value = getEnding(i) ?? "";
                          return (
                            <div key={i} className="border-b border-[#2A3244] last:border-b-0 pb-3 last:pb-0">
                              <div className="font-semibold text-[14px] text-[#B093F9] mb-2">엔딩 {String.fromCharCode(65 + i)}</div>
                              {!isEditing ? (
                                <pre className="whitespace-pre-wrap">{value}</pre>
                              ) : (
                                <textarea
                                  rows={6}
                                  className="w-full rounded-[8px] bg-[#1B2333] border border-[#2F3A52] p-3 text-[13px] text-[#DFE1EA] outline-none resize-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                  value={endingDrafts[i] ?? value}
                                  onChange={(e) => {
                                    const next = [...endingDrafts]; next[i] = e.target.value; setEndingDrafts(next);
                                  }}
                                  placeholder="엔딩 내용을 작성하세요."
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-[#A9B1C6]">에필로그 내용이 없습니다.</div>
                    )}
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
                  setPromptOverride(promptDraft);
                  setOverrideTitles(draftTitles.slice());
                  setOverrideContents(draftContents.slice());
                  setEndingOverrides(endingDrafts.slice());
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
                    setPromptDraft(getPrompt());
                    setDraftTitles(Array.from({ length: milestoneCount }, (_, i) => getTitle(i)));
                    setDraftContents(Array.from({ length: milestoneCount }, (_, i) => getContent(i)));
                    setEndingDrafts(Array.from({ length: Math.max(endings.length, endingOverrides.length) }, (_, i) => getEnding(i)));
                    if (!openMilestones) setOpenMilestones(1);
                    setIsEditing(true);
                  }}
                >
                  편집하기
                </button>
                <button
                  type="button"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#6F4ACD] text-[#FFF] text-[16px] font-semibold border-none"
                  onClick={() => {
                    // ⬇⬇ 빈값 방지용 안전 프롬프트
                    const safePrompt =
                      (getPrompt() && getPrompt().trim()) ||
                      (actualApiResult?.prompt ?? "") ||
                      "";

                    const payload = {
                      summary: actualApiResult?.summary || "",
                      prompt: safePrompt,
                      mileStones: Array.from({ length: milestones.length }, (_, i) => ({
                        title: getTitle(i),
                        content: getContent(i),
                        startTurn: milestones[i]?.startTurn ?? null,
                        endTurn: milestones[i]?.endTurn ?? null,
                      })),
                      endings: Array.from(
                        { length: Math.max(endings.length, (endingOverrides?.length || 0)) },
                        (_, i) => getEnding(i) ?? ""
                      ),
                      playTurn: requestBody?.playTurn || null,
                      storyStructure: requestBody?.storyStructure || null,
                    };

                    navigate("/FutureNotePost", {
                      state: { futureNotePayload: payload }
                    });
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
