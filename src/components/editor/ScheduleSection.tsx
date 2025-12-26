/**
 * スケジュールセクションコンポーネント
 */
import React from 'react';
import type { DayData, CastMaster } from '../../types';
import { ScheduleRowEditor } from './ScheduleRowEditor';

interface ScheduleSectionProps {
    currentDay: DayData;
    castMaster: CastMaster[];
    onAddSceneRow: () => void;
    onAddBreakRow: () => void;
    onAddLocationRow: () => void;
    onUpdateRow: (id: string, field: string, value: unknown) => void;
    onDeleteRow: (id: string) => void;
    onMoveRow: (index: number, direction: 'up' | 'down') => void;
    onToggleCast: (rowId: string, castId: string) => void;
    onToggleUpCast: (rowId: string, castId: string) => void;
    onToggleBreakOption: (rowId: string, option: string) => void;
    onUpdateLastDay: (isLastDay: boolean) => void;
    onUpdateLastDayMessage: (message: string) => void;
    onNext: () => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
    currentDay,
    castMaster,
    onAddSceneRow,
    onAddBreakRow,
    onAddLocationRow,
    onUpdateRow,
    onDeleteRow,
    onMoveRow,
    onToggleCast,
    onToggleUpCast,
    onToggleBreakOption,
    onUpdateLastDay,
    onUpdateLastDayMessage,
    onNext,
}) => {
    return (
        <>
            <div className="space-y-6">
                {currentDay.scheduleRows.map((row, index) => (
                    <ScheduleRowEditor
                        key={row.id}
                        row={row}
                        index={index}
                        totalRows={currentDay.scheduleRows.length}
                        castMaster={castMaster}
                        onUpdateRow={onUpdateRow}
                        onDeleteRow={onDeleteRow}
                        onMoveRow={onMoveRow}
                        onToggleCast={onToggleCast}
                        onToggleUpCast={onToggleUpCast}
                        onToggleBreakOption={onToggleBreakOption}
                    />
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onAddSceneRow}
                    className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 font-bold text-base"
                >
                    +撮影
                </button>
                <button
                    onClick={onAddBreakRow}
                    className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 font-bold text-base"
                >
                    +飯/移動/撤収
                </button>
                <button
                    onClick={onAddLocationRow}
                    className="w-full bg-gray-500 text-white py-3 rounded hover:bg-gray-600 font-bold text-base"
                >
                    +場所
                </button>
            </div>

            {/* 最終日チェックボックス */}
            <div className="mt-6 border-t pt-6">
                <label className="flex items-center gap-2 font-bold cursor-pointer p-2 hover:bg-gray-50 rounded">
                    <input
                        type="checkbox"
                        checked={currentDay.isLastDay}
                        onChange={(e) => onUpdateLastDay(e.target.checked)}
                        className="w-5 h-5"
                    />
                    最終日としてマーク
                </label>
                {currentDay.isLastDay && (
                    <div className="mt-4">
                        <label className="block text-base font-bold mb-2">最終日メッセージ</label>
                        <input
                            type="text"
                            value={currentDay.lastDayMessage}
                            onChange={(e) => onUpdateLastDayMessage(e.target.value)}
                            className="w-full border p-3 rounded text-base"
                            placeholder="例: お疲れ様でした！"
                        />
                    </div>
                )}
            </div>

            <div className="text-right mt-6">
                <button
                    onClick={onNext}
                    className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 text-base font-bold w-full sm:w-auto"
                >
                    次へ
                </button>
            </div>
        </>
    );
};
