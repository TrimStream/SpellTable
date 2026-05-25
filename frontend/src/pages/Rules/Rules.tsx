import { useEffect } from 'react';
import styles from './Rules.module.css';

export function Rules() {
    useEffect(() => {
        document.title = 'TrainingArk - Rules';
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Rules</h1>
            <p className={styles.subtitle}>Commander rules, ban list, and comprehensive rules reference. Coming soon.</p>
        </div>
    );
}
