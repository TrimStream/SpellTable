import styles from './CardModal.module.css';
import { useEffect, useState } from 'react';

interface CardModalProps {
    scryfallId: string;
    onClose: () => void;
}

interface ScryfallCard {
    id: string;
    name: string;
    image_uris?: { normal: string; large: string; };
    card_faces?: { image_uris: { normal: string; large: string; }; }[];
    type_line: string;
    oracle_text?: string;
    set_name: string;
    collector_number: string;
    scryfall_uri: string;
}

export function CardModal({ scryfallId, onClose }: CardModalProps) {
    const [card, setCard] = useState<ScryfallCard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchCard() {
            setLoading(true);
            try {
                const res = await fetch(`https://api.scryfall.com/cards/${scryfallId}`);
                if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
                const data = await res.json();
                if (!cancelled) setCard(data);
            } catch (err) {
                console.error('Failed to fetch Scryfall card', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchCard();

        return () => {
            cancelled = true;
        };
    }, [scryfallId]);

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {loading ? (
                    <div>Loading...</div>
                ) : card ? (
                    <div className={styles.content}>
                        <img src={
                            card.image_uris?.large ??
                            card.image_uris?.normal ??
                            card.card_faces?.[1]?.image_uris?.large ??
                            card.card_faces?.[0]?.image_uris?.large
                        }
                             alt={card.name}
                             className={styles.cardImage}
                        />
                        <div className={styles.details}>
                            <h2 className={styles.cardName}>{card.name}</h2>
                            <p className={styles.typeLine}>{card.type_line}</p>
                            <p className={styles.oracleText}>{card.oracle_text}</p>
                            <p className={styles.setName}><strong>Set:</strong> {card.set_name}</p>
                            <a href={card.scryfall_uri} target="_blank" rel="noopener noreferrer" className={styles.scryfallLink}>View on Scryfall</a>
                        </div>
                        <button className={styles.closeButton} onClick={onClose}>✕</button>
                    </div>
                ) : (
                    <div>Card not found</div>
                )}
            </div>
        </div>
    );
}
