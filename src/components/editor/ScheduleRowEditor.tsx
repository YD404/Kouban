/**
 * スケジュール行エディタコンポーネント
 */
import React from 'react';
import type { ScheduleRow, SceneRow, BreakRow, CastMaster } from '../../types';
import { DeleteButton } from '../ui';

interface ScheduleRowEditorProps {
    row: ScheduleRow;
    index: number;
    totalRows: number;
    castMaster: CastMaster[];
    onUpdateRow: (id: string, field: string, value: unknown) => void;
    onDeleteRow: (id: string) => void;
    onMoveRow: (index: number, direction: 'up' | 'down') => void;
    onToggleCast: (rowId: string, castId: string) => void;
    onToggleUpCast: (rowId: string, castId: string) => void;
    onToggleBreakOption: (rowId: string, option: string) => void;
}

const MEAL_OPTIONS = ['朝飯', '昼飯', '夕飯', '夜飯'];
const BREAK_OPTIONS = ['移動', '休憩', '完全撤収', '他'];

export const ScheduleRowEditor: React.FC<ScheduleRowEditorProps> = ({
    row,
    index,
    totalRows,
    castMaster,
    onUpdateRow,
    onDeleteRow,
    onMoveRow,
    onToggleCast,
    onToggleUpCast,
    onToggleBreakOption,
}) => {
    const renderLocationRow = () => (
        <div className="mt-8">
            <label className="block text-sm font-bold mb-2">場所 (見出し)</label>
            <input
                type="text"
                value={(row as { location: string }).location}
                onChange={(e) => onUpdateRow(row.id, 'location', e.target.value)}
                className="w-full border p-3 rounded font-bold text-base"
                placeholder="ロケ地名を入力"
            />
        </div>
    );

    const renderBreakRow = (breakRow: BreakRow) => {
        const currentMeal = MEAL_OPTIONS.find(m => breakRow.selectedOptions.includes(m));
        const hasMeal = !!currentMeal;

        const handleMealToggle = () => {
            if (currentMeal) {
                // チェック解除: 全ての食事オプションを削除
                const newOptions = breakRow.selectedOptions.filter(o => !MEAL_OPTIONS.includes(o));
                onUpdateRow(row.id, 'selectedOptions', newOptions);
            } else {
                // チェック: デフォルトで昼飯を追加
                const newOptions = [...breakRow.selectedOptions, '昼飯'];
                onUpdateRow(row.id, 'selectedOptions', newOptions);
            }
        };

        const handleMealChange = (newMeal: string) => {
            const newOptions = breakRow.selectedOptions.filter(o => !MEAL_OPTIONS.includes(o));
            newOptions.push(newMeal);
            onUpdateRow(row.id, 'selectedOptions', newOptions);
        };

        return (
            <div className="grid grid-cols-12 gap-4 mt-10">
                <div className="col-span-12 sm:col-span-4">
                    <label className="block text-sm font-bold mb-2">時間</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="time"
                            value={breakRow.startTime}
                            onChange={(e) => onUpdateRow(row.id, 'startTime', e.target.value)}
                            className="w-full border p-3 rounded text-base"
                        />
                        <span>-</span>
                        <input
                            type="time"
                            value={breakRow.endTime}
                            onChange={(e) => onUpdateRow(row.id, 'endTime', e.target.value)}
                            className="w-full border p-3 rounded text-base"
                        />
                    </div>
                </div>
                <div className="col-span-12">
                    <label className="block text-sm font-bold mb-2">SCENE (移動・休憩・撤収)</label>
                    <div className="flex flex-wrap gap-3">
                        {/* 食事オプション */}
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border cursor-pointer hover:bg-green-50">
                            <input
                                type="checkbox"
                                checked={hasMeal}
                                onChange={handleMealToggle}
                                className="w-5 h-5"
                            />
                            <span className="text-base">飯</span>
                            {hasMeal && (
                                <select
                                    value={currentMeal || '昼飯'}
                                    onChange={(e) => handleMealChange(e.target.value)}
                                    className="ml-2 border rounded p-1 text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {MEAL_OPTIONS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* その他のオプション */}
                        {BREAK_OPTIONS.map((option) => (
                            <label
                                key={option}
                                className="flex items-center gap-2 bg-white px-3 py-2 rounded border cursor-pointer hover:bg-green-50"
                            >
                                <input
                                    type="checkbox"
                                    checked={breakRow.selectedOptions.includes(option)}
                                    onChange={() => onToggleBreakOption(row.id, option)}
                                    className="w-5 h-5"
                                />
                                <span className="text-base">{option}</span>
                            </label>
                        ))}
                    </div>
                    {breakRow.selectedOptions.includes('他') && (
                        <div className="mt-2">
                            <input
                                type="text"
                                value={breakRow.otherText}
                                onChange={(e) => onUpdateRow(row.id, 'otherText', e.target.value)}
                                className="w-full border p-3 rounded text-base"
                                placeholder="その他の内容を入力"
                            />
                        </div>
                    )}
                    <div className="mt-4">
                        <label className="block text-sm font-bold mb-2">備考</label>
                        <input
                            type="text"
                            value={breakRow.remarks || ''}
                            onChange={(e) => onUpdateRow(row.id, 'remarks', e.target.value)}
                            className="w-full border p-3 rounded text-base"
                            placeholder="備考を入力"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderSceneRow = (sceneRow: SceneRow) => (
        <div className="grid grid-cols-12 gap-4 mt-10">
            <div className="col-span-12 sm:col-span-4">
                <label className="block text-sm font-bold mb-2">時間</label>
                <div className="flex items-center gap-2">
                    <input
                        type="time"
                        value={sceneRow.startTime}
                        onChange={(e) => onUpdateRow(row.id, 'startTime', e.target.value)}
                        className="w-full border p-3 rounded text-base"
                    />
                    <span>-</span>
                    <input
                        type="time"
                        value={sceneRow.endTime}
                        onChange={(e) => onUpdateRow(row.id, 'endTime', e.target.value)}
                        className="w-full border p-3 rounded text-base"
                    />
                </div>
            </div>
            <div className="col-span-4 sm:col-span-2">
                <label className="block text-sm font-bold mb-2">S#</label>
                <input
                    type="text"
                    value={sceneRow.sceneNumber}
                    onChange={(e) => onUpdateRow(row.id, 'sceneNumber', e.target.value)}
                    className="w-full border p-3 rounded text-base"
                />
            </div>
            <div className="col-span-4 sm:col-span-2">
                <label className="block text-sm font-bold mb-2">P</label>
                <input
                    type="number"
                    step="0.1"
                    value={sceneRow.pageNumber}
                    onChange={(e) => onUpdateRow(row.id, 'pageNumber', e.target.value)}
                    className="w-full border p-3 rounded text-base"
                />
            </div>
            <div className="col-span-4 sm:col-span-2">
                <label className="block text-sm font-bold mb-2">D/N</label>
                <select
                    value={sceneRow.dn}
                    onChange={(e) => onUpdateRow(row.id, 'dn', e.target.value)}
                    className="w-full border p-3 rounded text-base bg-white"
                >
                    <option value="D">D</option>
                    <option value="N">N</option>
                    <option value="E">E</option>
                    <option value="M">M</option>
                </select>
            </div>
            <div className="col-span-12">
                <label className="block text-sm font-bold mb-2">SCENE</label>
                <textarea
                    value={sceneRow.description}
                    onChange={(e) => onUpdateRow(row.id, 'description', e.target.value)}
                    className="w-full border p-3 rounded text-base h-24"
                />
            </div>
            <div className="col-span-12">
                <label className="block text-sm font-bold mb-2">備考</label>
                <input
                    type="text"
                    value={sceneRow.remarks || ''}
                    onChange={(e) => onUpdateRow(row.id, 'remarks', e.target.value)}
                    className="w-full border p-3 rounded text-base"
                    placeholder="備考を入力"
                />
            </div>
            <div className="col-span-12">
                <label className="block text-sm font-bold mb-2">出演</label>
                <div className="flex flex-wrap gap-3">
                    {castMaster.map((cast) => (
                        <div
                            key={cast.id}
                            className="flex items-center gap-1 bg-white px-3 py-2 rounded border hover:bg-blue-50"
                        >
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={sceneRow.castIds.includes(cast.id)}
                                    onChange={() => onToggleCast(row.id, cast.id)}
                                    className="w-5 h-5"
                                />
                                <span className="text-base">{cast.role}</span>
                            </label>
                            {sceneRow.castIds.includes(cast.id) && (
                                <label
                                    className="flex items-center gap-1 cursor-pointer ml-2 border-l pl-2 select-none"
                                    title={`${cast.role} UP`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={sceneRow.upCastIds?.includes(cast.id) || false}
                                        onChange={() => onToggleUpCast(row.id, cast.id)}
                                        className="w-4 h-4 accent-red-600"
                                    />
                                    <span className="text-xs font-bold text-red-600">UP</span>
                                </label>
                            )}
                        </div>
                    ))}
                    <label className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded border border-yellow-200 cursor-pointer hover:bg-yellow-100 ml-auto">
                        <input
                            type="checkbox"
                            checked={sceneRow.castIds.includes('EX')}
                            onChange={() => onToggleCast(row.id, 'EX')}
                            className="w-5 h-5"
                        />
                        <span className="text-base font-bold">EX</span>
                    </label>
                </div>
            </div>
        </div>
    );

    return (
        <div className="border p-4 rounded bg-gray-50 relative shadow-sm">
            <div className="absolute top-2 right-2 flex gap-2">
                <button
                    onClick={() => onMoveRow(index, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-500 hover:text-black bg-white rounded border disabled:opacity-50"
                >
                    ↑
                </button>
                <button
                    onClick={() => onMoveRow(index, 'down')}
                    disabled={index === totalRows - 1}
                    className="p-2 text-gray-500 hover:text-black bg-white rounded border disabled:opacity-50"
                >
                    ↓
                </button>
                <DeleteButton
                    onClick={() => onDeleteRow(row.id)}
                />
            </div>

            {row.type === 'location' && renderLocationRow()}
            {row.type === 'break' && renderBreakRow(row as BreakRow)}
            {row.type === 'scene' && renderSceneRow(row as SceneRow)}
        </div>
    );
};
