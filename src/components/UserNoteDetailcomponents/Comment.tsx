import React, { useState, useEffect } from 'react';
import { MoreHorizontalIcon, ThumbsUpIcon, MessageCircleIcon } from '../icons';

export interface CommentProps {
    commentId: number;
    isBest?: boolean;
    author: string;
    time: string;
    content: string;
    likes: number;
    replies: number;
    avatarUrl?: string;
    isLiked?: boolean;
    onMoreClick?: () => void;
    onLikeClick?: () => void;
    onReplyClick?: () => void;
    onLikeToggle?: () => Promise<'success' | 'own_comment' | 'error'>;
}

const Comment: React.FC<CommentProps> = ({
    isBest,
    author,
    time,
    content,
    likes,
    replies,
    avatarUrl,
    isLiked = false,
    onMoreClick,
    onReplyClick,
    onLikeToggle,
}) => {
    const [toast, setToast] = useState<{ show: boolean; message: string }>({
        show: false,
        message: ""
    });

    const showToast = (message: string) => {
        setToast({ show: true, message });
    };

    const hideToast = () => {
        setToast({ show: false, message: "" });
    };

    // 토스트 자동 숨김
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                hideToast();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // 좋아요 버튼 클릭 핸들러
    const handleLikeClick = async () => {
        if (onLikeToggle) {
            const result = await onLikeToggle();
            if (result === 'own_comment') {
                showToast("자신의 댓글에는 좋아요할 수 없습니다.");
            }
        }
    };

    return (
        <div className="relative">
            {/* 토스트 */}
            <div
                className={`absolute -top-16 left-1/2 -translate-x-1/2 transition-all duration-300 ease-out z-50 ${
                    toast.show
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                }`}
            >
                <div
                    role="status"
                    aria-live="polite"
                    className="inline-flex items-center py-[8px] px-[12px] rounded-[8px] bg-[#00000099] backdrop-blur-xl saturate-150 shadow-[0_8px_20px_rgba(0,0,0,0.3)] bg-gradient-to-br from-white/10 to-white/5 text-white text-[12px] font-medium whitespace-nowrap"
                >
                    {toast.message}
                </div>
            </div>

            <div className="flex items-start gap-3 py-4">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={author}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-[#2D3340] flex items-center justify-center flex-shrink-0">
                        <svg
                            className="w-6 h-6 text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                        >
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                    </div>
                )}

                <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 ml-[10px]">
                        <div>
                            <div className="flex items-center gap-2">
                                {isBest && (
                                    <span className="flex items-center justify-center w-[42px] h-[23px] rounded-[6px] bg-[#8A4DFF] text-[12px] font-bold text-white">
                                        BEST
                                    </span>
                                )}

                                <span className="text-[14px] font-semibold text-[#8B90A3] ml-[15px]">{author}</span>
                                <span className="text-[13px] text-[#8B90A3] ml-[10px]">· {time}</span>
                            </div>

                            <p className="mt-2 text-[15px] leading-[22px] text-[#D6DAE6]">
                                {content}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onMoreClick}
                            aria-label="더보기"
                            className="inline-flex items-center justify-center w-[40px] h-[40px] text-[#FFF] bg-transparent focus:outline-none focus:ring-0 border-0"
                        >
                            <MoreHorizontalIcon className="h-[25px] w-[25px] rotate-90" />
                        </button>
                    </div>

                    <div className="mt-3 flex items-center gap-3 ml-[10px]">
                        <button
                            type="button"
                            onClick={handleLikeClick}
                            className={`inline-flex items-center gap-2 rounded-[6px] px-3 py-2 text-[13px] hover:bg-[#383E4D] mr-[5px] border-0 focus:outline-none focus:ring-0 transition-colors ${
                                isLiked 
                                    ? 'bg-[#6F4ACD] text-white' 
                                    : 'bg-[#2F3440] text-[#C9CEDB]'
                            }`}
                        >
                            <ThumbsUpIcon className={`h-[20px] w-[20px] mr-[5px] ${
                                isLiked ? 'text-white' : 'text-[#C9CEDB]'
                            }`} />
                            <span>{likes}</span>
                        </button>

                        <button
                            type="button"
                            onClick={onReplyClick}
                            className="inline-flex items-center gap-2 rounded-[6px] bg-[#2F3440] px-3 py-2 text-[13px] text-[#C9CEDB] hover:bg-[#383E4D] border-0 focus:outline-none focus:ring-0"
                        >
                            <MessageCircleIcon className="h-[20px] w-[20px] text-[#C9CEDB] mr-[5px]" />
                            <span>{replies}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Comment;