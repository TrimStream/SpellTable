import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './Layout.module.css';
import { TarkLogo } from '../../components/TarkLogo/TarkLogo';

export function Layout() {
    const navigate = useNavigate();

    return (
        <div className={styles.wrapper}>
            <nav className={styles.nav}>
                <div className={styles.logoMark} onClick={() => navigate('/')}>
                    <TarkLogo size="nav" />
                </div>

                <div className={styles.navLinks}>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                        }
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/scenarios"
                        className={({ isActive }) =>
                            isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                        }
                    >
                        Scenarios
                    </NavLink>
                    <NavLink
                        to="/rules"
                        className={({ isActive }) =>
                            isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                        }
                    >
                        Rules
                    </NavLink>
                    <NavLink
                        to="/tutorial"
                        className={({ isActive }) =>
                            isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                        }
                    >
                        Tutorial
                    </NavLink>
                    {/* TODO V2: Uncomment Deck nav link when deck evaluation is built */}
                    {/* <span className={styles.navLinkSoon}>Deck</span> */}
                </div>

                <div className={styles.navRight}>
                    {/* TODO V7: Uncomment login button when auth is implemented */}
                    {/* <button className={styles.btnLogin}>Log in</button> */}
                    <NavLink to="/scenarios" className={styles.btnScenarios}>
                        Browse scenarios
                    </NavLink>
                </div>
            </nav>

            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}