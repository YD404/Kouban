/**
 * プレビュー画面コンポーネント
 * サブコンポーネントを組み合わせて構成
 */
import React from 'react';
import type { ProjectData, DayData } from '../types';
import { PreviewHeader, PreviewTable, PreviewFooter } from './preview/index';

interface PreviewProps {
    projectData: ProjectData;
    dayData: DayData;
}

export const Preview: React.FC<PreviewProps> = ({ projectData, dayData }) => {
    const { headerInfo, scheduleRows, footerInfo } = dayData;
    const { castMaster, title, groupName } = projectData;

    return (
        <div className="print-container w-full max-w-[182mm] mx-auto bg-white text-black text-xs leading-tight">
            <PreviewHeader
                title={title}
                groupName={groupName}
                headerInfo={headerInfo}
            />

            <PreviewTable
                scheduleRows={scheduleRows}
                castMaster={castMaster}
                isLastDay={dayData.isLastDay}
                lastDayMessage={dayData.lastDayMessage}
            />

            <PreviewFooter
                footerInfo={footerInfo}
            />
        </div>
    );
};

export default Preview;
