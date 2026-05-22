import type { Player } from "../../types";
import { Zone } from "../CardZone/CardZone";
import styles from './PlayerZone.module.css';

interface PlayerZoneProps {
    player: Player;
    position: 'top' | 'bottom';
    lifePosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function PlayerZone({ player, position, lifePosition }: PlayerZoneProps) {
    return (
        <div className={`${styles.container} ${position === 'top' ? styles.positionTop : styles.positionBottom}`}>
            <p className={styles.name}>{player.name}</p>
            <div className={`${styles.life} ${styles[lifePosition.replace('-', '_')]}`}>
                ❤ {player.life}
            </div>

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
