import type { Player } from "../../types";
import { Zone } from "../CardZone/CardZone";
import styles from './PlayerZone.module.css';

interface PlayerZoneProps {
    player: Player;
    position: 'bottom-right' | 'bottom-left' | 'top-left' | 'top-right';
}

export function PlayerZone({ player, position }: PlayerZoneProps) {
    const positionClass = {
        'bottom-right': styles.bottomRight,
        'bottom-left': styles.bottomLeft,
        'top-left': styles.topLeft,
        'top-right': styles.topRight,
    }[position];

    const isTop = position === 'top-left' || position === 'top-right';

    return (
        <div className={`${styles.outer} ${positionClass}`} aria-label={`${player.name}'s zone`}>
            {isTop && <p className={styles.name}>{player.name}</p>}
            <div className={styles.grid}>
                <div className={styles.commandWrapper}>
                    <div className={styles.tax}>{player.commanderTax}</div>
                    <Zone zone={player.zones.command} />
                </div>
                <div className={styles.battlefield}>
                    <Zone zone={player.zones.battlefield} />
                </div>
                <div className={styles.graveyard}>
                    <Zone zone={player.zones.graveyard} />
                </div>
                <div className={styles.library}>
                    <Zone zone={player.zones.library} />
                </div>
                <div className={styles.exile}>
                    <Zone zone={player.zones.exile} />
                </div>
            </div>
            {!isTop && <p className={styles.name}>{player.name}</p>}
        </div>
    );
}