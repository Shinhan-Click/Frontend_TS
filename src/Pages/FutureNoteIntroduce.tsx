import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, MoreVerticalIcon } from "../components/icons";
import { BiLike } from "react-icons/bi";
import FutureNoteBottomSheet from "./FutureNoteBottomSheetProps"; // 바텀시트 import

const API_BASE = "/api";

const Collapsible: React.FC<{ open: boolean; className?: string; children: React.ReactNode }> = ({
    open,
    className = "",
    children,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [maxH, setMaxH] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = () => setMaxH(open ? el.scrollHeight : 0);
        update();

        let ro: ResizeObserver | null = null;
        if (open) {
            ro = new ResizeObserver(update);
            ro.observe(el);
        }
        return () => ro?.disconnect();
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

type Tag = { tagId: number; name: string };
type FutureNoteDTO = {
    futureNoteId: number;
    futureNoteImageUrl: string | null;
    title: string;
    tags: Tag[];
    turnCount: number;
    mileStoneCount: number;
    endingCount: number;
    storySummary: string;
    description: string;
    exampleImageUrls: string[];
    authorProfileImageUrl: string | null;
    authorNickname: string;
    postDate: string; // "YYYY-MM-DD"
};

type ApiResponse<T> = {
    isSuccess: boolean;
    code: string;
    message: string;
    result: T;
};

const formatDateDot = (iso: string | null | undefined) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
};

const FutureNoteIntroduce: React.FC = () => {
    const navigate = useNavigate();
    const { futureNoteId } = useParams<{ futureNoteId: string }>();
    const [openExample, setOpenExample] = useState(true);

    // API 상태
    const [data, setData] = useState<FutureNoteDTO | null>(null);
    const [loading, setLoading] = useState(false);

    // 바텀시트 상태 추가
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        if (!futureNoteId) return;
        const ac = new AbortController();
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/futurenote/${futureNoteId}`, {
                    method: "GET",
                    headers: { accept: "*/*" },
                    signal: ac.signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json: ApiResponse<FutureNoteDTO> = await res.json();
                if (!json.isSuccess || !json.result) throw new Error(json.message || "API 실패");
                setData(json.result);
            } catch (e: any) {
                if (e?.name !== "AbortError") {
                    console.error("데이터 로딩 실패:", e?.message || "요청 실패");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        return () => ac.abort();
    }, [futureNoteId]);

    // 데모(그대로 유지)
    const recs = [
        {
            id: 1,
            title: "역할 반전 OOC",
            author: "woof",
            thumb: "/역할 반전.png",
            desc: "NPC와 PC의 상황과 역할, 직업을 반전시켜 도입부를 색다르게!",
            tags: ["#OOC"],
        },
        {
            id: 2,
            title: "1인칭 서술",
            author: "user_m",
            thumb: "/1인칭.png",
            desc: "주변 환경이나 인물들을 어떻게 인식하는지에 초점을 맞춰보자.",
            tags: ["#출력규칙"],
        },
        {
            id: 3,
            title: "NPC 팩",
            author: "nova",
            thumb: "/layers-two.png",
            desc: "위주 장면을 채워줄 단역 NPC 세트.",
            tags: ["#출현도구"],
        },
    ];

    const comments = [
        { id: 1, badge: "BEST", name: "하이도혁", time: "3일 전", text: "바로 적용해보러 갑니다.", likes: 5, replies: 1 },
        { id: 2, badge: "BEST", name: "유저 닉네임", time: "1일 전", text: "이거 진짜 재밌음 ㅋㅋㅋ", likes: 10, replies: 0 },
        {
            id: 3,
            badge: "BEST",
            name: "필평",
            time: "5일 전",
            text: "맛있네요 이거. 다음 작품도 기대하고 있습니다. 빨리 내주세요. 헌기증나요.",
            likes: 2,
            replies: 3,
        },
    ];

    const popularChars = [
        {
            id: "c1",
            name: "이하민",
            img: "/이하민.png",
            tags: ["#집착공", "#연하공"],
            desc:
                "이하민은 부잣집에 막내 도련님. 한없이 다정하지만 마음속에선 소유욕이 꿈틀거린다. 당신만을 바라보는 눈빛...",
            likes: 1298,
        },
        {
            id: "c2",
            name: "류겸",
            img: "/류겸.png",
            tags: ["#능글공", "#무심공"],
            desc: "처음에는 음악을 사랑하는 사람. 그러나 당신 앞에서는 장난스럽고 집요하다. 무심한 듯 챙겨주는 달인.",
            likes: 1298,
        },
        {
            id: "c3",
            name: "서휼",
            img: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop",
            tags: ["#냉미남", "#운동선수"],
            desc: "차갑지만 속은 따뜻한 포워드. 승부욕 강하고 보호본능 강한 타입. 말보다 행동으로 증명한다.",
            likes: 1298,
        },
    ];

    return (
        <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
            <div className="w-[375px] h-[896px] bg-[#141924] text-white flex flex-col overflow-hidden">
                <header className="w-full h-[56px] flex items-center justify-between px-3 bg-[#141924] border-b border-[#222A39]">
                    <button
                        type="button"
                        onClick={() => navigate("/FutureNotePost")}
                        className="ml-[10px] border-none w-10 h-10 bg-[#141924] flex items-center justify-center"
                        aria-label="뒤로가기"
                    >
                        <ArrowLeftIcon className="w-[24px] h-[24px] text-[#FFF]" />
                    </button>
                    <button
                        type="button"
                        aria-label="메뉴 설정"
                        className="w-10 h-10 border-none bg-[#141924] mr-[10px]"
                    >
                        <MoreVerticalIcon className="w-[22px] h-[22px] text-[#FFF]" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mr-[1px] pb-[96px]">
                    {/* 배너 */}
                    <section className="relative w-full h-[260px]">
                        <img
                            src={
                                data?.futureNoteImageUrl ||
                                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1500&auto=format&fit=crop"
                            }
                            alt="banner"
                            className="absolute inset-0 w-full h-full object-cover blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#141924]/40 via-[#141924]/35 to-[#141924]" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#141924]" />
                    </section>

                    {/* 제목/태그/지표 */}
                    <section className="px-[8px] relative -mt-[140px] z-10">
                        <h1 className="text-[20px] font-[500] text-[#FFF] ml-[8px]">
                            {loading && !data ? " " : (data?.title || "축제의 불빛 아래")}
                        </h1>

                        <div className="-mt-[8px] flex items-center">
                            {(data?.tags?.length ? data.tags.map(t => `#${t.name}`) : ["#대화출력", "#저장기능향상"]).map((t) => (
                                <span
                                    key={t}
                                    className="inline-flex items-center h-[24px] px-[5px] bg-[#454A55B8] ml-[8px] rounded-[6px] text-[#DFE1EA]/61 text-[12px] font-medium"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>

                        <div className="mt-[5px] ml-[10px] flex items-center gap-[6px] text-[12px] text-[#DFE1EA]/61">
                            <span className="inline-flex items-center gap-1">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M12.1 8.64l-.1.1-.1-.1C10.14 6.7 7.1 6.7 5.15 8.64c-1.95 1.95-1.95 5.1 0 7.05l.1.1L12 22l6.75-6.2.1-.1c1.95-1.95 1.95-5.1 0-7.05-1.95-1.94-4.99-1.94-6.95 0Z"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        fill="currentColor"
                                        className="text-white/90"
                                    />
                                </svg>
                                1,298
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" />
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                                </svg>
                                19.6K
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M21 15a3 3 0 0 1-3 3H9l-4 4v-4H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9Z"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                    />
                                </svg>
                                391
                            </span>
                        </div>
                    </section>

                    {/* 턴/마일스톤/엔딩 */}
                    <section className="px-4 relative z-10">
                        <div
                            className="
      mt-[8px] ml-[15px] p-[5px] w-[334px]
      rounded-[8px] bg-[#222A39]
      text-center py-3
      flex items-stretch justify-between
      divide-x divide-[#FFFFFF4D]
    "
                        >
                            {[
                                { value: data?.turnCount ?? 50, label: "턴" },
                                { value: data?.mileStoneCount ?? 4, label: "마일스톤" },
                                { value: data?.endingCount ?? 3, label: "엔딩" },
                            ].map((it) => (
                                <div key={it.label} className="flex-1 flex flex-col items-center px-3">
                                    <div className="text-[14px] text-[#FFF] font-[600]">{it.value}</div>
                                    <div className="mt-[2px] text-[12px] text-[#DFE1EA]/61">{it.label}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 요약/소개글 */}
                    <section className="px-[20px] space-y-5 mt-5">
                        <div>
                            <h2 className="text-[17px] text-[#FFF] font-semibold mb-2">스토리 요약</h2>
                            <p className="text-[16px] text-[#FFF]/90 leading-[22px]">
                                {data?.storySummary || "축제를 준비하며 시작된 미묘한 감정선. 때로는 갈등, 때로는 고백으로 이어지는 이야기. 선택에 따라 행복, 이별, 혹은 열린 결말이 펼쳐집니다."}
                            </p>
                        </div>
                        <hr className="border-[#DFE1EA]/20" />
                        <div>
                            <h2 className="text-[17px] text-[#FFF] font-semibold">소개글</h2>
                            <p className="text-[16px] text-[#DFE1EA]/61 leading-[22px]">
                                {data?.description || "이번엔 좀 재미있는 스토리를 잡아서 플레이하면 좋겠다는 생각이 들어서 만들어봤어요. ㅋㅋ 재밌게 한번 해보셈"}
                            </p>
                        </div>
                    </section>

                    {/* 적용 예시 */}
                    <section className="px-4 mt-[10px] text-[#FFF]">
                        <button
                            type="button"
                            onClick={() => setOpenExample((v) => !v)}
                            className="w-full flex items-center justify-between px-[20px] py-[20px] rounded-[10px] bg-[#0F1521] border-none"
                        >
                            <span className="text-[17px] text-[#FFF] font-semibold">적용 예시</span>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                className={`transition-transform ${openExample ? "rotate-180" : ""}`}
                                fill="none"
                            >
                                <path d="M6 9l6 6 6-6" stroke="#C9D0E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <Collapsible open={openExample} className="mt-[8px]">
                            <div className="w-[325px] ml-[8px] rounded-[20px] bg-[#141C2A] border border-[#2A3244] px-[16px] py-[14px] text-[#DFE1EA]">
                                {data?.exampleImageUrls?.length ? (
                                    <div className="flex gap-[8px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mr-[4px] pr-[4px]">
                                        {data.exampleImageUrls.map((url, idx) => (
                                            <div key={idx} className="w-[280px] h-[160px] rounded-[12px] bg-[#141924] relative flex-shrink-0">
                                                <img src={url} alt={`example-${idx}`} className="absolute inset-0 w-full h-full object-cover rounded-[12px]" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-full flex justify-center">
                                            <span className="px-[10px] py-[8px] rounded-[12px] ml-[155px] bg-[#6F4ACD] text-[#FFF] text-[11px] font-semibold">
                                                풍운지기, 내 손끝에 모여라...
                                            </span>
                                        </div>
                                        <p className="mt-[14px] text-[11px] leading-[22px] text-[#DFE1EA]/61">
                                            주이한은 삐죽 나온 앞머리를 대충 쓸어 넘기며 담벼락에 기대 채 서서 지켜보고 있었다...
                                        </p>
                                        <div className="mt-[14px] flex gap-[8px] items-start">
                                            <div className="w-[28px] h-[28px] rounded-full bg-[#232B3D] overflow-hidden" />
                                            <div className="flex-1">
                                                <div className="text-[11px] text-[#FFF] mb-[6px]">주이한</div>
                                                <div className="rounded-[10px] bg-[#DFE1EA]/10 border border-[#2A3244] p-[10px] text-[11px] text-[#DFE1EA]/90">
                                                    보아하니, 기운을 부르는 법은 아는 모양이오...
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-[10px] flex justify-center items-center gap-[6px]">
                                            <span className="w-[6px] h-[6px] rounded-full bg-[#475066]" />
                                            <span className="w-[32px] h-[6px] rounded-full bg-[#6F4ACD]" />
                                            <span className="w-[6px] h-[6px] rounded-full bg-[#475066]" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </Collapsible>
                    </section>

                    {/* 작가 추천 유저노트(데모 유지) */}
                    <section className="px-4 mt-[8px]">
                        <div className="rounded-[10px] bg-[#141924] p-[20px] space-y-4">
                            <h3 className="text-[17px] text-[#FFF] font-semibold">
                                작가가 추천한 <span className="font-semibold text-[#B093F9]">함께 사용하면 좋은 유저노트</span>
                            </h3>

                            <div className="flex gap-[6px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mr-[4px] pr-[4px]">
                                {recs.map((r) => (
                                    <article key={r.id} className="w-[152px] rounded-[12px] bg-[#141924] overflow-hidden flex-shrink-0">
                                        <div className="w=[152px] h-[110px] bg-[#141924] relative">
                                            <img src={r.thumb} alt={r.title} className="absolute inset-0 w-full h-full rounded-[12px] object-cover" />
                                        </div>
                                        <div className="p-[6px]">
                                            <h4 className="text-[16px] text-[#FFF] font-semibold line-clamp-1 -mt-[1px]">{r.title}</h4>
                                            <p className="text-[14px] text-[#DFE1EA]/61 line-clamp-2 -mt-[8px]">{r.desc}</p>

                                            <div className="-mt-[3px] flex gap-[2px]">
                                                {r.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="inline-flex items-center text-[#DFE1EA]/61 h-[22px] px-[8px] rounded-[6px] bg-[#363A4352] text-[11px]"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <div className="mt-[10px] border-t border-[#2A3244] pt-[8px]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-[6px]">
                                        <div className="w-[24px] h-[24px] rounded-full bg-[#232B3D] flex items-center justify-center">
                                            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="#fff">
                                                <path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-3.33 0-10 1.667-10 5v3h20v-3c0-3.333-6.67-5-10-5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-[14px] text-[#FFF] font-semibold">{data?.authorNickname || "장원영"}</div>
                                            <div className="text-[12px] text-[#DFE1EA]/61 opacity-90">@One0jang</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="h-[32px] px-[8px] text-[#FFF] rounded-[6px] bg-[#6F4ACD] text-[12px] font-semibold border-none"
                                    >
                                        팔로우
                                    </button>
                                </div>

                                <div className="mt-[8px] text-[12px] text-[#FFF] opacity-90">
                                    게시일 {data?.postDate ? formatDateDot(data.postDate) : "2025.08.20"}
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-[#222A39] mt-5" />

                    {/* 댓글(데모 유지) */}
                    <section className="px-[20px] mt-[10px]">
                        <h2 className="text-[17px] text-[#FFF] font-semibold mb-3">댓글 245</h2>

                        <div className="space-y-4">
                            {comments.map((c) => (
                                <div key={c.id} className="rounded-[10px] bg-[#141924] border-none p-[5px]">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-[4px]">
                                            <div className="w-[24px] h-[24px] rounded-full bg-[#232B3D] flex items-center justify-center mb-[30px]">
                                                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="#fff">
                                                    <path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-3.33 0-10 1.667-10 5v3h20v-3c0-3.333-6.67-5-10-5z" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col mt-[10px]">
                                                <div className="flex items-center gap-[4px]">
                                                    <span className="inline-flex items-center text-[#DFE1EA]/61 h-[22px] px-[4px] rounded-[6px] bg-[#6F4ACD] text-[10px] font-bold">
                                                        {c.badge}
                                                    </span>
                                                    <span className="text-[13px] text-[#FFF]/90">{c.name}</span>
                                                    <span className="text-[12px] text-[#FFF]/50">{c.time}</span>
                                                </div>
                                                <p className="mt-[6px] text-[14px] text-[#FFF]/95">{c.text}</p>
                                            </div>
                                        </div>

                                        <button type="button" className="p-1 text-[#FFF]/70 bg-[#141924] border-none">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                <circle cx="12" cy="5" r="2" />
                                                <circle cx="12" cy="12" r="2" />
                                                <circle cx="12" cy="19" r="2" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="-mt-[5px] flex items-center gap-[4px] ml-[25px]">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-[2px] h-[22px] px-[6px] rounded-[8px] bg-[#9EBCFF2B] text-[#FFF]/90 text-[13px] border-none"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path
                                                    d="M14 9V5a3 3 0 0 0-3-3l-1 6H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h8l5-7V9h-4Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.6"
                                                />
                                            </svg>
                                            {c.likes}
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-[2px] h-[22px] px-[6px] rounded-[8px] bg-[#9EBCFF2B] text-[#FFF]/90 text-[13px] border-none"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path
                                                    d="M21 15a3 3 0 0 1-3 3H9l-4 4v-4H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.6"
                                                />
                                            </svg>
                                            {c.replies}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="w-[335px] h-[40px] mt-[12px] rounded-[8px] bg-transparent border border-[#283143] text-[14px] text-[#FFF]"
                        >
                            전체 보기
                        </button>
                    </section>

                    {/* 인기 캐릭터(데모 유지) */}
                    <section className="px-4 mt-5">
                        <h3 className="text-[17px] font-semibold mb-3 ml-[15px] text-[#FFF]">사용자들이 많이 적용한 캐릭터</h3>

                        <div className="flex gap-[5px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-[6px] -mr-[6px]">
                            {popularChars.map((c) => (
                                <article
                                    key={c.id}
                                    className="w-[163px] ml-[15px] rounded-[12px] bg-[#141924] overflow-hidden flex-shrink-0"
                                >
                                    <div className="h-[148px] relative">
                                        <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover rounded-[12px]" />
                                    </div>
                                    <div className="p-3">
                                        <h4 className="text-[16px] font-semibold text-[#FFF] ">{c.name}</h4>
                                        <div className="flex flex-wrap gap-[5px] -mt-[10px]">
                                            {c.tags.map((t) => (
                                                <span
                                                    key={t}
                                                    className="inline-flex h-[22px] text-[#FFF] items-center px-[5px] rounded bg-[#454A55B8]/73 text-[12px] rounded-[6px]"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="mt-2 text-[14px] text-[#DFE1EA]/61 line-clamp-3">{c.desc}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <div className="h-6" />
                </main>

                {/* 바텀시트 */}
                <FutureNoteBottomSheet
                    open={sheetOpen}
                    onClose={() => setSheetOpen(false)}
                    futureNoteId={futureNoteId}
                />

                {/* 하단 고정 버튼(바텀시트 연결) */}
                <div className="sticky bottom-0 w-full">
                    <div className="bg-gradient-to-t from-[#141924] via-[#141924] to-transparent pt-3 pb-4">
                        <div className="w-[335px] mx-auto mb-[8px] flex items-center gap-[8px]">
                            <button
                                type="button"
                                className="flex flex-col items-center justify-center gap-1 h-[52px] w-[75px] rounded-[12px] bg-[#222A39] text-[#FFF] border-none"
                            >
                                <BiLike size={24} />
                                <span className="text-[12px]">1,298</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSheetOpen(true)}
                                className="flex-1 h-[52px] rounded-[12px] bg-[#6F4ACD] text-[#FFF] text-[16px] font-semibold border-none"
                            >
                                적용하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FutureNoteIntroduce;