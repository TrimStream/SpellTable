import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

type Tab = 'bookmarks' | 'scenarios' | 'history';

interface ScenarioCompletion {
    scenarioId: string;
    completedAt: string;
    choices: { quality: 'best' | 'ok' | 'blunder' | string; }[];
}

interface DashboardData {
    total_attempted: number;
    total_perfect: number;
    accuracy: number;
    scenarios_completed: ScenarioCompletion[];
    bookmarks: string[];
    skill_level: string | null;
    archetype: string | null;
    member_since: string;
    unique_scenarios_count: number;
}

interface AuthoredScenario {
    id: string;
    title: string;
    difficulty: string;
    status: string;
    createdAt: string;
}

export function Dashboard() {
    const { user, accessToken, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [authoredScenarios, setAuthoredScenarios] = useState<AuthoredScenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [scenarioTitles, setScenarioTitles] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<Tab>('bookmarks');
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (authLoading) return;
        if (!user || !accessToken) {
            navigate('/');
            return;
        }
        Promise.all([
            fetch(`${apiUrl}/users/me/dashboard`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }).then(r => r.json()),
            fetch(`${apiUrl}/scenarios`).then(r => r.json()),
            fetch(`${apiUrl}/builder/scenarios`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }).then(r => r.json()),
        ]).then(([dashData, scenarios, authored]) => {
            setData(dashData);
            const titles: Record<string, string> = {};
            scenarios.forEach((s: { id: string; title: string }) => {
                titles[s.id] = s.title;
            });
            setScenarioTitles(titles);
            setAuthoredScenarios(authored);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [user, accessToken, authLoading, navigate, apiUrl]);

    if (loading) return <p className={styles.loading}>Loading...</p>;
    if (!data) return null;

    function skillClass(level: string | null) {
        if (level === 'intermediate') return styles.skillIntermediate;
        if (level === 'expert') return styles.skillExpert;
        return styles.skillBeginner;
    }

    function formatDate(iso: string) {
        return new Date(iso).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    }

    function calculateScore(choices: ScenarioCompletion['choices']) {
        const qualityPoints: Record<string, number> = { best: 2, ok: 1, blunder: 0 };
        const earned = choices.reduce((sum, c) => sum + (qualityPoints[c.quality] ?? 0), 0);
        return { earned, max: choices.length * 2 };
    }

    function statusClass(status: string) {
        if (status === 'published') return styles.statusPublished;
        if (status === 'pending') return styles.statusPending;
        return styles.statusDraft;
    }

    return (
        <div className={styles.container}>
            {/* Profile header */}
            <div className={styles.profileHeader}>
                <div className={styles.avatarLarge}>
                    {user?.username[0].toUpperCase()}
                </div>
                <div className={styles.profileInfo}>
                    <h1 className={styles.username}>{user?.username}</h1>
                    <p className={styles.subtext}>
                        Member since {formatDate(data.member_since)}
                        {data.skill_level && (
                            <span className={`${styles.skillBadge} ${skillClass(data.skill_level)}`}>
                                {data.skill_level}
                            </span>
                        )}
                        {data.archetype && (
                            <span className={styles.archetype}>{data.archetype}</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Stats grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Attempted</span>
                    <span className={styles.statValue}>{data.total_attempted}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Perfect</span>
                    <span className={styles.statValue}>{data.total_perfect}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Accuracy</span>
                    <span className={styles.statValue}>{data.accuracy}%</span>
                    <div className={styles.accuracyBar}>
                        <div className={styles.accuracyFill} style={{ width: `${data.accuracy}%` }} />
                    </div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Unique</span>
                    <span className={styles.statValue}>{data.unique_scenarios_count}</span>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'bookmarks' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('bookmarks')}
                >
                    Bookmarks
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'scenarios' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('scenarios')}
                >
                    My Scenarios
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>

            {/* Tab content */}
            <div className={styles.tabContent}>

                {activeTab === 'bookmarks' && (
                    data.bookmarks.length === 0 ? (
                        <p className={styles.empty}>No bookmarks yet. Star a scenario on the board to save it here.</p>
                    ) : (
                        <div className={styles.scenarioList}>
                            {data.bookmarks.map((id, i) => (
                                <div
                                    key={i}
                                    className={`${styles.scenarioRow} ${styles.scenarioRowClickable}`}
                                    onClick={() => navigate(`/board/${id}`)}
                                >
                                    <span className={styles.scenarioName}>
                                        {scenarioTitles[id] || id}
                                    </span>
                                    <span className={styles.arrow}>→</span>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'scenarios' && (
                    authoredScenarios.length === 0 ? (
                        <p className={styles.empty}>
                            No scenarios yet.{' '}
                            <span className={styles.link} onClick={() => navigate('/builder')}>
                                Create one
                            </span>
                        </p>
                    ) : (
                        <div className={styles.scenarioList}>
                            {authoredScenarios.map(s => (
                                <div key={s.id} className={styles.scenarioRow}>
                                    <div className={styles.scenarioInfo}>
                                        <span className={styles.scenarioName}>
                                            {s.title || 'Untitled scenario'}
                                        </span>
                                        <span className={styles.scenarioMeta}>
                                            {s.difficulty} · {formatDate(s.createdAt)}
                                        </span>
                                    </div>
                                    <div className={styles.scenarioActions}>
                                        <span className={`${styles.statusBadge} ${statusClass(s.status)}`}>
                                            {s.status}
                                        </span>
                                        {s.status !== 'published' && (
                                            <button
                                                className={styles.editButton}
                                                onClick={() => navigate(`/builder/${s.id}`)}
                                                title="Edit in builder"
                                            >
                                                ✏️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'history' && (
                    data.scenarios_completed.length === 0 ? (
                        <p className={styles.empty}>
                            No scenarios completed yet.{' '}
                            <span className={styles.link} onClick={() => navigate('/scenarios')}>
                                Browse scenarios
                            </span>
                        </p>
                    ) : (
                        <div className={styles.scenarioList}>
                            {[...data.scenarios_completed].reverse().map((s, i) => {
                                const { earned, max } = calculateScore(s.choices ?? []);
                                return (
                                    <div key={i} className={styles.scenarioRow}>
                                        <span className={styles.scenarioName}>
                                            {scenarioTitles[s.scenarioId] || s.scenarioId}
                                        </span>
                                        <div className={styles.historyMeta}>
                                            <span className={styles.scoreBadge}>
                                                {earned}/{max}
                                            </span>
                                            <span className={styles.historyDate}>
                                                {formatDate(s.completedAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}