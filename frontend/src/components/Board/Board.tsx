import type { Scenario } from '../../types';
import { PlayerZone } from '../PlayerZone/PlayerZone';
import { ScenarioPanel } from '../ScenarioPanel/ScenarioPanel';
import styles from './Board.module.css';
import { useState } from "react";
import { CardModal } from '../CardModal/CardModal';

interface BoardProps {
    scenario: Scenario;
}

export function Board({ scenario }: BoardProps) {
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const players = scenario.players;

    return (
        <div className={styles.container}>
            <ScenarioPanel scenario={scenario} />
            <div className={styles.board} aria-label="Player board">
                <PlayerZone player={players[2]} position="top-left" onCardClick={setSelectedCardId} />
                <PlayerZone player={players[3]} position="top-right" onCardClick={setSelectedCardId} />
                <PlayerZone player={players[1]} position="bottom-left" onCardClick={setSelectedCardId} />
                <PlayerZone player={players[0]} position="bottom-right" onCardClick={setSelectedCardId} />
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
