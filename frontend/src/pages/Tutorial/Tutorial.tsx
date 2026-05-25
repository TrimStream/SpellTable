import { useEffect } from 'react';
import styles from './Tutorial.module.css';

export function Tutorial() {
    useEffect(() => {
        document.title = 'TrainingArk - Tutorial';
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Tutorial</h1>
                <p className={styles.body}>
                    This page will walk you through everything you need to know to start playing cEDH and get the most out of TrainingArk.
                </p>

                <h2 className={styles.heading}>What's coming</h2>
                <ul className={styles.list}>
                    <li>What makes cEDH different from casual Commander</li>
                    <li>How to read a board state and assess threats</li>
                    <li>Interaction timing and stack fundamentals</li>
                    <li>How to use the scenario trainer effectively</li>
                    <li>Mulligan philosophy in competitive Commander</li>
                    <li>Politics and table talk at a competitive table</li>
                </ul>
            </div>
        </div>
    );
}