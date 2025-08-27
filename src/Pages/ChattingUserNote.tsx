import React, { useState } from 'react';
import { ArrowLeftIcon, MoreVerticalIcon } from '../components/icons';
import { useNavigate } from 'react-router-dom';

type MyNote = {
  id: number;
  title: string;
  description: string;
  date: string;
};

type LikedNote = {
  id: number;
  title: string;
  description: string;
  author: string;
};

const MY_NOTES: MyNote[] = [
  {
    id: 1,
    title: '불도저 고백',
    description:
      '고백이라고 외치면 발동. {{user}}이 {{char}}의 손목을 거칠게 붙잡아 벽에 밀어붙인다. 숨이 가빠져지자 {...}',
    date: '2025-08-25',
  },
];

const LIKED_NOTES: LikedNote[] = [
  {
    id: 1,
    title: '금단의 기숙사',
    description:
      '남학생들만 있는 남자 기숙사에 모든 친목 행위는 규칙 위반! 발각 시 기숙사에서 퇴출됩니다. 긴장감 속 사랑...',
    author: '@Mischievous_Fox',
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

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-[16px] font-bold text-[#FFF] mb-3">{children}</h2>
);

const KebabButton: React.FC = () => (
  <button
    aria-label="더보기"
    className="absolute top-3 mt-[6px] ml-[270px] flex items-center justify-center bg-[rgba(217,200,239,0.03)]/10 border-none"
  >
    <MoreVerticalIcon className="w-[20px] h-[20px] text-[#FFF]" />
  </button>
);

const MyNoteCard: React.FC<{ note: MyNote }> = ({ note }) => (
  <div className="relative w-full box-border h-[124px] bg-[rgba(217,200,239,0.03)] rounded-[12px] px-[25px] shadow-lg">
    <KebabButton />
    <h3 className="text-[#FFF] font-normal text-[15px] mb-1">{note.title}</h3>
    <p className="text-[13px] text-[rgba(223,225,234,0.61)] leading-snug line-clamp-2">
      {note.description}
    </p>
    <div className="mt-3 inline-flex items-center rounded-[6px] bg-[rgba(69,74,85,0.32)] text-[#9CA3AF] text-[12px] px-3 py-1">
      {note.date}
    </div>
  </div>
);

const LikedNoteCard: React.FC<{ note: LikedNote }> = ({ note }) => (
  <div className="relative w-full box-border h-[124px] bg-[rgba(217,200,239,0.03)] rounded-[12px] px-[25px] shadow-lg">
    <KebabButton />
    <h3 className="text-[#FFF] font-normal text-[15px] mb-1">{note.title}</h3>
    <p className="text-[13px] text-[rgba(223,225,234,0.61)] leading-snug line-clamp-2">
      {note.description}
    </p>
    <div className="mt-3 inline-flex items-center rounded-[6px] bg-[rgba(69,74,85,0.32)] text-[#9CA3AF] text-[12px] px-3 py-1">
      {note.author}
    </div>
  </div>
);

const ChattingUserNote: React.FC = () => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<null | 'write' | 'merge'>(null);
  const navigate = useNavigate();

  const optionBase =
    'w-[327px] h-[70px] rounded-[12px] flex items-center gap-4 px-5 py-4 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20';
  const selectedStyle = 'bg-[#6F4ACD]/20 border-2 border-[#6F4ACD]';
  const unselectedStyle = 'bg-[#D9C8EF]/8 border border-transparent hover:bg-[#D9C8EF]/10';

  const handleSelectWrite = () => {
    setSelectedOption('write');
    setIsBottomSheetOpen(false);
    navigate('/UserNoteWrite');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="relative w-[375px] h-[896px] bg-[#141924] text-gray-200 flex flex-col overflow-hidden">
        <header className="flex-shrink-0 flex items-center h-[34px] mt-[24px] px-[20px]">
          <button className="p-2 ml-[4px] bg-[#141924] border-none" aria-label="뒤로가기">
            <ArrowLeftIcon className="w-[20px] h-[20px] text-[#FFF]" />
          </button>
          <h1 className="ml-[8px] text-[18px] font-bold text-[#FFF]">유저노트</h1>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-[335px] mx-auto pt-4 pb-24 space-y-6">
            <section className="mt-[25px]">
              <SectionTitle>내가 만든 유저노트</SectionTitle>
              <div className="space-y-3">
                {MY_NOTES.map((n) => (
                  <MyNoteCard key={n.id} note={n} />
                ))}
              </div>
            </section>

            <section className="mt-[45px]">
              <SectionTitle>좋아한 유저노트</SectionTitle>
              <div className="space-y-3">
                {LIKED_NOTES.map((n) => (
                  <LikedNoteCard key={n.id} note={n} />
                ))}
              </div>
            </section>
          </div>
        </main>

        <footer className="pointer-events-none">
          <div className="pointer-events-auto mb-[15px]">
            <div className="w-[335px] mx-auto py-3 flex gap-3">
              <button
                className="flex-1 h-[52px] mr-[10px] border-none rounded-[12px] bg-[#222A39] text-[#FFF] font-semibold"
                type="button"
                onClick={() => setIsBottomSheetOpen(true)}
              >
                생성하기
              </button>
              <button
                className={`flex-1 h-[52px] rounded-[12px] border-none font-semibold ${selectedOption
                  ? 'bg-[#6F4ACD] text-white'
                  : 'bg-[#6F4ACD] text-[#FFF] opacity-70 cursor-not-allowed'
                  }`}
                type="button"
                disabled={!selectedOption}
              >
                적용하기
              </button>
            </div>
          </div>
        </footer>

        <>
          <div
            className={`absolute inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isBottomSheetOpen
              ? 'opacity-100 visible pointer-events-auto'
              : 'opacity-0 invisible pointer-events-none'
              }`}
            onClick={() => setIsBottomSheetOpen(false)}
          />
          <div
            className="absolute left-0 right-0 z-50 w-full transition-transform duration-300 ease-out will-change-transform"
            style={{
              bottom: 0,
              transform: isBottomSheetOpen ? 'translateY(0)' : 'translateY(100%)',
            }}
          >
            <div className="bg-[#1E2532] h-[244px] rounded-t-[20px] shadow-2xl">
              <div className="w-12 h-1 bg-gray-400 rounded-full mx-auto mt-3 mb-4" />
              <div className="flex items-center justify-between px-5 pb-6">
                <h3 className="text-[#FFF] text-[18px] ml-[15px]">생성하기</h3>
                <button
                  onClick={() => setIsBottomSheetOpen(false)}
                  className="w-[40px] h-[40px] mr-[10px] bg-[#1E2532] border-none text-[#FFF] flex items-center justify-center"
                  aria-label="닫기"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="pb-6 ml-[25px] mt-[3px]" role="radiogroup" aria-label="생성 방식 선택">
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedOption === 'write'}
                  className={`${optionBase} ${selectedOption === 'write' ? selectedStyle : unselectedStyle}`}
                  onClick={handleSelectWrite}
                >
                  <div className="w-[25px] h-10 bg-gray-600 flex items-center justify-center text-[#FFF]">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[#FFF] font-medium text-[16px] ml-[10px]">직접 작성하기</div>
                    <div className="text-[#DFE1EA]/60 text-[13px] mt-0.5 ml-[10px]">처음부터 새 노트를 직접 작성합니다</div>
                  </div>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedOption === 'merge'}
                  className={`${optionBase} mt-[10px] ${selectedOption === 'merge' ? selectedStyle : unselectedStyle
                    }`}
                  onClick={() => setSelectedOption('merge')}
                >
                  <div className="w-[25px] h-10 bg-gray-600 flex items-center justify-center text-[#FFF]">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[#FFF] font-medium text-[16px] ml-[10px]">병합하기</div>
                    <div className="text-[#DFE1EA]/60 text-[13px] mt-0.5 ml-[10px]">선택된 노트를 참고해 새 노트를 생성합니다</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ChattingUserNote;