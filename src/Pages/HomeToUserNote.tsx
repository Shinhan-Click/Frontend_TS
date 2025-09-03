import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

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

type SimpleCombo = { id: number; img: string; title: string; handle: string };
const SimpleComboCard: React.FC<Omit<SimpleCombo, 'id'>> = ({ img, title }) => (
    <button
        type="button"
        className="relative block w-full aspect-[4/3] overflow-hidden bg-[#141924] border-none rounded-[12px]"
    >
        <img src={img} alt={title} className="w-full h-full object-cover" />
    </button>
);

type NoteListItemProps = {
    thumb: string;
    title: string;
    desc: string;
    handle: string;
};
const NoteListItem: React.FC<NoteListItemProps> = ({ thumb, title, desc, handle }) => (
    <button
        type="button"
        className="w-full text-left px-4 py-3 hover:bg-[#1A2130] transition-colors bg-[#141924] border-none -mt-[10px]"
    >
        <div className="flex gap-3">
            <img
                src={thumb}
                alt={title}
                className="w-[70px] h-[98px] rounded-[4px] object-cover bg-[#1F2636] flex-shrink-0 mt-[20px] ml-[10px]"
            />
            <div className="min-w-0 flex-1 ml-[15px]">
                <p className="text-[16px] font-bold text-[#FFF] truncate">{title}</p>
                <p className="text-[14px] leading-[18px] text-[#FFF]/60 line-clamp-2">{desc}</p>
                <span className="inline-block mt-[4px] px-2 py-[6px] rounded-[6px] bg-[#222A39] text-[12px] text-[#FFF]/80">
                    {handle.startsWith('@') ? handle : `@${handle}`}
                </span>
            </div>
        </div>
    </button>
);

