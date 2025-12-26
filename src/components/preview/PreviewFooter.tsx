/**
 * プレビューフッターコンポーネント
 */
import React from 'react';
import type { FooterInfo, TimeTableRow } from '../../types';

interface PreviewFooterProps {
    footerInfo: FooterInfo;
}

// フッターのキャスト名フォーマット
const formatFooterCast = (name: string) => {
    if (!name) return '';
    const parts = name.split(' (');
    if (parts.length === 2) {
        return (
            <>
                {parts[0]}<br />
                ({parts[1]}
            </>
        );
    }
    return name;
};

export const PreviewFooter: React.FC<PreviewFooterProps> = ({
    footerInfo,
}) => {
    // タイムテーブルの行スパン計算ロジック
    const calculateRowSpans = (rows: TimeTableRow[], index: number) => {
        const row = rows[index];
        let timeRowSpan = 1;
        let locationRowSpan = 1;

        // Time のrowSpan計算
        if (row.time && row.time !== '') {
            if (index > 0 && rows[index - 1].time === row.time) {
                timeRowSpan = 0;
            } else {
                for (let i = index + 1; i < rows.length; i++) {
                    if (rows[i].time === row.time) {
                        timeRowSpan++;
                    } else {
                        break;
                    }
                }
            }
        }

        // Location のrowSpan計算
        const isSameTimeAsPrev = index > 0 && rows[index - 1].time === row.time;
        const isSameLocationAsPrev = index > 0 && rows[index - 1].location === row.location;

        if (row.time && row.time !== '') {
            if (isSameTimeAsPrev && isSameLocationAsPrev) {
                locationRowSpan = 0;
            } else {
                for (let i = index + 1; i < rows.length; i++) {
                    if (rows[i].time === row.time && rows[i].location === row.location) {
                        locationRowSpan++;
                    } else {
                        break;
                    }
                }
            }
        }

        return { timeRowSpan, locationRowSpan };
    };

    return (
        <>
            {/* セクションA: 備考・車両・エキストラ */}
            <table className="w-full border-collapse border border-black mb-2 table-fixed">
                <thead>
                    <tr className="bg-gray-100 print:bg-gray-200 text-center text-xs">
                        <th className="border border-black px-1 py-1 w-1/3">備考</th>
                        <th className="border border-black px-1 py-1 w-1/3">車両 等</th>
                        <th className="border border-black px-1 py-1 w-1/3">エキストラ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black px-2 py-1 h-24 align-top whitespace-pre-wrap">{footerInfo.remarks}</td>
                        <td className="border border-black px-2 py-1 h-24 align-top whitespace-pre-wrap">{footerInfo.vehicles}</td>
                        <td className="border border-black px-2 py-1 h-24 align-top whitespace-pre-wrap">{footerInfo.extras}</td>
                    </tr>
                </tbody>
            </table>

            {/* セクションB: タイムテーブル */}
            <table className="w-full border-collapse border border-black mb-2 table-fixed">
                <thead>
                    <tr className="bg-gray-100 print:bg-gray-200 text-center text-xs">
                        <th className="border border-black px-1 py-1 w-[15%]">入り時間</th>
                        <th className="border border-black px-1 py-1 w-[25%]">場所</th>
                        <th colSpan={3} className="border border-black px-1 py-1 w-[35%]">出演者 (敬称略)</th>
                        <th className="border border-black px-1 py-1 w-[25%]">備考</th>
                    </tr>
                </thead>
                <tbody>
                    {footerInfo.timeTable.map((row, index) => {
                        const { timeRowSpan, locationRowSpan } = calculateRowSpans(footerInfo.timeTable, index);
                        const heightClass = row.time ? 'h-6' : 'h-3';
                        const paddingClass = row.time ? 'py-1' : 'py-0';

                        return (
                            <tr key={index}>
                                {timeRowSpan > 0 && (
                                    <td
                                        className={`border border-black px-1 ${paddingClass} ${heightClass} text-center align-middle`}
                                        rowSpan={timeRowSpan}
                                    >
                                        {row.time}
                                    </td>
                                )}
                                {locationRowSpan > 0 && (
                                    <td
                                        className={`border border-black px-1 ${paddingClass} ${heightClass} text-center align-middle`}
                                        rowSpan={locationRowSpan}
                                    >
                                        {row.location}
                                    </td>
                                )}
                                <td className={`border border-black px-1 ${paddingClass} ${heightClass} text-center w-[11%] text-[10px] leading-tight`}>
                                    {formatFooterCast(row.cast1)}
                                </td>
                                <td className={`border border-black px-1 ${paddingClass} ${heightClass} text-center w-[12%] text-[10px] leading-tight`}>
                                    {formatFooterCast(row.cast2)}
                                </td>
                                <td className={`border border-black px-1 ${paddingClass} ${heightClass} text-center w-[12%] text-[10px] leading-tight`}>
                                    {formatFooterCast(row.cast3)}
                                </td>
                                <td className={`border border-black px-1 ${paddingClass} ${heightClass} text-left`}>{row.remarks}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* セクションC: 連絡先 */}
            <div className="border-t-2 border-black pt-1 flex justify-start gap-8 text-xs">
                <div>
                    <span className="font-bold mr-2">監督:</span>
                    {footerInfo.directorContact.name}{' '}
                    <span className="ml-2 text-sm font-bold">{footerInfo.directorContact.phone}</span>
                </div>
                <div>
                    <span className="font-bold mr-2">助監督:</span>
                    {footerInfo.assistantDirectorContact.name}{' '}
                    <span className="ml-2 text-sm font-bold">{footerInfo.assistantDirectorContact.phone}</span>
                </div>
            </div>
        </>
    );
};
