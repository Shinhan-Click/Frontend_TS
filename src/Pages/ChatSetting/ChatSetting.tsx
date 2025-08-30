import React, { useEffect, useState, useCallback } from 'react';
import './ChatSetting.css';
import { InputWithCounter } from '../../components/ChatSettingcomponents/InputWithCounter';
import { RadioGroup } from '../../components/ChatSettingcomponents/RadioGroup';
import { ArrowLeftIcon } from '../../components/icons';
import PersonaDropdown from '../../components/ChatSettingcomponents/PersonaDropdown';
import BottomSheet from '../../components/ChatSettingcomponents/BottomSheet';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = '/api';

const GENDER_OPTIONS = [
  { id: 'male', label: '남성' },
  { id: 'female', label: '여성' },
  { id: 'none', label: '설정하지 않음' },
];

type ApiResponse<T> = { isSuccess: boolean; code: string; message: string; result: T };
type PersonaListItem = { personaId: number; name: string };
type PersonaDetail = { personaId: number; name: string; gender: 'MALE' | 'FEMALE' | string; persona: string };

type UserNotesResult = {
  myNotes: Array<{ userNoteId: number; title: string; description: string; createdAt: string }>;
  likedNotes: Array<{ userNoteId: number; title: string; description: string; author: string }>;
};

const ChatSetting: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const state = location?.state as any;
    if (state?.selectedUserNote) {
      setSelectedUserNote(state.selectedUserNote);
      window.history.replaceState({}, document.title);
    }
  }, [location?.state]);

  const [params] = useSearchParams();
  const [characterId, setCharacterId] = useState<string>('');
  useEffect(() => {
    setCharacterId(params.get('characterId') ?? '');
  }, [params]);

  const [personaChoice, setPersonaChoice] = useState<string>('custom');
  const [personaText, setPersonaText] = useState<string>('');
  const [personaOptions, setPersonaOptions] = useState<{ id: string; label: string }[]>([{ id: 'custom', label: '직접 입력' }]);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'none'>('male');
  const [introduction, setIntroduction] = useState('');
  const [userNote, setUserNote] = useState('');

  const [selectedUserNote, setSelectedUserNote] = useState<{
    title: string;
    description: string;
    type: 'my' | 'liked';
    author?: string;
  } | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const effectivePersona = personaChoice === 'custom' ? personaText : personaChoice;

  // 페르소나 목록
  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/persona`, { credentials: 'include' });
        if (!res.ok) throw new Error('GET /persona 실패');
        const data: ApiResponse<PersonaListItem[]> = await res.json();
        if (!data.isSuccess || !Array.isArray(data.result)) return;
        const opts = data.result.map((p) => ({ id: String(p.personaId), label: p.name }));
        setPersonaOptions([...opts, { id: 'custom', label: '직접 입력' }]);
      } catch {
        setPersonaOptions([{ id: 'custom', label: '직접 입력' }]);
      }
    })();
  }, [isLoggedIn]);

  const mapGender = (g?: string): 'male' | 'female' | 'none' => (g === 'MALE' ? 'male' : g === 'FEMALE' ? 'female' : 'none');

  const handlePersonaChange = async (value: string) => {
    setPersonaChoice(value);
    if (value === 'custom') {
      setName('');
      setIntroduction('');
      setPersonaText('');
      setUserNote('');
      return;
    }
    if (!value) return;
    try {
      const res = await fetch(`${API_BASE}/persona/${value}`, { credentials: 'include' });
      if (!res.ok) return;
      const data: ApiResponse<PersonaDetail> = await res.json();
      if (!data.isSuccess || !data.result) return;
      const persona = data.result;
      setName(persona.name || '');
      setGender(mapGender(persona.gender));
      setIntroduction(persona.persona || '');
    } catch {
      // 무시
    }
  };

  const handleOpenUserNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/usernote/my-usernotes`, {
        method: 'GET',
        headers: { accept: '*/*' },
        credentials: 'include',
      });
      if (!res.ok) {
        setSheetOpen(true);
        return;
      }
      const data: ApiResponse<UserNotesResult> = await res.json();
      const result = data?.result ?? { myNotes: [], likedNotes: [] };
      const hasNotes = (result.myNotes?.length ?? 0) > 0 || (result.likedNotes?.length ?? 0) > 0;
      if (hasNotes) navigate('/ChattingUserNote');
      else setSheetOpen(true);
    } catch {
      setSheetOpen(true);
    } finally {
      setNotesLoading(false);
    }
  }, [navigate]);

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
    console.log('채팅 설정 완료:', { characterId, effectivePersona, name, gender, introduction, userNote });
  };

  if (!isLoggedIn) {
    return (
      <div className="cs-root">
        <div className="cs-app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '16px' }}>
          로그인 중...
        </div>
      </div>
    );
  }

  return (
    <div className="cs-root">
      <div className="cs-app">
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

            <div className="cs-field">
              <InputWithCounter
                id="name"
                label="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="20자 이내로 입력해주세요"
                required
              />
            </div>

            <div className="cs-field">
              <RadioGroup
                label="성별"
                name="gender"
                options={GENDER_OPTIONS}
                selectedValue={gender}
                onChange={(v) => setGender(v as 'male' | 'female' | 'none')}
                required
              />
            </div>

            <div className="cs-field">
              <InputWithCounter
                id="introduction"
                label="소개"
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                maxLength={350}
                placeholder="캐릭터가 기억해 줬으면 하는 내용을 적어주세요"
                required
                isTextarea
                rows={6}
              />
            </div>

            <hr className="border-t border-[#283143] my-4" />
            <div className="cs-field">
              <div className="cs-field-head">
                <div>
                  <h2 className="cs-label">유저노트</h2>
                  <p className="cs-help">유저노트를 이용해서<br /> 더 다양한 대화를 나눌 수 있어요!</p>
                </div>
                <button className="cs-btn" type="button" onClick={handleOpenUserNotes} disabled={notesLoading}>
                  {notesLoading ? '불러오는 중...' : '불러오기'}
                </button>
              </div>
            </div>

            {selectedUserNote && (
              <div
                style={{
                  backgroundColor: '#1e2532',
                  border: '1px solid #283143',
                  borderRadius: '12px',
                  padding: '16px',
                  marginTop: '12px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 'normal', margin: 0, lineHeight: '1.3' }}>
                    {selectedUserNote.title}
                  </h3>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: 0,
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      marginLeft: '8px',
                      flexShrink: 0,
                    }}
                    onClick={() => setSelectedUserNote(null)}
                    aria-label="유저노트 제거"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a3441')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    ×
                  </button>
                </div>
                <p
                  style={{
                    color: 'rgba(223, 225, 234, 0.61)',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    margin: '0 0 12px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 6,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    maxHeight: '120px',
                  }}
                >
                  {selectedUserNote.description}
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(69, 74, 85, 0.32)',
                    color: '#9CA3AF',
                    fontSize: '12px',
                    padding: '4px 12px',
                    borderRadius: '6px',
                  }}
                >
                  {selectedUserNote.type === 'liked' && selectedUserNote.author ? `@${selectedUserNote.author}` : '내가 만든 노트'}
                </div>
              </div>
            )}

            <div style={{ height: 8 }} />
          </div>
        </main>

        <footer className="cs-footer">
          <button
            type="button"
            className="cs-primary"
            onClick={handleSubmit}
            disabled={(personaChoice === 'custom' && !personaText.trim()) || !name.trim() || !introduction.trim()}
          >
            대화하기
          </button>
        </footer>

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