import type {Card as CardType} from '../../types';
import styles from './Card.module.css';

interface CardProps {
    card: CardType;
    // onClick?: () => void; // Optional click handler for later
}

export function Card({ card }: CardProps) {
    return (
        <img
            src={card.imageUrl}
            alt={card.name}
            loading="lazy"
            className={styles.card}
        />
    );
}