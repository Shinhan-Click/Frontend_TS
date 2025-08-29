import React, { useState, useRef, useEffect } from 'react';
import './Home.css';
import { SearchIcon } from '../../components/icons';
import NavBar from '../../components/NavBar';
import type { ApiResponse } from '../../types/api';
import type { Character, Story, UserNote } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// .env 에서 서버 절대 URL을 반드시 지정하세요.
// 예) VITE_API_BASE_URL=http://localhost:8080
const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

type CardItem = { id: string; image: string; title: string; description: string; author: string };

type SimpleUser = {
  id: string;
  image: string;
  name: string;
  message: string;
  tags: string[];
};

// API 데이터를 SimpleUser로 변환
const transformCharacterToUser = (characters: Character[]): SimpleUser[] => {
  return characters.map((char) => ({
    id: char.characterId.toString(),
    image: char.characterImageUrl,
    name: char.name,
    message: extractMessage(char.description),
    tags: char.tags.length > 0 ? char.tags : ['#캐릭터챗', '#로맨스'],
  }));
};

// Story를 CardItem으로 변환
const transformStoryToCard = (stories: Story[]): CardItem[] => {
  return stories.map((story) => ({
    id: story.storyId.toString(),
    image: story.storyImageUrl,
    title: story.title,
    description: extractDescription(story.description),
    author: story.author,
  }));
};

// UserNote를 CardItem으로 변환
const transformUserNoteToCard = (userNotes: UserNote[]): CardItem[] => {
  return userNotes.map((note) => ({
    id: note.userNoteId.toString(),
    image: note.userNoteImageUrl || 'https://picsum.photos/seed/default/400/300',
    title: note.title,
    description: extractDescription(note.description),
    author: note.author,
  }));
};

// description에서 메시지 추출
const extractMessage = (description: string): string => {
  const quoteMatch = description.match(/"([^"]+)"/);
  if (quoteMatch) return quoteMatch[1];
  const firstLine = description.split('\n')[0] ?? '';
  return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
};

// description 추출 (짧게)
const extractDescription = (description: string): string => {
  const lines = description
    .split('\n')
    .filter(
      (line) =>
        line.trim() &&
        !line.startsWith('#') &&
        !line.startsWith('-') &&
        !line.startsWith('*') &&
        line.length > 10,
    );
  const firstContent = lines[0] || description.split('\n')[0] || '';
  return firstContent.length > 100 ? firstContent.substring(0, 97) + '...' : firstContent;
};

// 캐릭터 API 호출
const fetchCharacters = async (): Promise<SimpleUser[]> => {
  try {
    const response = await fetch(`${API_BASE}/character/all`, { credentials: 'include' });
    if (!response.ok) throw new Error('캐릭터 API 호출 실패');
    const data: ApiResponse<Character[]> = await response.json();
    return data.isSuccess ? transformCharacterToUser(data.result) : [];
  } catch (error) {
    console.error('캐릭터 데이터 로딩 실패:', error);
    return [];
  }
};

// 소설 API 호출
const fetchStories = async (): Promise<CardItem[]> => {
  try {
    const response = await fetch(`${API_BASE}/story/all`, { credentials: 'include' });
    if (!response.ok) throw new Error('소설 API 호출 실패');
    const data: ApiResponse<Story[]> = await response.json();
    return data.isSuccess ? transformStoryToCard(data.result) : [];
  } catch (error) {
    console.error('소설 데이터 로딩 실패:', error);
    return [];
  }
};

// 유저노트 API 호출
const fetchUserNotes = async (): Promise<CardItem[]> => {
  try {
    const response = await fetch(`${API_BASE}/usernote/all`, { credentials: 'include' });
    if (!response.ok) throw new Error('유저노트 API 호출 실패');
    const data: ApiResponse<UserNote[]> = await response.json();
    return data.isSuccess ? transformUserNoteToCard(data.result) : [];
  } catch (error) {
    console.error('유저노트 데이터 로딩 실패:', error);
    return [];
  }
};

