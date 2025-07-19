
import React from 'react';
import { MathIcon } from './Icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-surface border-b border-border-color shadow-sm">
            <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <MathIcon className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-xl font-bold text-text-primary tracking-tight">
                    수학 문장제 완전 정복
                </h1>
            </div>
        </header>
    );
};