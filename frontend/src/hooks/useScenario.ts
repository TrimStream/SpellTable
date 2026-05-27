import { useState, useEffect } from 'react';
import { fetchCard } from '../api/scryfall';
import type { Scenario, Card } from '../types';

interface UseScenarioResult {
    scenario: Scenario | null;
    loading: boolean;
    error: string | null;
}

export function useScenario(rawScenario: Scenario): UseScenarioResult {
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function hydrate() {
            try {
                // ── Step 1: Collect all Scryfall IDs that need fetching ──
                // Use a Set for automatic deduplication.
                // The same card can appear on multiple battlefields, in the stack,
                // and in graveyard simultaneously - fetch it once, use everywhere.

                const cardIds = new Set<string>();

                // Collect from all player zones
                for (const player of rawScenario.players) {
                    for (const zone of Object.values(player.zones)) {
                        for (const card of zone.cards) {
                            if (!card.isToken) {
                                cardIds.add(card.id);
                            }
                            // Tokens are skipped - they use hardcoded imageUrl from JSON.
                        }
                    }
                }

                // Collect from the stack (NEW in V5)
                // Stack items reference a source card by sourceCardId, not id.
                if (rawScenario.stack) {
                    for (const item of rawScenario.stack) {
                        cardIds.add(item.sourceCardId);
                    }
                }

                // ── Step 2: Fetch all cards in parallel ──
                // Per-card .catch(() => null) means one failure doesn't crash
                // the whole scenario - that card just won't have an image.

                const fetchPromises = Array.from(cardIds).map(id =>
                    fetchCard(id).catch(() => null)
                );
                const fetchedCards = (await Promise.all(fetchPromises))
                    .filter(Boolean) as Card[];

                if (cancelled) return;

                // ── Step 3: Build an id -> Card map for O(1) lookup ──

                const cardMap = new Map<string, Card>();
                for (const card of fetchedCards) {
                    cardMap.set(card.id, card);
                }

                // ── Step 4: Deep clone the scenario ──
                // JSON parse/stringify is safe here because the raw scenario
                // contains only serializable data (no functions, no Dates).
                // This prevents mutating the original prop.

                const hydrated: Scenario = JSON.parse(JSON.stringify(rawScenario));

                // ── Step 5: Re-hydrate player zone cards ──
                // Replace each card with its fetched version (which has imageUrl),
                // but explicitly restore the game-state fields that Scryfall
                // doesn't know about: tapped, faceDown, counters, isToken.
                // Without this restore, fetched cards would overwrite those fields
                // with undefined.

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

                // ── Step 6: Re-hydrate stack items (NEW in V5) ──
                // Stack items store sourceCardId separately from their own id.
                // We look up the fetched card by sourceCardId and copy its imageUrl
                // onto the stack item. The stack item keeps all its own fields.

                if (hydrated.stack) {
                    hydrated.stack = hydrated.stack.map(item => {
                        const fetched = cardMap.get(item.sourceCardId);
                        if (!fetched) return item;
                        return {
                            ...item,
                            imageUrl: fetched.imageUrl,
                        };
                    });
                }

                setScenario(hydrated);
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

    return { scenario, loading, error };
}