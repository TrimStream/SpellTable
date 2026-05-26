import {useEffect, useMemo, useState} from 'react';
import type { Scenario } from '../../types';
import styles from './ScenarioPanel.module.css';
import { useAuth } from '../../context/AuthContext';

interface ScenarioPanelProps {
    scenario: Scenario;
}

const normalizeAnswer = (value: string) => value.trim().toLowerCase();

export function ScenarioPanel({ scenario }: ScenarioPanelProps) {
    const hasOptions = (scenario.options?.length ?? 0) > 0;
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [freeformAnswer, setFreeformAnswer] = useState('');
    const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);

    const { user, accessToken, openAuthModal } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL;

    const currentAnswer = hasOptions ? selectedOption : freeformAnswer;
    const canSubmit = useMemo(() => currentAnswer.trim().length > 0, [currentAnswer]);

    const handleSubmit = async () => {
        if (!canSubmit) return;
        const correct = normalizeAnswer(currentAnswer) === normalizeAnswer(scenario.correctAnswer);
        setSubmittedAnswer(currentAnswer);
        setIsCorrect(correct);

        if (user && accessToken) {
            try {
                await fetch(`${apiUrl}/users/me/scenarios`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        scenario_id: scenario.id,
                        correct
                    })
                });
            } catch {
                // silently fail - don't interrupt the user experience if tracking fails
            }
        }
    };

    useEffect(() => {
        if (!user || !accessToken) return;
        fetch(`${apiUrl}/users/me/bookmarks`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
            .then(r => r.json())
            .then(data => {
                setIsBookmarked(data.bookmarks.includes(scenario.id));
            })
            .catch(() => {});
    }, [user, accessToken, scenario.id]);

    async function handleBookmark() {
        if (!user || !accessToken) {
            openAuthModal('register');
            return;
        }
        setBookmarkLoading(true);
        try {
            if (isBookmarked) {
                await fetch(`${apiUrl}/users/me/bookmarks/${scenario.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setIsBookmarked(false);
            } else {
                await fetch(`${apiUrl}/users/me/bookmarks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ scenario_id: scenario.id })
                });
                setIsBookmarked(true);
            }
        } catch {
            // silently fail
        } finally {
            setBookmarkLoading(false);
        }
    }

    return (
        <section className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.title}>{scenario.title}</h2>
                <p className={styles.question}>{scenario.question}</p>
            </header>
            {hasOptions ? (
                <div className={styles.options}>
                    {scenario.options?.map((option) => {
                        const isSelected = option === selectedOption;
                        return (
                            <button
                                key={option}
                                type="button"
                                className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ''}`}
                                onClick={() => setSelectedOption(option)}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <textarea
                    className={styles.textarea}
                    value={freeformAnswer}
                    onChange={(e) => setFreeformAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={3}
                />
            )}

            <div className={styles.submitRow}>
                <button
                    className={styles.bookmarkButton}
                    onClick={handleBookmark}
                    disabled={bookmarkLoading}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark this scenario'}
                >
                    {isBookmarked ? '★' : '☆'}
                </button>

                <button
                    type="button"
                    className={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                >
                    Submit
                </button>

                {submittedAnswer !== null && isCorrect !== null && (
                    <div className={styles.feedback}>
                        <span className={isCorrect ? styles.correct : styles.incorrect}>
                            {isCorrect ? 'Correct!' : 'Not quite.'}
                        </span>
                        <span className={styles.correctAnswer}>
                            <strong>Correct answer:</strong> {scenario.correctAnswer}
                        </span>
                    </div>
                )}
            </div>

            {submittedAnswer !== null && !user && (
                <p className={styles.nudge}>
                    Want to save your results? <button className={styles.nudgeButton} onClick={() => openAuthModal('register')}>Create a free account</button>
                </p>
            )}
        </section>
    );
}