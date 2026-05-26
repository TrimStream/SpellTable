import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

interface ScenarioCompletion {
    scenarioId: string;
    correct: boolean;
    completedAt: string;
}

interface DashboardData {
    total_attempted: number;
    total_correct: number;
    accuracy: number;
    scenarios_completed: ScenarioCompletion[];
    bookmarks: string[];
    skill_level: string | null;
    archetype: string | null;
    member_since: string;
    unique_scenarios_count: number;
}

export function Dashboard() {
    const { user, accessToken } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [scenarioTitles, setScenarioTitles] = useState<Record<string, string>>({});
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!user || !accessToken) {
            navigate('/');
            return;
        }
        Promise.all([
            fetch(`${apiUrl}/users/me/dashboard`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }).then(r => r.json()),
            fetch(`${apiUrl}/scenarios`).then(r => r.json())
        ]).then(([dashData, scenarios]) => {
            setData(dashData);
            const titles: Record<string, string> = {};
            scenarios.forEach((s: { id: string; title: string }) => {
                titles[s.id] = s.title;
            });
            setScenarioTitles(titles);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [user, accessToken]);

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

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.greeting}>Welcome back, {user?.username}</h1>
                <p className={styles.subtext}>
                    Member since {formatDate(data.member_since)}
                    {data.skill_level && (
                        <> &nbsp;·&nbsp;
                            <span className={`${styles.skillBadge} ${skillClass(data.skill_level)}`}>
                                {data.skill_level}
                            </span>
                        </>
                    )}
                    {data.archetype && <> &nbsp;·&nbsp; {data.archetype}</>}
                </p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Scenarios Attempted</span>
                    <span className={styles.statValue}>{data.total_attempted}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Correct</span>
                    <span className={styles.statValue}>{data.total_correct}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Accuracy</span>
                    <span className={styles.statValue}>{data.accuracy}%</span>
                    <div className={styles.accuracyBar}>
                        <div className={styles.accuracyFill} style={{ width: `${data.accuracy}%` }} />
                    </div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Unique Scenarios</span>
                    <span className={styles.statValue}>{data.unique_scenarios_count}</span>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Bookmarks</h2>
                {data.bookmarks.length === 0 ? (
                    <p className={styles.empty}>
                        No bookmarks yet. Star a scenario on the board to save it here.
                    </p>
                ) : (
                    <div className={styles.scenarioList}>
                        {data.bookmarks.map((id, i) => (
                            <div
                                key={i}
                                className={`${styles.scenarioRow} ${styles.scenarioRowClickable}`}
                                onClick={() => navigate(`/board/${id}`)}
                            >
                                <span className={styles.scenarioId}>
                                    {scenarioTitles[id] || id}
                                </span>
                                <span className={styles.arrow}>→</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Recent Activity</h2>
                {data.scenarios_completed.length === 0 ? (
                    <p className={styles.empty}>
                        No scenarios completed yet.{' '}
                        <span className={styles.link} onClick={() => navigate('/scenarios')}>
                            Browse scenarios
                        </span>
                    </p>
                ) : (
                    <div className={styles.scenarioList}>
                        {[...data.scenarios_completed].reverse().slice(0, 10).map((s, i) => (
                            <div key={i} className={styles.scenarioRow}>
                                <span className={styles.scenarioId}>
                                    {scenarioTitles[s.scenarioId] || s.scenarioId}
                                </span>
                                <div className={styles.scenarioMeta}>
                                    <span className={s.correct ? styles.correct : styles.incorrect}>
                                        {s.correct ? 'Correct' : 'Incorrect'}
                                    </span>
                                    <span>{formatDate(s.completedAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}