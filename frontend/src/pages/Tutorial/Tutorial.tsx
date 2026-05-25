import { useEffect } from 'react';
import styles from './Tutorial.module.css';

export function Tutorial() {
    useEffect(() => {
        document.title = 'TrainingArk - Tutorial';
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Tutorial</h1>
            <p className={styles.subtitle}>A guide to cEDH fundamentals and how to use TrainingArk. Coming soon.</p>
        </div>
    );
}
