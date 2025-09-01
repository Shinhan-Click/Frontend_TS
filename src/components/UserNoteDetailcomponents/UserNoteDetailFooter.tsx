import React, { useState, useEffect } from "react";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const API_BASE = '/api';

interface Props {
    bookmarkCount: number;
    userNoteId?: string;
    initialLikeStatus?: boolean;
}

interface ApiResponse<T> {
    isSuccess: boolean;
    code: string;
    message: string;
    result: T;
}

interface ToastState {
    show: boolean;
    message: string;
    showLink: boolean;
}

const UserNoteDetailFooter: React.FC<Props> = ({ 
    bookmarkCount, 
    userNoteId,
    initialLikeStatus = false
}) => {
    const [liked, setLiked] = useState(initialLikeStatus);
    const [count, setCount] = useState(bookmarkCount);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<ToastState>({
        show: false,
        message: "",
        showLink: false,
    });

    const navigate = useNavigate();

    // 초기 좋아요 상태 설정
    useEffect(() => {
        setLiked(initialLikeStatus);
    }, [initialLikeStatus]);

    // 좋아요 토글 API
    const toggleLikeAPI = async () => {
        if (!userNoteId || isLoading) return;
        
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/usernote/${userNoteId}/like`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({}), // 빈 객체라도 body 추가
                credentials: 'include'
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error('API 응답 상태:', res.status, res.statusText);
                console.error('응답 내용:', errorText);
                
                // 400 에러이고 자신의 유저노트인 경우
                if (res.status === 400) {
                    return 'own_note'; // 특별한 에러 코드 반환
                }
                
                throw new Error('좋아요 토글 API 실패');
            }
            const data: ApiResponse<any> = await res.json();
            
            if (data.isSuccess) {
                return true;
            }
            throw new Error('API 응답 실패');
        } catch (error) {
            console.error('toggleLikeAPI 에러:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (message: string, showLink = false) => {
        setToast({ show: true, message, showLink });
    };

    const hideToast = () => {
        setToast((prev) => ({ ...prev, show: false }));
    };

    // 토스트 자동 숨김 (5~6초 후)
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                hideToast();
            }, 5500); // 5.5초 후 페이드아웃
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const handleLikeToggle = async () => {
        if (isLoading) return;

        const result = await toggleLikeAPI();
        
        if (result === true) {
            // API 호출 성공시에만 UI 업데이트
            if (liked) {
                setCount((c) => c - 1);
                showToast("좋아요를 취소했습니다.", false);
            } else {
                setCount((c) => c + 1);
                showToast("좋아요한 유저노트에 추가했습니다.", true);
            }
            setLiked((prev) => !prev);
        } else if (result === 'own_note') {
            // 자신의 유저노트인 경우
            showToast("자신의 유저노트는 좋아요할 수 없습니다.", false);
        }
        // result === 'error'인 경우는 별도 처리 안함 (이미 콘솔에 로그)
    };

    const goLikedList = () => {
        hideToast();
        navigate("/LikeUserNote");
    };

    return (
        <footer className="relative h-[79px] flex-shrink-0 bg-[#000000]/60">
            {/* 커스텀 토스트 (리퀴드 글라스) */}
            <div
                className={`absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-out z-50 ${toast.show
                    ? "bottom-[90px] opacity-100 translate-y-0 scale-100"
                    : "bottom-[70px] opacity-0 translate-y-4 scale-95 pointer-events-none"
                    }`}
            >
                <div
                    role="status"
                    aria-live="polite"
                    className={[
                        "inline-flex items-center gap-5",
                        "py-[10px] px-[16px] rounded-[12px]",
                        "bg-[#00000099] backdrop-blur-xl saturate-150",
                        "shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
                        "bg-gradient-to-br from-white/10 to-white/5",
                        "text-white"
                    ].join(" ")}
                >
                    <span className="text-[14px] font-medium whitespace-nowrap">
                        {toast.message}
                    </span>

                    {/* 좋아요일 때만 바로가기 보이도록 */}
                    {toast.showLink && (
                        <button
                            onClick={goLikedList}
                            className={[
                                "flex flex-col items-center",
                                "bg-transparent border-none", // 투명 배경
                                "text-[14px] font-medium whitespace-nowrap text-[#FFF]",
                                // 항상 보이는 밑줄 (after를 이용)
                                "after:block after:w-full after:h-[1px] after:bg-[#FFF] after:mt-[2px]"
                            ].join(" ")}
                        >
                            바로가기
                        </button>
                    )}

                </div>
            </div>

            <div className="w-[355px] mx-auto py-4 flex items-center gap-4">
                <button
                    onClick={handleLikeToggle}
                    disabled={isLoading}
                    className={`mt-[13px] flex flex-col items-center hover:text-white rounded-[12px] bg-[#222A39] border border-[#222A39] transition-colors duration-200 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    {liked ? (
                        <BiSolidLike className="w-[50px] h-[32px] text-[#6F4ACD]" />
                    ) : (
                        <BiLike className="w-[50px] h-[32px] text-[#FFF]" />
                    )}
                    <span className="text-xs text-[#FFF] font-semibold">{count}</span>
                </button>

                <button
                    className="w-[281px] h-[52px] ml-auto mt-[13px]
                     bg-[#6F4ACD] border border-[#6F4ACD]
                     text-[#FFF] font-bold
                     px-8 rounded-[12px] text-[15px]
                     inline-flex items-center justify-center
                     hover:bg-[#5A3BA3] transition-colors duration-200"
                >
                    적용하기
                </button>
            </div>
        </footer>
    );
};

export default UserNoteDetailFooter;