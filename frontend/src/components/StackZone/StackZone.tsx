import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { StackItem } from '../../types';
import { CardModal } from '../CardModal/CardModal';
import styles from './StackZone.module.css';

interface StackZoneProps {
    stack: StackItem[];
}

export function StackZone({ stack }: StackZoneProps) {
    const [open, setOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<{
        id: string;
        imageUrl: string;
        x: number;
        y: number;
    } | null>(null);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    if (stack.length === 0) return null;

    return (
        <>
            {/* ── Gold stack button ── */}
            <div className={styles.wrapper}>
                <button
                    className={styles.stackButton}
                    onClick={() => setOpen(o => !o)}
                    aria-label={open ? 'Close stack' : 'View stack'}
                >
                    Stack ({stack.length})
                </button>

                {/* ── Stack popup ── */}
                {open && (
                    <div className={styles.popup}>
                        <div className={styles.popupHeader}>
                            Stack
                            <button
                                className={styles.closeButton}
                                onClick={() => setOpen(false)}
                                aria-label="Close stack"
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.items}>
                            {stack.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={styles.item}
                                    onMouseMove={e => {
                                        if (!item.imageUrl) return;
                                        setHoveredItem({
                                            id: item.id,
                                            imageUrl: item.imageUrl,
                                            x: e.clientX,
                                            y: e.clientY,
                                        });
                                    }}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    onClick={() => {
                                        setSelectedCardId(item.sourceCardId);
                                        setOpen(false);
                                    }}
                                >
                                    {index === 0 && (
                                        <span className={styles.resolvesBadge}>resolves next</span>
                                    )}
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.sourceCardName}
                                            className={styles.cardImage}
                                        />
                                    ) : (
                                        <div className={styles.cardPlaceholder}>
                                            {item.sourceCardName}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Hover preview portal ── */}
            {hoveredItem && createPortal(
                <img
                    src={hoveredItem.imageUrl}
                    alt="preview"
                    style={{
                        position: 'fixed',
                        top: hoveredItem.y > window.innerHeight * 0.6
                            ? hoveredItem.y - 320
                            : hoveredItem.y,
                        left: hoveredItem.x + 20,
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

            {/* ── Card modal ── */}
            {selectedCardId && (
                <CardModal
                    scryfallId={selectedCardId}
                    onClose={() => setSelectedCardId(null)}
                />
            )}
        </>
    );
}