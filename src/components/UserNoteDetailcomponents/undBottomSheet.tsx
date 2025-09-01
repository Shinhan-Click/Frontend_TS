import React, { useEffect, useRef, useState } from 'react';
import { XIcon } from '../icons';

interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
}

type Card = {
    id: number;
    name: string;
    time: string;
    message: string;
    sub: string;
    avatar: string;
};

const UndBottomSheet: React.FC<BottomSheetProps> = ({ open, onClose }) => {
    const sheetRef = useRef<HTMLDivElement>(null);
    const [selectedId, setSelectedId] = useState<number>(1);

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

    const onOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const cards: Card[] = [
        {
            id: 1,
            name: '하도혁',
            time: '오후 7:30',
            message:
                '네 손끝에서 시작된 기운이 거짓말처럼 바람이 되어 비상계단을 휩쓸고 지나간 뒤에도, 나는 한동안 숨을 고르지 못했다…',
            sub: '청하고등학교',
            avatar: 'https://picsum.photos/seed/u1/80/80',
        },
        {
            id: 2,
            name: '백도하',
            time: '오후 2:15',
            message:
                '나는 애써 고개를 돌려 창밖을 응시했지만, 시야 한구석에 자꾸만 네 모습이 걸렸다. 땀으로 축축해진 손을 꽉 쥐며…',
            sub: '백도하',
            avatar: 'https://picsum.photos/seed/u2/80/80',
        },
        {
            id: 3,
            name: '강태준',
            time: '1일 전',
            message:
                '아, 본부장이 아니었구나. 안도감이 든 것도 잠시, ‘책임’이라는 직급과 ‘나만 시킨다’는 말에 내 미간이 저절로…',
            sub: '페로몬 오피스 : 이해할 수 없는 관계',
            avatar: 'https://picsum.photos/seed/u3/80/80',
        },
    ];

    return (
        <div
            aria-hidden={!open}
            onClick={onOverlayClick}
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
                    {cards.map((c) => {
                        const isSelected: boolean = selectedId === c.id;
                        return (
                            <div
                                key={c.id}
                                role="radio"
                                aria-checked={isSelected}
                                tabIndex={0}
                                onClick={() => setSelectedId(c.id)}
                                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedId(c.id);
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
                                    src={c.avatar}
                                    alt={c.name}
                                    className="w-[64px] h-[75px] rounded-[10px] object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-[2px]">
                                        <p className="text-white font-semibold text-[14px] leading-[14px] truncate">{c.name}</p>
                                        <span className="text-[11px] text-[#A7B0C0] flex-shrink-0 leading-[12px]">{c.time}</span>
                                    </div>
                                    <p className="text-[12px] leading-[12px] text-[#C8D0DC] line-clamp-1 break-words whitespace-normal">
                                        {c.message}
                                    </p>
                                    <p className="text-[11px] leading-[12px] text-[#9CA3AF] truncate">{c.sub}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="px-4 pb-4 flex justify-center">
                    <button
                        type="button"
                        className="w-[327px] h-[44px] mb-[10px] bg-[#6F4ACD] text-[#FFF] font-semibold rounded-[12px] border-none"
                        onClick={() => {
                            console.log(`카드 ${selectedId} 적용하기`);
                            onClose();
                        }}
                    >
                        적용하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UndBottomSheet;
