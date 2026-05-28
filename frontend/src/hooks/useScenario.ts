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

                // ── Step 3: Build an id -> Card map for O(1) lookup ──

                const cardMap = new Map<string, Card>();
                for (const card of fetchedCards) {
                    cardMap.set(card.id, card);
                }

                // ── Step 4: Deep clone the scenario ──

                const hydrated: Scenario = JSON.parse(JSON.stringify(rawScenario));

                // ── Step 5: Re-hydrate player zone cards ──
                // Restore game-state fields that Scryfall doesn't know about.

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