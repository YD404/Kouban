/**
 * 追加ボタン（+ ○○）共通コンポーネント
 */
import React from 'react';

type AddButtonVariant = 'primary' | 'secondary';

interface AddButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    variant?: AddButtonVariant;
    fullWidth?: boolean;
    className?: string;
}

const variantClasses: Record<AddButtonVariant, string> = {
    primary: 'bg-action-add hover:bg-action-add-hover text-white',
    secondary: 'bg-brand-secondary hover:bg-brand-secondary-hover text-white',
};

export const AddButton: React.FC<AddButtonProps> = ({
    onClick,
    children,
    variant = 'primary',
    fullWidth = true,
    className = '',
}) => {
    return (
        <button
            onClick={onClick}
            className={`
                ${fullWidth ? 'w-full' : ''}
                py-3 rounded
                font-bold text-base
                transition-colors
                ${variantClasses[variant]}
                ${className}
            `}
            type="button"
        >
            {children}
        </button>
    );
};
