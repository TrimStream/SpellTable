import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import scenariosData from '../../data/scenarios-index.json';
import type { ScenarioMeta, Difficulty } from '../../types/scenario';
import styles from './Scenarios.module.css';

const scenarios = scenariosData as ScenarioMeta[];

const FILTERS = ['all', 'beginner', 'intermediate', 'expert'] as const;
type Filter = typeof FILTERS[number];

// TODO V4: Read skill level from user account instead of localStorage
const skillLevel = localStorage.getItem('tark_skill_level') as Difficulty | null;

function isLocked(difficulty: Difficulty): boolean {
    // TODO V4: Uncomment this when auth is implemented
    // if (!skillLevel) return false;
    // if (skillLevel === 'beginner') return difficulty !== 'beginner';
    // if (skillLevel === 'intermediate') return difficulty === 'expert';
    // return false;
    return false;
}

const badgeClass: Record<Difficulty, string> = {
    beginner: styles.badgeBeginner,
    intermediate: styles.badgeIntermediate,
    expert: styles.badgeExpert,
};

export function Scenarios() {
    const [filter, setFilter] = useState<Filter>('all');

    const filtered = useMemo(() => {
        if (filter === 'all') return scenarios;
        return scenarios.filter(s => s.difficulty === filter);
    }, [filter]);

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