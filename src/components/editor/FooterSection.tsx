/**
 * フッター情報セクションコンポーネント
 */
import React from 'react';
import type { DayData, CastMaster } from '../../types';
import { DeleteButton, AddButton } from '../ui';

interface FooterSectionProps {
    currentDay: DayData;
    castMaster: CastMaster[];
    onUpdateFooter: (field: keyof DayData['footerInfo'], value: unknown) => void;
    onUpdateTimeTableRow: (index: number, field: string, value: string) => void;
    onAddTimeTableRow: () => void;
    onDeleteTimeTableRow: (index: number) => void;
    onUpdateContact: (
        type: 'directorContact' | 'assistantDirectorContact',
        field: 'name' | 'phone',
        value: string
    ) => void;
    onAddDay: () => void;
    onPrint: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
    currentDay,
    castMaster,
    onUpdateFooter,
    onUpdateTimeTableRow,
    onAddTimeTableRow,
    onDeleteTimeTableRow,
    onUpdateContact,
    onAddDay,
    onPrint,
}) => {
    const { footerInfo } = currentDay;

    return (
        <>
            {/* 備考・車両・エキストラ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-base font-bold mb-2">備考</label>
                    <textarea
                        value={footerInfo.remarks}
                        onChange={(e) => onUpdateFooter('remarks', e.target.value)}
                        className="w-full border p-3 rounded h-32 text-base"
                    />
                </div>
                <div>
                    <label className="block text-base font-bold mb-2">車両 等</label>
                    <textarea
                        value={footerInfo.vehicles}
                        onChange={(e) => onUpdateFooter('vehicles', e.target.value)}
                        className="w-full border p-3 rounded h-32 text-base"
                    />
                </div>
                <div>
                    <label className="block text-base font-bold mb-2">エキストラ</label>
                    <textarea
                        value={footerInfo.extras}
                        onChange={(e) => onUpdateFooter('extras', e.target.value)}
                        className="w-full border p-3 rounded h-32 text-base"
                    />
                </div>
            </div>

            {/* 入り時間・キャスト表 */}
            <div className="border-t pt-6">
                <h3 className="font-bold mb-4 text-lg">入り時間・キャスト表</h3>
                <div className="space-y-6">
                    {footerInfo.timeTable.map((row, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded shadow-sm relative">
                            <div className="absolute top-2 right-2">
                                <DeleteButton
                                    onClick={() => onDeleteTimeTableRow(index)}
                                    title="行を削除"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pr-8">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="time"
                                        placeholder="時間"
                                        value={row.time}
                                        onChange={(e) => onUpdateTimeTableRow(index, 'time', e.target.value)}
                                        className="border p-3 rounded w-full text-base"
                                    />
                                    <button
                                        onClick={() => onUpdateTimeTableRow(index, 'time', '')}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-600 rounded p-3 font-bold"
                                        title="時間をクリア"
                                    >
                                        クリア
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="場所"
                                        value={row.location}
                                        onChange={(e) => onUpdateTimeTableRow(index, 'location', e.target.value)}
                                        className="border p-3 rounded w-full text-base"
                                    />
                                    {index > 0 && (
                                        <button
                                            onClick={() => {
                                                const prevRow = footerInfo.timeTable[index - 1];
                                                onUpdateTimeTableRow(index, 'location', prevRow.location);
                                            }}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-600 rounded p-3 font-bold whitespace-nowrap"
                                            title="上の行と同じ場所を入力"
                                        >
                                            同上
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                {(['cast1', 'cast2', 'cast3'] as const).map((castField, castIndex) => (
                                    <select
                                        key={castField}
                                        value={row[castField]}
                                        onChange={(e) => onUpdateTimeTableRow(index, castField, e.target.value)}
                                        className="border p-3 rounded w-full text-base bg-white"
                                    >
                                        <option value="">キャスト{castIndex + 1}を選択</option>
                                        {castMaster.map((c) => (
                                            <option key={c.id} value={`${c.name} (${c.role})`}>
                                                {c.name} ({c.role})
                                            </option>
                                        ))}
                                    </select>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="備考"
                                value={row.remarks}
                                onChange={(e) => onUpdateTimeTableRow(index, 'remarks', e.target.value)}
                                className="border p-3 rounded w-full text-base"
                            />
                        </div>
                    ))}
                    <AddButton onClick={onAddTimeTableRow}>
                        + 行を追加
                    </AddButton>
                </div>
            </div>

            {/* 連絡先 */}
            <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-bold mb-2 text-lg">監督連絡先</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="名前"
                            value={footerInfo.directorContact.name}
                            onChange={(e) => onUpdateContact('directorContact', 'name', e.target.value)}
                            className="border p-3 rounded w-full text-base"
                        />
                        <input
                            type="tel"
                            placeholder="電話番号"
                            value={footerInfo.directorContact.phone}
                            onChange={(e) => onUpdateContact('directorContact', 'phone', e.target.value)}
                            className="border p-3 rounded w-full text-base"
                        />
                    </div>
                </div>
                <div>
                    <h3 className="font-bold mb-2 text-lg">助監督連絡先</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="名前"
                            value={footerInfo.assistantDirectorContact.name}
                            onChange={(e) => onUpdateContact('assistantDirectorContact', 'name', e.target.value)}
                            className="border p-3 rounded w-full text-base"
                        />
                        <input
                            type="tel"
                            placeholder="電話番号"
                            value={footerInfo.assistantDirectorContact.phone}
                            onChange={(e) => onUpdateContact('assistantDirectorContact', 'phone', e.target.value)}
                            className="border p-3 rounded w-full text-base"
                        />
                    </div>
                </div>
            </div>

            {/* ボタン */}
            <div className="mt-8 flex justify-end gap-4">
                <button
                    onClick={onAddDay}
                    className="bg-[#32353d] hover:bg-[#1f2126] text-white font-bold py-3 px-6 rounded shadow transition text-base"
                >
                    + 日付追加
                </button>
                <button
                    onClick={onPrint}
                    className="bg-[#32353d] hover:bg-[#1f2126] text-white font-bold py-3 px-6 rounded shadow transition text-base"
                >
                    印刷 / PDF
                </button>
            </div>
        </>
    );
};
