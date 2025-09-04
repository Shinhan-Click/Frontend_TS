import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, MoreVerticalIcon } from "../components/icons";
import { BiLike, BiSolidLike } from "react-icons/bi";

const CharacterIntroduce: React.FC = () => {
    const navigate = useNavigate();

    const character = {
        title: "하도혁",
        banner: "./하도혁.png",
        tags: ["#댕댕이공", "#짝사랑공", "#다정공"],
        characterIntro:
            "18세 남자, 185의 큰 키. 흑발에 연갈색 눈, 얼핏보면 날카로운 눈매로 차갑게 느껴지기도 한다. 그렇지만 잘생긴 외모와 다정한 성격으로 여자는 물론 남자에게도 인기가 많다. 다른 친구들에게는 늘긍글맞게 대하며 사람을 다루는 법을 아는 것 처럼 보이지만, 당신 앞에서만큼은 매번 우물쭈물하며 얼굴을 붉힌다.",
        startSituation:
            "요즘따라 유독 네 생각이 더 자주 든다. 가까이 다가서고 싶지만 쉽사리 따라주지 않는 내 몸이 야속하다. 네 앞에만 서면 근엄버리고 무슨 말을 해야 할지 도저히 모르겠다. 이런 날 애써 감추며 평소와 같은 일상 생활을 보내고 있었다. 그런 내 앞에, 네가 나타났다.",
    };

    const comments = [
        { id: 1, badge: "BEST", name: "돌돌도", time: "1일 전", text: "우리 도혁이 없으면 누구랑 순애하냐.. 역시 돌고 돌아 도혁이다 돌돌도", likes: 298, replies: 57 },
        { id: 2, badge: "BEST", name: "하도돋독", time: "1일 전", text: "도혁이만한 댕댕이공이 없어요! 순애 좋아하시는 분은 도혁이 꼭 플레이하세요", likes: 58, replies: 13 },
        { id: 3, badge: "BEST", name: "상중하도혁", time: "2일 전", text: "나는 도혁이만 있으면 되고 도혁이만 사랑하고 도혁이뿐이야", likes: 23, replies: 0 },
    ];

    const related = {
        id: "rc1",
        name: "청하교등학교",
        img: "/청하고등학교.png",
        tags: ["#츤데레", "#상처서사"],
        desc: "푸른 여름, 학생일대만 느낄 수 있는 그 때의 분위기를...",
    };

    const [liked, setLiked] = React.useState(false);
    const [likeCount, setLikeCount] = React.useState(1298);
    const handleLike = () => {
        if (liked) {
            setLikeCount((prev) => prev - 1);
        } else {
            setLikeCount((prev) => prev + 1);
        }
        setLiked(!liked);
    };


    return (
        <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
            <div className="w-[375px] h-[896px] bg-[#141924] text-white flex flex-col overflow-hidden">
                <header className="absolute top-0 left-0 right-0 z-20 h-[56px] flex items-center justify-between px-3 bg-transparent">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="ml-[20px] border-none w-[34px] h-[34px] rounded-full bg-[#404D68] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm"
                        aria-label="뒤로가기"
                    >
                        <ArrowLeftIcon className="w-[24px] h-[24px] text-[#FFF]" />
                    </button>
                    <button
                        type="button"
                        aria-label="메뉴 설정"
                        className="w-[34px] h-[34px] border-none bg-[#404D68] rounded-full ml-[260px] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm"
                    >
                        <MoreVerticalIcon className="w-[24px] h-[24px] text-[#FFF]" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mr-[1px] pb-[96px]">
                    <section className="relative w-full h-[260px]">
                        <img
                            src={character.banner}
                            alt="banner"
                            className="absolute inset-0 w-full h-[300px] object-cover"
                            style={{
                                WebkitMaskImage:
                                    "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
                                maskImage:
                                    "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
                            }}
                        />
                    </section>

                    <section className="px-[8px] relative -mt-[90px] z-10">
                        <h1 className="text-[20px] font-[500] text-[#FFF] ml-[8px]">
                            {character.title}
                        </h1>
                        <div className="ml-[8px] -mt-[18px] text-[13px] text-[#DFE1EA]/80">@highly05</div>

                        <div className="mt-[10px] flex items-center">
                            {(character.tags.length ? character.tags : ["#캐릭터", "#로맨스"]).map((t) => (
                                <span
                                    key={t}
                                    className="inline-flex items-center h-[24px] px-[5px] bg-[#454A55B8] ml-[8px] rounded-[6px] text-[#DFE1EA]/61 text-[12px] font-medium"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </section>

                    <section className="px-4 relative z-10 ">
                        <div
                            className="
                mt-[8px] ml-[15px] p-[5px] w-[334px]
                rounded-[8px] bg-[#222A39]
                text-center py-3
                flex items-stretch justify-between
                divide-x divide-[#FFFFFF4D]
              "
                        >
                            {[{ value: 7845, label: "대화량" }, { value: 798, label: "추천" }, { value: 391, label: "댓글" }].map(
                                (it) => (
                                    <div key={it.label} className="flex-1 flex flex-col items-center px-3">
                                        <div className="text-[14px] text-[#FFF] font-[600]">{it.value}</div>
                                        <div className="mt-[2px] text-[12px] text-[#DFE1EA]/61">{it.label}</div>
                                    </div>
                                )
                            )}
                        </div>
                    </section>

                    <section className="px-[20px] space-y-5 mt-[25px]">
                        <div>
                            <h2 className="text-[17px] text-[#FFF] font-semibold">캐릭터 소개</h2>
                            <p className="text-[16px] text-[#DFE1EA]/61 leading-[22px]">
                                {character.characterIntro}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-[17px] text-[#FFF] font-semibold">시작 상황</h2>
                            <p className="text-[16px] text-[#DFE1EA]/61 leading-[22px]">
                                {character.startSituation}
                            </p>
                        </div>

                        <hr className="border-[#283143] mt-[10px]" />

                        <div className="mt-[12px] flex items-center justify-between">
                            <div className="flex items-start gap-[10px]">
                                <div className="w-[36px] h-[36px] rounded-full bg-[#232B3D] flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="#fff">
                                        <path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-3.33 0-10 1.667-10 5v3h20v-3c0-3.333-6.67-5-10-5z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <div className="text-[15px] text-[#FFF]">우드홍</div>
                                    <div className="text-[13px] text-[#DFE1EA]/70">@woodhong</div>
                                    <div className="mt-[8px] text-[13px] text-[#DFE1EA]/70">게시일 2025.08.20</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="px-[12px] h-[30px] rounded-[10px] bg-[#6F4ACD] text-[#FFF] text-[13px] border-none"
                            >
                                팔로우
                            </button>
                        </div>
                    </section>

                    <hr className="border-[#222A39] border-[4px] mt-5" />

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

                    <section className="px-4 mt-5">
                        <h3 className="text-[17px] font-semibold mb-3 ml-[15px] text-[#FFF]">관련 콘텐츠</h3>
                        <div className="flex gap-[5px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-[6px] -mr-[6px]">
                            <article
                                key={related.id}
                                className="w-[163px] ml-[15px] rounded-[12px] bg-[#141924] overflow-hidden flex-shrink-0"
                            >
                                <div className="h-[148px] relative">
                                    <img src={related.img} alt={related.name} className="absolute inset-0 w-full h-full object-cover rounded-[12px]" />
                                </div>
                                <div className="p-3">
                                    <h4 className="text-[16px] font-semibold text-[#FFF] ">{related.name}</h4>
                                    <div className="flex flex-wrap gap-[5px] -mt-[10px]">
                                        {related.tags.map((t) => (
                                            <span
                                                key={t}
                                                className="inline-flex h-[22px] text-[#FFF] items-center px-[5px] rounded bg-[#454A55B8]/73 text-[12px] rounded-[6px]"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-[14px] text-[#DFE1EA]/61 line-clamp-3">{related.desc}</p>
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
                                {liked ? <BiSolidLike size={24} /> : <BiLike size={24} />}
                                <span className="text-[12px]">{likeCount}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => alert("적용하기 기능은 준비 중입니다.")}
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
