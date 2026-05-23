import type { Zone as ZoneType } from "../../types";
import { Card } from "../Card/Card";
import styles from './CardZone.module.css';

interface ZoneProps {
    zone: ZoneType;
    onCardClick?: (id: string) => void;
}

export function Zone({ zone, onCardClick }: ZoneProps) {
    return (
        <div className={styles.cards}>
            {zone.cards.map((card) => (
                <Card key={card.id} card={card} onClick={onCardClick ? () => onCardClick(card.id) : undefined} />
            ))}
        </div>
    );
}