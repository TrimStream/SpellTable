import { LoadingScreen } from '../../components/LoadingScreen/LoadingScreen';
import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import type { Scenario } from "../../types";

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
                console.log('module:', module);
                console.log('module.default:', module.default);
                setScenario(module.default as Scenario);
                setLoading(false);
            })
            .catch(() => {
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

        if (!scenario) return null;

        return <div style={{color: 'white'}}>{JSON.stringify(scenario)}</div>;
    }
}