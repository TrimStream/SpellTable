import { useState, useRef, useEffect } from 'react';
import type { Scenario, ScenarioStep, Choice } from '../../types';
import { PlayerZone } from '../PlayerZone/PlayerZone';
import { CardModal } from '../CardModal/CardModal';
import { LogPanel } from '../LogPanel/LogPanel';
import styles from './Board.module.css';

interface BoardProps {
    scenario: Scenario;
}

export function Board({ scenario }: BoardProps) {
    // ── Card modal state ──
    // Any card click anywhere on the board sets this ID and opens the modal.
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    // ── Fullscreen state ──
    // Targets the boardSection div (board grid + log panel together).
    const [isFullscreen, setIsFullscreen] = useState(false);
    const boardSectionRef = useRef<HTMLDivElement>(null);

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            boardSectionRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    useEffect(() => {
        function handleFullscreenChange() {
            setIsFullscreen(!!document.fullscreenElement);
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // ── Scenario step state ──
    // currentStepId tracks where we are in the scenario step graph.
    // userChoices records every choice the user made, keyed by decisionPoint
    // step id, for use in the debrief at the end.
    // scenarioComplete flips to true when a step with isFinal: true is reached.
    const [currentStepId, setCurrentStepId] = useState<string | null>(
        scenario.startStepId ?? null
    );
    const [userChoices, setUserChoices] = useState<Record<string, Choice>>({});
    const [scenarioComplete, setScenarioComplete] = useState(false);

    // ── Step advancement ──
    // Called by LogPanel's ActionArea when the user makes a choice.
    // Records the choice, then advances to the next step.
    // If the next step has isFinal, marks the scenario complete.
    function handleChoice(stepId: string, choice: Choice) {
        setUserChoices(prev => ({ ...prev, [stepId]: choice }));
        // Advance to the current step's nextStepId, not the choice's nextStepId
        const currentStepObj = scenario.steps?.find(s => s.id === stepId);
        if (!currentStepObj?.nextStepId) return;
        const nextStep = scenario.steps?.find(s => s.id === currentStepObj.nextStepId);
        if (!nextStep) return;
        setCurrentStepId(nextStep.id);
        if (nextStep.isFinal) {
            setScenarioComplete(true);
        }
    }

    // ── Current step lookup ──
    const currentStep: ScenarioStep | undefined = scenario.steps?.find(
        s => s.id === currentStepId
    );

    console.log('Board state:', {
        currentStepId,
        currentStep: currentStep?.id,
        stepsCount: scenario.steps?.length,
        startStepId: scenario.startStepId
    });
    const players = scenario.players;

    useEffect(() => {
        if (!currentStep) return;
        if (currentStep.decisionPoint) return;
        if (currentStep.isFinal) {
            setScenarioComplete(true);
            return;
        }
        if (currentStep.nextStepId) {
            setCurrentStepId(currentStep.nextStepId);
        }
    }, [currentStep]);

    return (
        // ── Page wrapper: full scroll, board section fills viewport on load ──
        <div className={styles.page}>

            {/* Board section: fills viewport height minus nav bar */}
            <div className={styles.boardSection} ref={boardSectionRef}>

                {/* Board column: 2x2 grid of playmats */}
                <div className={styles.boardColumn}>
                    <button
                        className={styles.fullscreenButton}
                        onClick={toggleFullscreen}
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                        {isFullscreen ? '✕' : '⛶'}
                    </button>
                    <div className={styles.board} aria-label="Player board">
                        <PlayerZone
                            player={players[2]}
                            position="top-left"
                            onCardClick={setSelectedCardId}
                        />
                        <PlayerZone
                            player={players[3]}
                            position="top-right"
                            onCardClick={setSelectedCardId}
                        />
                        <PlayerZone
                            player={players[1]}
                            position="bottom-left"
                            onCardClick={setSelectedCardId}
                        />
                        <PlayerZone
                            player={players[0]}
                            position="bottom-right"
                            onCardClick={setSelectedCardId}
                        />
                    </div>
                </div>

                {/* Log panel: fixed 320px right side */}
                <LogPanel
                    scenario={scenario}
                    currentStep={currentStep}
                    userChoices={userChoices}
                    scenarioComplete={scenarioComplete}
                    onChoice={handleChoice}
                />

            </div>

            {/* Below fold: empty stub for V8 social features */}
            <div className={styles.belowFold}>
                {/* V8: scenario author profile, likes, comments, recommendations */}
            </div>

            {/* Card modal: rendered at board level, opened by any card click */}
            {selectedCardId && (
                <CardModal
                    scryfallId={selectedCardId}
                    onClose={() => setSelectedCardId(null)}
                />
            )}

        </div>
    );
}