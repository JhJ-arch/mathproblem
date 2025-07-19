
import React from 'react';
import type { GenerationOptions, Difficulty } from '../types';
import { MATH_CONCEPTS, GRADES, DIFFICULTY_LEVELS } from '../constants';
import { CreateIcon } from './Icons';

interface ControlsProps {
    options: GenerationOptions;
    setOptions: React.Dispatch<React.SetStateAction<GenerationOptions>>;
    onUnitChange: (unitName: string, semester: string, isSelected: boolean) => void;
    onSubTopicsChange: (unitName: string, semester: string, subTopics: string[]) => void;
    onCreate: () => void;
    isLoading: boolean;
}

const Label: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-text-secondary mb-2">{children}</label>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`w-full p-2.5 bg-surface border border-border-color rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition ${props.className || ''}`} />
);

export const Controls: React.FC<ControlsProps> = ({ options, setOptions, onUnitChange, onSubTopicsChange, onCreate, isLoading }) => {
    const unitsBySemester = MATH_CONCEPTS[options.grade] || {};

    const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setOptions(prev => ({ ...prev, grade: e.target.value, units: [] }));
    };

    const handleSubTopicToggle = (unitName: string, semester: string, subTopic: string) => {
        const unitSelection = options.units.find(u => u.unit === unitName && u.semester === semester);
        const currentSubTopics = unitSelection ? unitSelection.subTopics : [];
        const newSubTopics = currentSubTopics.includes(subTopic)
            ? currentSubTopics.filter(c => c !== subTopic)
            : [...currentSubTopics, subTopic];
        onSubTopicsChange(unitName, semester, newSubTopics);
    };
    
    const handleDifficultyChange = (difficulty: Difficulty, count: number) => {
        setOptions(prev => ({
            ...prev,
            difficultyDistribution: {
                ...prev.difficultyDistribution,
                [difficulty]: count,
            }
        }));
    };
    
    const totalProblems = Object.values(options.difficultyDistribution).reduce((sum, count) => sum + count, 0);

    return (
        <div className="bg-surface p-6 rounded-lg border border-border-color shadow-sm space-y-6 sticky top-8">
            <h2 className="text-xl font-bold text-text-primary">문제 생성 조건</h2>
            
            <div>
                <Label htmlFor="grade">학년</Label>
                <Select id="grade" value={options.grade} onChange={handleGradeChange}>
                    {GRADES.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                </Select>
            </div>

            <div>
                <Label htmlFor="units">단원 (하나 이상 선택)</Label>
                <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2">
                    {Object.entries(unitsBySemester).map(([semester, units]) => (
                        <div key={semester}>
                            <h3 className="text-sm font-semibold text-text-primary mb-2 sticky top-0 bg-surface py-1">{semester}</h3>
                            <div className="space-y-3">
                                {Object.keys(units).map(unitName => {
                                    const isSelected = options.units.some(u => u.unit === unitName && u.semester === semester);
                                    return (
                                        <div key={unitName} className="p-3 bg-background rounded-md border border-border-color">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`unit-${semester}-${unitName}`}
                                                    checked={isSelected}
                                                    onChange={e => onUnitChange(unitName, semester, e.target.checked)}
                                                    className="h-4 w-4 text-primary accent-primary focus:ring-primary"
                                                />
                                                <label htmlFor={`unit-${semester}-${unitName}`} className="ml-3 text-sm font-medium text-text-primary">
                                                    {unitName}
                                                </label>
                                            </div>
                                            {isSelected && (
                                                <div className="mt-3 pt-3 pl-4 border-t border-border-color">
                                                    <p className="text-xs text-text-secondary mb-2">세부 항목 선택 (미선택 시 전체)</p>
                                                    <div className="space-y-1.5">
                                                        {units[unitName].map(subTopic => {
                                                            const unitSelection = options.units.find(u => u.unit === unitName && u.semester === semester);
                                                            const isSubTopicSelected = unitSelection ? unitSelection.subTopics.includes(subTopic) : false;
                                                            return (
                                                            <div key={subTopic} className="flex items-center">
                                                                 <input
                                                                    type="checkbox"
                                                                    id={`subTopic-${semester}-${unitName}-${subTopic}`}
                                                                    checked={isSubTopicSelected}
                                                                    onChange={() => handleSubTopicToggle(unitName, semester, subTopic)}
                                                                    className="h-4 w-4 text-primary accent-primary focus:ring-primary rounded"
                                                                />
                                                                <label htmlFor={`subTopic-${semester}-${unitName}-${subTopic}`} className="ml-2 text-xs text-text-secondary">
                                                                    {subTopic}
                                                                </label>
                                                            </div>
                                                        )})}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                 <Label>난이도별 문제 수 (총 {totalProblems}문제)</Label>
                 <div className="space-y-4">
                    {DIFFICULTY_LEVELS.map(level => (
                        <div key={level.value}>
                            <label htmlFor={`difficulty-${level.value}`} className="text-sm text-text-secondary">
                                {level.label}: {options.difficultyDistribution[level.value]}
                            </label>
                            <input
                                type="range"
                                id={`difficulty-${level.value}`}
                                min="0"
                                max="15"
                                step="1"
                                value={options.difficultyDistribution[level.value]}
                                onChange={e => handleDifficultyChange(level.value, parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    ))}
                 </div>
            </div>
            
            <button
                onClick={onCreate}
                disabled={isLoading || options.units.length === 0 || totalProblems === 0}
                className="w-full bg-primary hover:bg-sky-600 disabled:bg-sky-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center gap-2"
            >
                <CreateIcon className="w-5 h-5" />
                {isLoading ? '생성 중...' : '문제 만들기'}
            </button>
        </div>
    );
};