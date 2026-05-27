// types/scenario.ts
// Lightweight scenario types used outside the board.
// ScenarioMeta is what the Scenarios browser page loads.
// Difficulty is the single source of truth - imported by types/index.ts.

export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export interface ScenarioMeta {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    commanders: string[];
    tags: string[];
}