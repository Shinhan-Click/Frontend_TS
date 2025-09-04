import React, { useState, useRef, useEffect } from 'react';
import './Home.css';
import { SearchIcon } from '../../components/icons';
import NavBar from '../../components/NavBar';
import type { ApiResponse } from '../../types/api';
import type { Character, Story, UserNote } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// 프록시 사용: 모든 API는 /api 로 호출
const API_BASE = '/api';

type CardItem = { id: string; image: string; title: string; description: string; author: string };

type SimpleUser = {
  id: string;
  image: string;
  name: string;
  message: string;
  tags: string[];
};

// 캐릭터 상세 정보 타입 (API 응답 기반)
type CharacterDetail = {
  characterId: number;
  characterImageUrl: string;
  name: string;
  gender: string;
  description: string;
  characterIntro: string;
  introductions: Array<{
    introductionId: number;
    title: string;
    text: string;
  }>;
  tags: Array<{
    tagId: number;
    name: string;
  }>;
};

// 배너 데이터 타입
type BannerItem = {
  id: string;
  image: string;
  hashtag: string;
  title: string;
  description: string;
};

// 배너 데이터 (예시)
const bannerData: BannerItem[] = [
  {
    id: '1',
    image: '/주이한.png',
    hashtag: '#츤데레',
    title: '주이한',
    description: '길들여지고 싶은 상처 입은 맹수'
  },
  {
    id: '2',
    image: '/백도하.png',
    hashtag: '#츤데레',
    title: '백도하',
    description: '12살부터 한 사람만을 짝사랑한 츤데레'
  },
  {
    id: '3',
    image: 'https://image.whif.io/GEp2aRhIR9uOP3SUj2q_kA/2197d6b4-636d-4740-05db-fed3c3aca400/public',
    hashtag: '#츤데레',
    title: '서윤구',
    description: '까다롭고 시니컬한 브런치 카페 사장님이자 SNS 셀럽'
  }
];

const transformCharacterToUser = (characters: Character[]): SimpleUser[] =>
  characters.map((char) => ({
    id: char.characterId.toString(),
    image: char.characterImageUrl,
    name: char.name,
    message: extractMessage(char.description),
    tags: char.tags.length > 0 ? char.tags : ['#캐릭터챗', '#로맨스'],
  }));

const transformStoryToCard = (stories: Story[]): CardItem[] =>
  stories.map((story) => ({
    id: story.storyId.toString(),
    image: story.storyImageUrl,
    title: story.title,
    description: extractDescription(story.description),
    author: story.author,
  }));

const transformUserNoteToCard = (userNotes: UserNote[]): CardItem[] =>
  userNotes.map((note) => ({
    id: note.userNoteId.toString(),
    image: note.userNoteImageUrl || 'https://picsum.photos/seed/default/400/300',
    title: note.title,
    description: extractDescription(note.description || ''),
    author: '#세계관확장',
  }));

const extractMessage = (description: string): string => {
  const q = description.match(/"([^"]+)"/);
  if (q) return q[1];
  const first = description.split('\n')[0] ?? '';
  return first.length > 50 ? first.slice(0, 47) + '...' : first;
};

const extractDescription = (description: string): string => {
  if (!description) return '';

  const lines = description
    .split('\n')
    .filter(
      (line) =>
        line.trim() && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*') && line.length > 10
    );
  const first = lines[0] || description.split('\n')[0] || '';
  return first.length > 100 ? first.slice(0, 97) + '...' : first;
};

const fetchCharacters = async (): Promise<SimpleUser[]> => {
  try {
    const res = await fetch(`${API_BASE}/character/all`, { credentials: 'include' });
    if (!res.ok) throw new Error('캐릭터 API 실패');
    const data: ApiResponse<Character[]> = await res.json();
    return data.isSuccess ? transformCharacterToUser(data.result) : [];
  } catch {
    return [];
  }
};

