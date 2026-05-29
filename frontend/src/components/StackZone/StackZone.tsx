import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { StackItem } from '../../types';
import { CardModal } from '../CardModal/CardModal';
import styles from './StackZone.module.css';

interface StackZoneProps {
    stack: StackItem[];
}

const TYPE_ICONS: Record<StackItem['type'], string> = {
    cast: '✦',
    triggered: '⟳',
    activated: '⚡',
};

export function StackZone({ stack }: StackZoneProps) {
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState<{
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
                            <span>Stack — top resolves first</span>
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
                                    className={`${styles.item} ${index === 0 ? styles.itemTop : ''}`}
                                    onMouseMove={e => {
                                        if (!item.imageUrl) return;
                                        setHovered({
                                            imageUrl: item.imageUrl,
                                            x: e.clientX,
                                            y: e.clientY,
                                        });
                                    }}
                                    onMouseLeave={() => setHovered(null)}
                                    onClick={() => {
                                        setSelectedCardId(item.sourceCardId);
                                        setOpen(false);
                                    }}
                                >
                                    <span className={styles.typeIcon}>
                                        {TYPE_ICONS[item.type]}
                                    </span>
                                    <span className={styles.itemName}>
                                        {item.sourceCardName}
                                    </span>
                                    {index === 0 && (
                                        <span className={styles.resolvesBadge}>next</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Hover preview portal ── */}
            {hovered && createPortal(
                <img
                    src={hovered.imageUrl}
                    alt="preview"
                    style={{
                        position: 'fixed',
                        top: hovered.y > window.innerHeight * 0.6
                            ? hovered.y - 320
                            : hovered.y,
                        left: hovered.x + 20,
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