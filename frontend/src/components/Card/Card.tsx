import type {Card as CardType} from '../../types';
import styles from './Card.module.css';

interface CardProps {
    card: CardType;
    onClick?: () => void;
}

export function Card({ card, onClick }: CardProps) {
    return (
        <img
            src={card.imageUrl}
            alt={card.name}
            loading="lazy"
            className={`${styles.card} ${card.tapped ? styles.tapped : ''}`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        />
    );
}