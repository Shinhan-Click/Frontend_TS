import React, { useState } from "react";
import { ArrowLeftIcon } from "../components/icons";
import { useNavigate, useLocation } from "react-router-dom";

const MAX_TITLE = 20;
const MAX_BODY = 500;

type ApiResponse<T> = { isSuccess: boolean; code: string; message: string; result: T };
type Draft = { personaChoice?: string; personaText?: string; name?: string; gender?: 'male' | 'female' | 'none'; introduction?: string; userNote?: string };

const API_BASE = "/api";

const UserNoteWrite: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingDraft: Draft | undefined = (location.state as any)?.draft;
  const fromSearch: string = (location.state as any)?.fromSearch ?? window.location.search ?? '';

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    const requestData = { title: title.trim(), prompt: body.trim() };

    try {
      const res = await fetch(`${API_BASE}/usernote/private`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        credentials: "include",
        body: JSON.stringify(requestData),
      });
      if (!res.ok) throw new Error();

      const data: ApiResponse<{ userNoteId: number; title: string; prompt: string }> = await res.json();
      if (!data.isSuccess) throw new Error();

      const draft = { ...(incomingDraft || {}), userNote: data.result.prompt };
      navigate(`/ChatSetting${fromSearch}`, {
        replace: true,
        state: { selectedUserNoteDescription: data.result.prompt, draft },
      });
    } catch {
      alert("유저노트 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
      <div className="w-[375px] h-[896px] bg-[#141924] text-gray-200 flex flex-col overflow-hidden">
        <header className="flex-shrink-0 h-[34px] mt-[25px] flex items-center px-[20.5px]">
          <button
            className="bg-transparent border-none outline-none p-0 m-0 cursor-pointer"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="w-[24px] h-[24px] text-[#FFF]" />
          </button>
          <h1 className="ml-[10px] text-[18px] font-bold text-[#FFF]">유저노트 작성</h1>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
          <div className="w-[335px] mx-auto pb-4">
            <div className="mt-[55px]">
              <label className="block text-[14px] font-semibold text-[#FFF] mb-2 h-[40px]">
                제목 <span className="text-[#F24C4C]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={MAX_TITLE}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력해주세요"
                  className="w-full h-[45px] bg-[#283143] text-[#FFF] placeholder-gray-500 border border-[rgba(100,116,139,0.4)] rounded-[6px] px-4 py-3 outline-none focus:border-[#6F4ACD] focus:ring-2 focus:ring-[#6F4ACD]/40"
                />
                <div className="mt-1.5 text-right text-xs text-[#FFF]">
                  {title.length}/{MAX_TITLE}
                </div>
              </div>
            </div>

            <div className="mt-[20px]">
              <label className="block text-[14px] font-semibold text-[#FFF] mb-2 h-[40px]">
                내용 <span className="text-[#F24C4C]">*</span>
              </label>
              <div className="relative">
                <textarea
                  rows={10}
                  maxLength={MAX_BODY}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="캐릭터가 반드시 기억해 줬으면 하는 내용을 적어주세요 (ex. 중요한 설정, 현재 상황, 제한되어야 하는 상황 등)"
                  className="w-full h-[300px] bg-[#283143] text-[#FFF] placeholder-gray-500 border border-[rgba(100,116,139,0.4)] rounded-[6px] px-4 py-3 outline-none resize-none focus:border-[#6F4ACD] focus:ring-2 focus:ring-[#6F4ACD]/40"
                />
                <div className="mt-1.5 text-right text-xs text-[#FFF]">
                  {body.length}/{MAX_BODY}
                </div>
              </div>
            </div>
            <div className="h-6" />
          </div>
        </main>

        <footer className="flex-shrink-0 px-4 pb-4">
          <button
            type="button"
            className={`w-[360px] h-[52px] ml-[8px] mb-[8px] rounded-[12px] border-none font-semibold text-[16px] ${
              isSubmitting || !title.trim() || !body.trim()
                ? "bg-[#6F4ACD] text-[#FFF] opacity-70 cursor-not-allowed"
                : "bg-[#6F4ACD] text-[#FFF] hover:bg-[#5A3A9E]"
            }`}
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !body.trim()}
          >
            {isSubmitting ? "저장 중..." : "저장하기"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default UserNoteWrite;