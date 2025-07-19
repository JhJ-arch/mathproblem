
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { ProblemPreview } from './components/ProblemPreview';
import { Spinner } from './components/Spinner';
import { generateProblems as generateProblemsFromApi, replaceProblem as replaceProblemFromApi } from './services/geminiService';
import type { Problem, GenerationOptions, UnitSelection, Difficulty } from './types';
import { exportProblemsToDocx } from './services/docxService';
import { BookIcon } from './components/Icons';

const App: React.FC = () => {
    const [options, setOptions] = useState<GenerationOptions>({
        grade: '3학년',
        units: [],
        difficultyDistribution: {
            Conceptual: 5,
            Applied: 5,
            Advanced: 0,
        },
    });
    const [problems, setProblems] = useState<Problem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

    const handleCreateProblems = useCallback(async () => {
        if (options.units.length === 0) {
            setError("하나 이상의 단원을 선택해주세요.");
            return;
        }
        const totalProblems = Object.values(options.difficultyDistribution).reduce((sum, count) => sum + count, 0);
        if (totalProblems === 0) {
            setError("하나 이상의 문제를 생성하도록 설정해주세요.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setProblems([]);
        try {
            const generated = await generateProblemsFromApi(options);
            setProblems(generated);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : '문제 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [options]);

    const handleReplaceProblem = useCallback(async (problemToReplace: Problem, newDifficulty: Difficulty) => {
        setIsLoading(true);
        setError(null);
        try {
            const newProblem = await replaceProblemFromApi(problemToReplace, newDifficulty);
            setProblems(prevProblems =>
                prevProblems.map(p => p.id === problemToReplace.id ? newProblem : p)
            );
            setSelectedProblemId(newProblem.id);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : '문제 교체 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleRemoveProblem = useCallback((id: string) => {
        setProblems(prev => prev.filter(p => p.id !== id));
        if (selectedProblemId === id) {
            setSelectedProblemId(null);
        }
    }, [selectedProblemId]);

    const handleExport = () => {
        if (problems.length === 0) {
            setError("다운로드할 문제가 없습니다.");
            return;
        }
        exportProblemsToDocx(problems);
    };

    const handleUnitChange = (unitName: string, semester: string, isSelected: boolean) => {
        setOptions(prevOptions => {
            const existingUnits = prevOptions.units;
            if (isSelected) {
                if (!existingUnits.some(u => u.unit === unitName && u.semester === semester)) {
                    return { ...prevOptions, units: [...existingUnits, { unit: unitName, semester, subTopics: [] }] };
                }
            } else {
                return { ...prevOptions, units: existingUnits.filter(u => u.unit !== unitName || u.semester !== semester) };
            }
            return prevOptions;
        });
    };

    const handleSubTopicsChange = (unitName: string, semester: string, subTopics: string[]) => {
        setOptions(prevOptions => ({
            ...prevOptions,
            units: prevOptions.units.map(u => u.unit === unitName && u.semester === semester ? { ...u, subTopics } : u)
        }));
    };


    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />
            <main className="container mx-auto p-4 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4">
                        <Controls
                            options={options}
                            setOptions={setOptions}
                            onUnitChange={handleUnitChange}
                            onSubTopicsChange={handleSubTopicsChange}
                            onCreate={handleCreateProblems}
                            isLoading={isLoading}
                        />
                    </div>
                    <div className="lg:col-span-8">
                        {isLoading && problems.length === 0 && <Spinner />}
                        {error && <div className="text-red-700 bg-red-100 border border-red-200 p-4 rounded-lg">{error}</div>}
                        {!isLoading && problems.length === 0 && !error && (
                             <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-surface rounded-lg border-2 border-dashed border-border-color">
                                <BookIcon className="w-16 h-16 text-slate-300 mb-4" />
                                <p className="text-text-secondary text-lg font-semibold">맞춤형 수학 문제 생성</p>
                                <p className="text-text-secondary">왼쪽 패널에서 조건을 설정하고</p>
                                <p className="text-text-secondary mb-4">"문제 만들기" 버튼을 눌러주세요.</p>
                            </div>
                        )}
                        {problems.length > 0 && (
                            <ProblemPreview
                                problems={problems}
                                onReplace={handleReplaceProblem}
                                onRemove={handleRemoveProblem}
                                onExport={handleExport}
                                selectedProblemId={selectedProblemId}
                                setSelectedProblemId={setSelectedProblemId}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
