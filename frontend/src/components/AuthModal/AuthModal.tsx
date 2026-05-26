import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthModal.module.css';

interface AuthModalProps {
    onClose: () => void;
    initialMode?: 'login' | 'register';
}

export function AuthModal({ onClose, initialMode = 'login' }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const [identifier, setIdentifier] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL;

    function getLocalStorageMigrationData() {
        return {
            skill_level: localStorage.getItem('tark_skill_level'),
            archetype: localStorage.getItem('tark_archetype'),
            scenarios_completed: JSON.parse(
                localStorage.getItem('tark_scenarios_completed') || '[]'
            ),
        };
    }

    function clearMigratedLocalStorage() {
        localStorage.removeItem('tark_skill_level');
        localStorage.removeItem('tark_archetype');
        localStorage.removeItem('tark_scenarios_completed');
    }

    async function handleLogin() {
        const res = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier,
                password,
                remember_me: rememberMe,
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');
        await login(data.access_token, data.refresh_token);
        onClose();
    }

    async function handleRegister() {
        const migrationData = getLocalStorageMigrationData();
        const res = await fetch(`${apiUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                username,
                password,
                ...migrationData,
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');
        await login(data.access_token, data.refresh_token);
        clearMigratedLocalStorage();
        onClose();
    }

    async function handleSubmit() {
        setError(null);
        setLoading(true);
        try {
            if (mode === 'login') await handleLogin();
            else await handleRegister();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>×</button>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
                        onClick={() => { setMode('login'); setError(null); }}
                    >
                        Log in
                    </button>
                    <button
                        className={`${styles.tab} ${mode === 'register' ? styles.activeTab : ''}`}
                        onClick={() => { setMode('register'); setError(null); }}
                    >
                        Register
                    </button>
                </div>

                {mode === 'login' ? (
                    <div className={styles.form}>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Email or username"
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                        />
                        <div className={styles.passwordWrapper}>
						    <input
						        className={styles.input}
						        type={showPassword ? 'text' : 'password'}
						        placeholder="Password"
						        value={password}
						        onChange={e => setPassword(e.target.value)}
						    />
						    <button
						        type="button"
						        className={styles.showPassword}
						        onClick={() => setShowPassword(s => !s)}
						    >
						        {showPassword ? 'Hide' : 'Show'}
						    </button>
						</div>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                            />
                            Remember me
                        </label>
                    </div>
                ) : (
                    <div className={styles.form}>
                        <input
                            className={styles.input}
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                        <div className={styles.passwordWrapper}>
						    <input
						        className={styles.input}
						        type={showPassword ? 'text' : 'password'}
						        placeholder="Password"
						        value={password}
						        onChange={e => setPassword(e.target.value)}
						    />
						    <button
						        type="button"
						        className={styles.showPassword}
						        onClick={() => setShowPassword(s => !s)}
						    >
						        {showPassword ? 'Hide' : 'Show'}
						    </button>
						</div>
                    </div>
                )}

                {error && <p className={styles.error}>{error}</p>}

                <button
                    className={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
                </button>
            </div>
        </div>
    );
}