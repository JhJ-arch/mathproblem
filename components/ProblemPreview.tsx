
import React from 'react';
import type { Problem, Difficulty } from '../types';
import { ProblemItem } from './ProblemItem';
import { DownloadIcon } from './Icons';

interface ProblemPreviewProps {
    problems: Problem[];
    onReplace: (problem: Problem, newDifficulty: Difficulty) => void;
    onRemove: (id: string) => void;
    onExport: () => void;
    selectedProblemId: string | null;
    setSelectedProblemId: React.Dispatch<React.SetStateAction<string | null>>;
    isLoading: boolean;
}

export const ProblemPreview: React.FC<ProblemPreviewProps> = ({ problems, onReplace, onRemove, onExport, selectedProblemId, setSelectedProblemId, isLoading }) => {
    const selectedProblem = problems.find(p => p.id === selectedProblemId);

    return (
        <div className="bg-surface p-6 rounded-lg border border-border-color">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-text-primary">생성된 문제 미리보기</h2>
                <button
                    onClick={onExport}
                    className="flex items-center gap-2 bg-secondary hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                    <DownloadIcon className="w-5 h-5" />
                    문제 다운로드
                </button>
            </div>
            
            <div className="space-y-4">
                {problems.map((problem, index) => (
                    <ProblemItem
                        key={problem.id}
                        problem={problem}
                        index={index}
                        onReplace={onReplace}
                        onRemove={onRemove}
                        isSelected={selectedProblemId === problem.id}
                        onSelect={() => setSelectedProblemId(problem.id === selectedProblemId ? null : problem.id)}
                        isLoading={isLoading}
                    />
                ))}
            </div>
        </div>
    );
};
