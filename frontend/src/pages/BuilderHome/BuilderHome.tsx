import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './BuilderHome.module.css';

interface DraftMeta {
    id: string;
    title: string;
    difficulty: string;
    createdAt: string;
}

export function BuilderHome() {
    const { user, accessToken, loading: authLoading, openAuthModal } = useAuth();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    const [drafts, setDrafts] = useState<DraftMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) return;
        fetchDrafts();
    }, [user, authLoading]);

    async function fetchDrafts() {
        try {
            const res = await fetch(`${apiUrl}/builder/scenarios`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDrafts(data);
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleNewScenario() {
        if (!user) {
            openAuthModal('register');
            return;
        }
        setCreating(true);
        try {
            const res = await fetch(`${apiUrl}/builder/scenarios`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                navigate(`/builder/${data.id}`);
            }
        } finally {
            setCreating(false);
        }
    }

    async function handleDelete(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm('Delete this draft? This cannot be undone.')) return;
        await fetch(`${apiUrl}/builder/scenarios/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        setDrafts(prev => prev.filter(d => d.id !== id));
    }

    if (authLoading) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Scenario Builder</h1>
                    <p className={styles.subtitle}>
                        Create interactive cEDH training scenarios.
                    </p>
                </div>
                <button
                    className={styles.newButton}
                    onClick={handleNewScenario}
                    disabled={creating}
                >
                    {creating ? 'Creating...' : '+ New scenario'}
                </button>
            </div>

            {!user && (
                <div className={styles.guestPrompt}>
                    <p>You need an account to create scenarios.</p>
                    <button className={styles.newButton} onClick={() => openAuthModal('register')}>
                        Create account
                    </button>
                </div>
            )}

            {user && (
                <>
                    <h2 className={styles.sectionTitle}>Your drafts</h2>
                    {loading ? (
                        <p className={styles.muted}>Loading...</p>
                    ) : drafts.length === 0 ? (
                        <p className={styles.muted}>No drafts yet. Create your first scenario above.</p>
                    ) : (
                        <div className={styles.draftList}>
                            {drafts.map(draft => (
                                <div
                                    key={draft.id}
                                    className={styles.draftCard}
                                    onClick={() => navigate(`/builder/${draft.id}`)}
                                >
                                    <div className={styles.draftInfo}>
                                        <span className={styles.draftTitle}>
                                            {draft.title || 'Untitled scenario'}
                                        </span>
                                        <span className={styles.draftMeta}>
                                            {draft.difficulty} · {new Date(draft.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={(e) => handleDelete(draft.id, e)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}