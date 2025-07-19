
import React from 'react';

export const Spinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-surface rounded-lg border border-border-color">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-text-secondary">AI가 열심히 문제를 만들고 있어요...</p>
        </div>
    );
};
