import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QuizModal } from '../../components/QuizModal/QuizModal';
import styles from './Home.module.css';

export function Home() {
    const [showQuiz, setShowQuiz] = useState(false);

    useEffect(() => {
        document.title = 'TrainingArk';
    }, []);

    return (
        <div>
            <section className={styles.hero}>
                <p className={styles.eyebrow}>cEDH training simulator</p>
                <h1 className={styles.title}>
                    Get better at <em>competitive Commander.</em><br />
                    One scenario at a time.
                </h1>
                <p className={styles.subtitle}>
                    cEDH is Commander played to win as fast as possible. No holding back. This is where you learn to play at that level.
                </p>
                <div className={styles.heroBtns}>
                    <Link to="/scenarios" className={styles.btnPrimary}>Browse scenarios</Link>
                    <button className={styles.btnOutline} onClick={() => setShowQuiz(true)}>
                        Not sure where to start? Take the quiz
                    </button>
                </div>
            </section>

            <section className={styles.whatIs}>
                <p className={styles.sectionTitle}>What is cEDH?</p>
                <div className={styles.cardGrid}>
                    <div className={styles.card}>
                        <p className={styles.cardTitle}>Competitive Commander</p>
                        <p className={styles.cardBody}>Commander at its highest power level. Every deck is built to win as fast as possible, typically on turns 3–5 through infinite combos and heavy interaction.</p>
                    </div>
                    <div className={styles.card}>
                        <p className={styles.cardTitle}>How this works</p>
                        <p className={styles.cardBody}>You see a real game state. Four players, real cards on a real board. You make a decision. We tell you if you got it right and explain the correct line.</p>
                    </div>
                    <div className={styles.card}>
                        <p className={styles.cardTitle}>Who is this for?</p>
                        <p className={styles.cardBody}>Players who know Magic but keep losing in cEDH. You picked up Kenrith or Kinnan. You're not sure why your lines are wrong. Start here.</p>
                    </div>
                </div>
            </section>

            {showQuiz && <QuizModal onClose={() => setShowQuiz(false)} />}
        </div>
    );
}