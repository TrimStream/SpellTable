import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryState {
    hasError: boolean;
    message: string;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        hasError: false,
        message: '',
    };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
}

componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
}

render() {
    if (this.state.hasError) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Something went wrong.</h1>
                <p className={styles.message}>An unexpected error occurred. Try going back home.</p>
                <Link to="/" className={styles.link}>Back to home</Link>
            </div>
        );
    }

    return this.props.children;
}
}