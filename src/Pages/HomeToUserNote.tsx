import React, { useState } from 'react';

type TrendingCardProps = {
    rank: number;
    thumb: string;
    title: string;
    saves: number;
    applies: number;
    tag: string;
    comments: { user: string; text: string; avatar: string }[];
};

const TrendingCard: React.FC<TrendingCardProps> = ({
    rank,
    thumb,
    title,
    saves,
    applies,
    tag,
    comments,
}) => {
    return (
        <div className="relative ml-[10px] bg-[#141924] p-2">
            <div className="absolute top-[5px] -left-2 w-[25px] h-[25px] px-1 rounded-[8px] bg-[#6F4ACD] text-[#FFF] text-xs font-bold flex items-center justify-center shadow-md">
                {rank}
            </div>

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

            <div className="mt-2 flex flex-col gap-[6px]">
                {comments.slice(0, 2).map((c, i) => (
                    <div key={i} className="rounded-[8px] bg-[#283143] px-2 py-2 ml-[10px]">
                        <p className="text-[13px] text-[#FFF]/90 ml-[8px] leading-[18px] line-clamp-2 break-words">
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

const HomeToUserNote: React.FC = () => {
    const makeCard = (rank: number, seed: string, title: string): TrendingCardProps => ({
        rank,
        thumb: `https://picsum.photos/seed/${seed}/96/96`,
        title,
        saves: 1000 + Math.floor(Math.random() * 800),
        applies: 1500 + Math.floor(Math.random() * 1500),
        tag: ['출력규칙', '대화연결', '톤앤매너'][rank % 3],
        comments: [
            {
                user: '하윤',
                text: '현신 캐릭터였는데 집착적 성향이 강하게 나와서 놀람!',
                avatar: 'https://picsum.photos/seed/u1/40/40',
            },
            {
                user: '권이안',
                text: '부성애 수치 높게 찍힌 거 보고 더 의지하고 있음ㅜ',
                avatar: 'https://picsum.photos/seed/u2/40/40',
            },
        ],
    });

    const RANK_COLUMNS: Record<number, TrendingCardProps[]> = {
        1: [makeCard(1, 'npc-1a', 'NPC 감정분석지표')],
        2: [makeCard(2, 'npc-2a', '메모리 기반 반응 템플릿')],
        3: [makeCard(3, 'npc-3a', '상황별 톤 컨트롤')],
        4: [makeCard(4, 'npc-4a', '역할 고정 OOC 방지')],
    };

    const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
    const RULE_CARDS = [
        {
            id: 1,
            title: '서사 쌓기용 규칙',
            desc:
                '로맨틱 코미디 톤 기반의 규칙 모음. 대화가 과장되거나 왜곡되지 않도록 균형을 맞추고, 감정선이 자연스럽게 이어지게 합니다.',
            saves: 598,
            applies: 1020,
        },
        {
            id: 2,
            title: '몰입도를 높여줄 1인칭 서술',
            desc:
                '주변 환경이나 인물들을 어떻게 인식하는지에 초점을 두고, 독자의 시점에서 현장감을 강화합니다.',
            saves: 126,
            applies: 89,
        },
        {
            id: 3,
            title: '감정 변화를 키워드로 요약',
            desc:
                '스토리 진행 상황과 감정선을 점검하는 규칙. 중요한 사건과 감정 키워드를 중심으로 간결하게 정리합니다.',
            saves: 91,
            applies: 234,
        },
    ];

    return (
        <div className="htun-root h-screen bg-[#FFF] text-white overflow-hidden">
            <div className="mx-auto w-[375px] h-full overflow-y-auto no-scrollbar px-4 pb-10 bg-[#141924]">
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

                <section id="trending">
                    <div className="flex items-center justify-between mb-3 bg-[#141924]">
                        <h2 className="text-[17px] text-[#FFF] font-bold ml-[15px]">
                            후기가 증명하는 인기 유저노트
                        </h2>
                    </div>

                    <div className="-mx-4 px-4 overflow-x-auto no-scrollbar bg-[#141924]">
                        <div className="flex gap-2 min-w-max">
                            {[1, 2, 3, 4].map((rank) => (
                                <div key={rank} className="w-[335px] flex-shrink-0">
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

                <div className="h-6" />

                <section id="hashtags">
                    <h2 className="text-[17px] text-[#FFF] font-bold mb-3 ml-[15px] mt-[25px] ">
                        더 만족스러운 채팅을 위한 <span className="text-[#8F7AE6]">#출력규칙</span>
                    </h2>

                    <div className="mx-[12px]">
                        {RULE_CARDS.map((r, idx) => {
                            const active = selectedRuleId === r.id;
                            return (
                                <React.Fragment key={r.id}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedRuleId((prev) => (prev === r.id ? null : r.id))
                                        }
                                        aria-pressed={active}
                                        className={[
                                            'w-full text-left text-[#FFF] px-4 py-3 bg-[#141924] border-none',
                                            active ? 'bg-[#283143]' : 'hover:bg-[#1A2130]',
                                        ].join(' ')}
                                    >
                                        <p className="text-[16px] font-semibold text-white">{r.title}</p>
                                        <p className="mt-[2px] text-[14px] text-[#DFE1EA]/61 leading-[18px] line-clamp-2">
                                            {r.desc}
                                        </p>
                                        <p className="mt-[6px] text-[12px] text-[#BEC1CB]/48">
                                            저장 {r.saves.toLocaleString()} · 적용 {r.applies.toLocaleString()}
                                        </p>
                                    </button>

                                    {idx < RULE_CARDS.length - 1 && (
                                        <div className="h-[1px] bg-[#2A3244] mx-4" aria-hidden />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </section>

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
