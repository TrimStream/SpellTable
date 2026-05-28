import type { Difficulty } from './scenario';

// ── Card ──

export interface Card {
    id: string;
    name: string;
    imageUrl?: string;
    tapped?: boolean;
    cardType: 'creature' | 'artifact' | 'enchantment' | 'planeswalker'
            | 'land' | 'instant' | 'sorcery' | 'battle';
    isToken?: boolean;
    faceDown?: boolean;
    counters?: Record<string, number>;
}

// ── Zone ──

export interface Zone {
    type: 'battlefield' | 'hand' | 'graveyard' | 'exile' | 'command' | 'library';
    cards: Card[];
    revealed: boolean;
    cardCount?: number;
    orderedPile?: boolean;
}

// ── Player ──

export interface Player {
    id: string;
    name: string;
    life: number;
    commanderTax: number | [number, number];
    zones: {
        battlefield: Zone;
        hand: Zone;
        graveyard: Zone;
        exile: Zone;
        command: Zone;
        library: Zone;
    };
}

// ── Stack ──

export interface StackItem {
    id: string;
    sourceCardId: string;
    sourceCardName: string;
    controller: string;
    label: string;
    type: 'cast' | 'triggered' | 'activated';
    imageUrl?: string;
}

// ── Board State ──
// A full snapshot of the board at a specific step.
// Lives in its own MongoDB collection, fetched lazily by boardStateId.
// Stack lives here because it changes per step.

export interface BoardState {
    id: string;
    scenarioId: string;
    stepId: string;
    stack: StackItem[];
    players: [Player, Player, Player, Player];
}

// ── Scenario Steps ──

export interface Choice {
    id: string;
    label: string;
    quality: 'best' | 'ok' | 'blunder';
    logEntry: string;
    explanation: string;
}

export interface DecisionPoint {
    prompt: string;
    choices: Choice[];
}

export interface ScenarioStep {
    id: string;
    label?: string;
    logLines: string[];
    boardStateId?: string;
    // When present, fetches and renders BoardState with this id.
    // When absent, board keeps the previous step's state.
    decisionPoint?: DecisionPoint;
    nextStepId?: string;
    isFinal?: boolean;
    builderPosition?: { x: number; y: number };
}

// ── Scenario ──

export interface Scenario {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    players: [Player, Player, Player, Player];
    // Fallback initial board state used before first boardState is fetched.
    // Also used by useScenario to hydrate card images on load.
    steps?: ScenarioStep[];
    startStepId?: string;
    question?: string;        // legacy
    options?: string[];       // legacy
    correctAnswer?: string;   // legacy
}