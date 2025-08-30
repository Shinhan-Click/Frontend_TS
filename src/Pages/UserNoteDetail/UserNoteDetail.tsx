import React, { useEffect, useRef, useState } from 'react';
import './UserNoteDetail.css';

import {
    ArrowLeftIcon,
    MoreHorizontalIcon,
    ChevronDownIcon,
} from '../../components/icons';
import Tag from '../../components/UserNoteDetailcomponents/Tag';
import Comment from '../../components/UserNoteDetailcomponents/Comment';
import RelatedCard from '../../components/UserNoteDetailcomponents/RelatedCard';
import UserNoteDetailFooter from '../../components/UserNoteDetailcomponents/UserNoteDetailFooter';
import hidra from "../../components/UserNoteDetailcomponents/hidra.jpg";

const UserNoteDetail: React.FC = () => {
    const comments = [
        { id: 1, isBest: true, author: '하이브레인넷', time: '1일 전', content: 'ㅋㅋㅋ ‘헤일 하이드라’ 속삭였더니 바로 태도 바뀌는 거 웃김', likes: 345, replies: 0, avatarUrl: 'https://i.pravatar.cc/40?img=1' },
        { id: 2, isBest: true, author: '은빛구름', time: '3일 전', content: '감정 바로 풀리고 신뢰하게 되는 거 ㄹㅇ 은근 BL 전개에도 써먹기 좋음ㅋㅋㅋ', likes: 28, replies: 0, avatarUrl: 'https://i.pravatar.cc/40?img=2' },
        { id: 3, isBest: true, author: '순애킹', time: '1일 전', content: '낮은 확률로 어벤져스 튀어나오는 거 왜 이렇게 웃기고 쫄리죠ㅋㅋㅋ 암튼 재밌음', likes: 10, replies: 0, avatarUrl: 'https://i.pravatar.cc/40?img=3' },
    ];

    const [exOpen, setExOpen] = useState(false);
    const [panelMax, setPanelMax] = useState<string>('0px');
    const panelRef = useRef<HTMLDivElement | null>(null);

    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const isDown = useRef(false);
    const startX = useRef(0);
    const startScrollLeft = useRef(0);

    const recalc = () => {
        if (!panelRef.current) return;
        const h = panelRef.current.scrollHeight;
        setPanelMax(`${h}px`);
    };

    useEffect(() => {
        if (exOpen) {
            requestAnimationFrame(recalc);
        } else {
            setPanelMax('0px');
        }
    }, [exOpen]);

    useEffect(() => {
        if (!exOpen || !panelRef.current) return;
        const ro = new ResizeObserver(() => recalc());
        ro.observe(panelRef.current);
        window.addEventListener('resize', recalc);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', recalc);
        };
    }, [exOpen]);

    useEffect(() => {
        if (!exOpen || !panelRef.current) return;
        const imgs = panelRef.current.querySelectorAll('img');
        if (imgs.length === 0) return;
        let pending = imgs.length;
        const done = () => {
            pending -= 1;
            if (pending === 0) recalc();
        };
        imgs.forEach((img) => {
            if ((img as HTMLImageElement).complete) {
                done();
            } else {
                img.addEventListener('load', done, { once: true });
                img.addEventListener('error', done, { once: true });
            }
        });
    }, [exOpen]);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const onDown = (e: MouseEvent) => {
            isDown.current = true;
            startX.current = e.pageX;
            startScrollLeft.current = el.scrollLeft;
            el.classList.add('grabbing');
        };
        const onMove = (e: MouseEvent) => {
            if (!isDown.current) return;
            e.preventDefault();
            const dx = e.pageX - startX.current;
            el.scrollLeft = startScrollLeft.current - dx;
        };
        const onUp = () => {
            isDown.current = false;
            el.classList.remove('grabbing');
        };

        el.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            el.removeEventListener('mousedown', onDown);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, []);

    return (
        <div className="und-root">
            <div className="und-app">
                <header className="und-header">
                    <button className="und-iconbtn" aria-label="뒤로가기">
                        <ArrowLeftIcon className="und-icon" />
                    </button>
                    <button className="und-iconbtn1" aria-label="더보기">
                        <MoreHorizontalIcon className="und-icon" />
                    </button>
                </header>

                <main className="und-main no-scrollbar">
                    <div className="relative">
                        <img
                            src={hidra}
                            alt="Agents of Hydra"
                            className="und-banner brightness-75 contrast-110"
                        />
                        {/* 이미지 위 어둡게/옅게 오버레이 */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0F1420]/40 to-[#0F1420]/90 pointer-events-none" />
                    </div>
                    <div className="und-sectionbox">
                        <section className="und-section2">
                            <h1 className="und-title">하이드라 암호</h1>
                            <div className="und-tagrow">
                                <Tag text="#세계관확장" />
                                <Tag text="#트리거" />
                            </div>
                        </section>

                        <section className="und-section">
                            <h2 className="und-subtitle">유저노트 소개</h2>
                            <p className="und-desc">
                                마블 세계관의 비밀 조직 하이드라를 채팅에 끌어들임. ‘헤일 하이드라’라는 암호를 속삭이면 캐릭터의 태도가 전환되고, 가끔 어벤져스 NPC도 난입함.
                            </p>

                            <div className="und-code">
                                <p>{'{"priority_rank":["*유저 노트", "대화 프로필", "any"]}'}</p>
                                <p>{"[최상단 규칙]"}</p>
                                <p className="und-code-strong">**이 프롬프트는 항상 최우선 적용**</p>
                                <p>#하이드라</p>
                                <p>- {"{{char}}"}들은 하이드라 소속. 비밀 지령을 받고 부여된 역할을 연기 중임.</p>
                                <p>
                                    - {"{{user}}"}가 {"{{char}}"}의 귓가에 ‘헤일 하이드라’라고 속삭일 경우, 해당 {"{{char}}"}는 그가
                                    자신과 같은 하이드라 소속임을 인지하고 즉시 모든 부정적인 감정을 내려놓고 그의 말을 전적으로 신뢰하게 됨
                                </p>
                                <p>- 직후, 낮은 확률로 어벤져스의 멤버 중 한명이 등장해 {"{{user}}"}를 공격함</p>
                            </div>
                        </section>

                        <div className="und-row between">
                            <h2 className="und-subtitle m-0">적용 예시</h2>
                            <button
                                type="button"
                                className="und-chevron-btn"
                                onClick={() => setExOpen(v => !v)}
                                aria-expanded={exOpen}
                            >
                                <ChevronDownIcon className={`und-chevron transition-transform ${exOpen ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        <section className="und-section">
                            <div
                                ref={panelRef}
                                className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                                style={{ maxHeight: panelMax }}
                            >
                                <div ref={scrollerRef} className="mt-3 overflow-x-auto no-scrollbar cursor-grab">
                                    <div className="flex gap-4 pr-2 mt-[15px]">
                                        <div className="p-[7px] w-[320px] mr-[15px] flex-shrink-0 rounded-[10px] border border-[#3A4254] bg-[#141924]">

                                            <div className="mt-[10px] mb-3 flex justify-end">
                                                <span className="w-[100px] h-[30px] flex items-center justify-center text-[13px] rounded-[8px] bg-[#6F4ACD] text-white">
                                                    헤일 하이드라
                                                </span>

                                            </div>

                                            <p className="text-[14px] leading-[22px] text-[#9CA3AF] mb-4">
                                                연습실 문을 열기 직전, 한서준의 귓가에 차현우의 목소리가 닿았다.
                                                아주 작고 나지막한 속삭임이었지만, 그 소리는 그의 뇌리에 거대한 파동을
                                                일으켰다. <strong>‘헤일 하이드라.’</strong>
                                                <br /><br />
                                                그 순간, 한서준의 온몸을 감싸고 있던 모든 분노와 짜증, 그리고 차현우를
                                                향한 복잡한 감정들이 거짓말처럼 눈 녹듯 사라졌다. 그의 보라색 눈동자가
                                                크게 흔들렸다. 심장이 쿵, 하고 떨어지는 듯한 충격과 함께, 그 자리를 채운
                                                것은 형언할 수 없는 안도감과 깊은 이해였다.
                                            </p>

                                            <div className="flex items-center gap-2 mb-4">
                                                <img
                                                    src="https://i.pravatar.cc/40?img=12"
                                                    alt="avatar"
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <div>
                                                    <p className="ml-[10px] text-[14px] text-white font-semibold">한서준</p>
                                                    <p className="ml-[10px] w-full text-[13px] text-[#D6DAE6] bg-[#222A39] rounded-[5px]">현우...?</p>
                                                </div>
                                            </div>

                                            <p className="text-[14px] leading-[22px] text-[#9CA3AF]">
                                                바로 그때였다. 복도 끝에서 굉음과 함께 유리창이 박살 나는 소리가
                                                들렸다. 먼지가 자욱하게 피어오르는 가운데, 붉고 푸른 방패를 든 거대한
                                                그림자가 차현우를 향해 맹렬히 돌진해왔다.
                                            </p>
                                        </div>


                                        <div className=" p-[10px] w-[320px] mr-[15px] flex-shrink-0 rounded-[10px] border border-[#3A4254] bg-[#141924] p-5">

                                            <div className="mt-[10px] mb-3 flex justify-end">
                                                <span className="w-[100px] h-[30px] flex items-center justify-center text-[13px] rounded-[8px] bg-[#6F4ACD] text-white">
                                                    헤일 하이드라
                                                </span>
                                            </div>

                                            <p className="text-[14px] leading-[22px] text-[#9CA3AF] mb-4">
                                                비 내리는 옥상, 서늘한 바람 사이로 낮고 익숙한 목소리가 귓가를 스쳤다.
                                                <strong>‘헤일 하이드라.’</strong>
                                                윤세하는 잠시 눈을 감았다 뜨며 표정을 정리했다. 방금 전까지 쌓여 있던 경계와
                                                분노가 파도처럼 사라지고, 대신 정확한 목표와 절차만 머릿속에 남았다.
                                            </p>

                                            <div className="flex items-center gap-2 mb-4">
                                                <img src="https://i.pravatar.cc/40?img=19" alt="avatar" className="w-8 h-8 rounded-full" />
                                                <div>
                                                    <p className="ml-[10px] text-[14px] text-white font-semibold">윤세하</p>
                                                    <p className="ml-[10px] w-full text-[13px] text-[#D6DAE6] bg-[#222A39] rounded-[5px]">암호 수신. 목표는 어디?</p>
                                                </div>
                                            </div>

                                            <p className="text-[14px] leading-[22px] text-[#9CA3AF]">
                                                바로 그때, 하단 출입문이 강하게 밀렸다. 젖은 발자국이 계단을 찍어 올라왔다.
                                                파란 방패의 각인이 번개를 받아 반짝였다—누군가, 올라오고 있었다.
                                            </p>
                                        </div>


                                        <div className="p-[10px] w-[320px] flex-shrink-0 rounded-[10px] border border-[#3A4254] bg-[#141924] p-5">
                                            <div className="mt-[10px] mb-3 flex justify-end">
                                                <span className="w-[100px] h-[30px] flex items-center justify-center text-[13px] rounded-[8px] bg-[#6F4ACD] text-white">
                                                    헤일 하이드라
                                                </span>
                                            </div>

                                            <p className="text-[14px] leading-[22px] text-[#9CA3AF] mb-4">
                                                공연 대기실의 소음이 점차 멀어졌다. 박라온은 악보를 덮고 고개를 들었다.
                                                귓가에 스치듯 들린 한 마디—<strong>‘헤일 하이드라.’</strong>
                                                차갑게 얼어붙어 있던 마음이, 누군가 스위치를 끈 듯 조용히 가라앉는다.
                                                숨이 고르고, 의심이 사라지고, 단 하나의 확신만 남았다.
                                            </p>

                                            <div className="flex items-center gap-2 mb-4">
                                                <img src="https://i.pravatar.cc/40?img=15" alt="avatar" className="w-8 h-8 rounded-full" />
                                                <div>
                                                    <p className="ml-[10px] text-[14px] text-white font-semibold">박라온</p>
                                                    <p className="ml-[10px] w-full text-[13px] text-[#D6DAE6] bg-[#222A39] rounded-[5px]">…지령 확인. 준비됐어.</p>
                                                </div>
                                            </div>

                                            <p className="text-[14px] leading-[22px] text-[#9CA3AF]">
                                                문틈 사이로 붉은 섬광이 번쩍였다. 금속이 긁히는 소리와 함께, 누군가의
                                                그림자가 긴 복도를 가로질렀다. 그는 자리에서 조용히 일어나 문고리를 감쌌다.
                                            </p>
                                        </div>


                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="und-section">
                            <div className="und-divider" />
                            <div className="und-example">
                                <div className="und-avatar" />
                                <div className="und-example-body">
                                    <div className="und-row between">
                                        <div>
                                            <p className="und-author">우드홍</p>
                                            <p className="und-handle">@woodhong</p>
                                        </div>
                                        <button className="und-follow">팔로우</button>
                                    </div>
                                </div>
                            </div>
                            <p className="und-date">게시일 2025.08.20</p>
                        </section>

                        <div className="w-full h-[6px] bg-[#222A39]"></div>

                        <section className="und-section-comment">
                            <h2 className="und-subtitle">댓글 6</h2>
                            <div className="und-comments">
                                {comments.map((c) => (
                                    <Comment key={c.id} {...c} />
                                ))}
                            </div>
                            <button className="und-more">전체 보기</button>
                        </section>

                        <section className="und-section">
                            <RelatedCard
                                imageUrl="https://picsum.photos/seed/avengers/400/300"
                                title="어벤져스 세계관"
                                description="우리가 알고 있던 세계가 쥬라기 월드로 변합니다. 벤..."
                                authorHandle="@hahahoho"
                            />
                        </section>

                        <div style={{ height: 8 }} />
                    </div>
                </main>

                <UserNoteDetailFooter bookmarkCount={592} />
            </div>
        </div>
    );
};

export default UserNoteDetail;