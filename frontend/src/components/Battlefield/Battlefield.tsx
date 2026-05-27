import type { Card as CardType } from '../../types';
import { Card } from '../Card/Card';
import styles from './Battlefield.module.css';

interface BattlefieldProps {
    cards: CardType[];
    isTop: boolean;
    infoBarSide: 'left' | 'right';
    onCardClick?: (id: string) => void;
}

export function Battlefield({ cards, isTop, infoBarSide, onCardClick }: BattlefieldProps) {
    const creatures = cards.filter(c => c.cardType === 'creature');
    const nonlands = cards.filter(c =>
        c.cardType === 'artifact' ||
        c.cardType === 'enchantment' ||
        c.cardType === 'planeswalker'
    );
    const lands = cards.filter(c => c.cardType === 'land');

    const sections = [
        <div key="creatures" className={styles.section}>
            {creatures.map(card => (
                <Card key={card.id} card={card} onClick={onCardClick ? () => onCardClick(card.id) : undefined} />
            ))}
        </div>,
        <div key="nonlands" className={styles.section}>
            {nonlands.map(card => (
                <Card key={card.id} card={card} onClick={onCardClick ? () => onCardClick(card.id) : undefined} />
            ))}
        </div>,
        <div key="lands" className={styles.section}>
            {lands.map(card => (
                <Card key={card.id} card={card} onClick={onCardClick ? () => onCardClick(card.id) : undefined} />
            ))}
        </div>,
    ];

    return (
        <div className={`${styles.battlefield} ${infoBarSide === 'left' ? styles.paddingLeft : styles.paddingRight} ${isTop ? styles.isTop : ''}`}>
            {isTop ? [...sections].reverse() : sections}
        </div>
    );
}