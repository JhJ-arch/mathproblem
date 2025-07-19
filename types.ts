
export interface Problem {
    id: string;
    question: string;
    answer: string;
    grade: string;
    semester: string;
    unit: string;
    subTopic: string;
    difficulty: Difficulty;
}

export type Difficulty = 'Conceptual' | 'Applied' | 'Advanced';

export interface UnitSelection {
    unit: string;
    semester: string;
    subTopics: string[];
}

export interface GenerationOptions {
    grade: string;
    units: UnitSelection[];
    difficultyDistribution: Record<Difficulty, number>;
}
