import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '../components/icons';
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
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="4" r="1.5" fill="white"/>
      <circle cx="10" cy="10" r="1.5" fill="white"/>
      <circle cx="10" cy="16" r="1.5" fill="white"/>
    </svg>
  </button>
);

// SingleSelectableCard - 단일 선택용 카드 (수정된 버전)
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
      // relative 추가하여 KebabButton의 absolute positioning 기준점 설정
      'relative flex w-[335px] p-[10px_16px] items-start gap-[24px] rounded-[12px] text-left transition-all',
      selected 
        ? 'bg-[#6F4ACD]/10 border-2 border-[#6F4ACD]' 
        : 'bg-[rgba(217,200,239,0.03)] border border-transparent hover:bg-[#D9C8EF]/10',
    ].join(' ')}
  >
    <div className="flex-1 pr-8"> {/* 오른쪽 여백 추가하여 케밥 버튼 공간 확보 */}
      <KebabButton />
      
      {/* 타이틀 */}
      <h3 className="text-[#F8F8FA] font-semibold text-[16px] leading-[150%] tracking-[0.091px] mb-1" 
          style={{ fontFamily: 'Pretendard' }}>
        {title}
      </h3>
      
      {/* 내용 컨테이너 */}
      <div className="flex h-[40px] flex-col justify-center self-stretch">
        <p className="overflow-hidden text-[rgba(223,225,234,0.61)] font-normal text-[14px] leading-[142.9%] tracking-[0.203px] line-clamp-2 mt-[-10px]" 
          style={{ fontFamily: 'Pretendard' }}>
          {description}
        </p>
      </div>
      
      {/* 태그 컨테이너 */}
      <div className="inline-flex p-[4px_6px] items-center gap-[4.638px] mt-3 rounded-[6px] bg-[rgba(69,74,85,0.32)] backdrop-blur-[2px]">
        <span className="text-[rgba(223,225,234,0.61)] font-normal text-[12px] leading-[133.4%] tracking-[0.302px] w-fit h-auto p-2 min-w-0 max-w-full break-words" 
              style={{ fontFamily: 'Pretendard' }}>
          {meta}
        </span>
      </div>
    </div>
  </button>
);

