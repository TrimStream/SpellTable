import { useState } from 'react';
import type { Player, Card } from '../../types';
import { Card as CardComponent } from '../Card/Card';
import styles from './InfoBar.module.css';

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type ExpandableZone = 'graveyard' | 'exile' | 'hand';

interface InfoBarProps {
    player: Player;
    position: Position;
    onCardClick?: (id: string) => void;
}

// ── Zone icons ──
// Text symbols used as compact zone identifiers in collapsed strips.
const ZONE_ICONS = {
    hand: '✋',
    library: '📚',
    graveyard: '💀',
    exile: '✕',
    command: '⚔',
} as const;

// ── Card back image ──
const CARD_BACK = '/src/assets/back_magic.png';

export function InfoBar({ player, position, onCardClick }: InfoBarProps) {
    const [expandedZones, setExpandedZones] = useState<Set<ExpandableZone>>(new Set());

    const isTop = position === 'top-left' || position === 'top-right';

    // ── Commander tax display ──
    // Handles both single (number) and dual commander ([number, number]) tax.
    function formatTax(tax: Player['commanderTax']): string {
        if (Array.isArray(tax)) return `Tax: ${tax[0]} / ${tax[1]}`;
        return `Tax: ${tax}`;
    }

    // ── Zone expand toggle ──
    // Clicking an already-expanded zone closes it.
    // Clicking a different zone switches to that one.
    function toggleZone(zone: ExpandableZone) {
	    setExpandedZones(prev => {
	        const next = new Set(prev);
	        if (next.has(zone)) {
	            next.delete(zone);
	        } else {
	            next.add(zone);
	        }
	        return next;
	    });
	}

    // ── Card rendering in expanded zones ──
    // Shows face-up or face-down based on the card's faceDown field and zone revealed state.
    // Graveyard and exile with orderedPile: true render bottom-to-top (reversed array).
    function renderExpandedCards(
        cards: Card[],
        zoneRevealed: boolean,
        orderedPile?: boolean
    ) {
        const ordered = orderedPile ? [...cards].reverse() : cards;
        return ordered.map(card => {
            const showFaceDown = card.faceDown || !zoneRevealed;
            if (showFaceDown) {
                return (
                    <img
                        key={card.id}
                        src={CARD_BACK}
                        alt="Card back"
                        className={styles.expandedCard}
                    />
                );
            }
            return (
                <CardComponent
                    key={card.id}
                    card={card}
                    onClick={onCardClick ? () => onCardClick(card.id) : undefined}
                />
            );
        });
    }

    // ── Collapsed zone count ──
    // Uses cardCount for hidden zones (library, collapsed hand),
    // falls back to cards.length for visible zones.
    function zoneCount(zoneName: keyof Player['zones']): number {
        const zone = player.zones[zoneName];
        return zone.cardCount ?? zone.cards.length;
    }

    // ── Sections ──
    // Built as named blocks so we can reverse the array for top players.

    const nameBlock = (
        <div key="name" className={styles.nameBlock}>
            <span className={styles.playerName}>{player.name}</span>
        </div>
    );

    const lifeBlock = (
        <div key="life" className={styles.lifeBlock}>
            <span className={styles.lifeIcon}>♥</span>
            <span className={styles.lifeTotal}>{player.life}</span>
        </div>
    );

    const taxBlock = (
        <div key="tax" className={styles.taxBlock}>
            <span className={styles.tax}>{formatTax(player.commanderTax)}</span>
        </div>
    );

    const commandBlock = (
        <div key="command" className={styles.commandBlock}>
            <div className={styles.commandCards}>
                {player.zones.command.cards.map(card => (
                    <CardComponent
                        key={card.id}
                        card={card}
                        onClick={onCardClick ? () => onCardClick(card.id) : undefined}
                    />
                ))}
            </div>
        </div>
    );

    // Hand: expandable. Opponents show card backs, you show card fronts.
    const isYou = position === 'bottom-right';
    const handZone = player.zones.hand;
    const handExpanded = expandedZones.has('hand');

    const handBlock = (
	    <div key="hand" className={`${styles.zoneBlock} ${handExpanded ? styles.zoneExpanded : ''}`}>
	        <button
	            className={styles.zoneHeader}
	            onClick={() => toggleZone('hand')}
	            aria-label={`${handExpanded ? 'Collapse' : 'Expand'} hand`}
	        >
	            <span className={styles.zoneIcon}>{ZONE_ICONS.hand}</span>
	            <span className={styles.zoneLabel}>Hand</span>
	            <span className={styles.zoneCount}>{zoneCount('hand')}</span>
	            <span className={styles.zoneChevron}>{handExpanded ? '▲' : '▼'}</span>
	        </button>
	        {handExpanded && (
	            <div className={styles.expandedCards}>
	                {/* ── Opponent hand: cards array is empty, use cardCount for backs ── */}
	                {!isYou && handZone.cards.length === 0 && (handZone.cardCount ?? 0) > 0 ? (
	                    Array.from({ length: handZone.cardCount! }).map((_, i) => (
	                        <img
	                            key={i}
	                            src={CARD_BACK}
	                            alt="Card back"
	                            className={styles.expandedCard}
	                        />
	                    ))
	                ) : handZone.cards.length === 0 ? (
	                    <span className={styles.emptyZone}>Empty</span>
	                ) : (
	                    handZone.cards.map(card => {
	                        const showFaceDown = isYou ? false : (card.faceDown !== false);
	                        if (showFaceDown) {
	                            return (
	                                <img
	                                    key={card.id}
	                                    src={CARD_BACK}
	                                    alt="Card back"
	                                    className={styles.expandedCard}
	                                />
	                            );
	                        }
	                        return (
	                            <CardComponent
	                                key={card.id}
	                                card={card}
	                                onClick={onCardClick ? () => onCardClick(card.id) : undefined}
	                            />
	                        );
	                    })
	                )}
	            </div>
	        )}
	    </div>
	);

    const libraryBlock = (
        <div key="library" className={styles.zoneBlock}>
            <div className={styles.zoneHeader}>
                <span className={styles.zoneIcon}>{ZONE_ICONS.library}</span>
				<span className={styles.zoneLabel}>Lib</span>
				<span className={styles.zoneCount}>{zoneCount('library')}</span>
            </div>
        </div>
    );

    const graveyardBlock = (
        <div key="graveyard" className={`${styles.zoneBlock} ${expandedZones.has('graveyard') ? styles.zoneExpanded : ''}`}>
            <button
                className={styles.zoneHeader}
                onClick={() => toggleZone('graveyard')}
                aria-label={`${expandedZones.has('graveyard') ? 'Collapse' : 'Expand'} graveyard`}
            >
                <span className={styles.zoneIcon}>{ZONE_ICONS.graveyard}</span>
				<span className={styles.zoneLabel}>GY</span>
				<span className={styles.zoneCount}>{zoneCount('graveyard')}</span>
				<span className={styles.zoneChevron}>{expandedZones.has('graveyard') ? '▲' : '▼'}</span>

            </button>
            {expandedZones.has('graveyard') && (
                <div className={styles.expandedCards}>
                    {player.zones.graveyard.cards.length === 0 ? (
                        <span className={styles.emptyZone}>Empty</span>
                    ) : (
                        renderExpandedCards(
                            player.zones.graveyard.cards,
                            player.zones.graveyard.revealed,
                            player.zones.graveyard.orderedPile
                        )
                    )}
                </div>
            )}
        </div>
    );

    const exileBlock = (
        <div key="exile" className={`${styles.zoneBlock} ${expandedZones.has('exile') ? styles.zoneExpanded : ''}`}>
            <button
                className={styles.zoneHeader}
                onClick={() => toggleZone('exile')}
                aria-label={`${expandedZones.has('exile') ? 'Collapse' : 'Expand'} exile`}
            >
                <span className={styles.zoneIcon}>{ZONE_ICONS.exile}</span>
				<span className={styles.zoneLabel}>EX</span>
				<span className={styles.zoneCount}>{zoneCount('exile')}</span>
				<span className={styles.zoneChevron}>{expandedZones.has('exile') ? '▲' : '▼'}</span>
            </button>
            {expandedZones.has('exile') && (
                <div className={styles.expandedCards}>
                    {player.zones.exile.cards.length === 0 ? (
                        <span className={styles.emptyZone}>Empty</span>
                    ) : (
                        renderExpandedCards(
                            player.zones.exile.cards,
                            player.zones.exile.revealed,
                            player.zones.exile.orderedPile
                        )
                    )}
                </div>
            )}
        </div>
    );

    // ── Section ordering ──
    // Bottom players (name at top, exile at bottom).
    // Top players (exile at top, name at bottom) -- reversed for symmetry.

    const bottomOrder = [
        nameBlock,
        lifeBlock,
        taxBlock,
        commandBlock,
        handBlock,
        libraryBlock,
        graveyardBlock,
        exileBlock,
    ];

	const spacer = <div key="spacer" style={{ flex: 1 }} />;

	const sections = isTop
	    ? [spacer, ...[...bottomOrder].reverse()]
	    : bottomOrder;

    const isRight = position === 'top-right' || position === 'bottom-right';

	return (
	    <div className={`${styles.infoBar} ${isRight ? styles.infoBarRight : styles.infoBarLeft} ${isTop ? styles.contentBottom : ''}`}>
	        {sections}
	    </div>
	);
}