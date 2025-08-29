// src/pages/ChatRoom.tsx
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon } from "../components/icons";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { MdFormatQuote } from "react-icons/md";

type Role = "ai" | "user" | "narration";
type Message = {
    id: string;
    role: Role;
    text: string;
    name?: string;
    avatarUrl?: string;
};

const DUMMY: Message[] = [
    { id: "n1", role: "narration", text: "메시지는 캐릭터 특성에 따라 자동 생성됩니다" },
    { id: "a1", role: "ai", name: "하이도혁", avatarUrl: "https://i.pravatar.cc/48?img=12", text: "저.. 안녕, 어디가는 길이야?" },
    { id: "a2", role: "ai", name: "하이도혁", avatarUrl: "https://i.pravatar.cc/48?img=12", text: "그냥 물어본 거야.\n의미부여하지 말아줘." },
    { id: "u1", role: "user", text: "나도 그냥 물어본 거거든?" },
    { id: "n2", role: "narration", text: "하이도혁은 총총거리며 그 자리를 떴다..." },
];

const ChatRoom: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>(DUMMY);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // 따옴표 감지 ( " ", “ ”, 「 」, 『 』 )
    const extractQuoted = (raw: string) => {
        const t = raw.trim();
        const pairs: Array<[string, string]> = [
            ['"', '"'],
            ['“', '”'],
            ['「', '」'],
            ['『', '』'],
        ];
        for (const [L, R] of pairs) {
            if (t.startsWith(L) && t.endsWith(R)) {
                const inner = t.slice(L.length, t.length - R.length).trim();
                return inner;
            }
        }
        return null;
    };

    const send = () => {
        const raw = input;
        const t = raw.trim();
        if (!t) return;

        const quoted = extractQuoted(raw);
        if (quoted !== null) {
            if (!quoted) return;
            setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), role: "narration", text: quoted },
            ]);
        } else {
            setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), role: "user", text: t },
            ]);
        }
        setInput("");
        requestAnimationFrame(() => inputRef.current?.focus());
    };

    const getMarginTop = (curr: Role, prev?: Role) => {
        if (!prev) return "mt-3";
        if (curr === "narration" && prev === "narration") return "mt-3";
        if (curr === "narration" || prev === "narration") return "mt-5";
        return curr === prev ? "mt-[5px]" : "mt-5";
    };

    // 따옴표 자동 입력
    const insertQuotes = () => {
        const el = inputRef.current;
        if (!el) return;
        const start = el.selectionStart ?? input.length;
        const end = el.selectionEnd ?? input.length;
        const before = input.slice(0, start);
        const after = input.slice(end);
        const next = `${before}“”${after}`;
        setInput(next);
        requestAnimationFrame(() => {
            inputRef.current?.focus();
            const caret = start + 1;
            inputRef.current?.setSelectionRange(caret, caret);
        });
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center pointer-events-auto">
            <div className="relative w-[375px] h-[896px] bg-[#141924] text-gray-200 flex flex-col overflow-hidden">

                {/* Header */}
                <header className="absolute top-0 left-0 right-0 z-[60] mt-[5px] w-[335px] h-[58px] px-[20px] flex items-center justify-between bg-[#141924]">
                    <div className="flex items-center">
                        <button
                            className="w-[35px] h-[35px] p-2 ml-[4px] bg-[#141924] text-[#FFF] border-none"
                            aria-label="뒤로가기"
                            onClick={() => history.back()}
                        >
                            <ArrowLeftIcon className="w-[20px] h-[20px] text-[#FFF]" />
                        </button>
                        <h1 className="ml-[8px] text-[18px] font-bold text-[#FFF]">하도혁</h1>
                    </div>

                    <button
                        className="w-[38px] h-[38px] p-2 rounded bg-[#222A39] text-[#FFF] border-none transition"
                        aria-label="채팅방 설정"
                        onClick={() => alert("설정 버튼")}
                    >
                        <AdjustmentsHorizontalIcon className="w-6 h-6" />
                    </button>
                </header>

                {/* Scroll Area */}
                <main className="relative z-0 flex-1 overflow-y-auto overflow-x-hidden pt-[58px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="w-[335px] mx-auto pt-3 pb-4">
                        {/* 안내 배지 */}
                        <div className="w-full h-[60px] flex justify-center items-center mt-[12px] mb-[12px]">
                            <span className="w-[290px] h-[34px] flex justify-center items-center text-[12px] rounded-[55px] bg-[#283143] text-[#DFE1EA]/70">
                                메시지는 캐릭터 특성에 따라 자동 생성됩니다
                            </span>
                        </div>

                        {messages
                            .filter((m) => !(m.role === "narration" && m.id === "n1"))
                            .map((m, i, arr) => {
                                const prev = arr[i - 1];
                                const mt = getMarginTop(m.role, prev?.role);

                                if (m.role === "narration") {
                                    return (
                                        <p key={m.id} className={`${mt} text-[14px] leading-7 text-[#C7CBD6]/70 whitespace-pre-wrap`}>
                                            {m.text}
                                        </p>
                                    );
                                }

                                if (m.role === "ai") {
                                    return (
                                        <div key={m.id} className={`${mt} flex items-start gap-2`}>
                                            <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden bg-[#222A39]">
                                                {m.avatarUrl && (
                                                    <img src={m.avatarUrl} alt={m.name ?? "ai"} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="max-w-[78%]">
                                                {m.name && <div className="text-[12px] font-medium text-[#FFF] mb-[6px]">{m.name}</div>}
                                                <div className="px-[10px] py-[4px] bg-[#283143] shadow rounded-[10px] rounded-tl-none">
                                                    <p className="text-[14px] leading-[18px] text-[#E6EAF3] whitespace-pre-wrap">{m.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={m.id} className={`${mt} flex justify-end`}>
                                        <div className="max-w-[78%]">
                                            <div className="px-[10px] py-[6px] bg-[#6F4ACD] text-[#FFF] shadow rounded-[10px] rounded-tr-none">
                                                <div className="text-[14px] leading-[18px] whitespace-pre-wrap">{m.text}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </main>

                {/* Footer */}
                <footer className="z-40 pointer-events-auto bg-[#141924] mb-[25px]">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            send();
                        }}
                        className="w-[335px] mx-auto py-3 flex items-center gap-2"
                    >
                        <div className="flex items-center flex-1 gap-[5px]">

                            <button
                                type="button"
                                onClick={insertQuotes}
                                className="w-[45px] h-[45px] flex items-center justify-center rounded-full bg-[#222A39] border-none text-[#FFF]"
                            >
                                <MdFormatQuote size={40} />
                            </button>

                            <div className="relative flex-1">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    name="message"
                                    aria-label="메시지 입력"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full h-[44px] rounded-[30px] bg-[#222A39] text-[#FFF]
                  placeholder:text-[#BFC6D4]/60 pl-4 pr-12 outline-none border-none"
                                    placeholder="“ ” 사이에 대사 지문을 넣어보세요"
                                    autoComplete="off"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className={[
                                        "absolute right-[3px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full flex items-center justify-center text-[#FFF]",
                                        input.trim() ? "bg-[#404D68] text-[#FFF]" : "bg-[#404D68] text-white/70 opacity-70 cursor-not-allowed",
                                    ].join(" ")}
                                    aria-label="전송"
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 2L11 13" />
                                        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default ChatRoom;
