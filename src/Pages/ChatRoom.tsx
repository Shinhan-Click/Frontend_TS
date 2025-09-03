import React, { useRef, useState, useEffect, useCallback } from "react";
import { ArrowLeftIcon, UserIcon, NoteIcon, EditIcon, HistoryIcon, TrashIcon } from "../components/icons";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { MdFormatQuote } from "react-icons/md";
import { useParams } from "react-router-dom";

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

                <div className="grid grid-cols-3 gap-4 text-center text-[15px] mb-6">
                    <IconButton icon={<UserIcon className="w-[33px] h-[33px] text-[#FFF]" />} label="유저 페르소나" />
                    <IconButton icon={<NoteIcon className="w-[33px] h-[33px] text-[#FFF]" />} label="유저 노트" />
                    <IconButton icon={<EditIcon className="w-[33px] h-[33px] text-[#FFF]" />} label="AI 모델 변경" />
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

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const toggleSheet = () => setIsSheetOpen((v) => !v);
    const closeSheet = () => setIsSheetOpen(false);

    const [characterName, setCharacterName] = useState("캐릭터");
    const [characterImageUrl, setCharacterImageUrl] = useState("");
    const [personaName, setPersonaName] = useState("");

    const splitLines = (s: string) =>
        (s ?? "")
            .split(/\r?\n/)
            .map((v) => v.trim())
            .filter(Boolean);

    const parseMessageContent = (content: string, role: "USER" | "ASSISTANT"): Message[] => {
        // \n 문자열을 실제 개행으로 변환하고, 여러 개행을 정리
        const cleanContent = content.replace(/\\n/g, '\n').replace(/\n+/g, '\n');
        const lines = cleanContent.split('\n');
        const messages: Message[] = [];

        console.log("Parsing content with", lines.length, "lines");
        console.log("Character info:", { characterName, characterImageUrl, personaName });

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            console.log("Processing line:", `"${trimmed}"`);

            // USER 메시지인 경우 따옴표 관계없이 user role로 처리
            if (role === "USER") {
                const replacedLine = trimmed.replace(/\{\{user\}\}/g, personaName || "사용자");
                messages.push({
                    id: crypto.randomUUID(),
                    role: "user",
                    text: replacedLine
                });
                console.log("Added user message:", replacedLine);
                continue;
            }

            // ASSISTANT 메시지인 경우 - 한 줄에서 따옴표들을 모두 찾아서 분리 처리
            const foundQuotes: Array<{ start: number, end: number, content: string }> = [];

            // 디버깅: 실제 문자 확인
            console.log("텍스트 첫 글자들:", Array.from(trimmed.slice(0, 10)).map(c => `'${c}'(${c.charCodeAt(0)})`));

            // 정확한 유니코드 값으로 스마트 따옴표 처리
            const allQuotesRegex = /(?:\u201C([^\u201D]*)\u201D)|(?:\\?"([^"]*?)\\?")|(?:"([^"]*)\")|(?:『([^』]*)』)|(?:「([^」]*)」)/g;

            let match;
            while ((match = allQuotesRegex.exec(trimmed)) !== null) {
                // 매칭된 그룹 중 실제 내용이 있는 것을 찾기 (순서 중요!)
                const content = match[1] || match[2] || match[3] || match[4] || match[5] || '';

                console.log("정규식 매치 결과:", {
                    fullMatch: match[0],
                    groups: match.slice(1),
                    content: content
                });

                if (content.trim()) {
                    foundQuotes.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        content: content
                    });
                }
            }

            if (foundQuotes.length > 0) {
                // 위치 순서로 정렬
                foundQuotes.sort((a, b) => a.start - b.start);

                let lastEnd = 0;

                for (const quote of foundQuotes) {
                    // 따옴표 전의 지문 처리
                    if (quote.start > lastEnd) {
                        const beforeText = trimmed.slice(lastEnd, quote.start).trim();
                        if (beforeText) {
                            const narration = beforeText.replace(/\{\{user\}\}/g, personaName || "사용자");
                            messages.push({
                                id: crypto.randomUUID(),
                                role: "narration",
                                text: narration
                            });
                            console.log("Found narration before quote:", narration);
                        }
                    }

                    // 따옴표 안의 대화 처리
                    const dialogue = quote.content.replace(/\{\{user\}\}/g, personaName || "사용자");
                    messages.push({
                        id: crypto.randomUUID(),
                        role: "ai",
                        text: dialogue,
                        name: characterName,
                        avatarUrl: characterImageUrl
                    });
                    console.log("Found dialogue:", dialogue);

                    lastEnd = quote.end;
                }

                // 마지막 따옴표 이후의 지문 처리
                if (lastEnd < trimmed.length) {
                    const afterText = trimmed.slice(lastEnd).trim();
                    if (afterText) {
                        const narration = afterText.replace(/\{\{user\}\}/g, personaName || "사용자");
                        messages.push({
                            id: crypto.randomUUID(),
                            role: "narration",
                            text: narration
                        });
                        console.log("Found narration after quotes:", narration);
                    }
                }
            } else {
                // 따옴표가 없는 경우 전체를 지문으로 처리
                const replacedLine = trimmed.replace(/\{\{user\}\}/g, personaName || "사용자");
                console.log("Adding as narration:", replacedLine);
                messages.push({
                    id: crypto.randomUUID(),
                    role: "narration",
                    text: replacedLine
                });
            }
        }

        console.log("Total messages parsed:", messages.length);
        return messages;
    };

    // 캐릭터 정보 가져오기
    useEffect(() => {
        let aborted = false;
        (async () => {
            try {
                console.log("Fetching character info for chatId:", chatId);
                const res = await fetch(`${API_BASE}/chat/${chatId}/info`, {
                    headers: { accept: "*/*" },
                    credentials: "include",
                });
                console.log("Character info response status:", res.status);
                if (!res.ok) {
                    console.error("Character info fetch failed:", res.status, res.statusText);
                    return;
                }
                const data: ApiResponse<ChatInfo> = await res.json();
                console.log("Character info data:", data);
                if (!data?.isSuccess || !data.result) {
                    console.error("Character info API returned error:", data);
                    return;
                }
                if (!aborted) {
                    console.log("Setting character info:", data.result);
                    setCharacterName(data.result.characterName || "캐릭터");
                    setCharacterImageUrl(data.result.characterImageUrl || "");
                    setPersonaName(data.result.personaName || "");
                }
            } catch (error) {
                console.error("Failed to fetch character info:", error);
            }
        })();
        return () => { aborted = true; };
    }, [chatId]);

    // 채팅 로그 가져오기 - 캐릭터 정보가 로드된 후에만 실행
    useEffect(() => {
        if (!characterName) return; // 캐릭터 정보가 없으면 대기

        let aborted = false;
        (async () => {
            try {
                console.log("Fetching chat log for chatId:", chatId);
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
            } catch (error) {
                console.error("Failed to fetch chat log:", error);
                if (!aborted) setMessages([]);
            }
        })();
        return () => { aborted = true; };
    }, [chatId, characterName, characterImageUrl, personaName]); // 의존성에 캐릭터 정보 추가

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

        // 사용자 메시지 즉시 UI에 추가
        setMessages((prev) => [
            ...prev,
            ...pieces.map((text) => ({
                id: crypto.randomUUID(),
                role: quoted !== null ? ("narration" as const) : ("user" as const),
                text,
            })),
        ]);

        setInput("");
        requestAnimationFrame(() => inputRef.current?.focus());

        // API 호출해서 AI 응답 받기
        try {
            console.log("Sending message:", { content: t });
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

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error Response:", errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data: ApiResponse<{ response: string }> = await response.json();

            if (data.isSuccess && data.result?.response) {
                // AI 응답을 파싱해서 메시지로 변환
                const aiMessages = parseMessageContent(data.result.response, "ASSISTANT");
                setMessages((prev) => [...prev, ...aiMessages]);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            // 에러 메시지 표시
            setMessages((prev) => [...prev, {
                id: crypto.randomUUID(),
                role: "narration",
                text: "메시지 전송에 실패했습니다. 다시 시도해주세요."
            }]);
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

    return (
        <div className="min-h-screen bg-white flex items-center justify-center pointer-events-auto">
            <div className="relative w-[375px] h-[896px] bg-[#141924] text-gray-200 flex flex-col overflow-hidden">

                <header className="absolute top-0 left-0 right-0 z-50 mt-[5px] w-[335px] h-[58px] px-[20px] flex items-center justify-between bg-[#141924]">
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
                                        <div className="max-w-[78%]">
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
                                        <div className="px-[10px] py-[6px] bg-[#6F4ACD] text-[#FFF] shadow rounded-[10px] rounded-tr-none">
                                            <div className="text-[14px] leading-[18px] whitespace-pre-wrap">{m.text}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full h-[44px] rounded-[30px] bg-[#222A39] text-[#FFF] placeholder:text-[#BFC6D4]/60 pl-4 pr-12 outline-none border-none"
                                    placeholder="&quot; &quot; 사이에 대사 지문을 넣어보세요"
                                    autoComplete="off"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className={[
                                        "absolute right-[3px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full flex items-center justify-center text-[#FFF]",
                                        input.trim() ? "bg-[#404D68]" : "bg-[#404D68] text-white/70 opacity-70 cursor-not-allowed",
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
        </div>
    );
};

export default ChatRoom;