import React from 'react';
import { ArrowLeftIcon, MoreVerticalIcon } from '../components/icons';
import { useNavigate } from 'react-router-dom';

export interface Note {
    id: number;
    title: string;
    description: string;
    author: string;
}

type NoteCardProps = {
    note: Note;
    containerClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    authorClassName?: string;
};

const NoteCard: React.FC<NoteCardProps> = ({
    note,
    containerClassName = '',
    titleClassName = '',
    descriptionClassName = '',
    authorClassName = '',
}) => {
    return (
        <div
            className={[
                'relative bg-[rgba(217,200,239,0.03)] p-[3px] rounded-[12px] mt-[13px] shadow-lg transition-transform hover:scale-[1.02] h-[140px]',
                containerClassName,
            ].join(' ')}
        >
            <button
                className="absolute top-4 right-0 mt-[5px] ml-[280px] text-[#FFF] hover:text-gray-200 bg-[rgba(217,200,239,0.03)] border-none"
                aria-label="더보기"
            >
                <MoreVerticalIcon className="w-[30px] h-[30px]" />
            </button>

            <div className="pr-8">
                <h2 className={['text-[15px] font-bold text-[#FFF] mb-2 ml-[10px]', titleClassName].join(' ')}>
                    {note.title}
                </h2>
                <p
                    className={[
                        'text-[#9CA3AF] text-[15px] mb-4 ml-[10px] line-clamp-2',
                        descriptionClassName,
                    ].join(' ')}
                >
                    {note.description}
                </p>
            </div>

            <div
                className={[
                    'inline-block ml-[10px] bg-[#222A39] text-[#9CA3AF] text-[12px] font-medium px-3 py-1 rounded-[6px]',
                    authorClassName,
                ].join(' ')}
            >
                {note.author}
            </div>
        </div>
    );
};

const LikeUserNote: React.FC = () => {
    const navigate = useNavigate();

    const notesData: Note[] = [
        {
            id: 1,
            title: '금단의 기숙사',
            description:
                '남학생들만 있는 남자 기숙사에 모든 친목 행위는 규칙 위반! 발각 시 기숙사에서 퇴출됩니다. 긴장감 속...',
            author: '@whif_official',
        },
        {
            id: 2,
            title: '사이버펑크 네오 서울',
            description:
                '2077년, 네오 서울. 당신은 불법 개조 시술을 받은 사이보그가 되어 도시의 어두운 이면에 맞서 싸웁니다.',
            author: '@whif_official',
        },
        {
            id: 3,
            title: '로맨틱 코미디 톤',
            description:
                '로맨틱 코미디 톤 기반의 규칙 모음. 대화가 과장되거나 왜곡되지 않게 도와주고, 캐릭터 감정과 사건 전개가...',
            author: '@floea',
        },
    ];

    return (
        <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
            <div className="w-[375px] h-[896px] bg-[#141924] text-gray-200 flex flex-col overflow-hidden">
                <header className="flex-shrink-0 h-[34px] mt-[30px] flex items-center px-[20.5px]">

                    <button
                        className="bg-[#141924] p-2 ml-2 border-none"
                        aria-label="뒤로가기"
                        onClick={() => navigate('/UserNoteDetail')}
                    >
                        <ArrowLeftIcon className="w-[20px] h-[20px] text-[#FFF]" />
                    </button>
                    <h1 className="ml-[10px] mb-[17px] text-[18px] font-bold text-[#FFF]">
                        좋아요한 유저노트
                    </h1>
                </header>

                <main className="mt-[20px] flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
                    <div className="w-[335px] mx-auto py-4">
                        <section className="flex justify-between items-center mb-6">
                            <div className="leading-snug">
                                <p className="text-[#9CA3AF] text-[14px]">
                                    좋아요한 유저노트를 합쳐<br />나만의 새로운 노트를 만들 수 있어요
                                </p>
                            </div>
                            <button
                                className="w-[80px] h-[36px] bg-[#404D68] hover:bg-[#475572] text-[#FFF] font-semibold py-2 px-4 border-none rounded-[6px] text-[15px] whitespace-nowrap transition-colors"
                                type="button"
                            >
                                병합하기
                            </button>
                        </section>

                        <section className="flex flex-col gap-4">
                            {notesData.map((note, idx) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    titleClassName={idx === 0 ? 'text-[15px] text-[#E7E9FF]' : ''}
                                    descriptionClassName=""
                                    authorClassName=""
                                    containerClassName=""
                                />
                            ))}
                        </section>

                        <div className="h-4" />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LikeUserNote;