// SelectableCard - 다중 선택용 카드 (수정된 버전)
const SelectableCard: React.FC<{
  title: string;
  description: string;
  meta: string;
  selected: boolean;
  onToggle: () => void;
}> = ({ title, description, meta, selected, onToggle }) => (
  <div
    className={[
      // 컨테이너: display: flex, width: 335px, padding: 10px 16px, align-items: flex-start, gap: 24px
      'flex w-[300px] p-[10px_16px] items-start gap-[24px] rounded-[12px] transition-all cursor-pointer',
      // 배경: border-radius: 12px, background: rgba(217, 200, 239, 0.03)
      selected 
        ? 'bg-[#D9C8EF]/10 border-2 border-[#6F4ACD]' 
        : 'bg-[rgba(217,200,239,0.03)] border border-transparent hover:bg-[#D9C8EF]/10',
    ].join(' ')}
    onClick={onToggle}
    role="button"
    aria-pressed={selected}
  >
    {/* 체크박스 */}
    <span className={[
      'w-[22px] h-[22px] rounded-[4px] border-[#DADDE9] flex items-center justify-center',
      'ring-2 transition-all flex-shrink-0',
      selected ? 'bg-[#6F4ACD] ring-[#6F4ACD] scale-100' : 'bg-[#2B3240] ring-[#3A4152] scale-95',
    ].join(' ')}>
      {selected && (
        <svg className="w-[12px] h-[12px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </span>

    <div className="flex-1">
      {/* 타이틀 - 완전 적용됨 */}
      <h3 className="text-[#F8F8FA] font-semibold text-[16px] leading-[150%] tracking-[0.091px] mb-1 mt-[-2px] ml-[-10px]" 
          style={{ fontFamily: 'Pretendard' }}>
        {title}
      </h3>
      
      {/* 내용 컨테이너 - 완전 적용됨 */}
      <div className="flex h-[40px] flex-col justify-center self-stretch">
        <p className="overflow-hidden text-[rgba(223,225,234,0.61)] font-normal text-[14px] leading-[142.9%] tracking-[0.203px] line-clamp-2 mt-[-10px] ml-[-10px]" 
          style={{ fontFamily: 'Pretendard' }}>
          {description}
        </p>
      </div>
      
      {/* 태그 컨테이너 - 긴 텍스트 처리 개선 */}
      <div className="inline-flex p-[4px_6px] items-center gap-[4.638px] mt-3 rounded-[6px] bg-[rgba(69,74,85,0.32)] backdrop-blur-[2px] ml-[-10px]"> 
        <span className="text-[rgba(223,225,234,0.61)] font-normal text-[12px] leading-[133.4%] tracking-[0.302px] w-fit h-auto p-2 min-w-0 max-w-full break-words" 
              style={{ fontFamily: 'Pretendard' }}>
          {meta}
        </span>
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
  // characterId를 sessionStorage에 저장 (혹시 이 경로로도 UserNoteWrite로 갈 수 있으므로)
  const savedCharacterId = sessionStorage.getItem('tempCharacterId');
  if (savedCharacterId) {
    // 이미 저장되어 있다면 그대로 유지
  }
  
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

    // sessionStorage에서 characterId 복원
    const savedCharacterId = sessionStorage.getItem('tempCharacterId');

    if (!userNoteDetail) {
      // API 호출 실패 시 기존 로직 유지 (fallback)
      let description = '';
      if (kind === 'my') description = myNotes.find((n) => n.userNoteId === id)?.description || '';
      else description = likedNotes.find((n) => n.userNoteId === id)?.description || '';

      const draft = { ...(incomingDraft || {}), userNote: description };
      
      // characterId가 있으면 쿼리 파라미터로, 없으면 기존 fromSearch 사용
      const targetUrl = savedCharacterId 
        ? `/ChatSetting?characterId=${savedCharacterId}` 
        : `/ChatSetting${fromSearch || ''}`;
        
      // sessionStorage 정리
      sessionStorage.removeItem('tempCharacterId');
      
      navigate(targetUrl, {
        state: { 
          selectedUserNoteDescription: description, 
          draft,
          userNoteSelected: true // 유저노트가 선택되었음을 표시
        }
      });
      return;
    }

    // API에서 가져온 prompt 데이터 사용
    const draft = { ...(incomingDraft || {}), userNote: userNoteDetail.prompt };
    
    const targetUrl = savedCharacterId 
      ? `/ChatSetting?characterId=${savedCharacterId}` 
      : `/ChatSetting${fromSearch || ''}`;
      
    // sessionStorage 정리
    sessionStorage.removeItem('tempCharacterId');
    
    navigate(targetUrl, {
      state: {
        selectedUserNoteDescription: userNoteDetail.prompt,
        selectedUserNoteDetail: userNoteDetail,
        draft,
        userNoteSelected: true // 유저노트가 선택되었음을 표시
      }
    });

  } catch (error) {
    console.error('Error applying user note:', error);
    
    // 에러 발생 시에도 기존 로직으로 fallback
    const savedCharacterId = sessionStorage.getItem('tempCharacterId');
    const [kind, idStr] = selectedApply.split(':');
    const id = parseInt(idStr, 10);
    let description = '';
    if (kind === 'my') description = myNotes.find((n) => n.userNoteId === id)?.description || '';
    else description = likedNotes.find((n) => n.userNoteId === id)?.description || '';

    const draft = { ...(incomingDraft || {}), userNote: description };
    
    const targetUrl = savedCharacterId 
      ? `/ChatSetting?characterId=${savedCharacterId}` 
      : `/ChatSetting${fromSearch || ''}`;
      
    // sessionStorage 정리
    sessionStorage.removeItem('tempCharacterId');
    
    navigate(targetUrl, {
      state: { 
        selectedUserNoteDescription: description, 
        draft,
        userNoteSelected: true // 유저노트가 선택되었음을 표시
      }
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}> {/* 20px 간격 */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}> {/* 20px 간격 */}
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
            <div className="pointer-events-auto mb-[-15px]">
              <div className="w-[335px] mx-auto py-[40px] flex gap-3">
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
                <h3 className="text-[#FFF] text-[16px] ml-[20px]">생성하기</h3>
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
                  className={`
                    flex w-[327px] p-[12px_8px_12px_16px] items-start gap-[12px] rounded-[12px] transition-colors
                    ${selectedOption === 'write' 
                      ? 'bg-[#D9C8EF]/[0.03] border-2 border-[#6F4ACD]' 
                      : 'bg-[#D9C8EF]/[0.03] border border-transparent hover:bg-[#D9C8EF]/10'
                    }
                  `}
                  onClick={handleSelectWrite}
                >
                  <div className="w-[25px] h-10 bg-gray-600 flex items-center justify-center text-[#FFF]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
                      <g clipPath="url(#clip0_2736_2692)">
                        <path d="M5.35312 16.4016C5.58213 16.3391 5.69663 16.3079 5.8034 16.26C5.89821 16.2174 5.98834 16.1651 6.07233 16.1039C6.16693 16.035 6.25085 15.9511 6.41869 15.7832L14.1688 8.03315C14.3173 7.88464 14.3915 7.81039 14.4193 7.72477C14.4438 7.64945 14.4438 7.56832 14.4193 7.493C14.3915 7.40738 14.3173 7.33313 14.1688 7.18462L12.0173 5.03315C11.8688 4.88464 11.7945 4.81039 11.7089 4.78257C11.6336 4.7581 11.5525 4.7581 11.4771 4.78257C11.3915 4.81039 11.3173 4.88464 11.1688 5.03315L3.4187 12.7832C3.25085 12.9511 3.16693 13.035 3.098 13.1296C3.03681 13.2136 2.98451 13.3037 2.94194 13.3985C2.894 13.5053 2.86277 13.6198 2.80032 13.8488L1.84302 17.3589L5.35312 16.4016Z" fill="#F8F8FA"/>
                        <path d="M13.843 2.35889L16.843 5.35889M1.84302 17.3589L2.80032 13.8488C2.86277 13.6198 2.894 13.5053 2.94194 13.3985C2.98451 13.3037 3.03681 13.2136 3.098 13.1296C3.16693 13.035 3.25085 12.9511 3.4187 12.7832L11.1688 5.03315C11.3173 4.88464 11.3915 4.81039 11.4771 4.78257C11.5525 4.7581 11.6336 4.7581 11.7089 4.78257C11.7945 4.81039 11.8688 4.88464 12.0173 5.03315L14.1688 7.18462C14.3173 7.33313 14.3915 7.40738 14.4193 7.493C14.4438 7.56832 14.4438 7.64945 14.4193 7.72477C14.3915 7.81039 14.3173 7.88464 14.1688 8.03315L6.4187 15.7832C6.25085 15.9511 6.16693 16.035 6.07233 16.1039C5.98834 16.1651 5.89821 16.2174 5.8034 16.26C5.69663 16.3079 5.58213 16.3391 5.35312 16.4016L1.84302 17.3589Z" stroke="#F8F8FA" strokeWidth="1.62" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_2736_2692">
                          <rect width="18" height="18" fill="white" transform="translate(0.343018 0.858887)"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div 
                        className="font-semibold text-[16px] leading-[150%] tracking-[0.091px]"
                        style={{ 
                          fontFamily: 'Pretendard',
                          fontWeight: 600,
                          color: '#F8F8FA'
                        }}
                      >
                        직접 작성하기
                      </div>
                      {/* 설명 - Semantic/Label/Alternative 스타일 적용 */}
                      <div 
                        className="text-[14px] leading-[142.9%] tracking-[0.203px] mt-0.5"
                        style={{ 
                          fontFamily: 'Pretendard',
                          fontWeight: 400,
                          color: 'rgba(223, 225, 234, 0.61)'
                        }}
                      >
                        처음부터 새 노트를 직접 작성합니다
                      </div>
                  </div>
                </button>

               <button
                    type="button"
                    role="radio"
                    aria-checked={selectedOption === 'merge'}
                    className={`
                      flex w-[327px] p-[12px_8px_12px_16px] items-start gap-[12px] rounded-[12px] transition-colors mt-[10px]
                      ${selectedOption === 'merge'
                        ? 'bg-[#D9C8EF]/[0.03] border-2 border-[#6F4ACD]'
                        : 'bg-[#D9C8EF]/[0.03] border border-transparent hover:bg-[#D9C8EF]/10'
                      }
                    `}
                    onClick={() => {
                      setSelectedOption('merge');
                      setIsBottomSheetOpen(false);
                      setMode('merge-select');
                      setSelectedForMerge([]);
                    }}
                  >
                  {/* 왼쪽 아이콘 + 설명 */}
                  <div className="flex items-start gap-[12px]">
                    <div className="w-[25px] h-10 bg-gray-600 flex items-center justify-center text-[#FFF]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                        <path d="M0.843018 3.75889C0.843018 2.91881 0.843018 2.49877 1.00651 2.1779C1.15032 1.89566 1.37979 1.66619 1.66203 1.52238C1.9829 1.35889 2.40294 1.35889 3.24302 1.35889H8.94302C9.7831 1.35889 10.2031 1.35889 10.524 1.52238C10.8062 1.66619 11.0357 1.89566 11.1795 2.1779C11.343 2.49877 11.343 2.91881 11.343 3.75889V9.45889C11.343 10.299 11.343 10.719 11.1795 11.0399C11.0357 11.3221 10.8062 11.5516 10.524 11.6954C10.2031 11.8589 9.7831 11.8589 8.94302 11.8589H3.24302C2.40294 11.8589 1.9829 11.8589 1.66203 11.6954C1.37979 11.5516 1.15032 11.3221 1.00651 11.0399C0.843018 10.719 0.843018 10.299 0.843018 9.45889V3.75889Z" fill="#F8F8FA" fillOpacity="0.3"/>
                        <path d="M5.34302 8.25889C5.34302 7.41881 5.34302 6.99877 5.50651 6.6779C5.65032 6.39566 5.87979 6.16619 6.16203 6.02238C6.4829 5.85889 6.90294 5.85889 7.74302 5.85889H13.443C14.2831 5.85889 14.7031 5.85889 15.024 6.02238C15.3062 6.16619 15.5357 6.39566 15.6795 6.6779C15.843 6.99877 15.843 7.41881 15.843 8.25889V13.9589C15.843 14.799 15.843 15.219 15.6795 15.5399C15.5357 15.8221 15.3062 16.0516 15.024 16.1954C14.7031 16.3589 14.2831 16.3589 13.443 16.3589H7.74302C6.90294 16.3589 6.4829 16.3589 6.16203 16.1954C5.87979 16.0516 5.65032 15.8221 5.50651 15.5399C5.34302 15.219 5.34302 14.799 5.34302 13.9589V8.25889Z" fill="#F8F8FA" fillOpacity="0.3"/>
                        <path d="M0.843018 3.75889C0.843018 2.91881 0.843018 2.49877 1.00651 2.1779C1.15032 1.89566 1.37979 1.66619 1.66203 1.52238C1.9829 1.35889 2.40294 1.35889 3.24302 1.35889H8.94302C9.7831 1.35889 10.2031 1.35889 10.524 1.52238C10.8062 1.66619 11.0357 1.89566 11.1795 2.1779C11.343 2.49877 11.343 2.91881 11.343 3.75889V9.45889C11.343 10.299 11.343 10.719 11.1795 11.0399C11.0357 11.3221 10.8062 11.5516 10.524 11.6954C10.2031 11.8589 9.7831 11.8589 8.94302 11.8589H3.24302C2.40294 11.8589 1.9829 11.8589 1.66203 11.6954C1.37979 11.5516 1.15032 11.3221 1.00651 11.0399C0.843018 10.719 0.843018 10.299 0.843018 9.45889V3.75889Z" stroke="#F8F8FA" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.34302 8.25889C5.34302 7.41881 5.34302 6.99877 5.50651 6.6779C5.65032 6.39566 5.87979 6.16619 6.16203 6.02238C6.4829 5.85889 6.90294 5.85889 7.74302 5.85889H13.443C14.2831 5.85889 14.7031 5.85889 15.024 6.02238C15.3062 6.16619 15.5357 6.39566 15.6795 6.6779C15.843 6.99877 15.843 7.41881 15.843 8.25889V13.9589C15.843 14.799 15.843 15.219 15.6795 15.5399C15.5357 15.8221 15.3062 16.0516 15.024 16.1954C14.7031 16.3589 14.2831 16.3589 13.443 16.3589H7.74302C6.90294 16.3589 6.4829 16.3589 6.16203 16.1954C5.87979 16.0516 5.65032 15.8221 5.50651 15.5399C5.34302 15.219 5.34302 14.799 5.34302 13.9589V8.25889Z" stroke="#F8F8FA" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex flex-col text-left">
                      <div 
                          className="font-semibold text-[16px] leading-[150%] tracking-[0.091px]"
                          style={{ 
                            fontFamily: 'Pretendard',
                            fontWeight: 600,
                            color: '#F8F8FA'
                          }}
                        >
                          병합하기
                        </div>
                        {/* 설명 - 선택된 노트를 합쳐 새 노트를 생성합니다 */}
                        <div 
                          className="text-[14px] leading-[142.9%] tracking-[0.203px] mt-0.5 whitespace-nowrap"
                          style={{ 
                            fontFamily: 'Pretendard',
                            fontWeight: 400,
                            color: 'rgba(223, 225, 234, 0.61)'
                          }}
                        >
                          선택된 노트를 합쳐 새 노트를 생성합니다
                        </div>
                    </div>
                  </div>

                  {/* 오른쪽 과금 표시 */}
                  <div className="flex items-start gap-[2px] flex-shrink-0 ml-[-40px] mt-[-8px]">
                    <img
                      src="/열쇠.png"
                      alt="key"
                      className="w-[22px] h-[22px] object-contain opacity-100"
                    />
                    <span className="text-sm text-[#FFF] leading-none mt-[4px]">10</span>
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