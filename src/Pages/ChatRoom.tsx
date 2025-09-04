import React, { useRef, useState, useEffect, useCallback } from "react";
import { ArrowLeftIcon, HistoryIcon, TrashIcon } from "../components/icons";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { MdFormatQuote } from "react-icons/md";
import { useParams, useLocation } from "react-router-dom";

interface IconButtonProps {
    icon: React.ReactNode;
    label: string;
}
const IconButton: React.FC<IconButtonProps> = ({ icon, label }) => (
    <div className="flex flex-col items-center justify-start gap-2 cursor-pointer group">
        <div className="w-16 h-16 rounded-full bg-[#6A5AF9] flex items-center justify-center transition-transform group-hover:scale-105">
            {icon}
        </div>
        <span className="text-sm text-slate-300 font-medium">{label}</span>
    </div>
);

interface ActionItemProps {
    icon: React.ReactNode;
    label: string;
    isDestructive?: boolean;
}
const ActionItem: React.FC<ActionItemProps> = ({ icon, label, isDestructive }) => (
    <button
        className="bg-[#222A39] border-none flex items-center gap-4 text-lg p-3 rounded-lg hover:bg-slate-700/50 w-full text-left transition-colors"
    >
        {icon}
        <span
            className={`font-medium ${isDestructive ? "text-[#F24C4C]" : "text-[#FFF]"}`}
        >
            {label}
        </span>
    </button>
);

