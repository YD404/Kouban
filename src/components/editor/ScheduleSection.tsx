/**
 * スケジュールセクションコンポーネント
 */
import React, { useState } from 'react';
import type { DayData, CastMaster } from '../../types';
import { ScheduleRowEditor } from './ScheduleRowEditor';

interface ScheduleSectionProps {
    currentDay: DayData;
    castMaster: CastMaster[];
    onAddSceneRow: (index?: number) => void;
    onAddBreakRow: (index?: number) => void;
    onAddLocationRow: (index?: number) => void;
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openInsertMenuIndex, setOpenInsertMenuIndex] = useState<number | null>(null);

    // 追加メニューのUI部品
    const renderAddMenu = (index?: number, isInline = false) => {
        const isOpen = isInline ? openInsertMenuIndex === index : isMenuOpen;
        const toggleMenu = () => isInline 
            ? setOpenInsertMenuIndex(isOpen ? null : index!)
            : setIsMenuOpen(!isOpen);
        
        const closeMenu = () => isInline ? setOpenInsertMenuIndex(null) : setIsMenuOpen(false);

        return (
            <div className={`relative ${isInline ? 'flex justify-center my-2' : 'w-full sm:w-auto'}`}>
                <button
                    onClick={toggleMenu}
                    className={isInline 
                        ? "bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl transition-colors"
                        : "w-full bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 font-bold text-base flex justify-between items-center"}
                    title={isInline ? "ここに追加" : "項目を追加"}
                >
                    {isInline ? '+' : (
                        <>
                            <span>+ 項目を追加</span>
                            <span>{isOpen ? '▲' : '▼'}</span>
                        </>
                    )}
                </button>
                {isOpen && (
                    <div className={`absolute ${isInline ? 'top-full left-1/2 -translate-x-1/2' : 'top-full left-0 w-full'} mt-1 bg-white border rounded shadow-lg z-20 flex flex-col min-w-[200px]`}>
                        <button
                            onClick={() => { onAddSceneRow(index); closeMenu(); }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b font-bold text-blue-600 whitespace-nowrap"
                        >
                            + 撮影を追加
                        </button>
                        <button
                            onClick={() => { onAddBreakRow(index); closeMenu(); }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b font-bold text-green-600 whitespace-nowrap"
                        >
                            + 飯/移動/撤収を追加
                        </button>
                        <button
                            onClick={() => { onAddLocationRow(index); closeMenu(); }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 font-bold text-gray-700 whitespace-nowrap"
                        >
                            + 場所の見出しを追加
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="space-y-2">
                {currentDay.scheduleRows.map((row, index) => (
                    <React.Fragment key={row.id}>
                        {/* 行と行の間の追加ボタン */}
                        {index > 0 && renderAddMenu(index, true)}
                        <ScheduleRowEditor
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
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-8">
                {renderAddMenu(currentDay.scheduleRows.length, false)}
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
