import React, { useEffect, useState } from 'react';
import { BsFilePerson } from 'react-icons/bs';
import { MdNoteAlt } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';

type NavItem = {
    id: 'home' | 'popular' | 'continue' | 'mypage';
    label: string;
    defaultIcon: string;
    activeIcon: string;
};

const navItems: NavItem[] = [
    { id: 'home', label: '홈', defaultIcon: '/Excludeg.png', activeIcon: '/Excludew.png' },
    { id: 'popular', label: '유저노트', defaultIcon: '/Vectorg.png', activeIcon: '/Vectorw.png' },
    { id: 'continue', label: '이어보기', defaultIcon: '/skipg.png', activeIcon: '/skipw.png' },
    { id: 'mypage', label: '마이 페이지', defaultIcon: '/userg.png', activeIcon: '/userw.png' },
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
                {navItems.map(({ id, label, defaultIcon, activeIcon }) => (
                    <button
                        key={id}
                        className={`nav-button ${active === id ? 'active' : ''}`}
                        onClick={() => handleNavClick(id)}
                        type="button"
                        aria-pressed={active === id}
                    >
                        <div className="icon">
                            <img
                                src={active === id ? activeIcon : defaultIcon}
                                alt={label}
                                className="nav-img"
                            />
                        </div>
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
                            <img src="/Vectorw.png" alt="유저노트" className="add-icon" />
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
