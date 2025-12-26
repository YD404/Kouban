/**
 * 基本情報セクションコンポーネント
 */
import React from 'react';
import type { ProjectData, DayData, CastMaster } from '../../types';
import { CastManager } from './CastManager';

interface BasicInfoSectionProps {
    projectData: ProjectData;
    currentDay: DayData;
    onUpdateTitle: (title: string) => void;
    onUpdateGroupName: (groupName: string) => void;
    onUpdateHeader: (field: keyof DayData['headerInfo'], value: string) => void;
    onAddCast: () => void;
    onUpdateCast: (id: string, field: keyof CastMaster, value: string) => void;
    onDeleteCast: (id: string) => void;
    onNext: () => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
    projectData,
    currentDay,
    onUpdateTitle,
    onUpdateGroupName,
    onUpdateHeader,
    onAddCast,
    onUpdateCast,
    onDeleteCast,
    onNext,
}) => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-base font-bold mb-2">タイトル</label>
                    <input
                        type="text"
                        value={projectData.title}
                        onChange={(e) => onUpdateTitle(e.target.value)}
                        className="w-full border p-3 rounded text-base"
                        placeholder="撮影香盤表"
                    />
                </div>
                <div>
                    <label className="block text-base font-bold mb-2">組名</label>
                    <input
                        type="text"
                        value={projectData.groupName}
                        onChange={(e) => onUpdateGroupName(e.target.value)}
                        className="w-full border p-3 rounded text-base"
                        placeholder="〇〇組"
                    />
                </div>
                <div>
                    <label className="block text-base font-bold mb-2">日付</label>
                    <input
                        type="date"
                        value={currentDay.headerInfo.date}
                        onChange={(e) => onUpdateHeader('date', e.target.value)}
                        className="w-full border p-3 rounded text-base"
                    />
                </div>
                <div>
                    <label className="block text-base font-bold mb-2">集合場所</label>
                    <input
                        type="text"
                        value={currentDay.headerInfo.meetingPlace}
                        onChange={(e) => onUpdateHeader('meetingPlace', e.target.value)}
                        className="w-full border p-3 rounded text-base"
                    />
                </div>
                <div>
                    <label className="block text-base font-bold mb-2">集合時間</label>
                    <input
                        type="time"
                        value={currentDay.headerInfo.meetingTime}
                        onChange={(e) => onUpdateHeader('meetingTime', e.target.value)}
                        className="w-full border p-3 rounded text-base"
                    />
                </div>
                <div>
                    <label className="block text-base font-bold mb-2">版数</label>
                    <div className="flex gap-4 items-center h-12">
                        <label className="flex items-center gap-2 cursor-pointer text-base">
                            <input
                                type="radio"
                                name="versionType"
                                checked={currentDay.headerInfo.versionType === 'decision'}
                                onChange={() => onUpdateHeader('versionType', 'decision')}
                                className="w-5 h-5"
                            />
                            決定稿
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-base">
                            <input
                                type="radio"
                                name="versionType"
                                checked={currentDay.headerInfo.versionType === 'provisional'}
                                onChange={() => onUpdateHeader('versionType', 'provisional')}
                                className="w-5 h-5"
                            />
                            仮
                        </label>
                        {currentDay.headerInfo.versionType === 'provisional' && (
                            <input
                                type="number"
                                value={currentDay.headerInfo.versionNumber}
                                onChange={(e) => onUpdateHeader('versionNumber', e.target.value)}
                                className="w-20 border p-2 rounded text-base"
                                placeholder="番号"
                            />
                        )}
                    </div>
                </div>
            </div>

            <CastManager
                castMaster={projectData.castMaster}
                onAddCast={onAddCast}
                onUpdateCast={onUpdateCast}
                onDeleteCast={onDeleteCast}
            />

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
