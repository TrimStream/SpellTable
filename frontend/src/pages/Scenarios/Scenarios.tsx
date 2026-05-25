import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ScenarioMeta, Difficulty } from '../../types/scenario';
import styles from './Scenarios.module.css';

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

    useEffect(() => {
        document.title = 'TrainingArk - Scenarios';

        const apiUrl = import.meta.env.VITE_API_URL;

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

    const filtered = useMemo(() => {
        if (filter === 'all') return scenarios;
        return scenarios.filter(s => s.difficulty === filter);
    }, [filter, scenarios]);

    if (loading) return <p style={{ padding: '2rem' }}>Loading scenarios...</p>;
    if (error) return <p style={{ padding: '2rem', color: 'red' }}>Failed to load scenarios: {error}</p>;

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
                            <span className={`${styles.badge} ${badgeClass[scenario.difficulty]}`}>
                                {scenario.difficulty}
                            </span>
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
        </div>
    );
}