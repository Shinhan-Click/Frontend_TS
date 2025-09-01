// src/pages/HomeToUserNote.tsx
import React from 'react';

/* ── 트렌딩 카드 ─────────────────────────── */
type TrendingCardProps = {
    rank: number;
    thumb: string;
    title: string;
    saves: number;   // 저장
    applies: number; // 적용
    tag: string;
    comments: { user: string; text: string; avatar: string }[];
};

const TrendingCard: React.FC<TrendingCardProps> = ({
    rank, thumb, title, saves, applies, tag, comments,
}) => {
    return (
        <div className="relative ml-[10px] bg-[#141924] p-2">
            {/* 랭크 배지 (카드 안쪽만 유지) */}
            <div className="absolute top-[5px] -left-2 w-[25px] h-[25px] px-1 rounded-[8px] bg-[#6F4ACD] text-[#FFF] text-xs font-bold flex items-center justify-center shadow-md">
                {rank}
            </div>

            {/* 상단: 썸네일 + 타이틀/메타 */}
            <div className="flex gap-[7px] ml-[10px] mb-[6px] bg-[#D9C8EF08]/90 rounded-[8px]">
                <img
                    src={thumb}
                    alt={title}
                    className="w-[64px] h-[64px] rounded-[8px] object-cover mt-[20px]"
                />
                <div className="min-w-0 flex-1 rounded-[8px]">
                    <p className="text-[15px] font-semibold text-[#FFF] truncate">{title}</p>
                    <p className="text-[12px] text-[#FFF]/70 mt-[2px]">
                        저장 {saves.toLocaleString()} · 적용 {applies.toLocaleString()}
                    </p>
                    <div className="mt-2">
                        <span className="inline-block px-[5px] py-[2px] mb-[5px] rounded-[6px] text-[11px] text-[#DFE1EA]/63 bg-[#363A4352]">
                            #{tag}
                        </span>
                    </div>
                </div>
            </div>

            {/* 댓글 미리보기 (2개) */}
            <div className="mt-2 flex flex-col gap-[6px]">
                {comments.slice(0, 2).map((c, i) => (
                    <div key={i} className="rounded-[8px] bg-[#283143] px-2 py-2 ml-[10px]">
                        <p className="text-[13px] text-[#FFF]/90 leading-[18px] line-clamp-2 break-words">
                            {c.text}
                        </p>
                        <div className="mt-2 flex items-center gap-[5px]">
                            <img
                                src={c.avatar}
                                alt={c.user}
                                className="w-[18px] h-[18px] ml-[5px] mb-[5px] rounded-full object-cover"
                            />
                            <span className="text-[11px] text-[#FFF]/70">
                                {c.user} <span className="opacity-70">적용후기</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ── 페이지 ──────────────────────────────────────────── */
const HomeToUserNote: React.FC = () => {
    // 데모 데이터 생성기 (각 랭크별 1장)
    const makeCard = (rank: number, seed: string, title: string): TrendingCardProps => ({
        rank,
        thumb: `https://picsum.photos/seed/${seed}/96/96`,
        title,
        saves: 1000 + Math.floor(Math.random() * 800),
        applies: 1500 + Math.floor(Math.random() * 1500),
        tag: ['출력규칙', '대화연결', '톤앤매너'][rank % 3],
        comments: [
            { user: '하윤', text: '현신 캐릭터였는데 집착적 성향이 강하게 나와서 놀람!', avatar: 'https://picsum.photos/seed/u1/40/40' },
            { user: '권이안', text: '부성애 수치 높게 찍힌 거 보고 더 의지하고 있음ㅜ', avatar: 'https://picsum.photos/seed/u2/40/40' },
        ],
    });

    const RANK_COLUMNS: Record<number, TrendingCardProps[]> = {
        1: [makeCard(1, 'npc-1a', 'NPC 감정분석지표')],
        2: [makeCard(2, 'npc-2a', '메모리 기반 반응 템플릿')],
        3: [makeCard(3, 'npc-3a', '상황별 톤 컨트롤')],
        4: [makeCard(4, 'npc-4a', '역할 고정 OOC 방지')],
    };

    return (
        <div className="htun-root h-screen bg-[#FFF] text-white overflow-hidden">
            {/* 스크롤 컨테이너 (모바일 375px 고정폭) */}
            <div className="mx-auto w-[375px] h-full overflow-y-auto no-scrollbar px-4 pb-10 bg-[#141924]">
                {/* ===== Section 1. 히어로/프로모 카드 ===== */}
                <section id="hero" className="pt-[5px] bg-[#141924]">
                    <header className="sr-only">히어로</header>
                    <div className="w-[345px] ml-[16px] rounded-[20px] bg-[#C663E7] border border-[#FFFFFF0D] shadow-[0_12px_30px_rgba(0,0,0,0.35)] h-[180px] flex items-center justify-center">
                        <span className="text-white/60 text-sm">[영역]</span>
                    </div>

                    <div className="mt-[10px] ml-[16px]">
                        <button
                            type="button"
                            className="w-[345px] h-[52px] rounded-[12px] bg-[#6F4ACD] border-none"
                        >
                            <span className="font-semibold">유저노트 바로 만들기</span>
                        </button>
                    </div>
                </section>

                <div className="h-6" />

                {/* ===== Section 2. 후기가 증명하는 인기 유저노트 ===== */}
                <section id="trending">
                    <div className="flex items-center justify-between mb-3 bg-[#141924]">
                        <h2 className="text-[17px] text-[#FFF] font-bold ml-[15px]">
                            후기가 증명하는 인기 유저노트
                        </h2>
                    </div>

                    {/* 가로 스크롤: 랭크 1~4, 각 컬럼 안에 카드들 세로 배치 */}
                    <div className="-mx-4 px-4 overflow-x-auto no-scrollbar bg-[#141924]">
                        <div className="flex gap-2 min-w-max">
                            {[1, 2, 3, 4].map((rank) => (
                                <div key={rank} className="w-[335px] flex-shrink-0">
                                    {/* ⛔️ 컬럼 상단의 별도 랭크 배지 제거 */}
                                    <div className="flex flex-col gap-2">
                                        {RANK_COLUMNS[rank].map((card, i) => (
                                            <TrendingCard key={`${rank}-${i}`} {...card} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* spacing */}
                <div className="h-6" />

                {/* ===== Section 3. 해시태그 추천 ===== */}
                <section id="hashtags">
                    <h2 className="text-[15px] font-bold mb-3 ">
                        더 만족스러운 채팅을 위한 <span className="text-[#8F7AE6]">#출력규칙</span>
                    </h2>

                    {/* 태그 칩 리스트 */}
                    <div className="flex flex-wrap gap-2">
                        {['로맨스', '판타지', '스릴러', 'OOC', '시스템', 'SF'].map((tag) => (
                            <button
                                key={tag}
                                className="px-3 h-8 rounded-lg bg-[#192131] border border-[#2A3244] text-sm text-white/80"
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </section>

                {/* spacing */}
                <div className="h-6" />

                {/* ===== Section 4. 합쳐서 더욱 새로운 유저노트 ===== */}
                <section id="combo">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[15px] font-bold">합쳐서 더욱 새로운 유저노트</h2>
                        <button className="text-[12px] text-white/70">더보기</button>
                    </div>

                    {/* 2열 그리드 */}
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="aspect-[4/3] rounded-xl bg-[#1A2130] border border-[#2A3244] flex items-center justify-center"
                            >
                                <span className="text-white/60 text-sm">[콤보 카드 {i}]</span>
                            </div>
                        ))}
                    </div>

                    {/* 섹션 하단 버튼 */}
                    <div className="mt-4">
                        <button className="w-full h-[42px] rounded-xl bg-[#222A39] text-white/90 border border-[#2A3244]">
                            유저노트 합쳐보기
                        </button>
                    </div>
                </section>

                {/* spacing */}
                <div className="h-6" />

                {/* ===== Section 5. 모든 유저 노트 ===== */}
                <section id="all-notes">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[15px] font-bold">모든 유저 노트</h2>
                        <div className="flex gap-2">
                            {['전체', 'OOC', '시스템', '순정', '판타지'].map((f, idx) => (
                                <button
                                    key={f}
                                    className={`px-3 h-8 rounded-lg border text-sm ${idx === 0
                                        ? 'bg-[#6F4ACD] border-[#6F4ACD]'
                                        : 'bg-[#192131] border-[#2A3244] text-white/80'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 세로 리스트 */}
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="h-[92px] rounded-xl bg-[#1A2130] border border-[#2A3244] flex items-center justify-center"
                            >
                                <span className="text-white/60 text-sm">[유저노트 리스트 아이템 {i}]</span>
                            </div>
                        ))}
                    </div>

                    {/* 리스트 하단 여백 */}
                    <div className="h-10" />
                </section>
            </div>
        </div>
    );
};

export default HomeToUserNote;
