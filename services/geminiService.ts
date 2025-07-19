import type { Problem, GenerationOptions, Difficulty } from '../types';

async function callApi(action: string, payload: unknown) {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
}

export const generateProblems = async (options: GenerationOptions): Promise<Problem[]> => {
    try {
        return await callApi('generate', options);
    } catch (error) {
        console.error("Error generating problems:", error);
        const message = error instanceof Error ? error.message : "문제 생성 중 오류가 발생했습니다.";
        throw new Error(message);
    }
};

export const replaceProblem = async (problemToReplace: Problem, newDifficulty: Difficulty): Promise<Problem> => {
     try {
        return await callApi('replace', { problemToReplace, newDifficulty });
    } catch (error) {
        console.error("Error replacing problem:", error);
        const message = error instanceof Error ? error.message : "문제 교체 중 오류가 발생했습니다.";
        throw new Error(message);
    }
};