import { useState, useEffect, useRef } from 'react';
import type { Scenario, ScenarioStep, Choice } from '../../types';
import styles from './LogPanel.module.css';

interface LogPanelProps {
    scenario: Scenario;
    currentStep: ScenarioStep | undefined;
    userChoices: Record<string, Choice>;
    scenarioComplete: boolean;
    onChoice: (stepId: string, choice: Choice) => void;
    onReset: () => void;
}

// ── Log entry types ──
type LogEntryType = 'narration' | 'decision' | 'correction' | 'system';

interface LogEntry {
    id: string;
    type: LogEntryType;
    text: string;
}

export function LogPanel({
    scenario,
    currentStep,
    userChoices,
    scenarioComplete,
    onChoice,
    onReset,
}: LogPanelProps) {
    const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
    const [awaitingChoice, setAwaitingChoice] = useState(false);
    const [pendingCorrection, setPendingCorrection] = useState<{
        quality: Choice['quality'];
        explanation: string;
    } | null>(null);
    const processedStepIds = useRef<Set<string>>(new Set());

    const feedRef = useRef<HTMLDivElement>(null);
    const entryCounter = useRef(0);

    const scenarioCompletedLogged = useRef(false);

    // ── Auto-scroll to bottom when new entries appear ──
    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [logEntries]);

    // ── Generate a unique id for each log entry ──
    function nextId(): string {
        entryCounter.current += 1;
        return `entry-${entryCounter.current}`;
    }

    // ── Append entries to the log ──
    function appendEntries(entries: Omit<LogEntry, 'id'>[]) {
        setLogEntries(prev => [
            ...prev,
            ...entries.map(e => ({ ...e, id: nextId() })),
        ]);
    }

    // ── Process a step when it becomes current ──
    // Appends its log lines, then either pauses for a decision or auto-advances.
    function processStep(step: ScenarioStep) {
        if (processedStepIds.current.has(step.id)) return;
        processedStepIds.current.add(step.id);

        if (step.logLines.length > 0) {
            appendEntries(
                step.logLines.map(line => ({
                    type: 'narration' as LogEntryType,
                    text: line,
                }))
            );
        }

        if (step.decisionPoint) {
            setAwaitingChoice(true);
        }
    }

    // ── React to currentStep changes ──
    useEffect(() => {
        if (!currentStep) return;
        processStep(currentStep);
    }, [currentStep]);

    // ── Handle scenario complete ──
    useEffect(() => {
        if (scenarioComplete && !scenarioCompletedLogged.current) {
            scenarioCompletedLogged.current = true;
            setAwaitingChoice(false);
            appendEntries([{
                type: 'system',
                text: 'Scenario complete.',
            }]);
        }
    }, [scenarioComplete]);

    // ── Handle a choice being made ──
    function handleChoice(choice: Choice) {
        if (!currentStep?.decisionPoint) return;

        // Append the player's choice to the log
        appendEntries([{
            type: 'decision',
            text: choice.logEntry,
        }]);

        // If not best, show inline correction before advancing
        if (choice.quality !== 'best') {
            setPendingCorrection({
                quality: choice.quality,
                explanation: choice.explanation,
            });
        }

        setAwaitingChoice(false);

        // Tell Board to advance to the next step
        onChoice(currentStep.id, choice);
    }

    // ── Dismiss correction and continue ──
    function dismissCorrection() {
        setPendingCorrection(null);
    }

    // ── Quality label ──
    function qualityLabel(quality: Choice['quality']): string {
        if (quality === 'ok') return 'Suboptimal';
        return 'Blunder';
    }

    // ── Quality color class ──
    function qualityClass(quality: Choice['quality']): string {
        if (quality === 'ok') return styles.correctionOk;
        return styles.correctionBlunder;
    }

    // ── Debrief ──
    // Shows all decision points and what the player chose.
    function renderDebrief() {
        if (!scenario.steps) return null;
        const decisionSteps = scenario.steps.filter(s => s.decisionPoint);

        return (
            <div className={styles.debrief}>
                <h3 className={styles.debriefTitle}>Debrief</h3>
                {decisionSteps.map(step => {
                    const chosen = userChoices[step.id];
                    if (!chosen) return null;
                    return (
                        <div key={step.id} className={styles.debriefItem}>
                            <div className={styles.debriefPrompt}>
                                {step.decisionPoint!.prompt}
                            </div>
                            <div className={`${styles.debriefChoice} ${
                                chosen.quality === 'best' ? styles.debriefBest :
                                chosen.quality === 'ok' ? styles.debriefOk :
                                styles.debriefBlunder
                            }`}>
                                <span className={styles.debriefQuality}>
                                    {chosen.quality === 'best' ? '★ Best' :
                                     chosen.quality === 'ok' ? '~ Ok' : '✕ Blunder'}
                                </span>
                                <span className={styles.debriefChoiceLabel}>
                                    {chosen.label}
                                </span>
                            </div>
                            <div className={styles.debriefExplanation}>
                                {chosen.explanation}
                            </div>
                        </div>
                    );
                })}
                <button className={styles.playAgainButton} onClick={onReset}>
                    Play Again
                </button>
            </div>
        );
    }

    return (
        <div className={styles.logPanel}>

            {/* ── Scenario header ── */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>{scenario.title}</div>
                <div className={styles.headerDifficulty}>{scenario.difficulty}</div>
            </div>

            {/* ── Log feed ── */}
            <div className={styles.feed} ref={feedRef}>
                {logEntries.map(entry => (
                    <div
                        key={entry.id}
                        className={`${styles.entry} ${styles[entry.type]}`}
                    >
                        {entry.text}
                    </div>
                ))}
            </div>

            {/* ── Action area ── */}
            <div className={styles.actionArea}>

                {/* Inline correction after a non-best choice */}
                {pendingCorrection && (
                    <div className={`${styles.correction} ${qualityClass(pendingCorrection.quality)}`}>
                        <div className={styles.correctionLabel}>
                            {qualityLabel(pendingCorrection.quality)}
                        </div>
                        <div className={styles.correctionText}>
                            {pendingCorrection.explanation}
                        </div>
                        <div className={styles.correctionButtons}>
                            {pendingCorrection.quality === 'blunder' && (
                                <button
                                    className={styles.correctionRestart}
                                    onClick={() => { dismissCorrection(); onReset(); }}
                                >
                                    Restart
                                </button>
                            )}
                            <button
                                className={styles.correctionDismiss}
                                onClick={dismissCorrection}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Decision choices */}
                {awaitingChoice && !pendingCorrection && currentStep?.decisionPoint && (
                    <div className={styles.choices}>
                        <div className={styles.choicePrompt}>
                            {currentStep.decisionPoint.prompt}
                        </div>
                        <div className={styles.choiceButtons}>
                            {currentStep.decisionPoint.choices.map(choice => (
                                <button
                                    key={choice.id}
                                    className={styles.choiceButton}
                                    onClick={() => handleChoice(choice)}
                                >
                                    {choice.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Debrief when scenario complete */}
                {scenarioComplete && !awaitingChoice && !pendingCorrection && (
                    renderDebrief()
                )}

            </div>

        </div>
    );
}