interface LocationState {
    firstMessage?: string;
    characterName?: string;
    characterImageUrl?: string;
    characterId?: number;
    userNoteApplied?: boolean; // 유저노트 적용 여부
    futureNoteApplied?: boolean;
}

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
}
const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose }) => {
    const handleEscape = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, handleEscape]);

    return (
        <>
            <div
                className={`absolute inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            <div
                className={`p-[10px] w-[355px] absolute inset-x-0 mt-[610px] z-50 bg-[#222A39] text-[#FFF] rounded-[20px] pt-3 pb-6 px-4 shadow-2xl transition-transform duration-300 ease-in-out transform ${isOpen ? "translate-y-0" : "translate-y-full"}`}
            >
                <hr className="border-[2px] border-[#E5E5EB] rounded-[10px] w-[40px]" />
                <div className="w-[375px] h-[30px] bg-slate-500 rounded-full mx-auto mb-5" />
                <h2 className="text-[18px] -mt-[15px] mb-[30px] font-bold text-[#FFF] px-2">채팅방 설정</h2>

                <div className="grid grid-cols-3 gap-4 text-center text-[15px]">
                    <IconButton icon={<img src="/userw.png" alt="유저 페르소나" className="w-[28px] h-[28px]" />} label="유저 페르소나" />
                    <IconButton icon={<img src="/Vectorw.png" alt="유저 노트" className="w-[28px] h-[28px]" />} label="유저 노트" />
                    <IconButton icon={<img src="/model.png" alt="AI 모델 변경" className="w-[28px] h-[28px]" />} label="AI 모델 변경" />
                </div>
                <hr className="border-[1px] border-[#3B4966] w-[320px] mt-[15px] mb-[15px]" />

                <div className="flex flex-col gap-[10px] h-[100px]">
                    <ActionItem
                        icon={<HistoryIcon className="w-[30px] h-[30px] text-[#FFF]" />}
                        label="이전 대화 보기"
                    />
                    <ActionItem
                        icon={<TrashIcon className="w-[30px] h-[30px] text-[#F24C4C]" />}
                        label="이 채팅방 삭제하기"
                        isDestructive
                    />
                </div>
            </div>
        </>
    );
};

type Role = "ai" | "user" | "narration";
type Message = {
    id: string;
    role: Role;
    text: string;
    name?: string;
    avatarUrl?: string;
};

type ApiResponse<T> = {
    isSuccess: boolean;
    code: string;
    message: string;
    result: T;
};

type ChatInfo = {
    characterName: string;
    characterImageUrl: string;
    personaName: string;
};

type ChatLogItem = {
    role: "USER" | "ASSISTANT";
    content: string;
};

type ChatLogResult = {
    chatLog: ChatLogItem[];
};

const API_BASE = "/api";

const ChatRoom: React.FC = () => {
    const { chatId = "" } = useParams<{ chatId: string }>();
    const location = useLocation();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const toggleSheet = () => setIsSheetOpen((v) => !v);
    const closeSheet = () => setIsSheetOpen(false);

    const [characterName, setCharacterName] = useState("캐릭터");
    const [characterImageUrl, setCharacterImageUrl] = useState("");
    const [personaName, setPersonaName] = useState("");

    const [aiTyping, setAiTyping] = useState(false);

    // === Toast: show once on first load, fade out over 4s ===
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<'usernote' | 'futurenote'>('usernote');

    useEffect(() => {
    const state = location.state as LocationState;
    
    // 유저노트가 실제로 적용되었을 때 토스트 표시
    if (state?.userNoteApplied === true) {
        setToastType('usernote');
        setShowToast(true);
        const timer = setTimeout(() => setShowToast(false), 4000);
        
        // 토스트 표시 후 state 정리 (뒤로가기 시 다시 표시되지 않도록)
        window.history.replaceState({
            ...state,
            userNoteApplied: undefined
        }, document.title);
        
        return () => clearTimeout(timer);
    }
    
    // 퓨처노트가 실제로 적용되었을 때 토스트 표시
        if (state?.futureNoteApplied === true) {
            setToastType('futurenote');
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 4000);
            
            // 토스트 표시 후 state 정리 (뒤로가기 시 다시 표시되지 않도록)
            window.history.replaceState({
                ...state,
                futureNoteApplied: undefined
            }, document.title);
            
            return () => clearTimeout(timer);
        }
    }, [location.state]);
    // =======================================================

    const endRef = useRef<HTMLDivElement | null>(null);
    const scrollToBottom = useCallback((smooth = true) => {
        if (!endRef.current) return;
        endRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
    }, []);

    const splitLines = (s: string) =>
        (s ?? "")
            .split(/\r?\n/)
            .map((v) => v.trim())
            .filter(Boolean);

    const parseMessageContent = (content: string, role: "USER" | "ASSISTANT"): Message[] => {
        const cleanContent = content.replace(/\\n/g, '\n').replace(/\n+/g, '\n');
        const lines = cleanContent.split('\n');
        const messages: Message[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (role === "USER") {
                const replacedLine = trimmed.replace(/\{\{user\}\}/g, personaName || "사용자");
                messages.push({
                    id: crypto.randomUUID(),
                    role: "user",
                    text: replacedLine
                });
                continue;
            }

            const foundQuotes: Array<{ start: number, end: number, content: string }> = [];
            const allQuotesRegex = /(?:\u201C([^\u201D]*)\u201D)|(?:\\?"([^"]*?)\\?")|(?:"([^"]*)\")|(?:『([^』]*)』)|(?:「([^」]*)」)/g;

            let match;
            while ((match = allQuotesRegex.exec(trimmed)) !== null) {
                const content = match[1] || match[2] || match[3] || match[4] || match[5] || '';
                if (content.trim()) {
                    foundQuotes.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        content: content
                    });
                }
            }

            if (foundQuotes.length > 0) {
                foundQuotes.sort((a, b) => a.start - b.start);
                let lastEnd = 0;

                for (const quote of foundQuotes) {
                    if (quote.start > lastEnd) {
                        const beforeText = trimmed.slice(lastEnd, quote.start).trim();
                        if (beforeText) {
                            const narration = beforeText.replace(/\{\{user\}\}/g, personaName || "사용자");
                            messages.push({
                                id: crypto.randomUUID(),
                                role: "narration",
                                text: narration
                            });
                        }
                    }

                    const dialogue = quote.content.replace(/\{\{user\}\}/g, personaName || "사용자");
                    messages.push({
                        id: crypto.randomUUID(),
                        role: "ai",
                        text: dialogue,
                        name: characterName,
                        avatarUrl: characterImageUrl
                    });

                    lastEnd = quote.end;
                }

                if (lastEnd < trimmed.length) {
                    const afterText = trimmed.slice(lastEnd).trim();
                    if (afterText) {
                        const narration = afterText.replace(/\{\{user\}\}/g, personaName || "사용자");
                        messages.push({
                            id: crypto.randomUUID(),
                            role: "narration",
                            text: narration
                        });
                    }
                }
            } else {
                const replacedLine = trimmed.replace(/\{\{user\}\}/g, personaName || "사용자");
                messages.push({
                    id: crypto.randomUUID(),
                    role: "narration",
                    text: replacedLine
                });
            }
        }

        return messages;
    };

    // 캐릭터 정보 가져오기
    useEffect(() => {
        let aborted = false;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/chat/${chatId}/info`, {
                    headers: { accept: "*/*" },
                    credentials: "include",
                });
                if (!res.ok) return;
                const data: ApiResponse<ChatInfo> = await res.json();
                if (!data?.isSuccess || !data.result) return;
                if (!aborted) {
                    setCharacterName(data.result.characterName || "캐릭터");
                    setCharacterImageUrl(data.result.characterImageUrl || "");
                    setPersonaName(data.result.personaName || "");
                }
            } catch { }
        })();
        return () => { aborted = true; };
    }, [chatId]);

    // 채팅 로그 가져오기
    useEffect(() => {
        if (!characterName) return;
        let aborted = false;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/chat/${chatId}`, {
                    method: "GET",
                    headers: { accept: "*/*" },
                    credentials: "include",
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: ApiResponse<ChatLogResult> = await res.json();
                if (!data?.isSuccess || !data.result) return;

                const flat: Message[] = [];
                for (const item of data.result.chatLog || []) {
                    const parsedMessages = parseMessageContent(item.content || "", item.role);
                    flat.push(...parsedMessages);
                }
                if (!aborted) setMessages(flat);
            } catch {
                if (!aborted) setMessages([]);
            }
        })();
        return () => { aborted = true; };
    }, [chatId, characterName, characterImageUrl, personaName]);

    const extractQuoted = (raw: string) => {
        const t = raw.trim();
        const pairs: Array<[string, string]> = [
            ['"', '"'],
            ['"', '"'],
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

    const send = async () => {
        const raw = input;
        const t = raw.trim();
        if (!t) return;

        const quoted = extractQuoted(raw);
        const pieces = splitLines(quoted ?? t);

        setMessages((prev) => [
            ...prev,
            ...pieces.map((text) => ({
                id: crypto.randomUUID(),
                role: quoted !== null ? ("narration" as const) : ("user" as const),
                text,
            }))
        ]);

        setInput("");
        if (inputRef.current) {
        inputRef.current.style.height = '18px';
        }   
        requestAnimationFrame(() => inputRef.current?.focus());

        setAiTyping(true);

        // API 호출해서 AI 응답 받기
        try {
            const response = await fetch(`${API_BASE}/chat/${chatId}/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "*/*"
                },
                credentials: "include",
                body: JSON.stringify({
                    content: t
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data: ApiResponse<{ response: string }> = await response.json();

            if (data.isSuccess && data.result?.response) {
                const aiMessages = parseMessageContent(data.result.response, "ASSISTANT");
                setMessages((prev) => [...prev, ...aiMessages]);
            }
        } catch (error) {
            setMessages((prev) => [...prev, {
                id: crypto.randomUUID(),
                role: "narration",
                text: "메시지 전송에 실패했습니다. 다시 시도해주세요."
            }]);
        } finally {
            setAiTyping(false);
        }
    };

    const getMarginTop = (curr: Role, prev?: Role) => {
        if (!prev) return "mt-3";
        if (curr === "narration" && prev === "narration") return "mt-3";
        if (curr === "narration" || prev === "narration") return "mt-5";
        return curr === prev ? "mt-[5px]" : "mt-5";
    };

    const insertQuotes = () => {
        const el = inputRef.current;
        if (!el) return;
        const start = el.selectionStart ?? input.length;
        const end = el.selectionEnd ?? input.length;
        const before = input.slice(0, start);
        const after = input.slice(end);
        const next = `${before}""${after}`;
        setInput(next);
        requestAnimationFrame(() => {
            inputRef.current?.focus();
            const caret = start + 1;
            inputRef.current?.setSelectionRange(caret, caret);
        });
    };

    useEffect(() => {
        scrollToBottom(messages.length > 0);
    }, [messages, aiTyping, scrollToBottom]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center pointer-events-auto">
            <div className="relative w-[375px] h-[896px] bg-[#141924] text-gray-200 flex flex-col overflow-hidden">

                <header className="absolute top-0 left-0 right-0 z-50 w-[335px] h-[58px] px-[20px] flex items-center justify-between bg-[#141924]">
                    <div className="flex items-center">
                        <button
                            className="w-[35px] h-[35px] p-2 ml-[4px] bg-[#141924] text-[#FFF] border-none"
                            aria-label="뒤로가기"
                            onClick={() => history.back()}
                        >
                            <ArrowLeftIcon className="w-[20px] h-[20px] text-[#FFF]" />
                        </button>
                        <h1 className="ml-[8px] text-[18px] font-bold text-[#FFF]">{characterName}</h1>
                    </div>

                    <button
                        className="w-[38px] h-[38px] p-2 rounded bg-[#141924] text-[#FFF] border-none transition"
                        aria-label="채팅방 설정"
                        onClick={toggleSheet}
                    >
                        <AdjustmentsHorizontalIcon className="w-6 h-6" />
                    </button>
                </header>

                <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden pt-[58px] bg-[#141924] [&::-webkit-scrollbar]:hidden">
                    
            {/* 새로운 토스트 */}
            {showToast && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[88px] z-50 animate-toast-fade">
                <div 
                    className="inline-flex h-[24px] w-[185px] items-center gap-[4px] flex-shrink-0 rounded-[6px] -mr-[105px]"
                    style={{
                        padding: "10px 16px 10px 10px",
                        background: "linear-gradient(273deg, rgba(111, 74, 205, 0.30) 0%, rgba(116, 92, 250, 0.30) 100%)",
                        boxShadow: "0 0 2px 0 rgba(255, 255, 255, 0.20) inset, 0 4px 50px 5px rgba(13, 24, 81, 0.05), 1px 3px 20px 0 rgba(13, 24, 81, 0.05), 0 10px 30px 0 rgba(13, 24, 81, 0.10)",
                        backdropFilter: "blur(3px)"
                    }}
                >
                    <div className="w-[24px] h-[24px] flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                            <g clipPath="url(#clip0_2224_9315)">
                                <path d="M12.2048 5.40479C8.34083 5.40479 5.20483 8.54079 5.20483 12.4048C5.20483 16.2688 8.34083 19.4048 12.2048 19.4048C16.0688 19.4048 19.2048 16.2688 19.2048 12.4048C19.2048 8.54079 16.0688 5.40479 12.2048 5.40479ZM10.8048 15.9048L7.30483 12.4048L8.29183 11.4178L10.8048 13.9238L16.1178 8.61079L17.1048 9.60478L10.8048 15.9048Z" fill="#A8FD68"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_2224_9315">
                                    <rect width="24" height="24" fill="white" transform="translate(0.204834 0.404785)"/>
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <span 
                        style={{
                            color: "#FFF",
                            fontFamily: "Pretendard",
                            fontSize: "14px",
                            fontWeight: "600",
                            lineHeight: "142.9%",
                            letterSpacing: "0.203px"
                        }}
                    >
                        {toastType === 'usernote' ? '유저노트가 적용되었습니다.' : '퓨처노트가 적용되었습니다.'}
                    </span>
                </div>
            </div>
        )}

                    <div className="w-[335px] mx-auto pt-3 pb-4">
                        <div className="w-full h-[60px] flex justify-center items-center mt-[12px] mb-[12px]">
                            <span className="w-[290px] h-[34px] flex justify-center items-center text-[12px] rounded-[55px] bg-[#283143] text-[#DFE1EA]/70">
                                메시지는 캐릭터 특성에 따라 자동 생성됩니다
                            </span>
                        </div>

                        {messages.map((m, i, arr) => {
                            const prev = arr[i - 1];
                            const mt = getMarginTop(m.role, prev?.role);

                            if (m.role === "narration") {
                                return (
                                    <p key={m.id} className={`${mt} text-[14px] leading-6 text-[#C7CBD6]/70 whitespace-pre-wrap`}>
                                        {m.text}
                                    </p>
                                );
                            }

                            if (m.role === "ai") {
                                return (
                                    <div key={m.id} className={`${mt} flex items-start gap-2`}>
                                        <div className="flex-shrink-0 w-[32px] h-[32px] rounded-full overflow-hidden bg-[#222A39]">
                                            {(m.avatarUrl || characterImageUrl) && (
                                                <img
                                                    src={m.avatarUrl ?? characterImageUrl}
                                                    alt={m.name ?? characterName}
                                                    className="w-[32px] h-[32px] object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="max-w-[78%] ml-[5px]">
                                            {(m.name || characterName) && (
                                                <div className="text-[12px] font-medium text-[#FFF] mb-[6px]">
                                                    {m.name ?? characterName}
                                                </div>
                                            )}
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
                                        <div className="px-[10px] py-[6px] bg-[#6F4ACD] text-[#FFF] shadow rounded-[10px] rounded-tr-none mt-[20px]">
                                            <div className="text-[14px] leading-[18px] whitespace-pre-wrap">{m.text}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {aiTyping && (
                            <div className="mt-5 flex items-start gap-2">
                                <div className="flex-shrink-0 w-[32px] h-[32px] rounded-full overflow-hidden bg-[#222A39]">
                                    {characterImageUrl && (
                                        <img
                                            src={characterImageUrl}
                                            alt={characterName}
                                            className="w-[32px] h-[32px] object-cover"
                                        />
                                    )}
                                </div>
                                <div className="ml-[5px] max-w-[78%]">
                                    <div className="text-[12px] font-medium text-[#FFF] mb-[6px]">
                                        {characterName}
                                    </div>
                                    <div className="px-[12px] py-[6px] bg-[#2E3646] text-[#DFE1EA] rounded-[10px] rounded-tl-none">

                                        <span className="typing-dots">
                                            <span className="typing-dot">º</span>
                                            <span className="typing-dot">º</span>
                                            <span className="typing-dot">º</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={endRef} />
                    </div>
                </main>

                <footer className="relative z-40 pointer-events-auto bg-[#141924] mb-[25px]">
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
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            send(); // 폼 제출
                                        }
                                        // Shift+Enter는 줄바꿈
                                    }}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        // 높이 자동 조절
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = '18px';
                                        
                                        if (target.scrollHeight > target.clientHeight) {
                                            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                                        }
                                    }}
                                    className="px-[10px] w-[240px] h-[18px] rounded-[30px] bg-[#222A39] text-[#FFF] placeholder:text-[#BFC6D4]/60 pl-4 pr-12 outline-none border-none resize-none py-[11px] leading-5"
                                    placeholder="&quot; &quot; 사이에 대사 지문을 넣어보세요"
                                    rows={0}
                                    style={{
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className={[
                                        "absolute right-[3px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full flex items-center justify-center text-[#FFF]",
                                        input.trim() ? "bg-[#404D68] border-none" : "bg-[#404D68] border-none text-white/50 opacity-70 cursor-not-allowed",
                                    ].join(" ")}
                                    aria-label="전송"
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M22 2L11 13" />
                                        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </form>
                </footer>

                <BottomSheet isOpen={isSheetOpen} onClose={closeSheet} />
            </div>
            
            <style>{`
                @keyframes und-wave {
                    0%   { transform: translateY(0);    opacity: .7; }
                    25%  { transform: translateY(-3px); opacity: 1;  }
                    50%  { transform: translateY(0);    opacity: .85;}
                    75%  { transform: translateY(3px);  opacity: .7; }
                    100% { transform: translateY(0);    opacity: .85;}
                }
                .typing-dots {
                    display: inline-flex;
                    gap: 8px;
                    align-items: center;
                    line-height: 1;
                }
                .typing-dot {
                    display: inline-block;
                    font-size: 18px;
                    animation: und-wave 1.2s ease-in-out infinite;
                }
                .typing-dot:nth-child(1) { animation-delay: 0s; }
                .typing-dot:nth-child(2) { animation-delay: .15s; }
                .typing-dot:nth-child(3) { animation-delay: .30s; }
                                .typing-dot:nth-child(1) { animation-delay: 0s; }
                .typing-dot:nth-child(2) { animation-delay: .15s; }
                .typing-dot:nth-child(3) { animation-delay: .30s; }

                /* Toast fade-out over 4s */
                @keyframes toast-fade {
                    0%   { opacity: 1; transform: translate(-50%, 0); }
                    100% { opacity: 0; transform: translate(-50%, -6px); }
                }
                .animate-toast-fade {
                    animation: toast-fade 4s ease forwards;
                }

                /* Hide scrollbar for textarea */
                textarea::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default ChatRoom;