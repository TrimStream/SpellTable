import type { Zone as ZoneType } from '../../types';
import styles from './ZoneModal.module.css';
import { Card } from '../Card/Card';

export interface ZoneModalProps {
	zone: ZoneType;
	title: string;
	onClose: () => void;
	onCardClick: (id: string) => void;
}

export function ZoneModal({ zone, title, onClose, onCardClick }: ZoneModalProps) {
	return (
		<div className={styles.backdrop} onClick={onClose}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<div className={styles.header}>
					<h2 className={styles.title}>{title}</h2>
					<button className={styles.closeButton} onClick={onClose} aria-label="Close">×</button>
				</div>

				<div className={styles.grid}>
					{zone.cards.map((card) => (
						<Card key={card.id} card={card} onClick={() => onCardClick(card.id)} />
					))}
				</div>
			</div>
		</div>
	);
}
