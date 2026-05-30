import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { ScenarioStep, Player } from '../../types';
import styles from './BuilderEditor.module.css';

interface BuilderScenario {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'expert';
    archetypes: string[];
    commanders: string[];
    tags: string[];
    steps: ScenarioStep[];
    startStepId: string | null;
    players: Player[];
}

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export function BuilderEditor() {
    const { id } = useParams<{ id: string }>();
    const { accessToken } = useAuth();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    const [scenario, setScenario] = useState<BuilderScenario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasUnsavedChanges = saveStatus === 'unsaved' || saveStatus === 'saving';

    // Block navigation when unsaved changes exist
    const blocker = useBlocker(hasUnsavedChanges);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Block browser tab close
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) e.preventDefault();
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [hasUnsavedChanges]);

    // Load draft on mount
    useEffect(() => {
        if (!id) return;
        fetch(`${apiUrl}/builder/scenarios/${id}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to load scenario');
                return res.json();
            })
            .then(data => {
                setScenario(data);
                if (data.steps?.length > 0) {
                    setSelectedStepId(data.startStepId ?? data.steps[0].id);
                }
            })
            .catch(() => setError('Failed to load scenario.'))
            .finally(() => setLoading(false));
    }, [id]);

    // Auto-save: debounced 1 second after any change
    const save = useCallback(async (data: BuilderScenario) => {
        setSaveStatus('saving');
        try {
            const res = await fetch(`${apiUrl}/builder/scenarios/${data.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(data)
            });
            setSaveStatus(res.ok ? 'saved' : 'error');
        } catch {
            setSaveStatus('error');
        }
    }, [accessToken, apiUrl]);

    function updateScenario(updates: Partial<BuilderScenario>) {
        setScenario(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            setSaveStatus('unsaved');
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => save(updated), 1000);
            return updated;
        });
    }

    async function handleDelete() {
        setDeleteLoading(true);
        try {
            const res = await fetch(`${apiUrl}/builder/scenarios/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (res.ok) navigate('/dashboard');
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
        }
    }

    if (loading) return <div className={styles.centered}>Loading...</div>;
    if (error) return <div className={styles.centered}>{error}</div>;
    if (!scenario) return null;

    const selectedStep = scenario.steps.find(s => s.id === selectedStepId) ?? null;

    return (
        <div className={styles.container}>
            {/* Top bar */}
            <div className={styles.topBar}>
                <span className={styles.scenarioTitle}>
                    {scenario.title || 'Untitled scenario'}
                </span>
                <span className={styles.saveIndicator} data-status={saveStatus}>
                    {saveStatus === 'saving' && 'Saving...'}
                    {saveStatus === 'saved' && 'Saved'}
                    {saveStatus === 'unsaved' && 'Unsaved changes'}
                    {saveStatus === 'error' && 'Save failed'}
                </span>
                <button
                    className={styles.deleteTopButton}
                    onClick={() => setShowDeleteModal(true)}
                >
                    Delete
                </button>
            </div>

            {/* Three panels */}
            <div className={styles.panels}>
                <div className={styles.leftPanel}>
                    <p className={styles.panelLabel}>Steps</p>
                    <p className={styles.comingSoon}>Step list coming soon</p>
                </div>

                <div className={styles.centerPanel}>
                    <p className={styles.panelLabel}>Board</p>
                    <p className={styles.comingSoon}>Board editor coming soon</p>
                </div>

                <div className={styles.rightPanel}>
                    <p className={styles.panelLabel}>
                        {selectedStep ? selectedStep.label || 'Untitled step' : 'Metadata'}
                    </p>
                    <p className={styles.comingSoon}>Step details coming soon</p>
                </div>
            </div>

            {/* Unsaved changes navigation blocker modal */}
            {blocker.state === 'blocked' && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <h2 className={styles.modalTitle}>Unsaved changes</h2>
                        <p className={styles.modalText}>
                            You have unsaved changes. If you leave now they will be lost.
                        </p>
                        <div className={styles.modalButtons}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => blocker.reset()}
                            >
                                Stay
                            </button>
                            <button
                                className={styles.dangerButton}
                                onClick={() => blocker.proceed()}
                            >
                                Leave anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <h2 className={styles.modalTitle}>Delete scenario?</h2>
                        <p className={styles.modalText}>This cannot be undone.</p>
                        <div className={styles.modalButtons}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.dangerButton}
                                onClick={handleDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}