import React, { useEffect, useState, useCallback } from 'react';
import './ChatSetting.css';
import { InputWithCounter } from '../../components/ChatSettingcomponents/InputWithCounter';
import { RadioGroup } from '../../components/ChatSettingcomponents/RadioGroup';
import { ArrowLeftIcon } from '../../components/icons';
import PersonaDropdown from '../../components/ChatSettingcomponents/PersonaDropdown';
import BottomSheet from '../../components/ChatSettingcomponents/BottomSheet';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const GENDER_OPTIONS = [
  { id: 'male', label: '남성' },
  { id: 'female', label: '여성' },
  { id: 'none', label: '설정하지 않음' },
];

// 최소 타입
type ApiResponse<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};
type PersonaListItem = { personaId: number; name: string };
type PersonaDetail = {
  personaId: number;
  name: string;
  gender: 'MALE' | 'FEMALE' | string;
  persona: string; // 소개
};

// 유저노트 응답 타입 - 실제 API 구조에 맞게 수정
type UserNotesResult = {
  myNotes: Array<{
    userNoteId: number;
    title: string;
    description: string;
    createdAt: string;
  }>;
  likedNotes: Array<{
    userNoteId: number;
    title: string;
    description: string;
    author: string;
  }>;
};

const ChatSetting: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  // 로그인 체크 - 로그인하지 않은 경우 홈으로 리다이렉트
  useEffect(() => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/', { replace: true });
      return;
    }
  }, [isLoggedIn, navigate]);

  // characterId 저장만
  const [params] = useSearchParams();
  const [characterId, setCharacterId] = useState<string>('');
  useEffect(() => {
    const id = params.get('characterId') ?? '';
    setCharacterId(id);
  }, [params]);

  // 페르소나 드롭다운
  const [personaChoice, setPersonaChoice] = useState<string>('custom'); // 기본값을 'custom'으로 설정
  const [personaText, setPersonaText] = useState<string>('');     // custom 입력값
  const [personaOptions, setPersonaOptions] = useState<{ id: string; label: string }[]>([
    { id: 'custom', label: '직접 입력' },
  ]);

  // 폼
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'none'>('male');
  const [introduction, setIntroduction] = useState('');
  const [userNote, setUserNote] = useState('');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const effectivePersona = personaChoice === 'custom' ? personaText : personaChoice;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

  // 페르소나 목록 호출 (세션 쿠키 포함)
  useEffect(() => {
    if (!isLoggedIn) return; // 로그인하지 않은 경우 실행하지 않음
    
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/persona`, {
          credentials: 'include', // 세션 사용
        });
        if (!res.ok) throw new Error('GET /persona 실패');
        const data: ApiResponse<PersonaListItem[]> = await res.json();
        if (!data.isSuccess || !Array.isArray(data.result)) return;

        const opts = data.result.map((p) => ({ id: String(p.personaId), label: p.name }));
        setPersonaOptions([...opts, { id: 'custom', label: '직접 입력' }]);
      } catch {
        // 실패해도 화면 유지
        setPersonaOptions([{ id: 'custom', label: '직접 입력' }]);
      }
    })();
  }, [API_BASE_URL, isLoggedIn]);

  // 성별 매핑
  const mapGender = (g?: string): 'male' | 'female' | 'none' => {
    if (g === 'MALE') return 'male';
    if (g === 'FEMALE') return 'female';
    return 'none';
  };

  // 직접 입력 모드인지 확인
  const isCustomMode = personaChoice === 'custom';

  // 페르소나 선택 처리
  const handlePersonaChange = async (value: string) => {
    setPersonaChoice(value);
    
    if (value === 'custom') {
      // 직접 입력으로 변경 시 폼 초기화
      setName('');
      setGender('male');
      setIntroduction('');
      setPersonaText('');
      setUserNote('');
      return;
    }
    
    if (value === '') return;

    // 선택된 페르소나 정보 불러오기
    try {
      const res = await fetch(`${API_BASE_URL}/persona/${value}`, {
        credentials: 'include',
      });
      if (!res.ok) return;
      
      const data: ApiResponse<PersonaDetail> = await res.json();
      if (!data.isSuccess || !data.result) return;

      const persona = data.result;
      // 폼에 데이터 자동 반영
      setName(persona.name || '');
      setGender(mapGender(persona.gender));
      setIntroduction(persona.persona || '');
    } catch {
      // 무시
    }
  };

  // 유저노트 불러오기 → 분기 (API 구조에 맞게 수정)
  const handleOpenUserNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/usernote/my-usernotes`, {
        method: 'GET',
        headers: { accept: '*/*' },
        credentials: 'include',
      });
      if (!res.ok) {
        // 실패 시에도 이동하지 않고 바텀시트로 안내
        setSheetOpen(true);
        return;
      }
      const data: ApiResponse<UserNotesResult> = await res.json();
      const result = data?.result ?? { myNotes: [], likedNotes: [] };
      const hasNotes =
        (result.myNotes?.length ?? 0) > 0 ||
        (result.likedNotes?.length ?? 0) > 0;

      if (hasNotes) {
        navigate('/ChattingUserNote');
      } else {
        setSheetOpen(true);
      }
    } catch {
      setSheetOpen(true);
    } finally {
      setNotesLoading(false);
    }
  }, [API_BASE_URL, navigate]);

  const handleSubmit = () => {
    if (personaChoice === 'custom' && !personaText.trim()) {
      alert('페르소나를 입력해주세요.');
      return;
    }
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!introduction.trim()) {
      alert('소개를 입력해주세요.');
      return;
    }
    console.log('채팅 설정 완료:', { 
      characterId, 
      effectivePersona, 
      name, 
      gender, 
      introduction, 
      userNote 
    });
  };

  // 로그인하지 않은 경우 로딩 화면 표시
  if (!isLoggedIn) {
    return (
      <div className="cs-root">
        <div className="cs-app" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '16px' 
        }}>
          로그인 중...
        </div>
      </div>
    );
  }

  return (
    <div className="cs-root">
      <div className="cs-app">
        {/* 헤더 */}
        <header className="cs-titlebar">
          <div className="cs-titlerow">
            <button className="cs-backbtn" aria-label="뒤로가기" onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="cs-backicon" />
            </button>
            <h1 className="cs-title">채팅 설정</h1>
          </div>
        </header>

        <main className="cs-scroll">
          <div className="cs-section">
            {/* 페르소나 */}
            <div className="cs-field">
              <label htmlFor="persona" className="cs-label">페르소나</label>
              <PersonaDropdown
                id="persona"
                value={personaChoice}
                onChange={handlePersonaChange}
                options={personaOptions}
                placeholder="페르소나를 선택하세요"
                customId="custom"
                customValue={personaText}
                onCustomChange={setPersonaText}
              />
            </div>

            {/* 이름 */}
            <div className="cs-field" style={{ opacity: isCustomMode ? 1 : 0.6 }}>
              <InputWithCounter
                id="name"
                label="이름"
                value={name}
                onChange={(e) => {
                  if (isCustomMode) {
                    setName(e.target.value);
                  }
                }}
                maxLength={20}
                placeholder="20자 이내로 입력해주세요"
                required
              />
            </div>

            {/* 성별 */}
            <div className="cs-field">
              <div style={{ 
                pointerEvents: isCustomMode ? 'auto' : 'none', 
                opacity: isCustomMode ? 1 : 0.6 
              }}>
                <RadioGroup
                  label="성별"
                  name="gender"
                  options={GENDER_OPTIONS}
                  selectedValue={gender}
                  onChange={(v) => {
                    if (isCustomMode) {
                      setGender(v as 'male' | 'female' | 'none');
                    }
                  }}
                  required
                />
              </div>
            </div>

            {/* 소개 */}
            <div className="cs-field" style={{ opacity: isCustomMode ? 1 : 0.6 }}>
              <InputWithCounter
                id="introduction"
                label="소개"
                value={introduction}
                onChange={(e) => {
                  if (isCustomMode) {
                    setIntroduction(e.target.value);
                  }
                }}
                maxLength={350}
                placeholder="캐릭터가 기억해 줬으면 하는 내용을 적어주세요"
                required
                isTextarea
                rows={6}
              />
            </div>

            {/* 유저노트 */}
            <hr className="border-t border-[#283143] my-4" />
            <div className="cs-field">
              <div className="cs-field-head">
                <div>
                  <h2 className="cs-label">유저노트</h2>
                  <p className="cs-help">유저노트를 이용해서<br /> 더 다양한 대화를 나눌 수 있어요!</p>
                </div>
                <button
                  className="cs-btn"
                  type="button"
                  onClick={handleOpenUserNotes}
                  disabled={notesLoading}
                >
                  {notesLoading ? '불러오는 중...' : '불러오기'}
                </button>
              </div>
            </div>

            <div style={{ height: 8 }} />
          </div>
        </main>

        {/* 하단 버튼 */}
        <footer className="cs-footer">
          <button
            type="button"
            className="cs-primary"
            onClick={handleSubmit}
            disabled={
              (personaChoice === 'custom' && !personaText.trim()) ||
              !name.trim() ||
              !introduction.trim()
            }
          >
            대화하기
          </button>
        </footer>

        {/* 바텀시트: 비어있을 때만 노출 */}
        <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="유저노트">
          <div className="sheet-card">
            <div className="sheet-icon" aria-hidden>🗒️</div>
            <div className="sheet-head">저장한 유저노트가 없어요</div>
            <ul className="sheet-bullets">
              <li>유저노트를 적용하면 새로운 세계관에서 대화할 수 있어요</li>
              <li>인기 유저노트를 둘러보고 마음에 드는 유저노트를 적용해보세요</li>
            </ul>
            <button
              className="sheet-cta"
              type="button"
              onClick={() => {
                setSheetOpen(false);
                navigate('/UserNoteWrite');
              }}
            >
              유저노트 작성하기
            </button>
          </div>
        </BottomSheet>
      </div>
    </div>
  );
};

export default ChatSetting;