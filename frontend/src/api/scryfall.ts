import type {Card} from "../types";

export async function fetchCard(scryfallID: string): Promise<Card> {
    try {
        const res = await fetch(`https://api.scryfall.com/cards/${scryfallID}`);
        const data = await res.json();
        return {
            id: data.id,
            name: data.name,
            imageUrl: data.image_uris.normal,
        };
    } catch (err) {
        console.error('Error fetching card ', err);
        throw err; // Or return a fallback Card
    }
}
