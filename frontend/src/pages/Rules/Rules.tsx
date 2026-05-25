import { useEffect } from 'react';
import styles from './Rules.module.css';

export function Rules() {
    useEffect(() => {
        document.title = 'TrainingArk - Rules';
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Rules Reference</h1>
                <p className={styles.body}>
                    This page will contain a full reference for competitive Commander including the official rules, the current ban list, and rulings relevant to common cEDH interactions.
                </p>

                <h2 className={styles.heading}>What's coming</h2>
                <ul className={styles.list}>
                    <li>Official Commander rules and format guidelines</li>
                    <li>Current EDH ban list updated for the latest announcements</li>
                    <li>Comprehensive rules reference for common cEDH interactions</li>
                    <li>Priority, the stack, and timing rules explained for competitive play</li>
                </ul>
            </div>
        </div>
    );
}