import { LoadingScreen } from '../../components/LoadingScreen/LoadingScreen';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import type { Scenario } from "../../types";
import { Board } from "../../components/Board/Board";
import { useScenario } from "../../hooks/useScenario";
import styles from './BoardPage.module.css';

function ExitButton() {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate('/scenarios')}
            className={styles.exitBtn}
        >
            ← Scenarios
        </button>
    );
}

function BoardWithScenario({ scenario }: { scenario: Scenario }) {
    const { scenario: loadedScenario, loading, error } = useScenario(scenario);

    useEffect(() => {
        if (loadedScenario) {
            document.title = `TrainingArk - ${loadedScenario.title}`;
        }
    }, [loadedScenario]);

    if (loading) return <LoadingScreen />;
    if (error) return <div style={{ color: 'white', padding: '20px' }}>{error}</div>;
    if (!loadedScenario) return null;

    return <Board scenario={loadedScenario} />;
}

export function BoardPage() {
    const { id } = useParams<{ id: string }>();
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        import(`../../data/scenarios/${id}.json`)
            .then(module => {
                setScenario(module.default as Scenario);
                setLoading(false);
            })
            .catch((err) => {
                console.log('import error:', err);
                setError(`Scenario "${id}" not found.`);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px',
                background: 'var(--bg)'
            }}>
                {error}
            </div>
        );
    }

    if (!scenario) return null;

    return (
        <div style={{ position: 'relative' }}>
            <BoardWithScenario scenario={scenario} />
            <ExitButton />
        </div>
    );
}