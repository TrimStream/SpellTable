import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { ScenarioStep, Player } from '../../types';
import styles from './BuilderEditor.module.css';

function generateId() {
    return Math.random().toString(36).slice(2, 10);
}

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
    const { accessToken, loading: authLoading } = useAuth();
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

    useEffect(() => {
        if (!authLoading && !accessToken) {
            navigate('/');
        }
    }, [authLoading, accessToken, navigate]);

    // Load draft on mount
    useEffect(() => {
        if (!id) return;
        if (authLoading) return;
        if (!accessToken) return;
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
    }, [id, authLoading, accessToken, apiUrl]);

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

    function addStep() {
        const newStep: ScenarioStep = {
            id: `step-${generateId()}`,
            label: '',
            logLines: [],
            isFinal: false,
        };

        setScenario(prev => {
            if (!prev) return prev;
            const steps = [...prev.steps];

            // Wire previous last step to point to new step
            if (steps.length > 0) {
                const last = { ...steps[steps.length - 1] };
                if (!last.isFinal) last.nextStepId = newStep.id;
                steps[steps.length - 1] = last;
            }

            const updated = {
                ...prev,
                steps: [...steps, newStep],
                startStepId: prev.startStepId ?? newStep.id,
            };

            setSaveStatus('unsaved');
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => save(updated), 1000);
            return updated;
        });

        setSelectedStepId(newStep.id);
    }

    function deleteStep(stepId: string) {
        setScenario(prev => {
            if (!prev) return prev;
            const steps = prev.steps.filter(s => s.id !== stepId);

            // Re-wire nextStepIds — remove any references to deleted step
            const rewired = steps.map(s => {
                if (s.nextStepId === stepId) return { ...s, nextStepId: undefined };
                return s;
            });

            const updated = {
                ...prev,
                steps: rewired,
                startStepId: prev.startStepId === stepId
                    ? (rewired[0]?.id ?? null)
                    : prev.startStepId,
            };

            setSaveStatus('unsaved');
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => save(updated), 1000);
            return updated;
        });

        setSelectedStepId(prev =>
            prev === stepId ? null : prev
        );
    }

    if (loading) return <div className={styles.centered}>Loading...</div>;
    if (error) return <div className={styles.centered}>{error}</div>;
    if (!scenario) return null;

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
                    <div className={styles.stepList}>
                        {scenario.steps.length === 0 && (
                            <p className={styles.comingSoon}>No steps yet.</p>
                        )}
                        {scenario.steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`${styles.stepRow} ${selectedStepId === step.id ? styles.stepRowSelected : ''}`}
                                onClick={() => setSelectedStepId(step.id)}
                            >
                                <div className={styles.stepRowMain}>
                                    <span className={styles.stepIndex}>{index + 1}</span>
                                    <span className={styles.stepLabel}>
                                        {step.label || 'Untitled'}
                                    </span>
                                </div>
                                <div className={styles.stepRowFooter}>
                                    <span className={`${styles.stepBadge} ${
                                        step.isFinal ? styles.badgeFinal :
                                        step.decisionPoint ? styles.badgeQuestion :
                                        styles.badgeNarration
                                    }`}>
                                        {step.isFinal ? 'Final' : step.decisionPoint ? 'Question' : 'Narration'}
                                    </span>
                                    <button
                                        className={styles.stepDeleteButton}
                                        onClick={e => { e.stopPropagation(); deleteStep(step.id); }}
                                        title="Delete step"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className={styles.addStepButton} onClick={addStep}>
                        + Add step
                    </button>
                </div>

                <div className={styles.centerPanel}>
                    <p className={styles.panelLabel}>Board</p>
                    <p className={styles.comingSoon}>Board editor coming soon</p>
                </div>

                <div className={styles.rightPanel}>
                    {!selectedStepId ? (
                        <MetadataPanel
                            scenario={scenario}
                            onUpdate={updateScenario}
                        />
                    ) : (
                        <StepPanel
                            step={scenario.steps.find(s => s.id === selectedStepId)!}
                            onUpdate={(updates) => {
                                updateScenario({
                                    steps: scenario.steps.map(s =>
                                        s.id === selectedStepId ? { ...s, ...updates } : s
                                    )
                                });
                            }}
                        />
                    )}
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

