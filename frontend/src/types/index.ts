// types/index.ts
// Updated for V5: stack zone, step-based scenarios, dual commanders,
// per-card face-down state, and counter support for V6 builder.

import type { Difficulty } from './scenario';

// ─── Card ───

export interface Card {
    id: string;
    // Scryfall UUID. For duplicate tokens append -2, -3 etc to keep React keys unique.

    name: string;
    // Card name for alt text and display before image loads.

    imageUrl?: string;
    // Fetched at runtime by useScenario from Scryfall. Hardcoded for tokens.

    tapped?: boolean;
    // Applies 90deg rotation on the battlefield. Preserved through Scryfall fetch.

    cardType: 'creature' | 'artifact' | 'enchantment' | 'planeswalker'
            | 'land' | 'instant' | 'sorcery' | 'battle';

    isToken?: boolean;
    // Tokens skip Scryfall fetch and use hardcoded imageUrl from JSON.

    faceDown?: boolean;
    // When true, renders as a card back regardless of zone.
    // Opponent hand cards default to face-down in the builder.
    // Explicitly set to false, to reveal a specific opponent hand card
    // (e.g. a card revealed through politics).
    // Undefined and false are treated identically by the board renderer.

    counters?: Record<string, number>;
    // Forward-compatibility for V6 scenario builder.
    // Examples: { '+1/+1': 2 }, { 'loyalty': 4 }, { 'charge': 1 }
    // Not rendered in V5 but stored and preserved through fetches.
}

// ─── Zone ───

export interface Zone {
    type: 'battlefield' | 'hand' | 'graveyard' | 'exile' | 'command' | 'library';
    cards: Card[];
    revealed: boolean;
    // true = zone is face-up (battlefield, graveyard, exile, command).
    // false = zone is hidden (library). Hand uses per-card faceDown instead.

    cardCount?: number;
    // Used for hidden zones (library, collapsed opponent hand)
    // to show a count without exposing card data.

    orderedPile?: boolean;
    // NEW - when true, pile renders bottom-to-top in strict order
}

// ─── Player ───

export interface Player {
    id: string;
    // 'player_1' through 'player_4'.

    name: string;
    life: number;

    commanderTax: number | [number, number];
    // Single commander: number (e.g. 1 means costs 2 more to cast).
    // Dual commanders: tuple [tax1, tax2] where index matches command zone card order.
    // Displayed as "Tax: 1" or "Tax: 1 / 2".

    zones: {
        battlefield: Zone;
        hand: Zone;
        graveyard: Zone;
        exile: Zone;
        command: Zone;     // Holds 1 or 2 cards for dual commanders.
        library: Zone;
    };
}

// ─── Stack ───

export interface StackItem {
    id: string;
    // Unique key for React rendering.

    sourceCardId: string;
    // Scryfall UUID of the source card. Used to fetch the image.

    sourceCardName: string;
    // Card name for alt text before image loads.

    controller: string;
    // Player name, e.g. "Opponent 2". Matches Player.name.

    label: string;
    // Human-readable description of what is on the stack.
    // Examples: "Demonic Consultation", "Thassa's Oracle ETB trigger"

    type: 'cast' | 'triggered' | 'activated';
    // Used to color-code or icon stack items in the StackBlock log entry.

    imageUrl?: string;
    // Fetched at runtime by useScenario. Same pipeline as Card.imageUrl.
}

// ─── Scenario Steps ────

export interface Choice {
    id: string;
    label: string;
    // Button text shown in the action area.
    // Examples: "Pass priority", "Cast Endurance", "Activate Kinnan"

    quality: 'best' | 'ok' | 'blunder';
    // Replaces isCorrect boolean. More nuanced than right/wrong.
    // 'best' = optimal line
    // 'ok' = acceptable but suboptimal
    // 'blunder' = loses the game or throws significant advantage

    logEntry: string;
    // Appended to the log feed when this choice is selected.
    // Written in second person: "You cast Endurance in response to the ETB trigger."

    explanation: string;
    // Shown in the debrief only. Explains why this was correct or incorrect.
    // Examples: "Correct. Endurance shuffles the graveyard back, preventing the win."
    //           "Incorrect. Passing here lets Thoracle's trigger resolve and win the game."
}

export interface DecisionPoint {
    prompt: string;
    // Shown above the choices in the action area.
    // Examples: "You have priority. Oracle's ETB is on the stack. What do you do?"

    choices: Choice[];
    // Always includes at least "Pass priority" as one option.
    // Game action choices are specific to the board state at this moment.
}

export interface ScenarioStep {
    id: string;
    // Unique identifier. Referenced by Choice.nextStepId and Scenario.startStepId.

    label?: string;

    logLines: string[];
    // Narration lines appended to the log feed when this step is entered.
    // Rendered as 'narration' or 'priority-pass' entries depending on content.
    // Empty array is valid for pure decision steps with no narration.

    boardState?: [Player, Player, Player, Player];
    // If present, board updates to this state when step is entered.
    // If absent, board keeps the previous state.

    decisionPoint?: DecisionPoint;
    // If present: append logLines, then pause and show choices in action area.
    // If absent: append logLines, then auto-advance to nextStepId.

    nextStepId?: string;
    // Used when decisionPoint is absent. Which step to go to automatically.
    // Must be present if decisionPoint is absent and isFinal is not true.

    isFinal?: boolean;
    // When true, this step ends the scenario and triggers the debrief.
    // logLines still append before the debrief appears.

    builderPosition?: { x: number; y: number };
    // Canvas coordinates for the V6 scenario builder node graph.
    // Ignored entirely by the board. Stored in MongoDB so the builder
    // can reload the graph in the same layout the author left it.
}

// ─── Scenario ───

export interface Scenario {
    id: string;
    title: string;
    description: string;

    difficulty: Difficulty;  // imported, not inlined

    players: [Player, Player, Player, Player];
    // Always exactly 4. Index 0 = you (bottom-right).

    stack?: StackItem[];
    // Current state of the stack when the scenario begins.
    // Undefined or empty means no stack (scenario-01 has no stack).
    // Items are ordered bottom to top: index 0 resolves last, last index resolves first.

    steps?: ScenarioStep[];
    // All steps in the scenario as a flat array.
    // The board navigates between them using startStepId and Choice.nextStepId.

    startStepId?: string;
    // The id of the first ScenarioStep to enter when the scenario loads.
    // Required when steps is present.

    // ── Legacy fields ── kept for backward compatibility during transition.
    // Remove after scenario-01 is rewritten into steps format.
    question?: string;
    options?: string[];
    correctAnswer?: string;
}