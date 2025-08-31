import React, { useState, useEffect } from "react";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

interface Props {
    bookmarkCount: number;
}

interface ToastState {
    show: boolean;
    message: string;
    showLink: boolean;
}

const UserNoteDetailFooter: React.FC<Props> = ({ bookmarkCount }) => {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(bookmarkCount);
    const [toast, setToast] = useState<ToastState>({
        show: false,
        message: "",
        showLink: false,
    });

    const navigate = useNavigate();

    const showToast = (message: string, showLink = false) => {
        setToast({ show: true, message, showLink });
    };

    const hideToast = () => {
        setToast((prev) => ({ ...prev, show: false }));
    };

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                hideToast();
            }, 5500);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const handleLikeToggle = () => {
        if (liked) {
            setCount((c) => c - 1);
            showToast("좋아요를 취소했습니다.", false);
        } else {
            setCount((c) => c + 1);
            showToast("좋아요한 유저노트에 추가했습니다.", true);
        }
        setLiked((prev) => !prev);
    };

    const goLikedList = () => {
        hideToast();
        navigate("/LikeUserNote");
    };

    return (
        <footer className="relative h-[79px] flex-shrink-0 bg-[#141924]">
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

                    {toast.showLink && (
                        <button
                            onClick={goLikedList}
                            className={[
                                "flex flex-col items-center",
                                "bg-transparent border-none",
                                "text-[14px] font-medium whitespace-nowrap text-[#FFF]",

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
                    className="mt-[13px] flex flex-col items-center hover:text-white rounded-[12px] bg-[#222A39] border border-[#222A39] transition-colors duration-200"
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
