import type { Scenario } from '../../types';
import { PlayerZone } from '../PlayerZone/PlayerZone';
import { ScenarioPanel } from '../ScenarioPanel/ScenarioPanel';
import styles from './Board.module.css';
import { useState, useRef, useEffect } from "react";
import { CardModal } from '../CardModal/CardModal';

interface BoardProps {
    scenario: Scenario;
}

export function Board({ scenario }: BoardProps) {
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const players = scenario.players;
    const containerRef = useRef<HTMLDivElement>(null);

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }

    useEffect(() => {
        function handleFullscreenChange() {
            setIsFullscreen(!!document.fullscreenElement);
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div className={styles.container} ref={containerRef}>
            <ScenarioPanel scenario={scenario} />
            <div className={styles.boardWrapper}>
                <button className={styles.fullscreenButton} onClick={toggleFullscreen}>
                    {isFullscreen ? '✕' : '⛶'}
                </button>
                <div className={styles.board} aria-label="Player board">
                    <PlayerZone player={players[2]} position="top-left" onCardClick={setSelectedCardId} />
                    <PlayerZone player={players[3]} position="top-right" onCardClick={setSelectedCardId} />
                    <PlayerZone player={players[1]} position="bottom-left" onCardClick={setSelectedCardId} />
                    <PlayerZone player={players[0]} position="bottom-right" onCardClick={setSelectedCardId} />
                </div>
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
