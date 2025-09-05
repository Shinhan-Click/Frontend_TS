import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XIcon } from '../components/icons';

interface FutureNoteBottomSheetProps {
    open: boolean;
    onClose: () => void;
    futureNoteId?: string; // FutureNote ID 추가
}

type Card = {
    chatId: number;
    characterImageUrl: string;
    characterName: string;
    storyTitle: string;
    lastChat: string;
    timeAgo: string;
};

type ApiResponse = {
    isSuccess: boolean;
    code: string;
    message: string;
    result: Card[];
};

const FutureNoteBottomSheet: React.FC<FutureNoteBottomSheetProps> = ({ open, onClose, futureNoteId }) => {
    const sheetRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [applying, setApplying] = useState<boolean>(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (open) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    useEffect(() => {
        const el = document.documentElement;
        const body = document.body;
        if (open) {
            el.classList.add('overflow-hidden');
            body.classList.add('overflow-hidden');
        } else {
            el.classList.remove('overflow-hidden');
            body.classList.remove('overflow-hidden');
        }
        return () => {
            el.classList.remove('overflow-hidden');
            body.classList.remove('overflow-hidden');
        };
    }, [open]);

    // API 호출
    useEffect(() => {
        if (open) {
            fetchChats();
        }
    }, [open]);

    const fetchChats = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/chat/all', {
                credentials: 'include'
            });
            const data: ApiResponse = await response.json();
            
            if (data.isSuccess && data.result) {
                setCards(data.result);
                // 첫 번째 카드를 기본 선택으로 설정
                if (data.result.length > 0) {
                    setSelectedId(data.result[0].chatId);
                }
            }
        } catch (error) {
            console.error('채팅 데이터를 불러오는데 실패했습니다:', error);
        } finally {
            setLoading(false);
        }
    };

    // FutureNote 적용 API - 새로운 chatId를 반환받도록 수정
const applyFutureNote = async (chatId: number, futureNoteId: string) => {
    try {
        const response = await fetch(`/api/chat/${chatId}/future-note?futureNoteId=${futureNoteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data: {
            isSuccess: boolean;
            code: string;
            message: string;
            result: number; // 새로운 chatId
        } = await response.json();
        
        if (data.isSuccess) {
            return data.result; // 새로운 chatId 반환
        }
        throw new Error(data.message || 'FutureNote 적용 실패');
    } catch (error) {
        console.error('FutureNote 적용 API 에러:', error);
        throw error;
    }
};

// 적용하기 버튼 핸들러 - 새로운 chatId로 네비게이션하도록 수정
const handleApply = async () => {
    if (!selectedId || !futureNoteId || applying) return;
    
    setApplying(true);
    try {
        const newChatId = await applyFutureNote(selectedId, futureNoteId);
        
        console.log(`FutureNote ${futureNoteId}가 적용된 새로운 채팅 ID: ${newChatId}`);
        onClose();
        
        // 새로운 채팅으로 이동
        navigate(`/ChatRoom/${newChatId}`, {
            state: {
                futureNoteApplied: true,
                isNewChat: true // 새 채팅임을 표시
            }
        });
        
    } catch (error: any) {
        console.error('FutureNote 적용에 실패했습니다:', error);
        alert(error.message || 'FutureNote 적용에 실패했습니다.');
    } finally {
        setApplying(false);
    }
    };

    
    return (
        <div
            aria-hidden={!open}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            className={[
                'fixed inset-0 z-50 flex items-end',
                'bg-black/45 backdrop-blur-[2px]',
                'transition-opacity duration-200',
                open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
            ].join(' ')}
        >
            <div
                ref={sheetRef}
                role="dialog"
                aria-modal="true"
                aria-label="대화 중인 채팅방"
                className={[
                    'w-[375px] h-[443px] mt-[445px] mx-auto bg-[#222A39] shadow-[0_-12px_30px_rgba(0,0,0,0.35)]',
                    'rounded-t-[20px] relative flex flex-col',
                    'transform transition-transform duration-300',
                    open ? 'translate-y-0' : 'translate-y-full',
                ].join(' ')}
            >
                <div className="mx-auto mt-2 h-1.5 w-11 rounded-full bg-[#3A4254]" aria-hidden />

                <div className="px-[25px] py-4 flex items-center justify-between">
                    <h2 className="text-[#FFF] font-bold text-[18px]">대화 중인 채팅방</h2>
                    <button
                        type="button"
                        aria-label="닫기"
                        onClick={onClose}
                        className="text-[#FFF] bg-[#222A39] border-none"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div
                    role="radiogroup"
                    aria-label="채팅방 선택"
                    className="flex-1 px-[14px] pt-[10px] pb-[10px] flex flex-col gap-[5px] overflow-auto no-scrollbar"
                >
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-[#A7B0C0] text-[14px]">로딩 중...</p>
                        </div>
                    ) : (
                        cards.map((c) => {
                            const isSelected: boolean = selectedId === c.chatId;
                            return (
                                <div
                                    key={c.chatId}
                                    role="radio"
                                    aria-checked={isSelected}
                                    tabIndex={0}
                                    onClick={() => setSelectedId(c.chatId)}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setSelectedId(c.chatId);
                                        }
                                    }}
                                    className={[
                                        'flex items-center gap-[8px] p-[6px] h-[75px] rounded-[12px] cursor-pointer select-none',
                                        'bg-[#1E2230] transition-colors',
                                        isSelected ? 'border border-[#6F4ACD] bg-[#AE6FFF1F]' : 'border border-transparent',
                                        isSelected ? 'shadow-[0_0_0_3px_rgba(111,74,205,0.25)]' : '',
                                        'focus:outline-none focus:ring-2 focus:ring-[#6F4ACD]/60',
                                    ].join(' ')}
                                >
                                    <img
                                        src={c.characterImageUrl}
                                        alt={c.characterName}
                                        className="w-[64px] h-[75px] rounded-[10px] object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-[2px]">
                                            <p className="text-[#FFFFFF] font-semibold text-[14px] leading-[14px] truncate">{c.characterName}</p>
                                            <span className="text-[11px] text-[#A7B0C0] flex-shrink-0 leading-[12px]">{c.timeAgo}</span>
                                        </div>
                                        <p className="text-[12px] leading-[12px] text-[#C8D0DC] line-clamp-1 break-words whitespace-normal">
                                            {c.lastChat}
                                        </p>
                                        <p className="text-[11px] leading-[12px] text-[#9CA3AF] truncate">{c.storyTitle}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="px-4 pb-4 flex justify-center">
                    <button
                        type="button"
                        className="w-[327px] h-[44px] mb-[10px] bg-[#6F4ACD] text-[#FFF] font-semibold rounded-[12px] border-none disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={handleApply}
                        disabled={!selectedId || applying}
                    >
                        {applying ? '적용 중...' : '적용하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FutureNoteBottomSheet;