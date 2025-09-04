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
type CharacterDetail = {
  characterId: number;
  characterImageUrl: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  description: string;
  authorComment: string;
  introductions: Array<{ introductionId: number; title: string; text: string }>;
  tags: Array<{ tagId: number; name: string }>;
  story?: { storyId: number; storyImageUrl: string; title: string; description: string };
};
type Draft = {
  personaChoice?: string;
  personaText?: string;
  name?: string;
  gender?: 'male' | 'female' | 'none';
  introduction?: string;
  userNote?: string;
};
type LocationState =
  | {
    selectedUserNoteDescription?: string | null;
    draft?: Draft;
    fromSearch?: string;
  }
  | null;

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

  const [params] = useSearchParams();
  const [characterId, setCharacterId] = useState<string>('');
  useEffect(() => {
    setCharacterId(params.get('characterId') ?? '');
  }, [params]);

  const [characterName, setCharacterName] = useState<string>('');
  const [characterImageUrl, setCharacterImageUrl] = useState<string>('');
  useEffect(() => {
    if (!characterId) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/character/${characterId}`, {
          credentials: 'include',
          headers: { accept: '*/*' },
        });
        if (!res.ok) return;
        const data: ApiResponse<CharacterDetail> = await res.json();
        if (data?.isSuccess && data.result) {
          setCharacterName(data.result.name ?? '');
          setCharacterImageUrl(data.result.characterImageUrl ?? '');
        }
      } catch { }
    })();
  }, [characterId]);

  const [personaChoice, setPersonaChoice] = useState<string>('');
  const [personaText, setPersonaText] = useState<string>('');
  const [personaOptions, setPersonaOptions] = useState<{ id: string; label: string }[]>([
    { id: 'custom', label: '직접 입력' },
  ]);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'none'>('male');
  const [introduction, setIntroduction] = useState('');
  const [userNote, setUserNote] = useState('');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const state = (location?.state as LocationState) || null;
    if (state?.draft) {
      const d = state.draft;
      if (d.personaChoice) setPersonaChoice(d.personaChoice);
      if (typeof d.personaText === 'string') setPersonaText(d.personaText);
      if (typeof d.name === 'string') setName(d.name);
      if (d.gender === 'male' || d.gender === 'female' || d.gender === 'none') setGender(d.gender);
      if (typeof d.introduction === 'string') setIntroduction(d.introduction);
      if (typeof d.userNote === 'string') setUserNote(d.userNote);
    }
    if (state && 'selectedUserNoteDescription' in state) {
      setUserNote(state.selectedUserNoteDescription ?? '');
    }
    if (state) window.history.replaceState({}, document.title);
  }, [location?.state]);

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/persona`, { credentials: 'include' });
        if (!res.ok) throw new Error();
        const data: ApiResponse<PersonaListItem[]> = await res.json();
        if (!data.isSuccess || !Array.isArray(data.result)) return;
        const opts = data.result.map((p) => ({ id: String(p.personaId), label: p.name }));
        setPersonaOptions([...opts, { id: 'custom', label: '직접 입력' }]);
      } catch {
        setPersonaOptions([{ id: 'custom', label: '직접 입력' }]);
      }
    })();
  }, [isLoggedIn]);

  const mapGender = (g?: string): 'male' | 'female' | 'none' =>
    g === 'MALE' ? 'male' : g === 'FEMALE' ? 'female' : 'none';

  const handlePersonaChange = async (value: string) => {
    setPersonaChoice(value);

    if (value === 'custom') {
      // 직접 입력 선택 시 필드들을 초기값으로 리셋
      setName('');
      setGender('male');
      setIntroduction('');
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
    } catch { }
  };

  const handleOpenUserNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/usernote/my-usernotes`, {
        method: 'GET',
        headers: { accept: '*/*', 'Cache-Control': 'no-cache' },
        credentials: 'include',
      });

      const draft: Draft = { personaChoice, personaText, name, gender, introduction, userNote };
      const fromSearch = location.search || window.location.search || '';

      if (!res.ok) {
        setSheetOpen(true);
        return;
      }

      const data: ApiResponse<UserNotesResult> = await res.json();
      const r = data?.result ?? { myNotes: [], likedNotes: [] };
      const hasNotes = (r.myNotes?.length ?? 0) > 0 || (r.likedNotes?.length ?? 0) > 0;

      if (hasNotes) {
        navigate('/ChattingUserNote', { state: { draft, fromSearch } });
      } else {
        setSheetOpen(true);
      }
    } catch {
      setSheetOpen(true);
    } finally {
      setNotesLoading(false);
    }
  }, [navigate, personaChoice, personaText, name, gender, introduction, userNote, location.search]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!introduction.trim()) {
      alert('소개를 입력해주세요.');
      return;
    }
    if (!characterId) {
      alert('캐릭터가 선택되지 않았습니다.');
      return;
    }

    setCreating(true);

    const personaGender: 'MALE' | 'FEMALE' | 'NONE' =
      gender === 'male' ? 'MALE' : gender === 'female' ? 'FEMALE' : 'NONE';

    try {
      // 직접 입력인 경우 페르소나 생성 API 호출
      if (personaChoice === 'custom') {
        const personaCreatePayload = {
          name: name.trim(),
          gender: personaGender === 'NONE' ? 'MALE' : personaGender, // NONE일 경우 기본값 MALE
          persona: introduction.trim()
        };

        const personaRes = await fetch(`${API_BASE}/persona/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', accept: '*/*' },
          credentials: 'include',
          body: JSON.stringify(personaCreatePayload),
        });

        if (!personaRes.ok) {
          throw new Error('페르소나 생성에 실패했습니다.');
        }

        const personaData: ApiResponse<{ personaId: number }> = await personaRes.json();
        if (!personaData.isSuccess || !personaData.result) {
          throw new Error('페르소나 생성에 실패했습니다.');
        }
      }

      const payload = {
        characterId: Number(characterId),
        introductionId: null,
        personaName: name.trim(),
        personaGender,
        personaPrompt: introduction.trim(),
        userNotePrompt: userNote.trim() ? userNote.trim() : null,
      };

      const res = await fetch(`${API_BASE}/chat/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: '*/*' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();

      const data: ApiResponse<{ chatId: number; first_message: string }> = await res.json();
      if (!data.isSuccess || !data.result) throw new Error();

      const { chatId, first_message } = data.result;

      navigate(`/ChatRoom/${chatId}`, {
        state: {
          firstMessage: first_message,
          characterName,
          characterImageUrl,
          characterId: Number(characterId),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('채팅방 생성에 실패했습니다.');
      }
    } finally {
      setCreating(false);
    }
  };

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
                customId=""
                customValue=""
                onCustomChange={() => { }}
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

            <hr className="border-t border-[#283143] my-2" />

            <div className="cs-field">
              <div className="cs-field-head">
                <div>
                  <h2 className="cs-label">유저노트</h2>
                  <p className="cs-help">유저노트를 이용해서<br />더 다양한 대화를 나눌 수 있어요!</p>
                </div>
                <button className="cs-btn" type="button" onClick={handleOpenUserNotes} disabled={notesLoading}>
                  {notesLoading ? '불러오는 중...' : '불러오기'}
                </button>
              </div>
            </div>

            {userNote !== '' && (
              <div style={{ marginTop: '16px' }}>
                <InputWithCounter
                  id="userNote"
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  maxLength={500}
                  placeholder="유저노트 내용을 편집하세요..."
                  isTextarea
                  rows={20}
                />
                <style>{`
                  #userNote { height: 380px !important; scrollbar-width: none; -ms-overflow-style: none; }
                  #userNote::-webkit-scrollbar { display: none; }
                `}</style>
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
            disabled={!name.trim() || !introduction.trim() || creating}
          >
            {creating ? '생성 중...' : '대화하기'}
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
                const draft: Draft = { personaChoice, personaText, name, gender, introduction, userNote };
                const fromSearch = location.search || window.location.search || '';
                setSheetOpen(false);
                navigate('/UserNoteWrite', { state: { draft, fromSearch } });
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