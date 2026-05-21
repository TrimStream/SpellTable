
// Every card should have these
export interface Card {
    id: string;         // Scryfall ID
    name: string;       // For search/display when image hasn't loaded
    imageUrl: string;  // Card image from scryfall.
    tapped?: boolean;   // Whether the card is tapped or not. Only used for cards on the battlefield.
}

// Each Zone a Player has. only one is editable by User
export interface Zone {
    type: 'battlefield' | 'hand' | 'graveyard' | 'exile' | 'command' | 'library';
    cards: Card[];
    revealed: boolean;  // Can players see what's in here?
}

// Each player's information
export interface Player {
    id: string;         // 'player_1', 'opponent_1', etc.
    name: string;       // Display name
    life: number;
    commanderTax: number;
    zones: {
        battlefield: Zone;
        hand: Zone;
        graveyard: Zone;
        exile: Zone;
        command: Zone;
        library: Zone;
    };
}

// The scenario create to help teach the game
export interface Scenario {
    id: string;
    title: string;              // "Turn 3 Thoracle Attempt"
    description: string;
    players: [Player, Player, Player, Player];  // Exactly 4
    question: string;           // "What should you do?"
    correctAnswer: string;      // For V1, just store the text explanation
}
