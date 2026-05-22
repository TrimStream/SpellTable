import type { Scenario } from '../../types';
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
                <PlayerZone player={scenario.players[2]} position="top" lifePosition="bottom-right"/>
                <PlayerZone player={scenario.players[3]} position="top" lifePosition="bottom-left"/>
                <PlayerZone player={scenario.players[1]} position="bottom" lifePosition="top-right"/>
                <PlayerZone player={scenario.players[0]} position="bottom" lifePosition="top-left"/>
            </div>
            <ScenarioPanel scenario={scenario} />
        </div>
    );
}
