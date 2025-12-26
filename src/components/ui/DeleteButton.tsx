/**
 * 削除ボタン（×）共通コンポーネント
 */
import React from 'react';

type DeleteButtonSize = 'sm' | 'md';

interface DeleteButtonProps {
    onClick: (e: React.MouseEvent) => void;
    size?: DeleteButtonSize;
    title?: string;
    className?: string;
}

const sizeClasses: Record<DeleteButtonSize, string> = {
    sm: 'w-5 h-5 text-sm',
    md: 'w-8 h-8 text-lg',
};

export const DeleteButton: React.FC<DeleteButtonProps> = ({
    onClick,
    size = 'md',
    title = '削除',
    className = '',
}) => {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center justify-center
                rounded-full
                bg-white border border-danger
                text-danger hover:text-white hover:bg-danger-hover
                transition-colors
                ${sizeClasses[size]}
                ${className}
            `}
            title={title}
            type="button"
        >
            ×
        </button>
    );
};
