import React from 'react';
import type { ProjectData, DayData } from '../types.ts';

interface PreviewProps {
    projectData: ProjectData;
    dayData: DayData;
}

const Preview: React.FC<PreviewProps> = ({ projectData, dayData }) => {
    const { headerInfo, scheduleRows, footerInfo } = dayData;
    const { castMaster } = projectData;



    // Helper to format footer cast name with newline
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

    const displayTitle = projectData.title;

    const displayGroupName = projectData.groupName
        ? (projectData.groupName.endsWith('組') ? projectData.groupName : `${projectData.groupName}組`)
        : '';

    // Calculate dynamic column widths
    const fixedWidth = 12 + 6 + 4 + 4 + 4; // Time(12) + S#(6) + P(4) + D/N(4) + EX(4)
    const castWidthPerCol = 5;
    const totalCastWidth = castMaster.length * castWidthPerCol;
    const availableWidth = 100 - fixedWidth - totalCastWidth;

    // Distribute available width between SCENE and Remarks (approx 24:15 ratio)
    const sceneRatio = 24 / 39;

    const sceneWidth = Math.max(10, Math.floor(availableWidth * sceneRatio)); // Min 10%
    const remarksWidth = Math.max(5, availableWidth - sceneWidth); // Remaining width

    return (
        <div className="print-container w-full max-w-[182mm] mx-auto bg-white text-black text-xs leading-tight">
            {/* Header */}
            <div className="mb-2 border-b-2 border-black pb-1 flex justify-between items-end">
                <div>
                    <div className="flex items-end gap-4 mb-1">
                        <h1 className="text-xl font-bold">{displayTitle}</h1>
                        {displayGroupName && <span className="text-lg font-bold">{displayGroupName}</span>}
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div><span className="font-bold">日付:</span> {headerInfo.date}</div>
                        <div>
                            <span className="font-bold">集合場所:</span>{' '}
                            {headerInfo.meetingPlace ? (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(headerInfo.meetingPlace)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-blue-800"
                                >
                                    {headerInfo.meetingPlace}
                                </a>
                            ) : (
                                ''
                            )}
                        </div>
                        <div><span className="font-bold">スタッフ集合時間:</span> {headerInfo.meetingTime}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold border border-black px-2 py-1 min-w-[80px] text-center">
                        {headerInfo.versionType === 'decision' ? '決定稿' : `仮${headerInfo.versionNumber}`}
                    </div>
                </div>
            </div>

            {/* Main Schedule Table */}
            <table className="w-full border-collapse border border-black mb-2 table-fixed">
                <thead>
                    <tr className="bg-gray-100 print:bg-gray-200 text-center">
                        <th className="border border-black px-1 py-1 w-[12%]">Time</th>
                        <th className="border border-black px-1 py-1 w-[6%]">S#</th>
                        <th className="border border-black px-1 py-1 w-[4%]">P</th>
                        <th className="border border-black px-1 py-1 w-[4%]">D/N</th>
                        <th className="border border-black px-1 py-1" style={{ width: `${sceneWidth}%` }}>SCENE</th>
                        {castMaster.map((cast, index) => (
                            <th key={cast.id} className={`border border-black px-1 py-1 text-[10px] ${index === 0 ? 'border-l-4' : ''}`} style={{ width: `${castWidthPerCol}%` }}>
                                {cast.role}
                            </th>
                        ))}
                        <th className="border border-black px-1 py-1 w-[4%] text-[10px] border-r-4">EX</th>
                        <th className="border border-black px-1 py-1" style={{ width: `${remarksWidth}%` }}>備考</th>
                    </tr>
                </thead>
                <tbody>
                    {scheduleRows.reduce<{ rows: React.ReactNode[], locationCount: number }>((acc, row) => {
                        if (row.type === 'location') {
                            acc.locationCount++;
                            acc.rows.push(
                                <tr key={row.id} className="bg-gray-200 print:bg-gray-200 font-bold">
                                    <td colSpan={7 + castMaster.length} className="border border-black px-2 py-1 text-left">
                                        第{acc.locationCount}現場：{row.location}
                                    </td>
                                </tr>
                            );
                            return acc;
                        }

                        if (row.type === 'break') {
                            const optionsText = row.selectedOptions.filter(o => o !== '他').join('・');
                            const fullText = row.selectedOptions.includes('他') && row.otherText
                                ? (optionsText ? `${optionsText}・${row.otherText}` : row.otherText)
                                : optionsText;

                            acc.rows.push(
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
                                    {/* Cast Columns */}
                                    {castMaster.map((cast, index) => (
                                        <td key={cast.id} className={`border border-black px-1 py-1 text-center text-lg align-middle ${index === 0 ? 'border-l-4' : ''}`}></td>
                                    ))}
                                    {/* EX Column */}
                                    <td className="border border-black px-1 py-1 text-center text-lg align-middle border-r-4"></td>
                                    <td className="border border-black px-1 py-1 text-left whitespace-pre-wrap align-top text-xs">
                                        {row.remarks}
                                    </td>
                                </tr>
                            );
                            return acc;
                        }

                        // Scene Row (Single row layout)
                        acc.rows.push(
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
                                {/* Cast Columns */}
                                {castMaster.map((cast, index) => (
                                    <td key={cast.id} className={`border border-black px-1 py-1 text-center text-lg align-middle ${index === 0 ? 'border-l-4' : ''}`}>
                                        {row.castIds.includes(cast.id) ? '○' : ''}
                                    </td>
                                ))}
                                {/* EX Column */}
                                <td className="border border-black px-1 py-1 text-center text-lg align-middle border-r-4">
                                    {row.castIds.includes('EX') ? '○' : ''}
                                </td>
                                <td className="border border-black px-1 py-1 text-left whitespace-pre-wrap align-top text-xs">
                                    {row.remarks}
                                </td>
                            </tr>
                        );

                        // Check for UP casts
                        if (row.upCastIds && row.upCastIds.length > 0) {
                            acc.rows.push(
                                <tr key={`${row.id}-up`}>
                                    <td className="border border-black px-1 py-1 text-center h-8 font-bold"></td>
                                    <td className="border border-black px-1 py-1 text-center font-bold text-sm"></td>
                                    <td className="border border-black px-1 py-1 text-center font-bold text-sm"></td>
                                    <td className="border border-black px-1 py-1 text-center"></td>
                                    <td className="border border-black px-1 py-1 text-left whitespace-pre-wrap align-top"></td>
                                    {/* Cast Columns */}
                                    {castMaster.map((cast, index) => (
                                        <td key={cast.id} className={`border border-black px-1 py-1 text-center text-lg align-middle font-bold ${index === 0 ? 'border-l-4' : ''}`}>
                                            {row.upCastIds?.includes(cast.id) ? 'UP' : ''}
                                        </td>
                                    ))}
                                    {/* EX Column */}
                                    <td className="border border-black px-1 py-1 text-center text-lg align-middle border-r-4"></td>
                                    <td className="border border-black px-1 py-1 text-left whitespace-pre-wrap align-top text-xs"></td>
                                </tr>
                            );
                        }

                        return acc;
                    }, { rows: [], locationCount: 0 }).rows}

                    {/* Last Day Message */}
                    {dayData.isLastDay && dayData.lastDayMessage && (
                        <tr>
                            <td colSpan={7 + castMaster.length} className="border border-black px-2 py-4 text-center font-bold text-lg">
                                {dayData.lastDayMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Footer Section A: 3 Columns Info */}
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

            {/* Footer Section B: Time Table */}
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
                    {footerInfo.timeTable.map((row, index, arr) => {
                        const heightClass = row.time ? 'h-6' : 'h-3';
                        const paddingClass = row.time ? 'py-1' : 'py-0';

                        // Calculate rowSpan for Time
                        let timeRowSpan = 1;
                        if (row.time && row.time !== '') {
                            if (index > 0 && arr[index - 1].time === row.time) {
                                timeRowSpan = 0;
                            } else {
                                for (let i = index + 1; i < arr.length; i++) {
                                    if (arr[i].time === row.time) {
                                        timeRowSpan++;
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }

                        // Calculate rowSpan for Location
                        // Merge only if Time is same AND Location is same
                        let locationRowSpan = 1;
                        const isSameTimeAsPrev = index > 0 && arr[index - 1].time === row.time;
                        const isSameLocationAsPrev = index > 0 && arr[index - 1].location === row.location;

                        // If time is empty, we generally don't merge, or simple merge? 
                        // Requirement says "if time is also same". Assuming non-empty time for strict merging usually.
                        // But let's follow the logic: If current row has same time as prev AND same location as prev, hide it.

                        if (row.time && row.time !== '') {
                            if (isSameTimeAsPrev && isSameLocationAsPrev) {
                                locationRowSpan = 0;
                            } else {
                                // Count how many next rows have same time AND same location
                                for (let i = index + 1; i < arr.length; i++) {
                                    if (arr[i].time === row.time && arr[i].location === row.location) {
                                        locationRowSpan++;
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }

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
                                <td className={`border border-black px-1 ${paddingClass} ${heightClass} text-center w-[11%] text-[10px] leading-tight`}>{formatFooterCast(row.cast1)}</td>
                                <td className={`border border-black px-1 ${paddingClass} ${heightClass} text-center w-[12%] text-[10px] leading-tight`}>{formatFooterCast(row.cast2)}</td>
                                <td className={`border border-black px-1 ${paddingClass} ${heightClass} text-center w-[12%] text-[10px] leading-tight`}>{formatFooterCast(row.cast3)}</td>
                                <td className={`border border-black px-1 ${paddingClass} ${heightClass} text-left`}>{row.remarks}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Footer Section C: Contacts */}
            <div className="border-t-2 border-black pt-1 flex justify-start gap-8 text-xs">
                <div>
                    <span className="font-bold mr-2">監督:</span>
                    {footerInfo.directorContact.name} <span className="ml-2 text-sm font-bold">{footerInfo.directorContact.phone}</span>
                </div>
                <div>
                    <span className="font-bold mr-2">助監督:</span>
                    {footerInfo.assistantDirectorContact.name} <span className="ml-2 text-sm font-bold">{footerInfo.assistantDirectorContact.phone}</span>
                </div>
            </div>


        </div>
    );
};

export default Preview;
