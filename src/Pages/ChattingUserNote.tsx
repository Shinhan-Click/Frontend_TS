import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, MoreVerticalIcon } from '../components/icons';
import { useNavigate } from 'react-router-dom';

type MyNote = { userNoteId: number; title: string; description: string; createdAt: string };
type LikedNote = { userNoteId: number; title: string; description: string; author: string };

type ApiResponse<T> = { isSuccess: boolean; code: string; message: string; result: T };
type UserNotesResult = { myNotes: MyNote[]; likedNotes: LikedNote[] };

const API_BASE = '/api';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-[16px] font-bold text-[#FFF] mb-3">{children}</h2>
);

const KebabButton: React.FC = () => (
  <button
    aria-label="더보기"
    className="absolute top-3 mt-[6px] ml-[270px] flex items-center justify-center bg-[rgba(217,200,239,0.03)]/10 border-none"
    onClick={(e) => e.stopPropagation()}
  >
    <MoreVerticalIcon className="w-[20px] h-[20px] text-[#FFF]" />
  </button>
);

const SingleSelectableCard: React.FC<{
  title: string;
  description: string;
  meta: string;
  selected: boolean;
  onToggle: () => void;
}> = ({ title, description, meta, selected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={[
      'relative w-full box-border h-[140px] rounded-[12px] mt-[12px] px-[25px] shadow-lg text-left transition-all',
      selected ? 'bg-[#6F4ACD]/10 border-2 border-[#6F4ACD]' : 'bg-[rgba(217,200,239,0.03)] border border-transparent hover:bg-[#D9C8EF]/10',
    ].join(' ')}
  >
    <KebabButton />
    <h3 className="text-[#FFF] font-normal text-[15px] mb-1">{title}</h3>
    <p className="text-[13px] text-[rgba(223,225,234,0.61)] leading-snug line-clamp-2">{description}</p>
    <div className="mt-3 inline-flex items-center rounded-[6px] bg-[rgba(69,74,85,0.32)] text-[#9CA3AF] text-[12px] px-3 py-1">
      {meta}
    </div>
  </button>
);

const SelectableCard: React.FC<{
  title: string;
  description: string;
  meta: string;
  selected: boolean;
  onToggle: () => void;
}> = ({ title, description, meta, selected, onToggle }) => (
  <div
    className={[
      'relative w-full box-border h-[140px] mt-[12px] rounded-[12px] px-[25px] shadow-lg transition-all',
      selected ? 'bg-[#D9C8EF]/10 border-2 border-[#6F4ACD]' : 'bg-[rgba(217,200,239,0.03)] border border-transparent hover:bg-[#D9C8EF]/10',
    ].join(' ')}
    onClick={onToggle}
    role="button"
    aria-pressed={selected}
  >
    <span
      className={[
        'absolute left-[10px] top-[16px] w-[22px] h-[22px] rounded-[4px] border-[#DADDE9] flex items-center justify-center',
        'ring-2 transition-all',
        selected ? 'bg-[#6F4ACD] ring-[#6F4ACD] scale-100' : 'bg-[#2B3240] ring-[#3A4152] scale-95',
      ].join(' ')}
      aria-hidden
    >
      {selected && (
        <svg className="w-[12px] h-[12px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </span>

    <div className="pl-7 ml-[15px]">
      <h3 className="text-[#FFF] font-normal text-[15px] mb-1">{title}</h3>
      <p className="text-[13px] text-[rgba(223,225,234,0.61)] leading-snug line-clamp-2">{description}</p>
      <div className="mt-3 inline-flex items-center rounded-[6px] bg-[rgba(69,74,85,0.32)] text-[#9CA3AF] text-[12px] px-3 py-1">
        {meta}
      </div>
    </div>
  </div>
);

const ChattingUserNote: React.FC = () => {
  const navigate = useNavigate();

  const [myNotes, setMyNotes] = useState<MyNote[]>([]);
  const [likedNotes, setLikedNotes] = useState<LikedNote[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<'browse' | 'merge-select'>('browse');
  const [selectedApply, setSelectedApply] = useState<string | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<null | 'write' | 'merge'>(null);
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);

  useEffect(() => {
    const loadUserNotes = async () => {
      try {
        const res = await fetch(`${API_BASE}/usernote/my-usernotes`, {
          method: 'GET',
          headers: { accept: '*/*' },
          credentials: 'include',
        });
        if (!res.ok) throw new Error('API 실패');
        const data: ApiResponse<UserNotesResult> = await res.json();
        if (data.isSuccess && data.result) {
          setMyNotes(data.result.myNotes || []);
          setLikedNotes(data.result.likedNotes || []);
        }
      } catch {
        setMyNotes([]);
        setLikedNotes([]);
      } finally {
        setLoading(false);
      }
    };
    loadUserNotes();
  }, []);

  const optionBase =
    'w-[327px] h-[70px] rounded-[12px] flex items-center gap-4 px-5 py-4 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20';
  const selectedStyle = 'bg-[#6F4ACD]/20 border-2 border-[#6F4ACD]';
  const unselectedStyle = 'bg-[#D9C8EF]/8 border border-transparent hover:bg-[#D9C8EF]/10';

  const makeKey = (kind: 'my' | 'liked', id: number) => `${kind}:${id}`;
  const isSelected = (kind: 'my' | 'liked', id: number) => selectedForMerge.includes(makeKey(kind, id));
  const toggleSelect = (kind: 'my' | 'liked', id: number) => {
    const key = makeKey(kind, id);
    if (selectedForMerge.includes(key)) {
      setSelectedForMerge((prev) => prev.filter((k) => k !== key));
      return;
    }
    if (selectedForMerge.length >= 2) return;
    setSelectedForMerge((prev) => [...prev, key]);
  };

  const isApplySelected = (kind: 'my' | 'liked', id: number) => selectedApply === makeKey(kind, id);
  const toggleApply = (kind: 'my' | 'liked', id: number) => {
    const key = makeKey(kind, id);
    setSelectedApply((prev) => (prev === key ? null : key));
  };

  const enterMergeSelect = () => {
    setSelectedOption('merge');
    setIsBottomSheetOpen(false);
    setMode('merge-select');
    setSelectedForMerge([]);
  };

  const exitMergeSelect = () => {
    setMode('browse');
    setSelectedForMerge([]);
    setSelectedOption(null);
  };

  const handleSelectWrite = () => {
    setSelectedOption('write');
    setIsBottomSheetOpen(false);
    navigate('/UserNoteWrite');
  };

  const handleConfirmMerge = () => {
    navigate('/UserNoteWrite', { state: { mergeFrom: selectedForMerge } });
  };

  const handleApply = () => {
    if (!selectedApply) return;
    navigate('/UserNoteWrite', { state: { applyFrom: selectedApply } });
  };

  const HeaderBrowse = (
    <header className="flex-shrink-0 flex items-center h-[34px] mt-[24px] px-[20px]">
      <button className="p-2 ml-[4px] bg-[#141924] border-none" aria-label="뒤로가기" onClick={() => navigate(-1)}>
        <ArrowLeftIcon className="w-[20px] h-[20px] text-[#FFF]" />
      </button>
      <h1 className="ml-[8px] text-[18px] font-bold text-[#FFF]">유저노트</h1>
    </header>
  );

  const HeaderMerge = (
    <header className="flex-shrink-0 px-[20px] pt-[24px] bg-[#222A39]">
      <div className="flex items-center">
        <button onClick={exitMergeSelect} className="mt-[5px] w-[35px] h-[35px] text-[#FFF] bg-[#222A39] border-none" aria-label="닫기" title="닫기">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 className="ml-[8px] text-[18px] font-bold text-[#FFF]">유저노트 병합</h1>
      </div>
      <hr className="border-t border-[#DFE1EA]/40 my-4 opacity-60" />
      <p className="text-[11px] text-[#DFE1EA]/60 mt-3 ml-[70px]">병합할 두 개의 유저노트를 선택해주세요</p>
    </header>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="relative w-[375px] h-[896px] bg-[#141924] text-gray-200 flex items-center justify-center">
          <div className="text-[#FFF] text-[16px]">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="relative w-[375px] h-[896px] bg-[#141924] text-gray-200 flex flex-col overflow-hidden">
        {mode === 'merge-select' ? HeaderMerge : HeaderBrowse}

        <main className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-[335px] mx-auto pt-4 pb-24 space-y-6">
            {myNotes.length > 0 && (
              <section className="mt-[25px]">
                <SectionTitle>내가 만든 유저노트</SectionTitle>
                <div className="space-y-3">
                  {mode === 'merge-select'
                    ? myNotes.map((note) => (
                        <SelectableCard
                          key={`my:${note.userNoteId}`}
                          title={note.title}
                          description={note.description}
                          meta={note.createdAt}
                          selected={isSelected('my', note.userNoteId)}
                          onToggle={() => toggleSelect('my', note.userNoteId)}
                        />
                      ))
                    : myNotes.map((note) => (
                        <SingleSelectableCard
                          key={`my:${note.userNoteId}`}
                          title={note.title}
                          description={note.description}
                          meta={note.createdAt}
                          selected={isApplySelected('my', note.userNoteId)}
                          onToggle={() => toggleApply('my', note.userNoteId)}
                        />
                      ))}
                </div>
              </section>
            )}

            {likedNotes.length > 0 && (
              <section className="mt-[45px]">
                <SectionTitle>좋아요한 유저노트</SectionTitle>
                <div className="space-y-3">
                  {mode === 'merge-select'
                    ? likedNotes.map((note) => (
                        <SelectableCard
                          key={`liked:${note.userNoteId}`}
                          title={note.title}
                          description={note.description}
                          meta={`@${note.author}`}
                          selected={isSelected('liked', note.userNoteId)}
                          onToggle={() => toggleSelect('liked', note.userNoteId)}
                        />
                      ))
                    : likedNotes.map((note) => (
                        <SingleSelectableCard
                          key={`liked:${note.userNoteId}`}
                          title={note.title}
                          description={note.description}
                          meta={`@${note.author}`}
                          selected={isApplySelected('liked', note.userNoteId)}
                          onToggle={() => toggleApply('liked', note.userNoteId)}
                        />
                      ))}
                </div>
              </section>
            )}

            {myNotes.length === 0 && likedNotes.length === 0 && (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <div className="text-[#9CA3AF] text-[16px] mb-2">저장한 유저노트가 없어요</div>
                  <div className="text-[#9CA3AF] text-[14px]">새로운 유저노트를 만들어보세요</div>
                </div>
              </div>
            )}
          </div>
        </main>

        {mode === 'merge-select' ? (
          <footer className="pointer-events-none">
            <div className="pointer-events-auto mb-[15px]">
              <div className="w-[335px] mx-auto py-3">
                <button
                  className={[
                    'w-full h-[52px] rounded-[12px] font-semibold border-none',
                    selectedForMerge.length === 2 ? 'bg-[#6F4ACD] text-[#FFF]' : 'bg-[#6F4ACD] text-[#FFF] opacity-70 cursor-not-allowed',
                  ].join(' ')}
                  type="button"
                  disabled={selectedForMerge.length !== 2}
                  onClick={handleConfirmMerge}
                >
                  병합하기
                </button>
              </div>
            </div>
          </footer>
        ) : (
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
                  className={[
                    'flex-1 h-[52px] rounded-[12px] border-none font-semibold',
                    selectedApply ? 'bg-[#6F4ACD] text-[#FFF]' : 'bg-[#6F4ACD] text-[#FFF] opacity-70 cursor-not-allowed',
                  ].join(' ')}
                  type="button"
                  disabled={!selectedApply}
                  onClick={handleApply}
                >
                  적용하기
                </button>
              </div>
            </div>
          </footer>
        )}

        <>
          <div
            className={`absolute inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
              isBottomSheetOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
            }`}
            onClick={() => setIsBottomSheetOpen(false)}
          />
          <div
            className="absolute left-0 right-0 z-50 w-full transition-transform duration-300 ease-out will-change-transform"
            style={{ bottom: 0, transform: isBottomSheetOpen ? 'translateY(0)' : 'translateY(100%)' }}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
                  className={`${optionBase} mt-[10px] ${selectedOption === 'merge' ? selectedStyle : unselectedStyle}`}
                  onClick={enterMergeSelect}
                >
                  <div className="w-[25px] h-10 bg-gray-600 flex items-center justify-center text-[#FFF]">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
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