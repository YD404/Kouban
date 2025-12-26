/**
 * プレビューヘッダーコンポーネント
 */
import React from 'react';
import type { ScheduleHeader } from '../../types';

interface PreviewHeaderProps {
    title: string;
    groupName: string;
    headerInfo: ScheduleHeader;
}

export const PreviewHeader: React.FC<PreviewHeaderProps> = ({
    title,
    groupName,
    headerInfo,
}) => {
    const displayGroupName = groupName
        ? (groupName.endsWith('組') ? groupName : `${groupName}組`)
        : '';

    return (
        <div className="mb-2 border-b-2 border-black pb-1 flex justify-between items-end">
            <div>
                <div className="flex items-end gap-4 mb-1">
                    <h1 className="text-xl font-bold">{title}</h1>
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
    );
};
