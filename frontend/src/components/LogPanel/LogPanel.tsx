import type { Scenario, ScenarioStep, Choice } from '../../types';

interface LogPanelProps {
    scenario: Scenario;
    currentStep: ScenarioStep | undefined;
    userChoices: Record<string, Choice>;
    scenarioComplete: boolean;
    onChoice: (stepId: string, choice: Choice) => void;
}

export function LogPanel({ scenario }: LogPanelProps) {
    return (
        <div style={{
            width: '320px',
            flexShrink: 0,
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
        }}>
            Log panel — coming next
        </div>
    );
}