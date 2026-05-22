import type { Scenario } from '../../types';
import { PlayerZone } from '../PlayerZone/PlayerZone';
import { ScenarioPanel } from '../ScenarioPanel/ScenarioPanel';
import styles from './Board.module.css';

interface BoardProps {
    scenario: Scenario;
}

export function Board({ scenario }: BoardProps) {
    const players = scenario.players;

    return (
        <div className={styles.container}>
            {/* Scenario title and question above the board */}
            <div className={styles.scenarioHeader}>
                <h2 className={styles.scenarioTitle}>{scenario.title}</h2>
                <p className={styles.scenarioQuestion}>{scenario.question}</p>
            </div>

            {/* 4-player board */}
            <div className={styles.boardWrapper}>
                <div className={styles.board} aria-label="Player board">
                    <PlayerZone player={players[2]} position="top-left" />
                    <PlayerZone player={players[3]} position="top-right" />
                    <PlayerZone player={players[1]} position="bottom-left" />
                    <PlayerZone player={players[0]} position="bottom-right" />
                </div>
            </div>

            {/* Options and submit below the board */}
            <ScenarioPanel scenario={scenario} />
        </div>
    );
}