const TopAppBar: React.FC<{ onSearch?: () => void }> = ({ onSearch }) => {
    const navigate = useNavigate();
    return (
        <div className="sticky top-0 z-40 bg-[#141924]/90 backdrop-blur supports-[backdrop-filter]:bg-[#141924]/70 border-b border-[#1f2636]">
            <div className="w-[375px] h-14 mx-auto px-4 flex items-center justify-between mb-[20px]">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="mt-[40px] ml-[30px] bg-transparent border-none"
                    >
                        <img
                            src="/위프 로고.png"
                            alt="위프 로고"
                            className="h-[20px] object-contain"
                        />
                    </button>
                </div>

                <button
                    type="button"
                    aria-label="검색"
                    onClick={onSearch}
                    className="mt-[40px] mr-[30px] p-2 rounded-full hover:bg-[#1A2130] transition-colors bg-[#141924] border-none"
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-300 text-[#DFE1EA]/50 border-none bg-[#141924]"
                    >
                        <path
                            d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm9 16-4.35-4.35"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const HomeToUserNote: React.FC = () => {
    const navigate = useNavigate();

    const makeCard = (rank: number, seed: string, title: string): TrendingCardProps => ({
        rank,
        thumb: `https://picsum.photos/seed/${seed}/96/96`,
        title,
        saves: 1000 + Math.floor(Math.random() * 800),
        applies: 1500 + Math.floor(Math.random() * 1500),
        tag: ['출력규칙', '대화연결', '톤앤매너'][rank % 3],
        comments: [
            { user: '하윤', text: '헌신 캐릭터였는데 집착적 성향이 강하게 나와서 놀람!', avatar: 'https://picsum.photos/seed/u1/40/40' },
            { user: '권이안', text: '부성애 수치 높게 찍힌 거 보고 더 의지하고 있음ㅜ', avatar: 'https://picsum.photos/seed/u2/40/40' },
        ],
    });

    const COMMENTS_BY_RANK: Record<number, { user: string; text: string; avatar: string }[]> = {
        1: [
            { user: '쏠SOL', text: '감정지표 세팅 후 캐릭터 반응이 안정적이에요.', avatar: 'https://picsum.photos/seed/r1a/40/40' },
            { user: '몰리', text: '분노 수치만 낮췄는데 대화가 훨씬 부드러워졌어요.', avatar: 'https://picsum.photos/seed/r1b/40/40' },
        ],
        2: [
            { user: '석우hong', text: '메모리 반영률이 좋아 맥락 유지력이 확실히 좋아졌어요.', avatar: 'https://picsum.photos/seed/r2a/40/40' },
            { user: '훈상박', text: '지난 회차에서 자연스럽게 이어가줘서 몰입이 올라감!.', avatar: 'https://picsum.photos/seed/r2b/40/40' },
        ],
        3: [
            { user: '라온', text: '상황 전환마다 톤이 과하지 않아 제일 좋았어요.', avatar: 'https://picsum.photos/seed/r3a/40/40' },
            { user: '은결', text: '감정 과장 없이 담백해서 대화가 깔끔합니다.', avatar: 'https://picsum.photos/seed/r3b/40/40' },
        ],
        4: [
            { user: '하람', text: 'OOC 방지 규칙 효과가 확실해서 일관성이 좋아요.', avatar: 'https://picsum.photos/seed/r4a/40/40' },
            { user: '주안', text: '설정 이탈이 줄어서 노트 재활용성이 높아졌습니다.', avatar: 'https://picsum.photos/seed/r4b/40/40' },
        ],
    };

    const RANK_COLUMNS: Record<number, TrendingCardProps[]> = {
        1: [{ ...makeCard(1, 'npc-1a', 'NPC 감정분석지표'), thumb: '/감정.png', comments: COMMENTS_BY_RANK[1] }],
        2: [{ ...makeCard(2, 'npc-2a', '메모리 기반 반응 템플릿'), thumb: '/메모리.png', comments: COMMENTS_BY_RANK[2] }],
        3: [{ ...makeCard(3, 'npc-3a', '상황별 톤 컨트롤'), comments: COMMENTS_BY_RANK[3] }],
        4: [{ ...makeCard(4, 'npc-4a', '역할 고정 OOC 방지'), comments: COMMENTS_BY_RANK[4] }],
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

    const COMBO_IMAGES: SimpleCombo[] = [
        { id: 1, img: '/마법이 있는 조선.png', title: '마법이 있는 조선', handle: 'lulurara' },
        { id: 2, img: '/신들의 BJ 데뷔전.png', title: '신들의 BJ 데뷔전', handle: 'godminsuuki' },
        { id: 3, img: '/좀비와의 연애.png', title: '좀비와의 연애', handle: 'ay1834' },
        { id: 4, img: '/판교에서 온 편지.png', title: '판교에서 온 편지', handle: 'ITMAN' },
    ];

    const goMerge = () => {
        navigate('/ChattingUserNote');
    };

    const FILTERS = ['전체', '출력규칙', '시스템', '세계관 확장', 'OOC', '퓨처노트', '기타'] as const;
    const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]>('전체');

    const NOTE_LIST = [
        {
            thumb: '/절대고수.png',
            title: '절대고수',
            desc:
                '현 무림은 정파,사파,마교로 삼분되어있고 그 어느곳에도 속하지 않은 정사지간의 고수들도 존재한다. 당신은 정파,마교,정사지간 중 세력을 선택해 ',
            handle: '@tico',
        },
        {
            thumb: '/수족관 소년들.png',
            title: '수족관 소년들',
            desc: '한때 인간의 잔혹한 탐욕에 유린당했던 수인들의 은밀한 안식처. 수인의 입양을 돕는 이곳..!!',
            handle: '@whif_official',
        },
        {
            thumb: '/무림생존기.png',
            title: '무림생존기',
            desc:
                '무림에서 일반인으로 살아남는 법! 규칙 없는 강호에서 살아남기 위한 전투와 계략, 생존의 기술...',
            handle: '@goldsu',
        },
    ];

    const handleSearch = () => {
        navigate('/search');
    };

    return (
        <div className="htun-root relative h-screen bg-[#FFF] text-white overflow-hidden">
            <div className="mx-auto w-[375px] h-full overflow-y-auto no-scrollbar px-4 pb-10 bg-[#141924]">
                <TopAppBar onSearch={handleSearch} />

                <section id="hero" className="pt-[5px] bg-[#141924]">
                    <header className="sr-only">히어로</header>
                    <div className="relative w-[345px] ml-[16px] mb-[15px] h-[365px] rounded-[20px] overflow-hidden border border-[#FFFFFF0D] shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                        <img
                            src="/유저노트.png"
                            alt="유저노트"
                            className="absolute inset-0 w-full h-[365px] object-cover"
                        />
                    </div>
                    <div className="mt-[10px] ml-[16px]">
                        <button type="button" className="w-[345px] h-[52px] rounded-[12px] bg-[#6F4ACD] border-none">
                            <span className="font-semibold text-[#FFF]">도혁이를 바꾼 유저노트 보러가기</span>
                        </button>
                    </div>
                </section>

                <div className="h-6" />

                <section id="trending">
                    <div className="flex items-center justify-between mb-3 bg-[#141924]">
                        <h2 className="text-[17px] text-[#FFF] font-bold ml-[15px]">후기가 증명하는 인기 유저노트</h2>
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
                                        onClick={() => setSelectedRuleId((prev) => (prev === r.id ? null : r.id))}
                                        aria-pressed={active}
                                        className={[
                                            'w-full text-left text-[#FFF] px-4 py-3 bg-[#141924] border-none',
                                            active ? 'bg-[#283143]' : 'hover:bg-[#1A2130]',
                                        ].join(' ')}
                                    >
                                        <p className="text-[16px] font-semibold text-white">{r.title}</p>
                                        <p className="mt-[2px] text-[14px] text-[#DFE1EA]/61 leading-[18px] line-clamp-2">{r.desc}</p>
                                        <p className="mt-[6px] text-[12px] text-[#BEC1CB]/48">
                                            저장 {r.saves.toLocaleString()} · 적용 {r.applies.toLocaleString()}
                                        </p>
                                    </button>
                                    {idx < RULE_CARDS.length - 1 && <div className="h-[1px] bg-[#2A3244] mx-4" aria-hidden />}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </section>

                <div className="h-6" />

                <section id="combo">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[17px] text-[#FFF] ml-[15px] font-bold">합쳐서 더욱 새로운 유저노트</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-[10px] px-[12px]">
                        {COMBO_IMAGES.map(({ id, img, title, handle }) => (
                            <SimpleComboCard key={id} img={img} title={title} handle={handle} />
                        ))}
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={goMerge}
                            className="w-[335px] h-[42px] ml-[20px] mt-[12px] rounded-[8px] bg-[#141924] text-[#FFF] border border-[#283143]
              transition-colors active:scale-[0.99]
              duration-150 hover:bg-[#1A2130] active:bg-[#0F1420] focus:outline-none focus:ring-2 focus:ring-[#6F4ACD]/40"
                        >
                            유저노트 병합하기
                        </button>
                    </div>
                </section>

                <div className="h-[8px] w-full bg-[#2A3244] mt-[20px]" aria-hidden />
                <div className="h-6" />

                <section id="all-notes">
                    <div className="flex items-center justify-between mb-3 mt-[15px]">
                        <h2 className="text-[17px] text-[#FFF] ml-[15px] font-bold">모든 유저 노트</h2>
                    </div>

                    <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
                        <div className="flex gap-[6px] min-w-max pl-[12px] pb-2 mb-[10px]">
                            {(['전체', '출력규칙', '시스템', '세계관 확장', 'OOC', '퓨처노트', '기타'] as const).map((f) => {
                                const active = activeFilter === f;
                                return (
                                    <button
                                        key={f}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => setActiveFilter(f)}
                                        className={[
                                            'whitespace-nowrap px-4 h-9 rounded-full border text-[14px] transition-colors',
                                            active ? 'bg-[#6F4ACD] border-[#6F4ACD] text-[#FFF]' : 'bg-transparent border-[#404E6A] text-[#FFF]/80 hover:bg-[#1A2130]',
                                        ].join(' ')}
                                    >
                                        {f}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-4 mb-[15px]">
                        <span className="text-[12px] text-[#FFF]/80 ml-[20px]">총 817 개</span>
                        <button className="text-[12px] text-[#FFF]/60 mr-[15px] inline-flex items-center gap-1 border-none bg-[#141924]">
                            저장순 <span className="text-[10px] ml-[5px]">▼</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-[4px]">
                        {NOTE_LIST.map((n, idx) => (
                            <NoteListItem key={`${n.title}-${idx}`} thumb={n.thumb} title={n.title} desc={n.desc} handle={n.handle} />
                        ))}
                    </div>

                    <div className="h-10" />
                </section>
            </div>

            <NavBar />
        </div>
    );
};

export default HomeToUserNote;
