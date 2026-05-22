import type { Player, Scenario } from '../../types';
import { PlayerZone } from '../PlayerZone/PlayerZone';
import { ScenarioPanel } from '../ScenarioPanel/ScenarioPanel';
import styles from './Board.module.css';

interface BoardProps {
    scenario: Scenario;
}

export function Board({ scenario }: BoardProps) {
    return (
        <div className={styles.container}>
            <div className={styles.board} aria-label="Player board">
                <PlayerZone player={scenario.players[2] as Player} />
                <PlayerZone player={scenario.players[3] as Player} />
                <PlayerZone player={scenario.players[1] as Player} />
                <PlayerZone player={scenario.players[0] as Player} />
            </div>
            <ScenarioPanel scenario={scenario} />
        </div>
    );
}