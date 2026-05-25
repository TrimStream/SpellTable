export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export interface ScenarioMeta {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    commanders: string[];
    tags: string[];
}
