import React, { useState } from "react";
import { ArrowLeftIcon } from "../components/icons";

const MAX_TITLE = 20;
const MAX_BODY = 500;

const UserNoteWrite: React.FC = () => {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    return (
        <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
            <div className="w-[375px] h-[896px] bg-[#141924] text-gray-200 flex flex-col overflow-hidden">

                <header className="flex-shrink-0 h-[34px] mt-[25px] flex items-center px-[20.5px]">
                    <button className="bg-transparent border-none outline-none p-0 m-0 cursor-pointer" aria-label="뒤로가기">
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
                                    placeholder={
                                        "캐릭터가 반드시 기억해 줬으면 하는 내용을 적어주세요 (ex. 중요한 설정, 현재 상황, 제한되어야 하는 상황 등)"
                                    }
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
                        className="w-[360px] h-[52px] ml-[8px] mb-[8px] rounded-[12px] border-none bg-[#6F4ACD] text-[#FFF] font-semibold text-[16px]"
                    >
                        저장하기
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default UserNoteWrite;