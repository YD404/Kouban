/**
 * ボタンコンポーネント
 */
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    fullWidth?: boolean;
    children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-[#8c1822] hover:bg-[#70131b] text-white',
    secondary: 'bg-[#32353d] hover:bg-[#1f2126] text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700',
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    fullWidth = false,
    className = '',
    children,
    ...props
}) => {
    const baseClass = 'font-bold py-2 px-4 rounded shadow transition';
    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseClass} ${variantClasses[variant]} ${widthClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
