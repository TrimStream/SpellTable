import { useState } from 'react';
import { QUIZ_QUESTIONS, calculateLevel, SKILL_LEVEL_LABELS, SKILL_LEVEL_DESCRIPTIONS } from '../../data/quiz';
import styles from './QuizModal.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface QuizModalProps {
    onClose: () => void;
}

export function QuizModal({ onClose }: QuizModalProps) {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answers, setAnswers] = useState<number[]>([]);
    const [done, setDone] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const { user, openAuthModal } = useAuth();

    const question = QUIZ_QUESTIONS[currentIndex];
    const isLast = currentIndex === QUIZ_QUESTIONS.length - 1;
    const progress = ((currentIndex) / QUIZ_QUESTIONS.length) * 100;

    function handleNext() {
        if (selectedOption === null) return;

        const newAnswers = [...answers, selectedOption];
        setAnswers(newAnswers);

        if (isLast) {
            const score = QUIZ_QUESTIONS.reduce((total, q, i) => {
                if (!q.scored) return total;
                return total + (q.options[newAnswers[i]]?.points ?? 0);
            }, 0);

            const level = calculateLevel(score);
            localStorage.setItem('tark_skill_level', level);

            const archetypeIndex = newAnswers[QUIZ_QUESTIONS.findIndex(q => q.id === 'archetype')];
            const archetype = QUIZ_QUESTIONS.find(q => q.id === 'archetype')?.options[archetypeIndex]?.label;
            if (archetype) localStorage.setItem('tark_archetype', archetype);

            setResult(level);
            setDone(true);
        } else {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
        }
    }

    function handleSkip() {
        onClose();
    }

    if (done && result) {
        const level = result as 'beginner' | 'intermediate' | 'expert';
        return (
            <div className={styles.backdrop} onClick={onClose}>
                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                    <div className={styles.resultBlock}>
                        <p className={styles.resultLevel}>{SKILL_LEVEL_LABELS[level]}</p>
                        <h2 className={styles.resultTitle}>Your level has been set.</h2>
                        <p className={styles.resultBody}>{SKILL_LEVEL_DESCRIPTIONS[level]}</p>
                        <button className={styles.resultBtn} onClick={() => { onClose(); navigate('/scenarios'); }}>
                            Browse scenarios
                        </button>
                        {!user && (
                            <p className={styles.nudge}>
                                <button className={styles.nudgeBtn} onClick={() => { onClose(); openAuthModal('register'); }}>
                                    Create a free account
                                </button>
                                {' '}to save your level and track your progress.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div>
                        <p className={styles.modalTitle}>Find your level</p>
                        <p className={styles.modalSubtitle}>
                            {QUIZ_QUESTIONS.length} quick questions. We'll recommend the right scenarios to start with.
                        </p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <div className={styles.progressRow}>
                    <div className={styles.progressTrack}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                    <span className={styles.progressLabel}>{currentIndex + 1} of {QUIZ_QUESTIONS.length}</span>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.question}>{question.question}</p>
                    {question.note && (
                        <p className={styles.questionNote}>{question.note}</p>
                    )}
                    <div className={styles.options}>
                        {question.options.map((option, i) => (
                            <button
                                key={i}
                                className={`${styles.option} ${selectedOption === i ? styles.optionSelected : ''}`}
                                onClick={() => setSelectedOption(i)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.skipBtn} onClick={handleSkip}>Skip quiz</button>
                    <button
                        className={styles.nextBtn}
                        onClick={handleNext}
                        disabled={selectedOption === null}
                    >
                        {isLast ? 'See my level' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}