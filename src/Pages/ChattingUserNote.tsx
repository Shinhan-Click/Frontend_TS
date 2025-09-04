import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, MoreVerticalIcon } from '../components/icons';
import { useNavigate, useLocation } from 'react-router-dom';

type MyNote = { userNoteId: number; title: string; description: string; createdAt: string };
type LikedNote = { userNoteId: number; title: string; description: string; author: string };
type ApiResponse<T> = { isSuccess: boolean; code: string; message: string; result: T };
type UserNotesResult = { myNotes: MyNote[]; likedNotes: LikedNote[] };
type Draft = { personaChoice?: string; personaText?: string; name?: string; gender?: 'male' | 'female' | 'none'; introduction?: string; userNote?: string };

// 단일 유저노트 조회 API 응답 타입
type UserNoteDetail = {
  userNoteId: number;
  userNoteImageUrl: string;
  title: string;
  tags: Array<{ tagId: number; name: string }>;
  description: string;
  prompt: string;
  exampleImageUrl: string;
  authorProfileImageUrl: string;
  authorNickname: string;
  postDate: string;
  likeCount: number;
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-[16px] font-bold text-[#FFF] mb-3">{children}</h2>
);

const KebabButton: React.FC = () => (
  <button
    aria-label="더보기"
    className="absolute top-3 mt-[6px] ml-[270px] flex items-center justify-center border-none"
    onClick={(e) => e.stopPropagation()}
    style={{ background: 'none' }}
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
  const location = useLocation();
  const incomingDraft: Draft | undefined = (location.state as any)?.draft;
  const fromSearch: string = (location.state as any)?.fromSearch ?? window.location.search ?? '';

  const [myNotes, setMyNotes] = useState<MyNote[]>([]);
  const [likedNotes, setLikedNotes] = useState<LikedNote[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedApply, setSelectedApply] = useState<string | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<null | 'write' | 'merge'>(null);
  const [mode, setMode] = useState<'browse' | 'merge-select'>('browse');
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);

  const API_BASE = '/api';

  useEffect(() => {
    window.history.replaceState({}, document.title);
  }, []);

  // 우선 선택 화면에서 돌아왔을 때 상태 복원
  useEffect(() => {
    const s = (location.state as any) || {};
    if (s.mode) setMode(s.mode);
    if (Array.isArray(s.selectedForMerge)) setSelectedForMerge(s.selectedForMerge);
  }, [location.key]); // 라우트 이동 시 갱신

  useEffect(() => {
    const loadUserNotes = async () => {
      try {
        const res = await fetch(`${API_BASE}/usernote/my-usernotes`, {
          method: 'GET',
          headers: { accept: '*/*', 'Cache-Control': 'no-cache' },
          credentials: 'include',
        });
        if (!res.ok) throw new Error();
        const data: ApiResponse<UserNotesResult> = await res.json();
        if (data.isSuccess && data.result) {
          setMyNotes(data.result.myNotes || []);
          setLikedNotes(data.result.likedNotes || []);
        } else {
          throw new Error();
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

  const makeKey = (kind: 'my' | 'liked', id: number) => `${kind}:${id}`;
  const isSelected = (kind: 'my' | 'liked', id: number) => selectedForMerge.includes(makeKey(kind, id));
  const toggleSelect = (kind: 'my' | 'liked', id: number) => {
    const key = makeKey(kind, id);
    if (selectedForMerge.includes(key)) setSelectedForMerge((prev) => prev.filter((k) => k !== key));
    else if (selectedForMerge.length < 2) setSelectedForMerge((prev) => [...prev, key]);
  };
  const isApplySelected = (kind: 'my' | 'liked', id: number) => selectedApply === makeKey(kind, id);
  const toggleApply = (kind: 'my' | 'liked', id: number) =>
    setSelectedApply((prev) => (prev === makeKey(kind, id) ? null : makeKey(kind, id)));

  const handleSelectWrite = () => {
    setSelectedOption('write');
    setIsBottomSheetOpen(false);
    navigate('/UserNoteWrite', { state: { draft: incomingDraft, fromSearch } });
  };

  // 선택 초기화 후 초기 화면으로 복귀
  const handleExitMerge = () => {
    setMode('browse');
    setSelectedForMerge([]);
    setSelectedOption(null);
    setSelectedApply(null);
    setIsBottomSheetOpen(false);
  };

  // 선택된 키를 실제 노트 데이터로 해석
  const resolveSelectedOptions = () => {
    return selectedForMerge.map((key) => {
      const [kind, idStr] = key.split(':');
      const id = parseInt(idStr, 10);
      if (kind === 'my') {
        const n = myNotes.find((x) => x.userNoteId === id);
        return n
          ? {
            id: key,
            title: n.title,
            description: n.description,
            meta: n.createdAt,
            kind: 'my' as const,
            rawId: id,
          }
          : null;
      } else {
        const n = likedNotes.find((x) => x.userNoteId === id);
        return n
          ? {
            id: key,
            title: n.title,
            description: n.description,
            meta: `@${n.author}`,
            kind: 'liked' as const,
            rawId: id,
          }
          : null;
      }
    }).filter(Boolean) as Array<{
      id: string;
      title: string;
      description: string;
      meta: string;
      kind: 'my' | 'liked';
      rawId: number;
    }>;
  };

  // 병합 선택 확정 → 우선순위 선택 화면으로 이동 (선택 요소들 전달)
  const handleConfirmMerge = () => {
    if (selectedForMerge.length !== 2) return;
    const options = resolveSelectedOptions();
    navigate('/UserNoteSelectPriorityBeforeMerging', {
      state: {
        options,
        selectedForMerge,
        draft: incomingDraft,
        fromSearch,
      },
    });
  };

  // 단일 유저노트 조회 API 호출 함수
  const fetchUserNoteDetail = async (userNoteId: number): Promise<UserNoteDetail | null> => {
    try {
      const res = await fetch(`${API_BASE}/usernote/${userNoteId}`, {
        method: 'GET',
        headers: { accept: '*/*', 'Cache-Control': 'no-cache' },
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data: ApiResponse<UserNoteDetail> = await res.json();

      if (data.isSuccess && data.result) {
        return data.result;
      } else {
        throw new Error(data.message || 'Failed to fetch user note detail');
      }
    } catch (error) {
      console.error('Error fetching user note detail:', error);
      return null;
    }
  };

  const handleApply = async () => {
    if (!selectedApply) return;

    try {
      const [kind, idStr] = selectedApply.split(':');
      const id = parseInt(idStr, 10);

      // API를 통해 유저노트 상세 정보 조회
      const userNoteDetail = await fetchUserNoteDetail(id);

      if (!userNoteDetail) {
        // API 호출 실패 시 기존 로직 유지 (fallback)
        let description = '';
        if (kind === 'my') description = myNotes.find((n) => n.userNoteId === id)?.description || '';
        else description = likedNotes.find((n) => n.userNoteId === id)?.description || '';

        const draft = { ...(incomingDraft || {}), userNote: description };
        navigate(`/ChatSetting${fromSearch || ''}`, {
          state: { selectedUserNoteDescription: description, draft }
        });
        return;
      }

      // API에서 가져온 prompt 데이터 사용
      const draft = { ...(incomingDraft || {}), userNote: userNoteDetail.prompt };
      navigate(`/ChatSetting${fromSearch || ''}`, {
        state: {
          selectedUserNoteDescription: userNoteDetail.prompt,
          selectedUserNoteDetail: userNoteDetail, // 전체 상세 정보도 함께 전달
          draft
        }
      });

    } catch (error) {
      console.error('Error applying user note:', error);
      // 에러 발생 시에도 기존 로직으로 fallback
      const [kind, idStr] = selectedApply.split(':');
      const id = parseInt(idStr, 10);
      let description = '';
      if (kind === 'my') description = myNotes.find((n) => n.userNoteId === id)?.description || '';
      else description = likedNotes.find((n) => n.userNoteId === id)?.description || '';

      const draft = { ...(incomingDraft || {}), userNote: description };
      navigate(`/ChatSetting${fromSearch || ''}`, {
        state: { selectedUserNoteDescription: description, draft }
      });
    }
  };

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
        {mode === 'merge-select' ? (
          <header className="flex-shrink-0 px-[20px] bg-[#222A39]">
            <div className="flex items-center h-[106x]">
              <button
                className="p-2 bg-[#222A39] border-none"
                aria-label="닫기"
                onClick={handleExitMerge}
              >
                <svg className="w-[20px] h-[20px] text-[#FFF] mt-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
              <h1 className="mt-[20px] ml-[8px] text-[18px] font-bold text-[#FFF]">유저노트 병합</h1>
            </div>
            <div className="mt-[10px] h-px bg-[#2A3346]" />
            <div className="py-[12px] ml-[65px] text-[12px] text-[#DFE1EA]/61">
              병합할 두 개의 유저노트를 선택해주세요
            </div>
          </header>
        ) : (
          <header className="flex-shrink-0 flex items-center h-[34px] mt-[24px] px-[20px]">
            <button className="p-2 ml-[4px] bg-[#141924] border-none" aria-label="뒤로가기" onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="w-[20px] h-[20px] text-[#FFF]" />
            </button>
            <h1 className="ml-[8px] text-[18px] font-bold text-[#FFF]">유저노트</h1>
          </header>
        )}

        <main className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-[335px] mx-auto pt-4 pb-24 space-y-6">
            {myNotes.length > 0 && (
              <section className="mt-[25px]">
                <SectionTitle>내가 만든 유저노트</SectionTitle>
                <div className="space-y-3">
                  {mode === 'merge-select'
                    ? myNotes.map((n) => (
                      <SelectableCard
                        key={`my:${n.userNoteId}`}
                        title={n.title}
                        description={n.description}
                        meta={n.createdAt}
                        selected={isSelected('my', n.userNoteId)}
                        onToggle={() => toggleSelect('my', n.userNoteId)}
                      />
                    ))
                    : myNotes.map((n) => (
                      <SingleSelectableCard
                        key={`my:${n.userNoteId}`}
                        title={n.title}
                        description={n.description}
                        meta={n.createdAt}
                        selected={isApplySelected('my', n.userNoteId)}
                        onToggle={() => toggleApply('my', n.userNoteId)}
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
                    ? likedNotes.map((n) => (
                      <SelectableCard
                        key={`liked:${n.userNoteId}`}
                        title={n.title}
                        description={n.description}
                        meta={`@${n.author}`}
                        selected={isSelected('liked', n.userNoteId)}
                        onToggle={() => toggleSelect('liked', n.userNoteId)}
                      />
                    ))
                    : likedNotes.map((n) => (
                      <SingleSelectableCard
                        key={`liked:${n.userNoteId}`}
                        title={n.title}
                        description={n.description}
                        meta={`@${n.author}`}
                        selected={isApplySelected('liked', n.userNoteId)}
                        onToggle={() => toggleApply('liked', n.userNoteId)}
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
            className={`absolute inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isBottomSheetOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
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
                  className={`w-[327px] h-[70px] rounded-[12px] flex items-center gap-4 px-5 py-4 transition-colors ${selectedOption === 'write' ? 'bg-[#6F4ACD]/20 border-2 border-[#6F4ACD]' : 'bg-[#D9C8EF]/8 border border-transparent hover:bg-[#D9C8EF]/10'
                    }`}
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
                  className={`w-[327px] h-[70px] rounded-[12px] flex items-center justify-between gap-4 px-5 py-4 transition-colors mt-[10px] ${selectedOption === 'merge'
                    ? 'bg-[#6F4ACD]/20 border-2 border-[#6F4ACD]'
                    : 'bg-[#D9C8EF]/8 border border-transparent hover:bg-[#D9C8EF]/10'
                    }`}
                  onClick={() => {
                    setSelectedOption('merge');
                    setIsBottomSheetOpen(false);
                    setMode('merge-select');
                    setSelectedForMerge([]);
                  }}
                >
                  {/* 왼쪽 아이콘 + 설명 */}
                  <div className="flex items-center gap-4">
                    <div className="w-[25px] h-10 bg-gray-600 flex items-center justify-center text-[#FFF]">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col text-left">
                      <div className="text-[#FFF] font-medium text-[16px]">병합하기</div>
                      <div className="text-[#DFE1EA]/60 text-[13px] mt-0.5">
                        선택된 노트를 참고해 새 노트를 생성합니다
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽 과금 표시 */}
                  <div className="flex items-center gap-[2px] mb-[20px] mr-[10px]">
                    <img
                      src="/열쇠.png"
                      alt="key"
                      className="w-[25px] h-[25px] object-contain opacity-100"
                    />
                    <span className="text-sm text-[#FFF] leading-none">10</span>
                  </div>
                </button>

              </div>
            </div>
          </div>
        </>
      </div>

      <style>{`.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}`}</style>
    </div>
  );
};

export default ChattingUserNote;