const Home: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [topUsers, setTopUsers] = useState<SimpleUser[]>([]);
  const [novels, setNovels] = useState<CardItem[]>([]);
  const [userNotes, setUserNotes] = useState<CardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const searchRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // 로그인 처리 - 서버가 302로 카카오로 이동
  const handleLogin = () => {
    if (!API_BASE) {
      alert('VITE_API_BASE_URL이 설정되지 않았습니다.');
      return;
    }
    window.location.href = `${API_BASE}/member/kakao/login`;
  };

  // 캐릭터 패널 버튼 → ChatSetting으로 이동
  const goToChatSetting = () => {
    const selected = topUsers.find((u) => u.id === activeCharacterId);
    if (!selected) return;
    navigate(`/ChatSetting?characterId=${encodeURIComponent(selected.id)}`, {
      state: { character: selected },
    });
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/member/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      await logout();
    } catch (e) {
      console.error('로그아웃 실패:', e);
    }
  };

  // 인증 버튼 렌더링
  const renderAuthButton = () => {
    if (isLoggedIn) {
      return (
        <button className="login-btn" onClick={handleLogout}>
          로그아웃
        </button>
      );
    }

    return (
      <button className="login-btn" onClick={handleLogin}>
        로그인 하기
      </button>
    );
  };

  // 초기 데이터 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const [charactersData, novelsData, userNotesData] = await Promise.all([
          fetchCharacters(),
          fetchStories(),
          fetchUserNotes(),
        ]);
        if (!mounted) return;
        setTopUsers(charactersData);
        setNovels(novelsData);
        setUserNotes(userNotesData);
      } catch (error) {
        console.error('데이터 로딩 중 오류:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleClick = (index: number): void => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  // 외부 클릭 감지 → 검색창 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };
    if (showSearch) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  const selectedCharacter = topUsers.find((u) => u.id === activeCharacterId) || null;

  // [소설] 카드
  const renderNovelCard = (item: CardItem) => (
    <div className="novel-card" key={item.id}>
      <img src={item.image} alt={item.title} className="novel-card-image" />
      <div className="novel-card-body">
        <h3 className="novel-card-title">{item.title}</h3>
        <p className="novel-card-desc">{item.description}</p>
        <p className="novel-card-author">{item.author}</p>
      </div>
    </div>
  );

  // [유저노트] 카드
  const renderNoteCard = (item: CardItem) => (
    <div className="note-card" key={item.id}>
      <img src={item.image} alt={item.title} className="note-card-image" />
      <div className="note-card-body">
        <h3 className="note-card-title">{item.title}</h3>
        <p className="note-card-desc">{item.description}</p>
        <p className="note-card-author">{item.author}</p>
      </div>
    </div>
  );

  let content: React.ReactNode;
  switch (activeIndex) {
    case 0:
      content = (
        <>
          <section className="section recommend-character-chat"></section>
          <section className="section public-favorite-choice"></section>
          <section className="section otherGenre"></section>
          <section className="section All-chat"></section>
        </>
      );
      break;
    case 1:
      content = (
        <>
          <section className="section recommend-web-novel"></section>
          <section className="section public-favorite-novel"></section>
          <section className="section recommend-taste"></section>
          <section className="section All-web-novel"></section>
        </>
      );
      break;
    case 2:
      content = (
        <>
          <section className="section recommend-userNote"></section>
          <section className="section genre-popular-note"></section>
          <section className="section genre-romance"></section>
          <section className="section all-user-note"></section>
        </>
      );
      break;
    default:
      content = (
        <div>
          {/* 배너 */}
          <section className="section banner">
            <img
              src="https://beizfkcdgqkvhqcqvtwk.supabase.co/storage/v1/object/public/character-thumbnails/c0f8aff0-0b17-4551-b1c4-d4539d067239/1753700613259-mw7jhzoxl7.png"
              alt="Banner"
              className="banner-image"
            />
            <div className="banner-overlay">
              <p className="banner-hashtag">#축구공</p>
              <h2 className="banner-title">서휼 (徐휼)</h2>
              <p className="banner-desc">그가 내미는 달콤한 충심의 이면에는, 당신을 완벽..</p>
            </div>
          </section>

          {/* 위프 유저들이 가장 좋아한 캐릭터 */}
          <section className="section">
            <h2 className="section-title">위프 유저들이 가장 좋아한 캐릭터</h2>

            {isLoading ? (
              <div className="loading-container">로딩 중...</div>
            ) : topUsers.length === 0 ? (
              <div className="empty-container">캐릭터 데이터를 불러올 수 없습니다.</div>
            ) : (
              <div className="hscroll">
                {topUsers.map((u) => (
                  <div
                    key={u.id}
                    className={`top-user ${activeCharacterId === u.id ? 'active' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setActiveCharacterId((prev) => (prev === u.id ? null : u.id))
                    }
                    onKeyDown={(e) =>
                      e.key === 'Enter'
                        ? setActiveCharacterId((prev) => (prev === u.id ? null : u.id))
                        : null
                    }
                  >
                    <img src={u.image} alt={u.name} className="avatar" />
                    <span className="avatar-name">{u.name}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedCharacter && (
              <div className="character-panel">
                <div className="character-name">{selectedCharacter.name}</div>
                <div className="speech-bubble">{selectedCharacter.message}</div>
                <div className="tag-row">
                  {selectedCharacter.tags.map((t) => (
                    <span key={t} className="tag-chip">
                      {t}
                    </span>
                  ))}
                </div>
                <button className="primary-btn" onClick={goToChatSetting}>
                  무슨 일인지 알아보러 가기
                </button>
              </div>
            )}
          </section>

          {/* [소설] 가로 스크롤 */}
          <section className="section">
            <div className="title-row">
              <h2 className="section-title accent">#공공</h2>
              <h2 className="section-title accent1">좋아하는 사람들이 많이 본 소설</h2>
            </div>

            {isLoading ? (
              <div className="loading-container">소설 로딩 중...</div>
            ) : novels.length === 0 ? (
              <div className="empty-container">소설 데이터를 불러올 수 없습니다.</div>
            ) : (
              <div className="hscroll-novels">{novels.slice(0, 5).map(renderNovelCard)}</div>
            )}
          </section>

          {/* [유저노트] 가로 스크롤 */}
          <section className="section">
            <h2 className="section-title">새로운 세계로 떠나는 유저노트</h2>

            {isLoading ? (
              <div className="loading-container">유저노트 로딩 중...</div>
            ) : userNotes.length === 0 ? (
              <div className="empty-container">유저노트 데이터를 불러올 수 없습니다.</div>
            ) : (
              <div className="hscroll-notes">{userNotes.slice(0, 5).map(renderNoteCard)}</div>
            )}
          </section>
        </div>
      );
  }

  return (
    <div className="Home-container">
      <div className="scroll-area">
        <section className="section title">
          {renderAuthButton()}
          <div className="appTitle">WHIF</div>
          <div ref={searchRef} className="search-container">
            {showSearch ? (
              <input
                type="text"
                className="search-input"
                placeholder="검색어를 입력하세요."
                autoFocus
              />
            ) : (
              <SearchIcon className="searchIcon" onClick={() => setShowSearch(true)} />
            )}
          </div>
        </section>

        <section className="section chip">
          <div className="chip-button">
            {['캐릭터 챗', '웹 소설', '유저 노트'].map((label, index) => (
              <button
                key={index}
                type="button"
                className={activeIndex === index ? 'active' : ''}
                onClick={() => handleClick(index)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {content}
      </div>
      <NavBar />
    </div>
  );
};

export default Home;