const fetchCharacterDetail = async (characterId: string): Promise<CharacterDetail | null> => {
  try {
    const res = await fetch(`${API_BASE}/character/${characterId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('캐릭터 상세 API 실패');
    const data: ApiResponse<CharacterDetail> = await res.json();
    return data.isSuccess ? data.result : null;
  } catch (error) {
    console.error('캐릭터 상세 정보 조회 실패:', error);
    return null;
  }
};

const fetchStories = async (): Promise<CardItem[]> => {
  try {
    const res = await fetch(`${API_BASE}/story/all`, { credentials: 'include' });
    if (!res.ok) throw new Error('소설 API 실패');
    const data: ApiResponse<Story[]> = await res.json();
    return data.isSuccess ? transformStoryToCard(data.result) : [];
  } catch {
    return [];
  }
};

const fetchUserNotes = async (): Promise<CardItem[]> => {
  try {
    const res = await fetch(`${API_BASE}/usernote/all`, { credentials: 'include' });
    if (!res.ok) throw new Error('유저노트 API 실패');
    const data: ApiResponse<UserNote[]> = await res.json();
    return data.isSuccess ? transformUserNoteToCard(data.result) : [];
  } catch {
    return [];
  }
};

// 유틸리티 함수들을 컴포넌트 밖으로 이동
const extractSpeechBubble = (description: string): string => {
  const match = description.match(/"([^"]+)"/);
  return match ? match[1] : '';
};

const removeQuotesFromDescription = (description: string): string => {
  return description.replace(/"[^"]*"/g, '').trim();
};

const Home: React.FC = () => {
  const { isLoggedIn, logout, checkSession } = useAuth();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [selectedCharacterDetail, setSelectedCharacterDetail] = useState<CharacterDetail | null>(null);
  const [topUsers, setTopUsers] = useState<SimpleUser[]>([]);
  const [novels, setNovels] = useState<CardItem[]>([]);
  const [userNotes, setUserNotes] = useState<CardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCharacter, setIsLoadingCharacter] = useState(false);
  
  // 배너 슬라이드 관련 상태
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // 터치 이벤트 관련 상태
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 캐릭터 클릭 핸들러 - API 호출
  const handleCharacterClick = async (characterId: string) => {
 // 기존 애니메이션 초기화
 const panel = document.querySelector('.character-panel');
 if (panel) panel.classList.remove('show');

 if (activeCharacterId === characterId) {
   setActiveCharacterId(null);
   setSelectedCharacterDetail(null);
   return;
 }

 setActiveCharacterId(characterId);
 setIsLoadingCharacter(true);
 
 try {
   const characterDetail = await fetchCharacterDetail(characterId);
   setSelectedCharacterDetail(characterDetail);
   
   // 애니메이션 트리거
   if (characterDetail) {
     setTimeout(() => {
       const characterPanel = document.querySelector('.character-panel');
       if (characterPanel) {
         characterPanel.classList.add('show');
       }
     }, 100);
   }
 } catch (error) {
   console.error('캐릭터 상세 정보 로딩 실패:', error);
   setSelectedCharacterDetail(null);
 } finally {
   setIsLoadingCharacter(false);
 }
};

  // 터치 스와이프 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerData.length);
    }
    if (isRightSwipe) {
      setCurrentBannerIndex((prev) => (prev - 1 + bannerData.length) % bannerData.length);
    }
  };

  // 배너 자동 슬라이드 효과
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        (prevIndex + 1) % bannerData.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginStatus = urlParams.get('login');
    if (loginStatus === 'success') {
      window.history.replaceState({}, '', '/');
      checkSession();
    }
  }, [checkSession]);

  const handleLogin = () => {
    window.location.href = `${API_BASE}/member/kakao/login`;
  };

  const goToChatSetting = () => {
    if (!selectedCharacterDetail) return;
    navigate(`/CharacterIntroduce/${selectedCharacterDetail.characterId}`, { 
      state: { character: selectedCharacterDetail } 
    });
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/member/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      await logout();
    } catch {
    }
  };

  const renderAuthButton = () =>
    !isLoggedIn ? (
      <button className="login-btn" onClick={handleLogin}>
        로그인
      </button>
    ) : null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const [c, n, u] = await Promise.all([fetchCharacters(), fetchStories(), fetchUserNotes()]);
        if (!mounted) return;
        setTopUsers(c);
        setNovels(n);
        setUserNotes(u);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleClick = async (i: number) => {
    if (i === 2) {
      navigate('/HomeToUserNote');
      return;
    }
    if (i === 1) {
      await handleLogout();
      return;
    }
    setActiveIndex((prev) => (prev === i ? null : i));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    if (showSearch) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSearch]);

  const renderNovelCard = (item: CardItem) => (
    <div className="novel-card" key={item.id}>
      <img src={item.image} alt={item.title} className="novel-card-image" />
      <div className="novel-card-body">
        <h3 className="novel-card-title">{item.title}</h3>
        <p className="novel-card-desc">{item.description}</p>
        <p className="novel-card-author">@{item.author}</p>
      </div>
    </div>
  );

  const renderNoteCard = (item: CardItem) => (
    <div
      className="note-card"
      key={item.id}
      onClick={() => navigate(`/UserNoteDetail/${item.id}`)}
      style={{ cursor: 'pointer' }}
    >
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
      content = <></>;
      break;
    case 2:
      content = <></>;
      break;
    default:
      content = (
        <div>
          {/* 자동 페이드 배너 섹션 */}
          <section 
            className="section banner"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="banner-container">
              {bannerData.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`banner-slide ${index === currentBannerIndex ? 'active' : ''}`}
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="banner-image"
                  />
                  <div className="banner-overlay">
                    <p className="banner-hashtag">{banner.hashtag}</p>
                    <h2 className="banner-title">{banner.title}</h2>
                    <p className="banner-desc">{banner.description}</p>
                  </div>
                </div>
              ))}
              
              {/* 배너 카운터 */}
              <div className="banner-counter">
                {currentBannerIndex + 1}/{bannerData.length}
              </div>
            </div>
          </section>

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
                    onClick={() => handleCharacterClick(u.id)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' ? handleCharacterClick(u.id) : null
                    }
                  >
                    <img src={u.image} alt={u.name} className="avatar" />
                    <span className="avatar-name">{u.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 캐릭터 상세 패널 */}
            {activeCharacterId && (
              <div className="character-panel">
                {isLoadingCharacter ? (
                  <div className="loading-container"></div>
                ) : selectedCharacterDetail ? (
                  <>
                    {/* 전체 설명 (맨 위) - 따옴표 부분 제거 */}
                    <div className="character-description">
                      {removeQuotesFromDescription(selectedCharacterDetail.description)}
                    </div>
                    
                    {/* 캐릭터 이름 */}
                    <div className="character-name">{selectedCharacterDetail.name}</div>
                    
                    {/* 따옴표 부분 (말풍선) */}
                    {extractSpeechBubble(selectedCharacterDetail.description) && (
                      <div className="speech-bubble">
                        {extractSpeechBubble(selectedCharacterDetail.description)}
                      </div>
                    )}
                    
                    {/* 태그들 */}
                    <div className="tag-row">
                      {selectedCharacterDetail.tags.map((tag) => (
                        <span key={tag.tagId} className="tag-chip">#{tag.name}</span>
                      ))}
                    </div>
                    
                    <button className="primary-btn" onClick={goToChatSetting}>
                      무슨 일인지 알아보러 가기
                    </button>
                  </>
                ) : (
                  <div className="empty-container">캐릭터 정보를 불러올 수 없습니다.</div>
                )}
              </div>
            )}
          </section>

          <section className="section">
            <div className="title-row">
              <h2 className="section-title accent">#능글공</h2>
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

          <button
            type="button"
            className="appTitle logo-button"
            onClick={() => navigate('/')}
            aria-label="홈으로 이동"
          >
            <img
              src="/위프 로고.png"
              alt="위프 로고"
              className="logo-image"
            />
          </button>

          <div ref={searchRef} className="search-container">
            {showSearch ? (
              <input type="text" className="search-input" placeholder="검색어를 입력하세요." autoFocus />
            ) : (
              <SearchIcon className="searchIcon" onClick={() => setShowSearch(true)} />
            )}
          </div>
        </section>

        <section className="section chip">
          <div className="chip-button">
            {['캐릭터', '웹 소설'].map((label, index) => (
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