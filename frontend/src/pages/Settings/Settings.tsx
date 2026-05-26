import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';

export function Settings() {
    const { user, accessToken, login } = useAuth();
    const { theme, toggle } = useTheme();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    const [newUsername, setNewUsername] = useState('');
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [usernameSuccess, setUsernameSuccess] = useState(false);
    const [usernameLoading, setUsernameLoading] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    if (!user) {
        navigate('/');
        return null;
    }

    async function handleChangeUsername() {
        if (!newUsername.trim()) return;
        setUsernameError(null);
        setUsernameSuccess(false);
        setUsernameLoading(true);
        try {
            const res = await fetch(`${apiUrl}/users/me/username`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({ new_username: newUsername.trim() })
            });
            const data = await res.json();
            if (!res.ok) {
                setUsernameError(data.detail || 'Failed to update username');
                return;
            }
            setUsernameSuccess(true);
            setNewUsername('');
            // refresh user data by re-fetching me
            const meRes = await fetch(`${apiUrl}/auth/me`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (meRes.ok) {
                // force auth context to update by triggering a re-login with existing tokens
                const refreshToken = localStorage.getItem('tark_refresh_token');
                await login(accessToken!, refreshToken);
            }
        } catch {
            setUsernameError('Something went wrong');
        } finally {
            setUsernameLoading(false);
        }
    }

    async function handleChangePassword() {
        if (!currentPassword || !newPassword || !confirmPassword) return;
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters');
            return;
        }
        setPasswordError(null);
        setPasswordSuccess(false);
        setPasswordLoading(true);
        try {
            const res = await fetch(`${apiUrl}/users/me/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });
            const data = await res.json();
            if (!res.ok) {
                setPasswordError(data.detail || 'Failed to update password');
                return;
            }
            setPasswordSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            setPasswordError('Something went wrong');
        } finally {
            setPasswordLoading(false);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Settings</h1>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Account</h2>

                <div className={styles.field}>
                    <label className={styles.label}>Current username</label>
                    <input
                        className={styles.input}
                        type="text"
                        value={user.username}
                        disabled
                        style={{ opacity: 0.5 }}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>New username</label>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Enter new username"
                        value={newUsername}
                        onChange={e => { setNewUsername(e.target.value); setUsernameSuccess(false); setUsernameError(null); }}
                    />
                </div>

                {usernameError && <p className={styles.error}>{usernameError}</p>}
                {usernameSuccess && <p className={styles.success}>Username updated successfully.</p>}

                <button
                    className={styles.saveButton}
                    onClick={handleChangeUsername}
                    disabled={!newUsername.trim() || usernameLoading}
                >
                    {usernameLoading ? 'Saving...' : 'Save username'}
                </button>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Password</h2>

                <div className={styles.field}>
                    <label className={styles.label}>Current password</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            className={styles.input}
                            type={showCurrent ? 'text' : 'password'}
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={e => { setCurrentPassword(e.target.value); setPasswordError(null); setPasswordSuccess(false); }}
                        />
                        <button className={styles.showPassword} onClick={() => setShowCurrent(s => !s)}>
                            {showCurrent ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>New password</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            className={styles.input}
                            type={showNew ? 'text' : 'password'}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={e => { setNewPassword(e.target.value); setPasswordError(null); setPasswordSuccess(false); }}
                        />
                        <button className={styles.showPassword} onClick={() => setShowNew(s => !s)}>
                            {showNew ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Confirm new password</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            className={styles.input}
                            type={showNew ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={e => { setConfirmPassword(e.target.value); setPasswordError(null); setPasswordSuccess(false); }}
                        />
                    </div>
                </div>

                {passwordError && <p className={styles.error}>{passwordError}</p>}
                {passwordSuccess && <p className={styles.success}>Password updated successfully.</p>}

                <button
                    className={styles.saveButton}
                    onClick={handleChangePassword}
                    disabled={!currentPassword || !newPassword || !confirmPassword || passwordLoading}
                >
                    {passwordLoading ? 'Saving...' : 'Save password'}
                </button>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Appearance</h2>
                <div className={styles.themeRow}>
                    <span className={styles.themeLabel}>Dark mode</span>
                    <button
                        className={`${styles.themeSwitch} ${theme === 'dark' ? styles.themeSwitchOn : ''}`}
                        onClick={toggle}
                        aria-label="Toggle theme"
                    >
                        <span className={styles.themeSwitchThumb} />
                    </button>
                </div>
            </div>

            <div className={styles.dangerSection}>
                <h2 className={styles.dangerTitle}>Danger Zone</h2>
                <p className={styles.dangerText}>Permanently delete your account and all associated data. This cannot be undone.</p>
                <button className={styles.dangerButton} disabled>
                    Delete account (coming soon)
                </button>
            </div>
        </div>
    );
}