const ARCHETYPES = ['Turbo', 'Midrange', 'Stax', 'Hatebears', 'Combo-Control'];
const DIFFICULTIES = ['beginner', 'intermediate', 'expert'] as const;

function MetadataPanel({
    scenario,
    onUpdate,
}: {
    scenario: BuilderScenario;
    onUpdate: (updates: Partial<BuilderScenario>) => void;
}) {
    const [commanderInput, setCommanderInput] = useState('');
    const [commanderSuggestions, setCommanderSuggestions] = useState<string[]>([]);
    const [commanderLoading, setCommanderLoading] = useState(false);
    const [commanderImageMap, setCommanderImageMap] = useState<Record<string, string>>({});
    const [hoverCard, setHoverCard] = useState<{imageUrl: string, x: number, y: number} | null>(null);
    const [tagInput, setTagInput] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleCommanderInput(value: string) {
        setCommanderInput(value);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        if (!value.trim()) { setCommanderSuggestions([]); return; }
        searchTimer.current = setTimeout(async () => {
            setCommanderLoading(true);
            try {
                const res = await fetch(
                    `https://api.scryfall.com/cards/search?q=is:commander+name:/${encodeURIComponent(value)}/&order=name&unique=names`
                );
                if (res.status === 404) { setCommanderSuggestions([]); return; }
                if (!res.ok) { setCommanderSuggestions([]); return; }
                const data = await res.json();
                const names: string[] = (data.data ?? [])
                    .slice(0, 8)
                    .map((c: any) => c.name as string)
                    .filter((n: any) => typeof n === 'string');
                setCommanderSuggestions(names);
            } finally {
                setCommanderLoading(false);
            }
        }, 300);
    }

    async function fetchCommanderImage(name: string): Promise<string> {
        if (commanderImageMap[name]) return commanderImageMap[name];
        try {
            const res = await fetch(
                `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`
            );
            if (!res.ok) return '';
            const data = await res.json();
            const url = data.image_uris?.normal ?? data.card_faces?.[0]?.image_uris?.normal ?? '';
            setCommanderImageMap(prev => ({ ...prev, [name]: url }));
            return url;
        } catch {
            return '';
        }
    }

    function selectCommander(name: string) {
        if (scenario.commanders.includes(name)) return;
        onUpdate({ commanders: [...scenario.commanders, name] });
        setCommanderInput('');
        setCommanderSuggestions([]);
        fetchCommanderImage(name);
    }

    async function handleSuggestionHover(name: string, e: React.MouseEvent) {
        const url = await fetchCommanderImage(name);
        if (url) setHoverCard({ imageUrl: url, x: e.clientX, y: e.clientY });
    }

    return (
        <div className={styles.metaPanel}>
            <p className={styles.panelLabel}>Scenario Metadata</p>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>Title</label>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Scenario title"
                    value={scenario.title}
                    onChange={e => onUpdate({ title: e.target.value })}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>Description</label>
                <textarea
                    className={styles.textarea}
                    placeholder="What is this scenario about?"
                    value={scenario.description}
                    onChange={e => onUpdate({ description: e.target.value })}
                    rows={3}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>Difficulty</label>
                <div className={styles.difficultyRow}>
                    {DIFFICULTIES.map(d => (
                        <button
                            key={d}
                            className={`${styles.difficultyButton} ${scenario.difficulty === d ? styles.difficultySelected : ''}`}
                            onClick={() => onUpdate({ difficulty: d })}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>Archetypes in play</label>
                <div className={styles.tagRow}>
                    {ARCHETYPES.map(a => (
                        <button
                            key={a}
                            className={`${styles.tagToggle} ${scenario.archetypes.includes(a) ? styles.tagToggleOn : ''}`}
                            onClick={() => {
                                const next = scenario.archetypes.includes(a)
                                    ? scenario.archetypes.filter(x => x !== a)
                                    : [...scenario.archetypes, a];
                                onUpdate({ archetypes: next });
                            }}
                        >
                            {a}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>Commanders</label>
                <div className={styles.chipList}>
                    {scenario.commanders.map(c => (
                        <span
                            key={c}
                            className={styles.chip}
                            onMouseEnter={(e) => commanderImageMap[c] && setHoverCard({
                                imageUrl: commanderImageMap[c],
                                x: e.clientX,
                                y: e.clientY
                            })}
                            onMouseMove={(e) => setHoverCard(prev =>
                                prev ? { ...prev, x: e.clientX, y: e.clientY } : prev
                            )}
                            onMouseLeave={() => setHoverCard(null)}
                        >
                            {c}
                            <button
                                className={styles.chipRemove}
                                onClick={() => onUpdate({
                                    commanders: scenario.commanders.filter(x => x !== c)
                                })}
                            >×</button>
                        </span>
                    ))}
                </div>
                <div className={styles.autocompleteWrapper}>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Search for a commander..."
                        value={commanderInput}
                        onChange={e => handleCommanderInput(e.target.value)}
                        autoComplete="off"
                    />
                    {commanderLoading && <p className={styles.hint}>Searching...</p>}
                    {commanderSuggestions.length > 0 && (
                        <div className={styles.suggestionList}>
                            {commanderSuggestions.map(name => (
                                <div
                                    key={name}
                                    className={styles.suggestionRow}
                                    onClick={() => selectCommander(name)}
                                    onMouseEnter={(e) => handleSuggestionHover(name, e)}
                                    onMouseMove={(e) => setHoverCard(prev =>
                                        prev ? { ...prev, x: e.clientX, y: e.clientY } : prev
                                    )}
                                    onMouseLeave={() => setHoverCard(null)}
                                >
                                    {name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {hoverCard && createPortal(
                    <img
                        src={hoverCard.imageUrl}
                        alt="Card preview"
                        style={{
                            position: 'fixed',
                            top: hoverCard.y > window.innerHeight * 0.6
                                ? hoverCard.y - 320
                                : hoverCard.y,
                            left: hoverCard.x - 240,
                            width: '220px',
                            height: 'auto',
                            borderRadius: '10px',
                            zIndex: 9999,
                            pointerEvents: 'none',
                            boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
                        }}
                    />,
                    document.body
                )}
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>Tags</label>
                <div className={styles.chipList}>
                    {scenario.tags.map(t => (
                        <span key={t} className={styles.chip}>
                            {t}
                            <button
                                className={styles.chipRemove}
                                onClick={() => onUpdate({
                                    tags: scenario.tags.filter(x => x !== t)
                                })}
                            >×</button>
                        </span>
                    ))}
                </div>
                <div className={styles.inputRow}>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Add tag"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && tagInput.trim()) {
                                onUpdate({ tags: [...scenario.tags, tagInput.trim()] });
                                setTagInput('');
                            }
                        }}
                    />
                </div>
                <p className={styles.hint}>Press Enter to add</p>
            </div>
        </div>
    );
}

function StepPanel({
    step,
    onUpdate,
}: {
    step: ScenarioStep;
    onUpdate: (updates: Partial<ScenarioStep>) => void;
}) {
    const [newLogLine, setNewLogLine] = useState('');

    return (
        <div className={styles.metaPanel}>
            <p className={styles.panelLabel}>Step Details</p>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>Label</label>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="e.g. Oracle resolves"
                    value={step.label ?? ''}
                    onChange={e => onUpdate({ label: e.target.value })}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>Narration</label>
                <div className={styles.logLines}>
                    {(step.logLines ?? []).map((line, i) => (
                        <div key={i} className={styles.logLineRow}>
                            <span className={styles.logLineText}>{line}</span>
                            <button
                                className={styles.chipRemove}
                                onClick={() => onUpdate({
                                    logLines: step.logLines?.filter((_, j) => j !== i)
                                })}
                            >×</button>
                        </div>
                    ))}
                </div>
                <textarea
                    className={styles.textarea}
                    placeholder="Add a narration line"
                    value={newLogLine}
                    onChange={e => setNewLogLine(e.target.value)}
                    rows={2}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey && newLogLine.trim()) {
                            e.preventDefault();
                            onUpdate({ logLines: [...(step.logLines ?? []), newLogLine.trim()] });
                            setNewLogLine('');
                        }
                    }}
                />
                <p className={styles.hint}>Press Enter to add</p>
            </div>

            <div className={styles.field}>
                <div className={styles.toggleRow}>
                    <label className={styles.fieldLabel}>Mark as final step</label>
                    <button
                        className={`${styles.toggle} ${step.isFinal ? styles.toggleOn : ''}`}
                        onClick={() => onUpdate({ isFinal: !step.isFinal })}
                    >
                        <span className={styles.toggleThumb} />
                    </button>
                </div>
            </div>

            <div className={styles.field}>
                <div className={styles.toggleRow}>
                    <label className={styles.fieldLabel}>Has question</label>
                    <button
                        className={`${styles.toggle} ${step.decisionPoint ? styles.toggleOn : ''}`}
                        onClick={() => onUpdate({
                            decisionPoint: step.decisionPoint ? undefined : {
                                prompt: '',
                                choices: []
                            }
                        })}
                    >
                        <span className={styles.toggleThumb} />
                    </button>
                </div>
            </div>

            {step.decisionPoint && (
                <DecisionPointPanel
                    decisionPoint={step.decisionPoint}
                    onUpdate={dp => onUpdate({ decisionPoint: dp })}
                />
            )}
        </div>
    );
}

function DecisionPointPanel({
    decisionPoint,
    onUpdate,
}: {
    decisionPoint: NonNullable<ScenarioStep['decisionPoint']>;
    onUpdate: (dp: NonNullable<ScenarioStep['decisionPoint']>) => void;
}) {
    function addChoice() {
        const newChoice = {
            id: `choice-${Math.random().toString(36).slice(2, 8)}`,
            label: '',
            quality: 'best' as const,
            logEntry: '',
            explanation: '',
        };
        onUpdate({
            ...decisionPoint,
            choices: [...decisionPoint.choices, newChoice]
        });
    }

    function updateChoice(index: number, updates: Partial<typeof decisionPoint.choices[0]>) {
        const choices = decisionPoint.choices.map((c, i) =>
            i === index ? { ...c, ...updates } : c
        );
        onUpdate({ ...decisionPoint, choices });
    }

    function removeChoice(index: number) {
        onUpdate({
            ...decisionPoint,
            choices: decisionPoint.choices.filter((_, i) => i !== index)
        });
    }

    return (
        <div className={styles.decisionPanel}>
            <div className={styles.field}>
                <label className={styles.fieldLabel}>Question prompt</label>
                <textarea
                    className={styles.textarea}
                    placeholder="What do you do?"
                    value={decisionPoint.prompt}
                    onChange={e => onUpdate({ ...decisionPoint, prompt: e.target.value })}
                    rows={2}
                />
            </div>

            <label className={styles.fieldLabel}>Choices</label>
            {decisionPoint.choices.map((choice, i) => (
                <div key={choice.id} className={styles.choiceCard}>
                    <div className={styles.choiceHeader}>
                        <span className={styles.choiceNumber}>Choice {i + 1}</span>
                        <button
                            className={styles.chipRemove}
                            onClick={() => removeChoice(i)}
                        >×</button>
                    </div>
                    <input
                        className={styles.input}
                        placeholder="Button label"
                        value={choice.label}
                        onChange={e => updateChoice(i, { label: e.target.value })}
                    />
                    <div className={styles.qualityRow}>
                        {(['best', 'ok', 'blunder'] as const).map(q => (
                            <button
                                key={q}
                                className={`${styles.qualityButton} ${choice.quality === q ? styles[`quality_${q}`] : ''}`}
                                onClick={() => updateChoice(i, { quality: q })}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                    <textarea
                        className={styles.textarea}
                        placeholder="Log entry (shown in feed)"
                        value={choice.logEntry}
                        onChange={e => updateChoice(i, { logEntry: e.target.value })}
                        rows={2}
                    />
                    <textarea
                        className={styles.textarea}
                        placeholder="Explanation (shown after answer)"
                        value={choice.explanation}
                        onChange={e => updateChoice(i, { explanation: e.target.value })}
                        rows={3}
                    />
                </div>
            ))}

            {decisionPoint.choices.length < 4 && (
                <button className={styles.addStepButton} onClick={addChoice}>
                    + Add choice
                </button>
            )}
        </div>
    );
}

