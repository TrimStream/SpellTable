import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ScenarioMeta, Difficulty } from '../../types/scenario';
import styles from './Scenarios.module.css';
import { LoadingScreen } from '../../components/LoadingScreen/LoadingScreen';
import { useAuth } from '../../context/AuthContext';

const FILTERS = ['all', 'beginner', 'intermediate', 'expert'] as const;
type Filter = typeof FILTERS[number];

const badgeClass: Record<Difficulty, string> = {
    beginner: styles.badgeBeginner,
    intermediate: styles.badgeIntermediate,
    expert: styles.badgeExpert,
};

export function Scenarios() {
    const [scenarios, setScenarios] = useState<ScenarioMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<Filter>('all');
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

    const { user, accessToken, openAuthModal } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        document.title = 'TrainingArk - Scenarios';
        fetch(`${apiUrl}/scenarios`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                setScenarios(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!user || !accessToken) return;
        fetch(`${apiUrl}/users/me/bookmarks`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
            .then(r => r.json())
            .then(data => setBookmarks(new Set(data.bookmarks)))
            .catch(() => {});
    }, [user, accessToken]);

    async function toggleBookmark(e: React.MouseEvent, scenarioId: string) {
        e.preventDefault();
        e.stopPropagation();

        if (!user || !accessToken) {
            openAuthModal('register');
            return;
        }

        const isBookmarked = bookmarks.has(scenarioId);

        // optimistic update
        setBookmarks(prev => {
            const next = new Set(prev);
            if (isBookmarked) next.delete(scenarioId);
            else next.add(scenarioId);
            return next;
        });

        try {
            if (isBookmarked) {
                await fetch(`${apiUrl}/users/me/bookmarks/${scenarioId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
            } else {
                await fetch(`${apiUrl}/users/me/bookmarks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ scenario_id: scenarioId })
                });
            }
        } catch {
            // revert optimistic update on failure
            setBookmarks(prev => {
                const next = new Set(prev);
                if (isBookmarked) next.add(scenarioId);
                else next.delete(scenarioId);
                return next;
            });
        }
    }

    const filtered = useMemo(() => {
        if (filter === 'all') return scenarios;
        return scenarios.filter(s => s.difficulty === filter);
    }, [filter, scenarios]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Scenarios</h1>
                <p className={styles.subtitle}>Read the board state, make a decision.</p>
            </div>

            <div className={styles.filterBar}>
                {FILTERS.map(f => (
                    <button
                        key={f}
                        className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className={styles.loadingArea}>
                    <LoadingScreen inline />
                </div>
            ) : error ? (
                <div className={styles.errorArea}>
                    <p className={styles.errorText}>Failed to load scenarios. The server may be waking up - try refreshing in a moment.</p>
                    <button className={styles.retryButton} onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filtered.length === 0 && (
                        <p className={styles.empty}>No scenarios found.</p>
                    )}
                    {filtered.map(scenario => (
                        <Link
                            key={scenario.id}
                            to={`/board/${scenario.id}`}
                            className={styles.card}
                        >
                            <div className={styles.cardTop}>
                                <p className={styles.cardTitle}>{scenario.title}</p>
                                <div className={styles.cardTopRight}>
                                    <span className={`${styles.badge} ${badgeClass[scenario.difficulty]}`}>
                                        {scenario.difficulty}
                                    </span>
                                    <button
                                        className={styles.bookmarkBtn}
                                        onClick={(e) => toggleBookmark(e, scenario.id)}
                                        title={bookmarks.has(scenario.id) ? 'Remove bookmark' : 'Bookmark'}
                                    >
                                        {bookmarks.has(scenario.id) ? '★' : '☆'}
                                    </button>
                                </div>
                            </div>
                            <p className={styles.cardDesc}>{scenario.description}</p>
                            <div className={styles.tags}>
                                {scenario.tags.map(tag => (
                                    <span key={tag} className={styles.tag}>{tag}</span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}