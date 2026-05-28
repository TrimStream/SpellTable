import { useState, useEffect } from 'react';
import { fetchCard } from '../api/scryfall';
import type { Scenario, Card } from '../types';

interface UseScenarioResult {
    scenario: Scenario | null;
    loading: boolean;
    error: string | null;
    cardImageMap: Map<string, string>;
}

export function useScenario(rawScenario: Scenario): UseScenarioResult {
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cardImageMap, setCardImageMap] = useState<Map<string, string>>(new Map());

    useEffect(() => {
        let cancelled = false;

        async function hydrate() {
            try {
                // ── Step 1: Collect all Scryfall IDs ──

                const cardIds = new Set<string>();

                for (const player of rawScenario.players) {
                    for (const zone of Object.values(player.zones)) {
                        for (const card of zone.cards) {
                            if (!card.isToken) {
                                cardIds.add(card.id);
                            }
                        }
                    }
                }

                // ── Step 2: Fetch all cards in parallel ──

                const fetchPromises = Array.from(cardIds).map(id =>
                    fetchCard(id).catch(() => null)
                );
                const fetchedCards = (await Promise.all(fetchPromises))
                    .filter(Boolean) as Card[];

                if (cancelled) return;

                // ── Step 3: Build id -> Card map ──

                const cardMap = new Map<string, Card>();
                for (const card of fetchedCards) {
                    cardMap.set(card.id, card);
                }

                // ── Step 4: Build id -> imageUrl map ──
                // Extracted separately so Board can hydrate boardState snapshots
                // without re-fetching from Scryfall.

                const imageMap = new Map<string, string>();
                for (const card of fetchedCards) {
                    if (card.imageUrl) {
                        imageMap.set(card.id, card.imageUrl);
                    }
                }

                // ── Step 5: Deep clone the scenario ──

                const hydrated: Scenario = JSON.parse(JSON.stringify(rawScenario));

                // ── Step 6: Re-hydrate player zone cards ──

                for (const player of hydrated.players) {
                    for (const zone of Object.values(player.zones)) {
                        zone.cards = zone.cards.map(card => {
                            if (card.isToken) return card;
                            const fetched = cardMap.get(card.id);
                            if (!fetched) return card;
                            return {
                                ...fetched,
                                tapped: card.tapped,
                                faceDown: card.faceDown,
                                counters: card.counters,
                                isToken: card.isToken,
                            };
                        });
                    }
                }

                setScenario(hydrated);
                setCardImageMap(imageMap);

            } catch (err) {
                if (!cancelled) {
                    setError('Failed to load scenario. Please try again.');
                    console.error('useScenario hydration error:', err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void hydrate();

        return () => {
            cancelled = true;
        };
    }, [rawScenario]);

    return { scenario, loading, error, cardImageMap };
}