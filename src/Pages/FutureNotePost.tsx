import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftIcon } from "../components/icons";

const MAX_TITLE = 20;
const MAX_DESC = 500;
const MAX_GALLERY = 5;

// 프록시 사용: 모든 API는 /api 로 호출 (Home과 동일)
const API_BASE = "/api";

const FutureNotePost: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { futureNotePayload?: any };
  };

  const [incoming, setIncoming] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["#태그"]);
  const [cover, setCover] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);

  // 실제 업로드용 File 상태
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const tryAddTag = () => {
    const raw = tagInput.trim();
    if (!raw) return;
    const val = raw.startsWith("#") ? raw : `#${raw}`;
    if (!tags.includes(val)) setTags((t) => [...t, val]);
    setTagInput("");
  };

  const onTagKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      tryAddTag();
    }
  };

  const handlePickCover = () => coverInputRef.current?.click();
  const handlePickGallery = () => galleryInputRef.current?.click();

  const onCoverSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCoverFile(file);
    setCover((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    e.currentTarget.value = "";
  };

  const onGallerySelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const slotsLeft = MAX_GALLERY - gallery.length;
    const picked = files.slice(0, Math.max(0, slotsLeft));
    const urls = picked.map((f) => URL.createObjectURL(f));
    setGalleryFiles((prev) => [...prev, ...picked]);
    setGallery((prev) => [...prev, ...urls]);
    e.currentTarget.value = "";
  };

  const removeGalleryAt = (idx: number) => {
    setGallery((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed);
      return copy;
    });
    setGalleryFiles((prev) => {
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };

  useEffect(() => {
    return () => {
      if (cover) URL.revokeObjectURL(cover);
      gallery.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.state?.futureNotePayload) {
      setIncoming(location.state.futureNotePayload);
      // 필요 시 추후 백업
      // localStorage.setItem('futureNotePostPayload', JSON.stringify(location.state.futureNotePayload));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== 업로드 유틸 =====
  const normalizeTags = (arr: string[]) =>
    arr.map((t) => (t.startsWith("#") ? t.slice(1) : t)).filter(Boolean);

  const toEndingObjects = (arr: any) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((e: any) => (typeof e === "string" ? { ending: e } : e));
  };

  const handleSubmit = async () => {
    try {
      if (!incoming) {
        alert("데이터가 없습니다. 이전 단계로 돌아가 주세요.");
        return;
      }

      // data / mileStones / endings 모두 JSON 문자열로 전송
      const dataPayload = {
        title: title.trim(),
        description: desc.trim(),
        tagNames: normalizeTags(tags),
        playTurn: incoming.playTurn ?? null,            // "SHORT" | "NORMAL" | "LONG"
        storyStructure: incoming.storyStructure ?? null, // "THREE_ACT" | "FIVE_ACT"
        summary: incoming.summary ?? "",
        prompt: incoming.prompt ?? "",                  // ← FutureNote에서 넘어온 prompt
      };

      const mileStonesPayload = (incoming.mileStones || []).map((m: any) => ({
        title: m.title ?? "",
        content: m.content ?? "",
        startTurn: m.startTurn ?? null,
        endTurn: m.endTurn ?? null,
      }));

      const endingsPayload = toEndingObjects(incoming.endings || []);

      const formData = new FormData();
      formData.append("data", JSON.stringify(dataPayload));
      formData.append("mileStones", JSON.stringify(mileStonesPayload));
      formData.append("endings", JSON.stringify(endingsPayload));
      if (coverFile) formData.append("thumbnail", coverFile);
      galleryFiles.forEach((f) => formData.append("exampleImages", f));

      const resp = await fetch(`${API_BASE}/futurenote/create`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status} ${text || ""}`);
      }

      // Parse the response
      const responseData = await resp.json();

      if (responseData.isSuccess && responseData.result) {
        alert("게시 완료");

        // Navigate to FutureNoteIntroduce with the response data
        const futureNoteId = responseData.result.futureNoteId;
        navigate(`/futureNoteIntroduce/${futureNoteId}`, {
          state: {
            futureNoteData: responseData.result
          }
        });
      } else {
        throw new Error(responseData.message || "게시 실패");
      }

    } catch (err: any) {
      console.error(err);
      alert("게시 실패: " + (err?.message || "알 수 없는 오류"));
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
      <div className="w-[375px] h-[896px] bg-[#141924] text-white flex flex-col overflow-hidden">
        <header className="flex-shrink-0 h-[34px] mt-[25px] flex items-center px-[20.5px]">
          <button
            className="bg-transparent border-none outline-none p-0 m-0 cursor-pointer"
            aria-label="뒤로가기"
            onClick={() => navigate("/FutureNote")}
          >
            <ArrowLeftIcon className="w-[24px] h-[24px] text-[#FFF] mt-[5px]" />
          </button>
          <h1 className="ml-[10px] text-[18px] font-bold text-[#FFF]">퓨처노트</h1>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]">
          <div className="w-[335px] mx-auto pb-[120px]">
            <section className="mt-[26px]">
              <label className="block text-[17px] font-semibold text-[#FFF] mb-[6px]">
                제목 <span className="text-[#F24C4C]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
                  placeholder="20자 이내로 입력해주세요"
                  className="w-full h-[44px] bg-[#283143] text-[#FFF] placeholder-[#9AA3B2] border border-[rgba(100,116,139,0.4)] rounded-[6px] px-4 outline-none focus:border-[#404D68]"
                />
                <div className="mt-1.5 text-right text-[12px] text-[#F8F8FA]">
                  {title.length}/{MAX_TITLE}
                </div>
              </div>
            </section>

            <section className="mt-[14px]">
              <label className="block text-[17px] font-semibold text-[#FFF] mb-[6px]">
                소개글 <span className="text-[#F24C4C]">*</span>
              </label>
              <div className="relative">
                <textarea
                  rows={10}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value.slice(0, MAX_DESC))}
                  placeholder="스토리에 대한 대략적인 설명을 입력해주세요."
                  className="w-full h-[180px] bg-[#283143] text-[#FFF] placeholder-[#9AA3B2] border border-[rgba(100,116,139,0.4)] rounded-[6px] px-4 py-3 outline-none resize-none focus:border-[#6F4ACD]"
                />
                <div className="mt-1.5 text-right text-[12px] text-[#F8F8FA]">
                  {desc.length}/{MAX_DESC}
                </div>
              </div>
            </section>

            <section className="mt-[14px]">
              <label className="block text-[17px] font-semibold text-[#FFF] mb-[6px]">
                해시태그 <span className="text-[#F24C4C]">*</span>
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onTagKeyDown}
                placeholder="입력 후 엔터를 눌러 해시태그를 등록하세요."
                className="w-full h-[42px] bg-[#283143] text-[#FFF] placeholder-[#9AA3B2] border border-[rgba(100,116,139,0.4)] rounded-[8px] px-4 outline-none"
              />
              <div className="flex flex-wrap gap-[5px] mt-[5px]">
                {tags.map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="inline-flex items-center px-[2px] gap-[5px] bg-[#454A55] text-[#E6EAF2] h-[30px] rounded-[6px] text-[12px]"
                  >
                    {t}
                    <button
                      type="button"
                      className="text-[#FFF] bg-[#454A55] border-none"
                      onClick={() =>
                        setTags((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      aria-label="태그 삭제"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="my-[16px] h-px bg-[#2A3244]" />
            </section>

            <section className="mt-[2px]">
              <div className="text-[14px] font-semibold text-[#FFF]">표지 이미지</div>
              <p className="text-[12px] text-[#A9B1C6] mt-[6px]">
                초상권과 저작권에 위반되는 이미지는 사용을 삼가 주시기 바랍니다.
              </p>

              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={handlePickCover}
                  className="flex items-center justify-center w-[96px] h-[96px] rounded-[12px] bg-[#20283A] border border-[#2A3244] text-[#8CA0BF]"
                >
                  <div className="flex flex-col items-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-[12px] mt-1">(1/1)</span>
                  </div>
                </button>

                {cover && (
                  <div className="relative">
                    <img
                      src={cover}
                      alt="표지"
                      className="w-[96px] h-[96px] ml-[8px] object-cover rounded-[12px] border border-[#2A3244]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (cover) URL.revokeObjectURL(cover);
                        setCover(null);
                        setCoverFile(null);
                      }}
                      className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full border-none bg-[##F8F8FACC] flex items-center justify-center text-[12px] ml-[80px]"
                      aria-label="표지 삭제"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onCoverSelected}
              />
            </section>

            <section className="mt-[22px]">
              <div className="text-[14px] font-semibold text-[#FFF]">이미지 첨부</div>
              <p className="text-[12px] text-[#A9B1C6] mt-[6px]">
                유저노트를 적당한 채팅 스크린샷을 업로드해주세요.
              </p>

              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={handlePickGallery}
                  className="flex items-center justify-center w-[96px] h-[96px] rounded-[12px] bg-[#20283A] border border-[#2A3244] text-[#8CA0BF]"
                >
                  <div className="flex flex-col items-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-[12px] mt-1">
                      ({gallery.length}/{MAX_GALLERY})
                    </span>
                  </div>
                </button>

                <div className="flex gap-3">
                  {gallery.map((g, i) => (
                    <div key={g} className="relative">
                      <img
                        src={g}
                        alt={`첨부 ${i + 1}`}
                        className="w-[96px] h-[96px] ml-[8px] object-cover rounded-[12px] border border-[#2A3244]"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryAt(i)}
                        className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full border-none bg-[##F8F8FACC] text-[#6F4ACD] flex items-center justify-center text-[12px] ml-[80px]"
                        aria-label="이미지 삭제"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onGallerySelected}
              />
            </section>
          </div>
        </main>

        <div className="sticky bottom-0 w-full bg-gradient-to-t from-[#141924] via-[#141924] to-transparent">
          <div className="w-[335px] mx-auto pb-5 pt-3 flex gap-[8px] mb-[10px]">
            <button
              type="button"
              className="flex-1 h-[52px] rounded-[12px] bg-[#253043] text-[#FFF] text-[16px] font-semibold border-none"
              onClick={() => {
                alert("임시 저장했습니다. (UI 전용)");
              }}
            >
              저장하기
            </button>
            <button
              type="button"
              className="flex-1 h-[52px] rounded-[12px] bg-[#6F4ACD] text-[#FFF] text-[16px] font-semibold border-none"
              onClick={handleSubmit}
            >
              게시하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutureNotePost;