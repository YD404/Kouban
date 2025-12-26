/**
 * アコーディオンコンポーネント
 */
import React from 'react';

interface AccordionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
    title,
    isOpen,
    onToggle,
    children,
}) => {
    return (
        <div className="border rounded-lg overflow-hidden">
            <button
                className="w-full px-4 py-3 bg-gray-100 text-left font-bold flex justify-between items-center hover:bg-gray-200"
                onClick={onToggle}
            >
                <span>{title}</span>
                <span>{isOpen ? '▼' : '▶'}</span>
            </button>
            {isOpen && (
                <div className="p-4 space-y-6 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
};
