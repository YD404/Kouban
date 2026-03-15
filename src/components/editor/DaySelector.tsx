/**
 * 日付選択タブコンポーネント
 */
import React from 'react';
import type { DayData } from '../../types';
import { DeleteButton } from '../ui';

interface DaySelectorProps {
    days: DayData[];
    currentDayId: string;
    onSelectDay: (id: string) => void;
    onAddDay: () => void;
    onDeleteDay: (id: string) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
    days,
    currentDayId,
    onSelectDay,
    onAddDay,
    onDeleteDay,
}) => {
    const handleDeleteClick = (e: React.MouseEvent, dayId: string) => {
        e.stopPropagation();
        if (days.length <= 1) {
            alert('最後の日付は削除できません。');
            return;
        }
        if (window.confirm('この日付を削除しますか？')) {
            onDeleteDay(dayId);
        }
    };

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 border-b">
            {days.map((day, index) => (
                <div
                    key={day.id}
                    onClick={() => onSelectDay(day.id)}
                    className={`flex items-center px-4 py-2 rounded whitespace-nowrap cursor-pointer ${day.id === currentDayId
                        ? 'bg-[#8c1822] text-white font-bold'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                >
                    <span>{day.headerInfo.date || `Day ${index + 1}`}</span>
                    {days.length > 1 && (
                        <DeleteButton
                            onClick={(e) => handleDeleteClick(e, day.id)}
                            size="sm"
                            className="ml-2"
                        />
                    )}
                </div>
            ))}
            <button
                onClick={onAddDay}
                className="px-4 py-2 bg-brand-secondary hover:bg-brand-secondary-hover text-white rounded whitespace-nowrap font-bold"
            >
                + 日付追加
            </button>
        </div>
    );
};
