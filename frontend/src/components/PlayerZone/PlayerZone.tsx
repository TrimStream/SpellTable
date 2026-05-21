import type { Player } from "../../types";
import { Zone } from "../CardZone/CardZone";
import styles from './PlayerZone.module.css';

interface PlayerZoneProps {
    player: Player;
}

export function PlayerZone({ player }: PlayerZoneProps) {
    return (
        <div className={styles.container}>
            <h2>{player.name} - {player.life} Life</h2>

            <div className={styles.zones}>
                <div className={styles.commandZoneWrapper}>
                    <div className={styles.tax}>{player.commanderTax}</div>
                    <Zone zone={player.zones.command} />
                </div>
                <Zone zone={player.zones.battlefield} />
            </div>
        </div>
    );
}
