import type { Card as CardType } from '../../types'
import { Card } from '../Card/Card';
import styles from './Battlefield.module.css'

interface BattlefieldProps {
    cards: CardType[];
    isTop: boolean;
    onCardClick?: (id: string) => void;
}

export function Battlefield({ cards, isTop, onCardClick }: BattlefieldProps) {
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
        <div className={styles.battlefield}>
            {isTop ? [...sections].reverse() : sections}
        </div>
    );
}