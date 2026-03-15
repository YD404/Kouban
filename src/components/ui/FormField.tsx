/**
 * フォームフィールドコンポーネント
 */
import React from 'react';

type FieldType = 'text' | 'number' | 'date' | 'time' | 'tel' | 'textarea';

interface FormFieldProps {
    label: string;
    type?: FieldType;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    step?: string;
    rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    className = '',
    step,
    rows = 4,
}) => {
    const inputClass = 'w-full border p-3 rounded text-base';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={className}>
            <label className="block text-base font-bold mb-2">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`${inputClass} h-${rows * 8}`}
                    rows={rows}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={inputClass}
                    step={step}
                />
            )}
        </div>
    );
};
