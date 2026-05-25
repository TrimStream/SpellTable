import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export function NotFound() {
    useEffect(() => {
        document.title = 'TrainingArk - Page Not Found';
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.code}>404</h1>
            <p className={styles.message}>This page doesn't exist.</p>
            <Link to="/" className={styles.link}>Back to home</Link>
        </div>
    );
}