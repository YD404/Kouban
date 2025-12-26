/**
 * プレビューテーブルコンポーネント
 */
import React from 'react';
import type { ScheduleRow, CastMaster, SceneRow, BreakRow } from '../../types';

interface PreviewTableProps {
    scheduleRows: ScheduleRow[];
    castMaster: CastMaster[];
    isLastDay: boolean;
    lastDayMessage: string;
}

// 固定列の幅定義
const FIXED_COLUMN_COUNT = 5; // Time, S#, P, D/N, EX以外の固定部分
const CAST_WIDTH_PER_COL = 5;

export const PreviewTable: React.FC<PreviewTableProps> = ({
    scheduleRows,
    castMaster,
    isLastDay,
    lastDayMessage,
}) => {
    // 動的カラム幅の計算
    const fixedWidth = 12 + 6 + 4 + 4 + 4; // Time(12) + S#(6) + P(4) + D/N(4) + EX(4)
    const totalCastWidth = castMaster.length * CAST_WIDTH_PER_COL;
    const availableWidth = 100 - fixedWidth - totalCastWidth;
    const sceneRatio = 24 / 39;
    const sceneWidth = Math.max(10, Math.floor(availableWidth * sceneRatio));
    const remarksWidth = Math.max(5, availableWidth - sceneWidth);

    // colSpanの計算（固定列 + キャスト列 + EX列 + 備考列）
    const totalColSpan = FIXED_COLUMN_COUNT + castMaster.length + 2; // +2 for EX and Remarks

    const renderSceneRow = (row: SceneRow) => (
        <>
            <tr key={row.id}>
                <td className="border border-black px-1 py-1 text-center h-8 font-bold">
                    {row.startTime} - {row.endTime}
                </td>
                <td className="border border-black px-1 py-1 text-center font-bold text-sm">{row.sceneNumber}</td>
                <td className="border border-black px-1 py-1 text-center font-bold text-sm">{row.pageNumber}</td>
                <td className="border border-black px-1 py-1 text-center">{row.dn}</td>
                <td className="border border-black px-1 py-1 text-left whitespace-pre-wrap align-top">
                    {row.description}
                </td>
                {castMaster.map((cast, index) => (
                    <td key={cast.id} className={`border border-black px-1 py-1 text-center text-lg align-middle ${index === 0 ? 'border-l-4' : ''}`}>
                        {row.castIds.includes(cast.id) ? '○' : ''}
                    </td>
                ))}
                <td className="border border-black px-1 py-1 text-center text-lg align-middle border-r-4">
                    {row.castIds.includes('EX') ? '○' : ''}
                </td>
                <td className="border border-black px-1 py-1 text-left whitespace-pre-wrap align-top text-xs">
                    {row.remarks}
                </td>
            </tr>
            {/* UP行 */}
            {row.upCastIds && row.upCastIds.length > 0 && (
                <tr key={`${row.id}-up`}>
                    <td className="border border-black px-1 py-1 text-center h-8 font-bold"></td>
                    <td className="border border-black px-1 py-1 text-center font-bold text-sm"></td>
                    <td className="border border-black px-1 py-1 text-center font-bold text-sm"></td>
                    <td className="border border-black px-1 py-1 text-center"></td>
                    <td className="border border-black px-1 py-1 text-left whitespace-pre-wrap align-top"></td>
                    {castMaster.map((cast, index) => (
                        <td key={cast.id} className={`border border-black px-1 py-1 text-center text-lg align-middle font-bold ${index === 0 ? 'border-l-4' : ''}`}>
                            {row.upCastIds?.includes(cast.id) ? 'UP' : ''}
                        </td>
                    ))}
                    <td className="border border-black px-1 py-1 text-center text-lg align-middle border-r-4"></td>
                    <td className="border border-black px-1 py-1 text-left whitespace-pre-wrap align-top text-xs"></td>
                </tr>
            )}
        </>
    );

    const renderBreakRow = (row: BreakRow) => {
        const optionsText = row.selectedOptions.filter(o => o !== '他').join('・');
        const fullText = row.selectedOptions.includes('他') && row.otherText
            ? (optionsText ? `${optionsText}・${row.otherText}` : row.otherText)
            : optionsText;

        return (
            <tr key={row.id}>
                <td className="border border-black px-1 py-1 text-center h-8 font-bold">
                    {row.startTime} - {row.endTime}
                </td>
                <td className="border border-black px-1 py-1 text-center font-bold text-sm"></td>
                <td className="border border-black px-1 py-1 text-center font-bold text-sm"></td>
                <td className="border border-black px-1 py-1 text-center"></td>
                <td className="border border-black px-1 py-1 text-left whitespace-pre-wrap align-top font-bold">
                    {fullText ? `＜${fullText}＞` : ''}
                </td>
                {castMaster.map((cast, index) => (
                    <td key={cast.id} className={`border border-black px-1 py-1 text-center text-lg align-middle ${index === 0 ? 'border-l-4' : ''}`}></td>
                ))}
                <td className="border border-black px-1 py-1 text-center text-lg align-middle border-r-4"></td>
                <td className="border border-black px-1 py-1 text-left whitespace-pre-wrap align-top text-xs">
                    {row.remarks}
                </td>
            </tr>
        );
    };

    let locationCount = 0;

    return (
        <table className="w-full border-collapse border border-black mb-2 table-fixed">
            <thead>
                <tr className="bg-gray-100 print:bg-gray-200 text-center">
                    <th className="border border-black px-1 py-1 w-[12%]">Time</th>
                    <th className="border border-black px-1 py-1 w-[6%]">S#</th>
                    <th className="border border-black px-1 py-1 w-[4%]">P</th>
                    <th className="border border-black px-1 py-1 w-[4%]">D/N</th>
                    <th className="border border-black px-1 py-1" style={{ width: `${sceneWidth}%` }}>SCENE</th>
                    {castMaster.map((cast, index) => (
                        <th
                            key={cast.id}
                            className={`border border-black px-1 py-1 text-[10px] ${index === 0 ? 'border-l-4' : ''}`}
                            style={{ width: `${CAST_WIDTH_PER_COL}%` }}
                        >
                            {cast.role}
                        </th>
                    ))}
                    <th className="border border-black px-1 py-1 w-[4%] text-[10px] border-r-4">EX</th>
                    <th className="border border-black px-1 py-1" style={{ width: `${remarksWidth}%` }}>備考</th>
                </tr>
            </thead>
            <tbody>
                {scheduleRows.map((row) => {
                    if (row.type === 'location') {
                        locationCount++;
                        return (
                            <tr key={row.id} className="bg-gray-200 print:bg-gray-200 font-bold">
                                <td colSpan={totalColSpan} className="border border-black px-2 py-1 text-left">
                                    第{locationCount}現場：{row.location}
                                </td>
                            </tr>
                        );
                    }

                    if (row.type === 'break') {
                        return renderBreakRow(row as BreakRow);
                    }

                    return renderSceneRow(row as SceneRow);
                })}

                {/* 最終日メッセージ */}
                {isLastDay && lastDayMessage && (
                    <tr>
                        <td colSpan={totalColSpan} className="border border-black px-2 py-4 text-center font-bold text-lg">
                            {lastDayMessage}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};
