import type {Card} from "../types";

function parseCardType(typeLine: string): Card['cardType'] {
    if (typeLine.includes('Creature')) return 'creature';
    if (typeLine.includes('Land')) return 'land';
    if (typeLine.includes('Planeswalker')) return 'planeswalker';
    if (typeLine.includes('Artifact')) return 'artifact';
    if (typeLine.includes('Enchantment')) return 'enchantment';
    if (typeLine.includes('Instant')) return 'instant';
    if (typeLine.includes('Sorcery')) return 'sorcery';
    if (typeLine.includes('Battle')) return 'battle';
    return 'artifact'; // fallback
}

export async function fetchCard(scryfallID: string): Promise<Card> {
    try {
        const res = await fetch(`https://api.scryfall.com/cards/${scryfallID}`);
        const data = await res.json();
        return {
            id: data.id,
            name: data.name,
            imageUrl: data.image_uris.normal,
            cardType: parseCardType(data.type_line),
        };
    } catch (err) {
        console.error('Error fetching card ', err);
        throw err; // Or return a fallback Card
    }
}
