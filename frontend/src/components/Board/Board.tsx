import { useState, useRef, useEffect } from 'react';
import type { Scenario, ScenarioStep, Choice, BoardState } from '../../types';
import { PlayerZone } from '../PlayerZone/PlayerZone';
import { CardModal } from '../CardModal/CardModal';
import { LogPanel } from '../LogPanel/LogPanel';
import { fetchBoardState } from '../../api/boardState';
import { fetchCard } from '../../api/scryfall';
import styles from './Board.module.css';
import { StackZone } from '../StackZone/StackZone';

interface BoardProps {
    scenario: Scenario;
    cardImageMap: Map<string, string>;
}

export function Board({ scenario, cardImageMap }: BoardProps) {
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
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

    const [currentStepId, setCurrentStepId] = useState<string | null>(
        scenario.startStepId ?? null
    );
    const [userChoices, setUserChoices] = useState<Record<string, Choice>>({});
    const [scenarioComplete, setScenarioComplete] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [currentBoardState, setCurrentBoardState] = useState<BoardState | null>(null);
    const boardStateCache = useRef<Map<string, BoardState>>(new Map());

    // ── Supplementary image map ──
    // Holds imageUrls for cards that appear in boardState snapshots but
    // were not in scenario.players and therefore not fetched by useScenario.
    // Examples: Thassa's Oracle (not on battlefield at scenario start),
    // Demonic Consultation (in graveyard only after it resolves).
    const localImageMap = useRef<Map<string, string>>(new Map());

    const currentStep: ScenarioStep | undefined = scenario.steps?.find(
        s => s.id === currentStepId
    );

    // ── Hydrate board state players with cached images ──
    function hydratePlayers(players: BoardState['players']): BoardState['players'] {
        return players.map(player => ({
            ...player,
            zones: Object.fromEntries(
                Object.entries(player.zones).map(([zoneName, zone]) => [
                    zoneName,
                    {
                        ...zone,
                        cards: zone.cards.map(card => ({
                            ...card,
                            imageUrl: card.imageUrl
                                ?? cardImageMap.get(card.id)
                                ?? localImageMap.current.get(card.id),
                        })),
                    },
                ])
            ),
        })) as BoardState['players'];
    }

    // ── Fetch images for cards missing from both image maps ──
    async function fetchMissingImages(
        players: BoardState['players'],
        stack: BoardState['stack']
    ): Promise<void> {
        const missingIds = new Set<string>();
        for (const player of players) {
            for (const zone of Object.values(player.zones)) {
                for (const card of zone.cards) {
                    if (
                        !card.isToken &&
                        !card.imageUrl &&
                        !cardImageMap.has(card.id) &&
                        !localImageMap.current.has(card.id)
                    ) {
                        missingIds.add(card.id);
                    }
                }
            }
        }

        // ── Also check stack items ──
        for (const item of stack) {
            if (
                !item.imageUrl &&
                !cardImageMap.has(item.sourceCardId) &&
                !localImageMap.current.has(item.sourceCardId)
            ) {
                missingIds.add(item.sourceCardId);
            }
        }

        if (missingIds.size === 0) return;

        const fetchPromises = Array.from(missingIds).map(id =>
            fetchCard(id).catch(() => null)
        );
        const fetched = (await Promise.all(fetchPromises)).filter(Boolean);
        for (const card of fetched) {
            if (card?.imageUrl) {
                localImageMap.current.set(card.id, card.imageUrl);
            }
        }
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
            .then(async boardState => {
                await fetchMissingImages(boardState.players, boardState.stack);
                const hydratedStack = boardState.stack.map(item => ({
                    ...item,
                    imageUrl:
                        item.imageUrl
                        ?? cardImageMap.get(item.sourceCardId)
                        ?? localImageMap.current.get(item.sourceCardId),
                }));
                const hydrated = {
                    ...boardState,
                    players: hydratePlayers(boardState.players),
                    stack: hydratedStack,
                };
                boardStateCache.current.set(id, hydrated);
                setCurrentBoardState(hydrated);
            })
            .catch(err => {
                console.error('Failed to fetch board state:', err);
            });
    }, [currentStep]);

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

    function handleReset() {
        setCurrentStepId(scenario.startStepId ?? null);
        setUserChoices({});
        setScenarioComplete(false);
        setCurrentBoardState(null);
        boardStateCache.current.clear();
        localImageMap.current.clear();
        setResetKey(prev => prev + 1);
    }

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
                        <StackZone stack={currentBoardState?.stack ?? []} />
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