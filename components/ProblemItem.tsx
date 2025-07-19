
import React, { useState } from 'react';
import type { Problem, Difficulty } from '../types';
import { ReplaceIcon, RemoveIcon, ChevronDownIcon, CheckCircleIcon } from './Icons';
import { DIFFICULTY_LEVELS } from '../constants';

interface ProblemItemProps {
    problem: Problem;
    index: number;
    onReplace: (problem: Problem, newDifficulty: Difficulty) => void;
    onRemove: (id: string) => void;
    isSelected: boolean;
    onSelect: () => void;
    isLoading: boolean;
}

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`w-full p-1.5 bg-surface border border-border-color rounded-md text-text-primary text-xs focus:ring-1 focus:ring-primary focus:border-primary transition ${props.className || ''}`} />
);


export const ProblemItem: React.FC<ProblemItemProps> = ({ problem, index, onReplace, onRemove, isSelected, onSelect, isLoading }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const [replacementDifficulty, setReplacementDifficulty] = useState<Difficulty>(problem.difficulty);
    const difficultyLabel = DIFFICULTY_LEVELS.find(d => d.value === problem.difficulty)?.label || problem.difficulty;

    return (
        <div className={`border rounded-lg transition-all duration-300 ${isSelected ? 'border-primary shadow-md bg-white' : 'border-border-color bg-surface hover:border-slate-300'}`}>
            <div className="p-4 cursor-pointer" onClick={onSelect}>
                <div className="flex justify-between items-start gap-4">
                    <p className="text-text-primary flex-1 whitespace-pre-wrap">
                        <span className="text-primary font-bold mr-2">{index + 1}.</span>
                        {problem.question}
                    </p>
                    <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform flex-shrink-0 mt-1 ${isSelected ? 'rotate-180' : ''}`} />
                </div>
                <div className="mt-2 text-xs text-text-secondary flex items-center gap-1 flex-wrap">
                    <span>{problem.grade}</span>
                    <span>&gt;</span>
                    <span>{problem.semester}</span>
                    <span>&gt;</span>
                    <span>{problem.unit}</span>
                    <span>&gt;</span>
                    <span className="font-medium text-slate-600">{problem.subTopic}</span>
                     <span className="mx-1 text-slate-300">|</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{difficultyLabel.split(':')[1].trim()}</span>
                </div>
            </div>

            {isSelected && (
                <div className="border-t border-border-color p-4 bg-background">
                     <div className="flex justify-between items-center mb-3">
                        <button
                            onClick={() => setShowAnswer(!showAnswer)}
                            className="text-sm font-semibold text-secondary hover:text-emerald-600"
                        >
                            {showAnswer ? '정답 숨기기' : '정답 보기'}
                        </button>
                        <div className="flex items-center gap-3">
                             <Select value={replacementDifficulty} onChange={(e) => setReplacementDifficulty(e.target.value as Difficulty)} className="max-w-[120px]">
                                {DIFFICULTY_LEVELS.map(level => (
                                    <option key={level.value} value={level.value}>{level.label.split(':')[1].trim()}으로 교체</option>
                                ))}
                            </Select>
                            <button
                                onClick={() => onReplace(problem, replacementDifficulty)}
                                disabled={isLoading}
                                className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-600 disabled:text-gray-400 transition"
                            >
                                <ReplaceIcon className="w-4 h-4" /> 교체
                            </button>
                            <button
                                onClick={() => onRemove(problem.id)}
                                disabled={isLoading}
                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 disabled:text-gray-400 transition"
                            >
                                <RemoveIcon className="w-4 h-4" /> 제거
                            </button>
                        </div>
                    </div>
                    {showAnswer && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 whitespace-pre-wrap flex items-start gap-2">
                           <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                           <span className="flex-1">{problem.answer}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
