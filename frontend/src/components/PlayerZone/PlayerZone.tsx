import type { Player } from '../../types';
import { Battlefield } from '../Battlefield/Battlefield';
import { InfoBar } from '../InfoBar/InfoBar';
import styles from './PlayerZone.module.css';

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface PlayerZoneProps {
    player: Player;
    position: Position;
    onCardClick?: (id: string) => void;
}

export function PlayerZone({ player, position, onCardClick }: PlayerZoneProps) {
    const isTop = position === 'top-left' || position === 'top-right';
    const isRight = position === 'top-right' || position === 'bottom-right';

    return (
        <div className={styles.playmat}>
            <Battlefield
                cards={player.zones.battlefield.cards}
                isTop={isTop}
                infoBarSide={isRight ? 'right' : 'left'}
                onCardClick={onCardClick}
            />
            <InfoBar
                player={player}
                position={position}
                onCardClick={onCardClick}
            />
        </div>
    );
}