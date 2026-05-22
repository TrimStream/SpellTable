import { useState, useEffect } from 'react';
import type { Scenario, Card } from '../types';
import { fetchCard } from '../api/scryfall';

export function useScenario(rawScenario: Scenario | null) {
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!rawScenario) {
            setLoading(false);
            return;
        }

        const loadScenario = async () => {
            try {
                setLoading(true);
                setError(null);

                // Extract all unique card IDs from all players and zones
                const cardIds = new Set<string>();
                for (const player of rawScenario.players) {
                    for (const zone of Object.values(player.zones)) {
                        for (const card of zone.cards) {
                            cardIds.add(card.id);
                        }
                    }
                }

                // Fetch all cards in parallel
                const fetchPromises = Array.from(cardIds).map(id =>
                    fetchCard(id).catch(() => null) // Handle individual card fetch errors
                );
                const fetchedCards = (await Promise.all(fetchPromises))
                    .filter(Boolean) as Card[];

                // Create a map of id -> Card for quick lookup
                const cardMap = new Map<string, Card>();
                fetchedCards.forEach(card => {
                    cardMap.set(card.id, card);
                });

                // Deep clone and replace card data with fetched cards
                const updatedScenario: Scenario = JSON.parse(JSON.stringify(rawScenario));
                for (const player of updatedScenario.players) {
                    for (const zone of Object.values(player.zones)) {
                        zone.cards = zone.cards.map(card => {
                            const fetchedCard = cardMap.get(card.id);
                            return fetchedCard ? { ...fetchedCard, tapped: card.tapped } : card; // Use fetched card or keep original
                        });
                    }
                }

                setScenario(updatedScenario);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load scenario');
                setLoading(false);
            }
        };

        loadScenario();
    }, [rawScenario]);

    return { scenario, loading, error };
}