import { useState, useRef, useEffect } from 'react';
import type { Scenario, ScenarioStep, Choice, BoardState } from '../../types';
import { PlayerZone } from '../PlayerZone/PlayerZone';
import { CardModal } from '../CardModal/CardModal';
import { LogPanel } from '../LogPanel/LogPanel';
import { fetchBoardState } from '../../api/boardState';
import styles from './Board.module.css';

interface BoardProps {
    scenario: Scenario;
    cardImageMap: Map<string, string>;
}

export function Board({ scenario, cardImageMap }: BoardProps) {
    // ── Card modal state ──
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    // ── Fullscreen state ──
    const [isFullscreen, setIsFullscreen] = useState(false);
    const boardSectionRef = useRef<HTMLDivElement>(null);

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            boardSectionRef.current?.requestFullscreen();
        } else {
            void document.exitFullscreen();
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
    const [currentStepId, setCurrentStepId] = useState<string | null>(
        scenario.startStepId ?? null
    );
    const [userChoices, setUserChoices] = useState<Record<string, Choice>>({});
    const [scenarioComplete, setScenarioComplete] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    // ── Board state ──
    const [currentBoardState, setCurrentBoardState] = useState<BoardState | null>(null);
    const boardStateCache = useRef<Map<string, BoardState>>(new Map());

    // ── Current step lookup ──
    const currentStep: ScenarioStep | undefined = scenario.steps?.find(
        s => s.id === currentStepId
    );

    // ── Hydrate board state players with cached images ──
    // boardState documents from MongoDB have no imageUrls -- they store only
    // Scryfall UUIDs. This function fills in imageUrls from the map built
    // by useScenario so we never make redundant Scryfall requests.
    function hydratePlayers(
        players: BoardState['players']
    ): BoardState['players'] {
        return players.map(player => ({
            ...player,
            zones: Object.fromEntries(
                Object.entries(player.zones).map(([zoneName, zone]) => [
                    zoneName,
                    {
                        ...zone,
                        cards: zone.cards.map(card => ({
                            ...card,
                            imageUrl: card.imageUrl ?? cardImageMap.get(card.id),
                        })),
                    },
                ])
            ),
        })) as BoardState['players'];
    }

    // ── Fetch board state when step changes ──
    useEffect(() => {
        if (!currentStep?.boardStateId) return;

        const id = currentStep.boardStateId;

        if (boardStateCache.current.has(id)) {
            setCurrentBoardState(boardStateCache.current.get(id)!);
            return;
        }

        fetchBoardState(id)
            .then(boardState => {
                const hydrated = {
                    ...boardState,
                    players: hydratePlayers(boardState.players),
                };
                boardStateCache.current.set(id, hydrated);
                setCurrentBoardState(hydrated);
            })
            .catch(err => {
                console.error('Failed to fetch board state:', err);
            });
    }, [currentStep]);

    // ── Auto-advance narration steps ──
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

    // ── Step advancement ──
    function handleChoice(stepId: string, choice: Choice) {
        setUserChoices(prev => ({ ...prev, [stepId]: choice }));
        const currentStepObj = scenario.steps?.find(s => s.id === stepId);
        if (!currentStepObj?.nextStepId) return;
        const nextStep = scenario.steps?.find(s => s.id === currentStepObj.nextStepId);
        if (!nextStep) return;
        setCurrentStepId(nextStep.id);
        if (nextStep.isFinal) {
            setScenarioComplete(true);
        }
    }

    // ── Reset for play again ──
    function handleReset() {
        setCurrentStepId(scenario.startStepId ?? null);
        setUserChoices({});
        setScenarioComplete(false);
        setCurrentBoardState(null);
        boardStateCache.current.clear();
        setResetKey(prev => prev + 1);
    }

    // ── Resolve current players ──
    const currentPlayers = currentBoardState?.players ?? scenario.players;

    return (
        <div className={styles.page}>
            <div className={styles.boardSection} ref={boardSectionRef}>

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
                            player={currentPlayers[2]}
                            position="top-left"
                            onCardClick={setSelectedCardId}
                        />
                        <PlayerZone
                            player={currentPlayers[3]}
                            position="top-right"
                            onCardClick={setSelectedCardId}
                        />
                        <PlayerZone
                            player={currentPlayers[1]}
                            position="bottom-left"
                            onCardClick={setSelectedCardId}
                        />
                        <PlayerZone
                            player={currentPlayers[0]}
                            position="bottom-right"
                            onCardClick={setSelectedCardId}
                        />
                    </div>
                </div>

                <LogPanel
                    key={resetKey}
                    scenario={scenario}
                    currentStep={currentStep}
                    userChoices={userChoices}
                    scenarioComplete={scenarioComplete}
                    onChoice={handleChoice}
                    onReset={handleReset}
                />

            </div>

            <div className={styles.belowFold}>
                {/* V8: scenario author profile, likes, comments, recommendations */}
            </div>

            {selectedCardId && (
                <CardModal
                    scryfallId={selectedCardId}
                    onClose={() => setSelectedCardId(null)}
                />
            )}

        </div>
    );
}