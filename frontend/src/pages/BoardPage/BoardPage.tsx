import { LoadingScreen } from '../../components/LoadingScreen/LoadingScreen';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Scenario } from '../../types';
import { Board } from '../../components/Board/Board';
import { useScenario } from '../../hooks/useScenario';

function BoardWithScenario({ scenario }: { scenario: Scenario }) {
    const { scenario: loadedScenario, loading, error, cardImageMap } = useScenario(scenario);

    useEffect(() => {
        if (loadedScenario) {
            document.title = `TrainingArk - ${loadedScenario.title}`;
        }
    }, [loadedScenario]);

    if (loading) return <LoadingScreen />;
    if (error) return <div style={{ color: 'white', padding: '20px' }}>{error}</div>;
    if (!loadedScenario) return null;

    return <Board scenario={loadedScenario} cardImageMap={cardImageMap} />;
}

export function BoardPage() {
    const { id } = useParams<{ id: string }>();
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const apiUrl = import.meta.env.VITE_API_URL;

        fetch(`${apiUrl}/scenarios/${id}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                setScenario(data as Scenario);
                setLoading(false);
            })
            .catch(err => {
                console.log('fetch error:', err);
                setError(`Scenario "${id}" not found.`);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <LoadingScreen />;

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px',
                padding: '2rem'
            }}>
                {error}
            </div>
        );
    }

    if (!scenario) return null;

    return <BoardWithScenario scenario={scenario} />;
}