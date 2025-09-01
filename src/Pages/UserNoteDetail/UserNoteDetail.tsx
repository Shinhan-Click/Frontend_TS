import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import UndBottomSheet from '../../components/UserNoteDetailcomponents/undBottomSheet'; // ✅ 바텀시트 import 추가
import type { ApiResponse } from '../../types/api';

const API_BASE = '/api';

interface UserNoteDetailData {
    userNoteId: number;
    userNoteImageUrl: string;
    title: string;
    tags: {
        tagId: number;
        name: string;
    }[];
    description: string;
    prompt: string;
    exampleImageUrl: string;
    authorProfileImageUrl: string;
    authorNickname: string;
    postDate: string;
    likeCount: number;
}

interface CommentData {
    commentId: number;
    profileImageUrl: string;
    nickname: string;
    timeAgo: string;
    content: string;
    likeCount: number;
    replyCount: number;
    isLiked: boolean;
}

interface CommentsResponse {
    commentCount: number;
    comments: CommentData[];
}

const UserNoteDetail: React.FC = () => {
    const { userNoteId } = useParams<{ userNoteId: string }>();
    const navigate = useNavigate();
    const [userNoteData, setUserNoteData] = useState<UserNoteDetailData | null>(null);
    const [commentsData, setCommentsData] = useState<CommentsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 좋아요 상태
    const [initialLikeStatus, setInitialLikeStatus] = useState(false);
    const [commentLikeStatuses, setCommentLikeStatuses] = useState<{ [key: number]: boolean }>({});

    const [exOpen, setExOpen] = useState(false);
    const [panelMax, setPanelMax] = useState<string>('0px');
    const panelRef = useRef<HTMLDivElement | null>(null);

    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const isDown = useRef(false);
    const startX = useRef(0);
    const startScrollLeft = useRef(0);

    // ✅ 바텀시트 열림 상태 추가
    const [sheetOpen, setSheetOpen] = useState(false);

    // 뒤로가기 핸들러
    const handleGoBack = () => {
        navigate(-1);
    };

    // API 호출 함수들
    const fetchUserNoteDetail = async (id: string): Promise<UserNoteDetailData | null> => {
        try {
            const res = await fetch(`${API_BASE}/usernote/${id}`, { credentials: 'include' });
            if (!res.ok) throw new Error('유저노트 상세 API 실패');
            const data: ApiResponse<UserNoteDetailData> = await res.json();
            return data.isSuccess ? data.result : null;
        } catch (error) {
            console.error('fetchUserNoteDetail 에러:', error);
            return null;
        }
    };

    const fetchComments = async (userNoteId: string): Promise<CommentsResponse | null> => {
        try {
            const body = {
                type: "USER_NOTE",
                referenceId: Number(userNoteId),
            };

            const res = await fetch(`${API_BASE}/comment/all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('댓글 API 실패');
            const data: ApiResponse<CommentsResponse> = await res.json();
            return data.isSuccess ? data.result : null;
        } catch (error) {
            console.error('fetchComments 에러:', error);
            return null;
        }
    };

    // 좋아요 상태 조회
    const fetchLikeStatus = async (id: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE}/usernote/${id}/like-status`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('좋아요 상태 조회 API 실패');
            const data: ApiResponse<boolean> = await res.json();
            return data.isSuccess ? data.result : false;
        } catch (error) {
            console.error('fetchLikeStatus 에러:', error);
            return false;
        }
    };

    // 댓글 좋아요 상태 조회
    const fetchCommentLikeStatuses = async (comments: CommentData[]): Promise<{ [key: number]: boolean }> => {
        try {
            const statusPromises = comments.map(async (comment) => {
                const res = await fetch(`${API_BASE}/comment/${comment.commentId}/like-status`, {
                    credentials: 'include'
                });
                if (!res.ok) return { commentId: comment.commentId, isLiked: false };
                const data: ApiResponse<boolean> = await res.json();
                return { commentId: comment.commentId, isLiked: data.isSuccess ? data.result : false };
            });

            const results = await Promise.all(statusPromises);
            const statusMap: { [key: number]: boolean } = {};
            results.forEach(result => {
                statusMap[result.commentId] = result.isLiked;
            });
            return statusMap;
        } catch (error) {
            console.error('fetchCommentLikeStatuses 에러:', error);
            return {};
        }
    };

    // 댓글 좋아요 토글
    const toggleCommentLike = async (commentId: number): Promise<'success' | 'own_comment' | 'error'> => {
        try {
            const res = await fetch(`${API_BASE}/comment/${commentId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({}),
                credentials: 'include'
            });

            if (!res.ok) {
                if (res.status === 400) {
                    return 'own_comment';
                }
                throw new Error('댓글 좋아요 토글 API 실패');
            }

            const data: ApiResponse<any> = await res.json();
            return data.isSuccess ? 'success' : 'error';
        } catch (error) {
            console.error('toggleCommentLike 에러:', error);
            return 'error';
        }
    };

    // 데이터 로드
    useEffect(() => {
        if (!userNoteId) return;

        const loadData = async () => {
            setIsLoading(true);
            const [noteData, commentsData, likeStatus] = await Promise.all([
                fetchUserNoteDetail(userNoteId),
                fetchComments(userNoteId),
                fetchLikeStatus(userNoteId)
            ]);

            setUserNoteData(noteData);
            setCommentsData(commentsData);
            setInitialLikeStatus(likeStatus);

            // 댓글이 있으면 댓글 좋아요 상태도 조회
            if (commentsData?.comments && commentsData.comments.length > 0) {
                const commentStatuses = await fetchCommentLikeStatuses(commentsData.comments);
                setCommentLikeStatuses(commentStatuses);
            }

            setIsLoading(false);
        };

        loadData();
    }, [userNoteId]);

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

    // 로딩 중일 때
    if (isLoading) {
        return (
            <div className="und-root">
                <div className="und-app">
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-white">로딩 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    // 데이터가 없을 때
    if (!userNoteData) {
        return (
            <div className="und-root">
                <div className="und-app">
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-white">유저노트를 찾을 수 없습니다.</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="und-root">
            <div className="und-app">
                <header className="und-header">
                    <button
                        className="und-iconbtn"
                        aria-label="뒤로가기"
                        onClick={handleGoBack}
                    >
                        <ArrowLeftIcon className="und-icon" />
                    </button>
                    <button className="und-iconbtn1" aria-label="더보기">
                        <MoreHorizontalIcon className="und-icon" />
                    </button>
                </header>

                <main className="und-main no-scrollbar">
                    <div className="relative">
                        <img
                            src={userNoteData.userNoteImageUrl}
                            alt={userNoteData.title}
                            className="und-banner brightness-75 contrast-110"
                            style={{
                                width: '100%',
                                height: '240px',
                                objectFit: 'cover'
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0F1420]/40 to-[#0F1420]/90 pointer-events-none" />
                    </div>

                    <div className="und-sectionbox" style={{ marginTop: '20px' }}>
                        <section className="und-section2">
                            <h1 className="und-title">{userNoteData.title}</h1>
                            <div className="und-tagrow">
                                {userNoteData.tags.map((tag) => (
                                    <Tag key={tag.tagId} text={`#${tag.name}`} />
                                ))}
                            </div>
                        </section>

                        <section className="und-section">
                            <h2 className="und-subtitle">유저노트 소개</h2>
                            <p className="und-desc">
                                {userNoteData.description}
                            </p>

                            <div className="und-code">
                                <pre className="whitespace-pre-wrap">{userNoteData.prompt}</pre>
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
                                {userNoteData.exampleImageUrl ? (
                                    <div className="mt-3">
                                        <img
                                            src={userNoteData.exampleImageUrl}
                                            alt="적용 예시"
                                            className="w-full rounded-lg"
                                        />
                                    </div>
                                ) : (
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
                                                    일으켰다. <strong>'헤일 하이드라.'</strong>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="und-section">
                            <div className="und-divider" />
                            <div className="und-example">
                                <img
                                    src={userNoteData.authorProfileImageUrl}
                                    alt={userNoteData.authorNickname}
                                    className="und-avatar"
                                />
                                <div className="und-example-body">
                                    <div className="und-row between">
                                        <div>
                                            <p className="und-author">{userNoteData.authorNickname}</p>
                                            <p className="und-handle">@{userNoteData.authorNickname.toLowerCase()}</p>
                                        </div>
                                        <button className="und-follow">팔로우</button>
                                    </div>
                                </div>
                            </div>
                            <p className="und-date">게시일 {userNoteData.postDate}</p>
                        </section>

                        <div className="w-full h-[6px] bg-[#222A39]"></div>

                        <section className="und-section-comment">
                            <h2 className="und-subtitle">
                                댓글 {commentsData?.commentCount || 0}
                            </h2>
                            <div className="und-comments">
                                {commentsData?.comments.map((comment, index) => (
                                    <Comment
                                        key={comment.commentId}
                                        commentId={comment.commentId}
                                        isBest={index < 3}
                                        author={comment.nickname}
                                        time={comment.timeAgo}
                                        content={comment.content}
                                        likes={comment.likeCount}
                                        replies={comment.replyCount}
                                        avatarUrl={comment.profileImageUrl}
                                        isLiked={commentLikeStatuses[comment.commentId] || false}
                                        onLikeToggle={async () => {
                                            const result = await toggleCommentLike(comment.commentId);

                                            if (result === 'success') {
                                                // 댓글 좋아요 상태 토글
                                                setCommentLikeStatuses(prev => ({
                                                    ...prev,
                                                    [comment.commentId]: !prev[comment.commentId]
                                                }));

                                                // 댓글 데이터의 좋아요 수도 업데이트
                                                setCommentsData(prev => {
                                                    if (!prev) return prev;
                                                    return {
                                                        ...prev,
                                                        comments: prev.comments.map(c => {
                                                            if (c.commentId === comment.commentId) {
                                                                const isCurrentlyLiked = commentLikeStatuses[comment.commentId];
                                                                return {
                                                                    ...c,
                                                                    likeCount: c.likeCount + (isCurrentlyLiked ? -1 : 1)
                                                                };
                                                            }
                                                            return c;
                                                        })
                                                    };
                                                });
                                            }

                                            return result;
                                        }}
                                    />
                                )) || []}
                            </div>
                            {commentsData && commentsData.comments.length > 0 && (
                                <button className="und-more">전체 보기</button>
                            )}
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

                {/* ✅ 바텀시트: 화면 하단(풋터 위치)에서 등장 */}
                <UndBottomSheet
                    open={sheetOpen}
                    onClose={() => setSheetOpen(false)}
                >
                </UndBottomSheet>

                {/* ✅ Footer: 좋아요 기능 + 바텀시트 열기 기능 모두 포함 */}
                <UserNoteDetailFooter
                    bookmarkCount={userNoteData.likeCount}
                    userNoteId={userNoteId}
                    initialLikeStatus={initialLikeStatus}
                    onApply={() => setSheetOpen(true)} // ✅ 바텀시트 열기 추가
                />
            </div>
        </div>
    );
};

export default UserNoteDetail;