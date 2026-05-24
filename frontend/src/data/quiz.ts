export type SkillLevel = 'beginner' | 'intermediate' | 'expert';

export interface QuizOption {
    label: string;
    points: number;
}

export interface QuizQuestion {
    id: string;
    question: string;
    note?: string;
    options: QuizOption[];
    scored: boolean;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: 'magic_experience',
        question: 'How long have you played Magic: The Gathering?',
        scored: true,
        options: [
            { label: 'Less than 2 years', points: 0 },
            { label: '2–5 years', points: 1 },
            { label: '6+ years', points: 2 },
        ],
    },
    {
        id: 'cedh_experience',
        question: 'How long have you played cEDH specifically?',
        scored: true,
        options: [
            { label: 'Less than 6 months', points: 0 },
            { label: '6 months–2 years', points: 1 },
            { label: '3+ years', points: 2 },
        ],
    },
    {
        id: 'top_cut',
        question: 'How many times have you made top cut at a cEDH tournament with 60+ players?',
        note: 'Top cut means finishing in the top 16 or advancing to playoffs.',
        scored: true,
        options: [
            { label: 'Never', points: 0 },
            { label: '1–2 times', points: 2 },
            { label: '3+ times', points: 3 },
        ],
    },
    {
        id: 'wins',
        question: 'How many times have you won a cEDH tournament with 60+ players?',
        scored: true,
        options: [
            { label: 'Never', points: 0 },
            { label: 'Once', points: 3 },
            { label: 'More than once', points: 5 },
        ],
    },
    {
        id: 'archetype',
        question: 'What archetype do you play?',
        scored: false,
        options: [
            { label: 'Turbo', points: 0 },
            { label: 'Midrange', points: 0 },
            { label: 'Stax', points: 0 },
            { label: 'Not sure yet', points: 0 },
        ],
    },
];

export function calculateLevel(score: number): SkillLevel {
    if (score >= 10) return 'expert';
    if (score >= 5) return 'intermediate';
    return 'beginner';
}

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    expert: 'Expert',
};

export const SKILL_LEVEL_DESCRIPTIONS: Record<SkillLevel, string> = {
    beginner: "You're just getting started in cEDH. Start with the beginner scenarios to learn threat assessment and interaction timing. The tutorial and rules pages cover the fundamentals when you need a reference.",
    intermediate: "You know the format but there's room to sharpen your decisions. Scenarios will focus on timing, stack sequencing, and reading the table.",
    expert: "You're competing at a high level. Scenarios are designed to challenge your political reads, optimal lines, and edge case interactions.",
};