import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
    id: string;
    email: string;
    username: string;
    skill_level: string | null;
    archetype: string | null;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    loading: boolean;
    authModalMode: 'login' | 'register' | null;
    openAuthModal: (mode: 'login' | 'register') => void;
    closeAuthModal: () => void;
    login: (accessToken: string, refreshToken: string | null) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL;

    const openAuthModal = (mode: 'login' | 'register') => setAuthModalMode(mode);
    const closeAuthModal = () => setAuthModalMode(null);

    async function fetchUser(token: string): Promise<User | null> {
        try {
            const res = await fetch(`${apiUrl}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    }

    async function login(token: string, refreshToken: string | null) {
        setAccessToken(token);
        if (refreshToken) {
            localStorage.setItem("tark_refresh_token", refreshToken);
        }
        const userData = await fetchUser(token);
        setUser(userData);
    }

    function logout() {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("tark_refresh_token");
    }

    useEffect(() => {
        async function restoreSession() {
            const refreshToken = localStorage.getItem("tark_refresh_token");
            if (!refreshToken) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${apiUrl}/auth/refresh`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh_token: refreshToken })
                });
                if (!res.ok) {
                    localStorage.removeItem("tark_refresh_token");
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                setAccessToken(data.access_token);
                const userData = await fetchUser(data.access_token);
                setUser(userData);
            } catch {
                localStorage.removeItem("tark_refresh_token");
            } finally {
                setLoading(false);
            }
        }
        restoreSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, accessToken, loading, authModalMode, openAuthModal, closeAuthModal, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}