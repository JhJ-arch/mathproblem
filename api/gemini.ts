import { GoogleGenAI, Type } from "@google/genai";
import type { Problem, GenerationOptions, Difficulty } from '../types';
import { DIFFICULTY_DESCRIPTIONS, MATH_CONCEPTS, DIFFICULTY_LEVELS } from '../constants';

// Vercel Edge Function for faster responses
export const config = {
  runtime: 'edge',
};

const API_KEY = process.env.API_KEY;

const problemSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING, description: "The math word problem text." },
        answer: { type: Type.STRING, description: "The detailed answer, including the formula and the final result with units (e.g., '3 x 4 = 12. 답: 12개')." },
        grade: { type: Type.STRING },
        semester: { type: Type.STRING },
        unit: { type: Type.STRING },
        subTopic: { type: Type.STRING, description: "The specific sub-topic from the curriculum." },
        difficulty: { type: Type.STRING, enum: ['Conceptual', 'Applied', 'Advanced'] },
    },
    required: ['question', 'answer', 'grade', 'semester', 'unit', 'subTopic', 'difficulty']
};

const buildPrompt = (options: GenerationOptions): string => {
    const { grade, units, difficultyDistribution } = options;

    const unitDetails = units.map(u => {
        const allSubTopics = MATH_CONCEPTS[grade]?.[u.semester]?.[u.unit] || [];
        const selectedSubTopics = u.subTopics.length > 0 ? u.subTopics : allSubTopics;
        return `- Semester: ${u.semester}, Unit: ${u.unit} (Sub-topics: ${selectedSubTopics.join(', ') || 'All sub-topics within the unit'})`;
    }).join('\n');

    const difficultyDetails = DIFFICULTY_LEVELS.map(level => {
        const count = difficultyDistribution[level.value];
        if (count > 0) {
            return `- **${level.label}**: ${count} 문제\n  - *정의:* ${DIFFICULTY_DESCRIPTIONS[level.value]}`;
        }
        return null;
    }).filter(Boolean).join('\n');
    
    const totalProblems = Object.values(difficultyDistribution).reduce((sum, count) => sum + count, 0);

    return `
You are an expert AI specializing in creating age-appropriate math word problems for Korean elementary school students. Your task is to generate a set of problems based on the user's specifications.

**Generation Criteria:**
1.  **Total Problems to Generate:** ${totalProblems}
2.  **Grade Level:** ${grade}
3.  **Target Semesters, Units, and Sub-topics:**
    ${unitDetails}
4.  **Difficulty Level Distribution & Definitions:**
    ${difficultyDetails}

**Instructions:**
- Create a total of ${totalProblems} distinct math word problems that fit all the criteria above.
- Strictly adhere to the number of problems required for each difficulty level.
- Ensure the problems are creative, engaging, and contextually relevant for Korean elementary students.
- The numbers used in the problems should be appropriate for the specified grade level.
- The answer must include both the calculation process and the final answer with the correct units.
- Distribute the problems evenly across the selected units and sub-topics.
- The output MUST be a JSON object containing a single key "problems" which is an array of problem objects. Do not output any other text or markdown.
`;
};

const generateProblemsApi = async (ai: GoogleGenAI, options: GenerationOptions): Promise<Problem[]> => {
    const prompt = buildPrompt(options);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    problems: {
                        type: Type.ARRAY,
                        items: problemSchema
                    }
                },
                required: ['problems']
            },
            temperature: 0.8,
        }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (!result.problems || !Array.isArray(result.problems)) {
        throw new Error("Invalid response format from API: 'problems' array not found.");
    }
    
    return result.problems.map((p: Omit<Problem, 'id'>) => ({ ...p, id: self.crypto.randomUUID() }));
};

const replaceProblemApi = async (ai: GoogleGenAI, problemToReplace: Problem, newDifficulty: Difficulty): Promise<Problem> => {
    const { grade, semester, unit, subTopic } = problemToReplace;

    const prompt = `
You are an expert AI specializing in creating age-appropriate math word problems for Korean elementary school students.

Your task is to create a new, unique math problem that is different from the one provided below, but covers the same learning objective with a new difficulty.

**Original Problem (for reference, do not copy):**
"${problemToReplace.question}"

**Criteria for the New Problem:**
1.  **Grade Level:** ${grade}
2.  **Semester:** ${semester}
3.  **Unit:** ${unit}
4.  **Specific Sub-topic:** ${subTopic}
5.  **NEW Difficulty Level:** ${newDifficulty}
   - **Definition:** ${DIFFICULTY_DESCRIPTIONS[newDifficulty]}

**Instructions:**
- Generate exactly ONE new word problem with the new difficulty: ${newDifficulty}.
- The new problem must be thematically and numerically different from the original.
- The output must be a single JSON object. Do not output any other text or markdown.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: problemSchema,
            temperature: 0.9,
        }
    });
    
    const jsonText = response.text.trim();
    const newProblemData = JSON.parse(jsonText);

    return { ...newProblemData, id: self.crypto.randomUUID(), difficulty: newDifficulty };
};


export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (!API_KEY) {
        console.error("API_KEY environment variable not set on server");
        return new Response(JSON.stringify({ message: 'Server configuration error: API key not found.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { action, payload } = await req.json();

        if (action === 'generate') {
            const problems = await generateProblemsApi(ai, payload);
            return new Response(JSON.stringify(problems), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        if (action === 'replace') {
            const { problemToReplace, newDifficulty } = payload;
            const newProblem = await replaceProblemApi(ai, problemToReplace, newDifficulty);
            return new Response(JSON.stringify(newProblem), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: 'Invalid action specified.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error in API handler:", error);
        const errorMessage = error instanceof Error ? error.message : "An internal server error occurred.";
        return new Response(JSON.stringify({ message: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
