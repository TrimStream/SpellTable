import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';
import { TarkLogo } from '../../components/TarkLogo/TarkLogo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Footer } from '../../components/Footer/Footer';
import { AuthModal } from '../../components/AuthModal/AuthModal';

export function Layout() {
    const { theme, toggle } = useTheme();
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const isBoardPage = location.pathname.startsWith('/board/');

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen]);

    useEffect(() => {
        function handleOpenAuth(e: Event) {
            const mode = (e as CustomEvent).detail as 'login' | 'register';
            setAuthModal(mode);
        }
        window.addEventListener('open-auth-modal', handleOpenAuth);
        return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
    }, []);

    return (
        <div className={styles.wrapper}>
            <nav className={styles.nav}>
                <div className={styles.logoMark} onClick={() => navigate('/')}>
                    <TarkLogo size="nav" />
                </div>

                <div className={styles.navLinks}>
                    <NavLink to="/" end className={({ isActive }) =>
                        isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                        Home
                    </NavLink>
                    <NavLink to="/scenarios" className={({ isActive }) =>
                        isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                        Scenarios
                    </NavLink>
                    <NavLink to="/rules" className={({ isActive }) =>
                        isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                        Rules
                    </NavLink>
                    <NavLink to="/tutorial" className={({ isActive }) =>
                        isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                        Tutorial
                    </NavLink>
                    <NavLink to="/about" className={({ isActive }) =>
                        isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                        About
                    </NavLink>
                </div>

                <div className={styles.navRight}>
                    {!loading && (
                        <>
                            {user ? (
                                <div className={styles.profileWrapper} ref={dropdownRef}>
                                    <button
                                        className={styles.profileButton}
                                        onClick={() => setDropdownOpen(o => !o)}
                                    >
                                        <div className={styles.avatar}>
                                            {user.username[0].toUpperCase()}
                                        </div>
                                    </button>

                                    {dropdownOpen && (
                                        <div className={styles.dropdown}>
                                            <div className={styles.dropdownUser}>
                                                <span className={styles.dropdownUsername}>{user.username}</span>
                                                <span className={styles.dropdownEmail}>{user.email}</span>
                                            </div>
                                            <div className={styles.dropdownDivider} />
                                            <button className={styles.dropdownItem} onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}>
                                                Dashboard
                                            </button>
                                            <button className={styles.dropdownItem} onClick={() => { navigate('/settings'); setDropdownOpen(false); }}>
                                                Settings
                                            </button>
                                            <div className={styles.dropdownDivider} />
                                            <div className={styles.dropdownTheme}>
                                                <span className={styles.dropdownItemLabel}>Dark mode</span>
                                                <button
                                                    className={`${styles.themeSwitch} ${theme === 'dark' ? styles.themeSwitchOn : ''}`}
                                                    onClick={toggle}
                                                    aria-label="Toggle theme"
                                                >
                                                    <span className={styles.themeSwitchThumb} />
                                                </button>
                                            </div>
                                            <div className={styles.dropdownDivider} />
                                            <button className={`${styles.dropdownItem} ${styles.dropdownLogout}`} onClick={() => { logout(); setDropdownOpen(false); }}>
                                                Log out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={styles.authButtons}>
                                    <button className={styles.btnLogin} onClick={() => setAuthModal('login')}>
                                        Log in
                                    </button>
                                    <button className={styles.btnRegister} onClick={() => setAuthModal('register')}>
                                        Register
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </nav>

            <main className={isBoardPage ? styles.mainBoard : styles.main}>
                <Outlet />
            </main>
            {!isBoardPage && <Footer />}

            {authModal && (
                <AuthModal
                    initialMode={authModal}
                    onClose={() => setAuthModal(null)}
                />
            )}
        </div>
    );
}