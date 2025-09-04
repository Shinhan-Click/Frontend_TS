import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, MoreVerticalIcon } from "../components/icons";

const API_BASE = '/api';

interface Tag {
    tagId: number;
    name: string;
}

interface Introduction {
    introductionId: number;
    title: string;
    text: string;
}

interface CharacterData {
    characterId: number;
    characterImageUrl: string;
    name: string;
    gender: "FEMALE" | "MALE";
    description: string;
    characterIntro: string;
    introductions: Introduction[];
    tags: Tag[];
}

interface ApiResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: CharacterData;
}

const CharacterIntroduce: React.FC = () => {
    const navigate = useNavigate();
    const { characterId } = useParams<{ characterId: string }>();
    
    const [character, setCharacter] = useState<CharacterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCharacterData = async () => {
            if (!characterId) {
                setError('캐릭터 ID가 필요합니다.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`${API_BASE}/character/${characterId}`);
                
                if (!response.ok) {
                    throw new Error('캐릭터 데이터를 불러오는데 실패했습니다.');
                }

                const data: ApiResponse = await response.json();
                
                if (data.isSuccess && data.result) {
                    setCharacter(data.result);
                } else {
                    throw new Error(data.message || '캐릭터 데이터를 불러오는데 실패했습니다.');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchCharacterData();
    }, [characterId]);

    const comments = [
        { id: 1, badge: "BEST", name: "돌돌도", time: "· 1일 전", text: "우리 도혁이 없으면 누구랑 순애하냐.. 역시 돌고 돌아 도혁이다 돌돌도", likes: 298, replies: 57 },
        { id: 2, badge: "BEST", name: "하도돋독", time: "· 1일 전", text: "도혁이만한 댕댕이공이 없어요! 순애 좋아하시는 분은 도혁이 꼭 플레이하세요", likes: 58, replies: 13 },
        { id: 3, badge: "BEST", name: "상중하도혁", time: "· 2일 전", text: "나는 도혁이만 있으면 되고 도혁이만 사랑하고 도혁이뿐이야", likes: 23, replies: 0 },
    ];

    const related = {
        id: "rc1",
        name: "청하교등학교",
        img: "/청하고등학교.png",
        tags: ["#츤데레", "#상처서사"],
        desc: "푸른 여름, 학생일대만 느낄 수 있는 그 때의 분위기를...",
    };

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(1298);
    const handleLike = () => {
        if (liked) {
            setLikeCount((prev) => prev - 1);
        } else {
            setLikeCount((prev) => prev + 1);
        }
        setLiked(!liked);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
                <div className="w-[375px] h-[896px] bg-[#141924] text-white flex items-center justify-center">
                    <div className="text-[#FFF] text-[16px]">로딩 중...</div>
                </div>
            </div>
        );
    }

    if (error || !character) {
        return (
            <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
                <div className="w-[375px] h-[896px] bg-[#141924] text-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-[#FFF] text-[16px] mb-4">{error || '캐릭터를 찾을 수 없습니다.'}</div>
                        <button 
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-[#6F4ACD] text-[#FFF] rounded-[8px] border-none"
                        >
                            돌아가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
            <div className="w-[375px] h-[896px] bg-[#141924] text-white flex flex-col overflow-hidden">
                <header className="absolute top-0 left-0 right-0 z-20 h-[56px] mt-[30px] flex items-center justify-between px-3 bg-transparent">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="ml-[20px] border-none w-[40px] h-[40px] rounded-full bg-[#404D68] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm"
                        aria-label="뒤로가기"
                    >
                        <ArrowLeftIcon className="w-[24px] h-[24px] text-[#FFF]" />
                    </button>
                    <button
                        type="button"
                        aria-label="메뉴 설정"
                        className="w-[40px] h-[40px] border-none bg-[#404D68] rounded-full ml-[260px] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm"
                    >
                        <MoreVerticalIcon className="w-[24px] h-[24px] text-[#FFF]" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mr-[1px] pb-[96px]">
                    <section className="relative w-full h-[260px]">
                        <img
                            src={character.characterImageUrl}
                            alt="banner"
                            className="absolute inset-0 w-full h-[300px] object-cover"
                            style={{
                                backgroundPosition: '0px -1.455px',
                                backgroundSize: '100% 127.025%',
                                backgroundRepeat: 'no-repeat'
                            }}
                        />
                        <div 
                            className="absolute inset-0 w-full h-[300px]"
                            style={{
                                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, #141924 100%)'
                            }}
                        />
                    </section>

                    <section className="px-[8px] relative -mt-[90px] z-10">
                        <h1 className="text-[20px] font-[600] text-[#FFF] ml-[8px] leading-[1.4] tracking-[-0.24px]">                            {character.name}
                        </h1>
                        <div className="ml-[8px] -mt-[18px] text-[14px] text-[#FFF] font-normal leading-[142.9%] tracking-[0.203px]" style={{ fontFamily: 'Pretendard' }}>@highly05</div>
                        <div className="mt-[10px] flex items-center py-[4px] px-[6px] gap-[4.638px]">
                        {character.tags.map((tag) => (
                            <span
                                key={tag.tagId}
                                className="inline-flex items-center h-[24px] px-[5px] bg-[#454A55B8] rounded-[6px] text-[#DFE1EA]/61 text-[12px] font-medium mt-[-5px]"
                            >
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                    </section>

                    <section className="px-4 relative z-10 ">
                        <div
                            className="
                mt-[8px] ml-[15px] p-[5px] w-[334px] h-[72px] mt-[19px]
                rounded-[8px] bg-[#222A39]
                text-center
                flex items-center justify-between
                divide-x divide-[#FFFFFF4D]
              "
                        >
                            {[{ value: "19.6K", label: "대화량" }, { value: "1,298", label: "추천" }, { value: 391, label: "댓글" }].map(
                                (it) => (
                                    <div key={it.label} className="flex-1 flex flex-col items-center px-3 text-center">
                                        <div className="text-[14px] text-[#FFF] font-[600]">{it.value}</div>
                                        <div className="mt-[5px] text-[12px] text-[#F8F8FA]/61">{it.label}</div>
                                    </div>
                                )
                            )}
                        </div>
                    </section>

                    <section className="px-[20px] space-y-5 mt-[32px]">
                        <div>
                            <h2 className="text-[17px] text-[#FFF] font-semibold">캐릭터 소개</h2>
                            <p className="text-[16px] text-[#DFE1EA]/61 leading-[1.625] mt-[-3px]">
                                {character.characterIntro}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-[17px] text-[#FFF] font-semibold mt-[27px]">시작 상황</h2>
                            <p className="text-[16px] text-[#DFE1EA]/61 leading-[1.625] mt-[-3px]">
                                {character.introductions[0]?.text || '시작 상황이 없습니다.'}
                            </p>
                        </div>

                        <hr className="border-[#283143] mt-[10px]" />

                        <div className="mt-[12px] flex items-center justify-between">
                            <div className="flex items-start gap-[10px]">
                                <div className="w-[40px] h-[40px] rounded-full bg-[#222A39] flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-[14px] h-[15.077px]" fill="#404D68">
                                        <path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-3.33 0-10 1.667-10 5v3h20v-3c0-3.333-6.67-5-10-5z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col leading-tight">
                                {/* 우드홍 */}
                                <div className="text-[14px] text-[#F8F8FA] font-normal leading-[142.9%] tracking-[0.203px]">우드홍</div>
                                
                                {/* @woodhong */}
                                <div className="text-[12px] text-[#DFE1EA]/61 font-normal leading-[133.4%] tracking-[0.302px]">@woodhong</div>
                                
                                {/* 게시일 */}
                                <div className="mt-[8px] ml-[-50px] text-[12px] text-[#BEC1CB]/48 font-normal leading-[133.4%] tracking-[0.302px]">게시일 2025.08.20</div>
                            </div>
                            </div>
                            <button
                            type="button"
                            className="flex px-[10px] py-[6px] h-auto rounded-[6px] bg-[#6F4ACD] text-[#FFF] text-[12px] border-none justify-center items-center gap-[8px] mt-[-25px]"
                            >
                            팔로우
                            </button>
                        </div>
                    </section>

                    <hr className="border-[#222A39] border-[4px] mt-[30px]" />

                    <section className="px-[20px] mt-[10px]">
                        <h2 className="text-[17px] text-[#FFF] font-semibold mb-3 mt-[30px]">댓글 391</h2>

                        <div className="space-y-4">
                            {comments.map((c) => (
                                <div key={c.id} className="rounded-[12px] bg-[#141924] border-none p-[5px] ml-[-5px]">
                                    <div className="mt-[12px] flex items-center justify-between">
                                        <div className="flex items-start gap-[10px]">
                                            <div className="w-[40px] h-[40px] rounded-full bg-[#222A39] flex items-center justify-center flex-shrink-0">
                                                <svg viewBox="0 0 24 24" className="w-[14px] h-[15.077px]" fill="#404D68">
                                                    <path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-3.33 0-10 1.667-10 5v3h20v-3c0-3.333-6.67-5-10-5z" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-[10px]">
                                                    <span className="inline-flex items-center text-[#DFE1EA]/61 h-[22px] px-[4px] rounded-[6px] bg-[#6F4ACD] text-[12px] font-medium leading-[133.4%] tracking-[0.302px]">
                                                        {c.badge}
                                                    </span>
                                                    <span className="text-[12px] text-[#DFE1EA]/61 font-medium leading-[133.4%] tracking-[0.302px]">{c.name}</span>
                                                    <span className="text-[12px] text-[#DFE1EA]/61 font-normal leading-[133.4%] tracking-[0.302px]">{c.time}</span>
                                                </div>
                                                    <p className="mt-[6px] text-[14px] text-[#FFF] font-normal leading-[142.9%] tracking-[0.203px]">{c.text}</p>
                                            </div>
                                        </div>

                                        <button type="button" className="p-1 text-[#FFF]/70 bg-[#141924] border-none -mt-[55px]">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                <circle cx="12" cy="5" r="2" />
                                                <circle cx="12" cy="12" r="2" />
                                                <circle cx="12" cy="19" r="2" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="-mt-[5px] flex items-center gap-[10px] ml-[50px]">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-[5px] h-[28px] px-[10px] rounded-[6px] bg-[#9EBCFF2B] text-[#F8F8FA] text-[13px] font-pretendard font-normal tracking-[0.302px] leading-[133.4%] border-none"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M6.05935 14.7101V7.94216M2.98303 9.17269V13.4795C2.98303 14.1591 3.53396 14.7101 4.21356 14.7101H12.4743C13.3853 14.7101 14.1601 14.0454 14.2986 13.1449L14.9612 8.8381C15.1332 7.71999 14.2681 6.71164 13.1368 6.71164H10.9815C10.6417 6.71164 10.3662 6.43617 10.3662 6.09637V3.92193C10.3662 3.08403 9.68696 2.40479 8.84906 2.40479C8.64921 2.40479 8.4681 2.52248 8.38693 2.70511L6.22175 7.57678C6.123 7.79897 5.90266 7.94216 5.65951 7.94216H4.21356C3.53396 7.94216 2.98303 8.49309 2.98303 9.17269Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                            {c.likes}
                                        </button>
                                        <button
                                        type="button"
                                        className="inline-flex items-center gap-[5px] h-[28px] px-[10px] rounded-[6px] bg-[#9EBCFF2B] text-[#F8F8FA] text-[13px] font-pretendard font-normal tracking-[0.302px] leading-[133.4%] border-none"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                            <path d="M14.983 8.40479C14.983 11.7185 12.2967 14.4048 8.98303 14.4048C8.18494 14.4048 7.42323 14.249 6.72669 13.9661C6.59338 13.9119 6.52673 13.8849 6.47285 13.8728C6.42014 13.861 6.38113 13.8567 6.32712 13.8566C6.2719 13.8566 6.21176 13.8667 6.09147 13.8867L3.71954 14.282C3.47115 14.3234 3.34696 14.3441 3.25716 14.3056C3.17855 14.2719 3.11592 14.2093 3.08221 14.1307C3.04369 14.0409 3.06439 13.9167 3.10578 13.6683L3.5011 11.2964C3.52115 11.1761 3.53118 11.1159 3.53117 11.0607C3.53116 11.0067 3.52684 10.9677 3.51503 10.915C3.50295 10.8611 3.47588 10.7944 3.42174 10.6611C3.13886 9.96458 2.98303 9.20288 2.98303 8.40479C2.98303 5.09108 5.66932 2.40479 8.98303 2.40479C12.2967 2.40479 14.983 5.09108 14.983 8.40479Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
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

                    <section className="px-4 mt-5">
                        <h3 className="text-[17px] font-semibold mb-3 ml-[15px] text-[#FFF] mt-[20px]">관련 콘텐츠</h3>
                        <div className="flex gap-[5px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-[6px] -mr-[6px]">
                            <article
                                key={related.id}
                                className="w-[163px] ml-[15px] rounded-[12px] bg-[#141924] overflow-hidden flex-shrink-0"
                            >
                                <div className="h-[110px] self-stretch relative">
                                    <img 
                                        src={related.img} 
                                        alt={related.name} 
                                        className="absolute inset-0 w-full h-full object-cover rounded-[12px]" 
                                        style={{
                                            background: `url(${related.img}) lightgray 50% / cover no-repeat`
                                        }}
                                    />
                                </div>
                                <div className="p-3">
                                <h4 className="text-[16px] font-semibold text-[#FFF] mt-[11px]">{related.name}</h4>
                                <p className="mt-[-5px] text-[14px] text-[#DFE1EA]/61 line-clamp-3">{related.desc}</p>
                            
                                <div 
                                    className="inline-flex py-[4px] px-[6px] items-center gap-[4.638px] mt-[-20px] rounded-[6px] backdrop-blur-[2px]"
                                    style={{
                                        background: 'rgba(54, 58, 67, 0.32)'
                                    }}
                                >
                                    <span className="text-[#DFE1EA]/61 text-[12px] font-normal leading-[133.4%] tracking-[0.302px]">
                                        @whif_official
                                    </span>
                                </div>
                            </div>
                            </article>
                        </div>
                    </section>
                    <div className="h-6" />
                </main>

                <div className="sticky bottom-0 w-full">
                    <div className="bg-gradient-to-t from-[#141924] via-[#141924] to-transparent pt-3 pb-4">
                        <div className="w-[335px] mx-auto mb-[8px] flex items-center gap-[8px]">
                            <button
                                type="button"
                                onClick={handleLike}
                                className="flex flex-col items-center justify-center gap-1 h-[52px] w-[75px] rounded-[12px] bg-[#222A39] text-[#FFF] border-none"
                            >
                                <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                                    <path d="M6.05935 14.7101V7.94216M2.98303 9.17269V13.4795C2.98303 14.1591 3.53396 14.7101 4.21356 14.7101H12.4743C13.3853 14.7101 14.1601 14.0454 14.2986 13.1449L14.9612 8.8381C15.1332 7.71999 14.2681 6.71164 13.1368 6.71164H10.9815C10.6417 6.71164 10.3662 6.43617 10.3662 6.09637V3.92193C10.3662 3.08403 9.68696 2.40479 8.84906 2.40479C8.64921 2.40479 8.4681 2.52248 8.38693 2.70511L6.22175 7.57678C6.123 7.79897 5.90266 7.94216 5.65951 7.94216H4.21356C3.53396 7.94216 2.98303 8.49309 2.98303 9.17269Z" stroke={liked ? "#6F4ACD" : "white"} fill={liked ? "#6F4ACD" : "none"} strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="text-[12px]">{likeCount.toLocaleString()}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(`/ChatSetting?characterId=${characterId}`)}
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

export default CharacterIntroduce;