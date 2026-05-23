import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Card as CardType } from '../../types';
import styles from './Card.module.css';

interface CardProps {
    card: CardType;
    onClick?: () => void;
}

export function Card({ card, onClick }: CardProps) {
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

    return (
        <div
            className={styles.cardWrapper}
            onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setMousePos(null)}
        >
            <img
                src={card.imageUrl}
                alt={card.name}
                loading="lazy"
                className={`${styles.card} ${card.tapped ? styles.tapped : ''}`}
                onClick={onClick}
                style={{ cursor: onClick ? 'pointer' : 'default' }}
            />
            {mousePos && createPortal(
                <img
                    src={card.imageUrl}
                    alt={`${card.name} preview`}
                    style={{
                        position: 'fixed',
                        top: mousePos.y > window.innerHeight * 0.6
                            ? mousePos.y - 320  // show above cursor
                            : mousePos.y,       // show below cursor
                        left: mousePos.x + 20,
                        width: 'clamp(220px, 18vw, 320px)',
                        height: 'auto',
                        borderRadius: '10px',
                        zIndex: 9999,
                        pointerEvents: 'none',
                        boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
                    }}
                />,
                document.body
            )}
        </div>
    );
}