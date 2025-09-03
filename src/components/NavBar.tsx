import React, { useEffect, useState } from 'react';
import { FaCommentAlt, FaPlay, FaUser } from 'react-icons/fa';
import { BsFilePerson } from 'react-icons/bs';
import { MdNoteAlt } from 'react-icons/md';
import { NoteIcon } from '../components/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';

type NavItem = {
    id: 'home' | 'popular' | 'continue' | 'mypage';
    label: string;
    icon: React.ReactNode;
};

const navItems: NavItem[] = [
    { id: 'home', label: '홈', icon: <FaCommentAlt /> },
    { id: 'popular', label: '유저노트', icon: <NoteIcon className="noteicon" /> },
    { id: 'continue', label: '이어보기', icon: <FaPlay /> },
    { id: 'mypage', label: '마이 페이지', icon: <FaUser /> },
];

const routeById: Record<NavItem['id'], string> = {
    home: '/',
    popular: '/HomeToUserNote',
    continue: '/',
    mypage: '/',
};

const NavBar: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [active, setActive] = useState<NavItem['id']>('home');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const matched = (Object.entries(routeById).find(([, path]) => path === location.pathname)?.[0] ??
            (location.pathname === '/' ? 'home' : null)) as NavItem['id'] | null;

        if (matched) setActive(matched);
    }, [location.pathname]);

    const handleNavClick = (id: NavItem['id']) => {
        setActive(id);
        if (id === 'home') {
            navigate('/');
            return;
        }
        navigate(routeById[id]);
    };

    return (
        <div className="nav-row">
            <nav className="bottom-nav narrow">
                {navItems.map(({ id, label, icon }) => (
                    <button
                        key={id}
                        className={`nav-button ${active === id ? 'active' : ''}`}
                        onClick={() => handleNavClick(id)}
                        type="button"
                        aria-pressed={active === id}
                    >
                        <div className="icon">{icon}</div>
                        <div className="label">{label}</div>
                    </button>
                ))}
            </nav>

            <div className="add-wrap">
                <button
                    type="button"
                    className={`add-btn ${open ? 'open' : ''}`}
                    aria-label="추가"
                    onClick={() => setOpen((v) => !v)}
                >
                    <span className="add-plus">+</span>
                </button>

                <div className={`add-popover ${open ? 'show' : ''}`}>
                    <div className="add-row">
                        <div className="add-label">캐릭터 생성</div>
                        <button className="add-item" aria-label="캐릭터 생성">
                            <BsFilePerson className="add-icon" />
                        </button>
                    </div>

                    <div className="add-row">
                        <div className="add-label">유저 노트 생성</div>
                        <button
                            className="add-item"
                            aria-label="유저노트"
                            onClick={() => {
                                setOpen(false);
                                navigate('/UserNoteWrite');
                            }}
                        >
                            <NoteIcon className="add-icon" />
                        </button>
                    </div>

                    <div className="add-row">
                        <div className="add-label">퓨처 노트 생성</div>
                        <button
                            className="add-item"
                            aria-label="노트 작성"
                            onClick={() => {
                                setOpen(false);
                                navigate('/FutureNoteWrite');
                            }}
                        >
                            <MdNoteAlt className="add-icon" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavBar;