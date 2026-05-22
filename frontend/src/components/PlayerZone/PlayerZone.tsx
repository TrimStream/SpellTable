import type { Player } from '../../types';
import { Zone } from '../CardZone/CardZone';
import styles from './PlayerZone.module.css';
import cardBack from '../../assets/back_magic.png';
import { Battlefield } from '../Battlefield/Battlefield';

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
    const isRevealed = position === 'bottom-right'; // Only "You" sees their hand

    const strip = (
        <div className={styles.strip}>
            <div className={styles.playerInfo}>
                <span className={styles.name}>{player.name}</span>
                <span className={styles.life}>❤ {player.life}</span>
                {player.commanderTax > 0 && (
                    <span className={styles.tax}>Tax: {player.commanderTax}</span>
                )}
            </div>

            {/* Command zone */}
            {player.zones.command.cards.length > 0 && (
                <div className={styles.pileZone}>
                    <Zone zone={player.zones.command} />
                </div>
            )}

            {/* Hand */}
            <div className={styles.handZone}>
                {isRevealed ? (
                    <Zone zone={player.zones.hand} />
                ) : (
                    <div className={styles.hiddenHand}>
                        {Array.from({ length: player.zones.hand.cardCount ?? 0 }).map((_, i) => (
                            <img key={i} src={cardBack} alt="Card back" className={styles.pileCard} />
                        ))}
                    </div>
                )}
            </div>

            {/* Library */}
            <div className={styles.pileZone}>
                <div className={styles.pile}>
                    <img src={cardBack} alt="Library" className={styles.pileCard} />
                    <span className={styles.count}>{player.zones.library.cardCount ?? 0}</span>
                </div>
            </div>
            
            {/* Graveyard */}
            <div className={styles.pileZone}>
                {player.zones.graveyard.cards.length > 0 ? (
                    <div className={styles.pile}>
                        <img
                            src={player.zones.graveyard.cards[player.zones.graveyard.cards.length - 1].imageUrl}
                            alt="Graveyard"
                            className={styles.pileCard}
                        />
                        <span className={styles.count}>{player.zones.graveyard.cardCount ?? player.zones.graveyard.cards.length}</span>
                    </div>
                ) : (
                    <div className={styles.emptyPile}>GY</div>
                )}
            </div>

            {/* Exile */}
            <div className={styles.pileZone}>
                {player.zones.exile.cards.length > 0 ? (
                    <div className={styles.pile}>
                        <img
                            src={player.zones.exile.cards[player.zones.exile.cards.length - 1].imageUrl}
                            alt="Exile"
                            className={styles.pileCard}
                        />
                        <span className={styles.count}>{player.zones.exile.cardCount ?? player.zones.exile.cards.length}</span>
                    </div>
                ) : (
                    <div className={styles.emptyPile}>EX</div>
                )}
            </div>
        </div>
    );

    return (
        <div className={`${styles.playmat} ${positionClass}`} aria-label={`${player.name}'s zone`}>
            {isTop && strip}
            <div className={styles.battlefield}>
                <Battlefield cards={player.zones.battlefield.cards} isTop={isTop} />
            </div>
            {!isTop && strip}
        </div>
    );
}