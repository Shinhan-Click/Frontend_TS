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
   author: note.author,
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

const Home: React.FC = () => {
 const { isLoggedIn, logout, checkSession } = useAuth();
 const [activeIndex, setActiveIndex] = useState<number | null>(null);
 const [showSearch, setShowSearch] = useState(false);
 const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
 const [topUsers, setTopUsers] = useState<SimpleUser[]>([]);
 const [novels, setNovels] = useState<CardItem[]>([]);
 const [userNotes, setUserNotes] = useState<CardItem[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const searchRef = useRef<HTMLDivElement>(null);
 const navigate = useNavigate();

 // 로그인 성공 후: URL 정리만, 쿠키는 서버 Set-Cookie에 맡김(중복 방지)
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
   const selected = topUsers.find((u) => u.id === activeCharacterId);
   if (!selected) return;
   navigate(`/ChatSetting?characterId=${encodeURIComponent(selected.id)}`, { state: { character: selected } });
 };

 const handleLogout = async () => {
   try {
     await fetch(`${API_BASE}/member/logout`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
     await logout();
   } catch {
     // 무시
   }
 };

 const renderAuthButton = () =>
   isLoggedIn ? (
     <button className="login-btn" onClick={handleLogout}>로그아웃</button>
   ) : (
     <button className="login-btn" onClick={handleLogin}>로그인 하기</button>
   );

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

 const handleClick = (i: number) => setActiveIndex((prev) => (prev === i ? null : i));

 useEffect(() => {
   const handler = (e: MouseEvent) => {
     if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
   };
   if (showSearch) document.addEventListener('mousedown', handler);
   return () => document.removeEventListener('mousedown', handler);
 }, [showSearch]);

 const selectedCharacter = topUsers.find((u) => u.id === activeCharacterId) || null;

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
                   onClick={() => setActiveCharacterId((prev) => (prev === u.id ? null : u.id))}
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
                   <span key={t} className="tag-chip">{t}</span>
                 ))}
               </div>
               <button className="primary-btn" onClick={goToChatSetting}>무슨 일인지 알아보러 가기</button>
             </div>
           )}
         </section>

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
             <input type="text" className="search-input" placeholder="검색어를 입력하세요." autoFocus />
           ) : (
             <SearchIcon className="searchIcon" onClick={() => setShowSearch(true)} />
           )}
         </div>
       </section>

       <section className="section chip">
         <div className="chip-button">
           {['캐릭터 챗', '웹 소설', '유저 노트'].map((label, index) => (
             <button key={index} type="button" className={activeIndex === index ? 'active' : ''} onClick={() => handleClick(index)}>
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