/**
 * 編集画面コンポーネント
 * サブコンポーネントを組み合わせて構成
 */
import React, { useState, useEffect } from 'react';
import type { ProjectData, DayData, CastMaster } from '../types';
import { DaySelector, BasicInfoSection, ScheduleSection, FooterSection } from './editor/index';
import { Accordion } from './ui/index';
import { scrollToTop, DESKTOP_SCROLL_CONTAINER } from '../utils';

type ActiveSection = 'basic' | 'schedule' | 'footer';

interface EditorProps {
    projectData: ProjectData;
    currentDay: DayData;
    currentDayId: string;
    // プロジェクトレベル
    onUpdateTitle: (title: string) => void;
    onUpdateGroupName: (groupName: string) => void;
    // キャスト
    onAddCast: () => void;
    onUpdateCast: (id: string, field: keyof CastMaster, value: string) => void;
    onDeleteCast: (id: string) => void;
    // 日付
    onAddDay: () => void;
    onDeleteDay: (dayId: string) => void;
    onSelectDay: (dayId: string) => void;
    // ヘッダー
    onUpdateHeader: (field: keyof DayData['headerInfo'], value: string) => void;
    // スケジュール行
    onAddSceneRow: () => void;
    onAddBreakRow: () => void;
    onAddLocationRow: () => void;
    onUpdateRow: (id: string, field: string, value: unknown) => void;
    onDeleteRow: (id: string) => void;
    onMoveRow: (index: number, direction: 'up' | 'down') => void;
    onToggleCast: (rowId: string, castId: string) => void;
    onToggleUpCast: (rowId: string, castId: string) => void;
    onToggleBreakOption: (rowId: string, option: string) => void;
    // フッター
    onUpdateFooter: (field: keyof DayData['footerInfo'], value: unknown) => void;
    onUpdateTimeTableRow: (index: number, field: string, value: string) => void;
    onAddTimeTableRow: () => void;
    onDeleteTimeTableRow: (index: number) => void;
    onUpdateContact: (
        type: 'directorContact' | 'assistantDirectorContact',
        field: 'name' | 'phone',
        value: string
    ) => void;
    onUpdateLastDay: (isLastDay: boolean) => void;
    onUpdateLastDayMessage: (message: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
    projectData,
    currentDay,
    currentDayId,
    onUpdateTitle,
    onUpdateGroupName,
    onAddCast,
    onUpdateCast,
    onDeleteCast,
    onAddDay,
    onDeleteDay,
    onSelectDay,
    onUpdateHeader,
    onAddSceneRow,
    onAddBreakRow,
    onAddLocationRow,
    onUpdateRow,
    onDeleteRow,
    onMoveRow,
    onToggleCast,
    onToggleUpCast,
    onToggleBreakOption,
    onUpdateFooter,
    onUpdateTimeTableRow,
    onAddTimeTableRow,
    onDeleteTimeTableRow,
    onUpdateContact,
    onUpdateLastDay,
    onUpdateLastDayMessage,
}) => {
    const [activeSection, setActiveSection] = useState<ActiveSection>('basic');

    // セクション変更時にスクロールをリセット
    useEffect(() => {
        scrollToTop(DESKTOP_SCROLL_CONTAINER);
    }, [activeSection]);

    // 日付追加時にもスクロールをリセット
    const handleAddDay = () => {
        onAddDay();
        setActiveSection('basic');
        scrollToTop(DESKTOP_SCROLL_CONTAINER);
    };

    const toggleSection = (section: ActiveSection) => {
        setActiveSection(activeSection === section ? 'basic' : section);
    };

    if (!currentDay) return null;

    return (
        <div className="space-y-6">
            {/* 日付選択タブ */}
            <DaySelector
                days={projectData.days}
                currentDayId={currentDayId}
                onSelectDay={onSelectDay}
                onAddDay={handleAddDay}
                onDeleteDay={onDeleteDay}
            />

            {/* 1. 基本情報 & キャスト */}
            <Accordion
                title="1. 基本情報 & キャスト登録"
                isOpen={activeSection === 'basic'}
                onToggle={() => toggleSection('basic')}
            >
                <BasicInfoSection
                    projectData={projectData}
                    currentDay={currentDay}
                    onUpdateTitle={onUpdateTitle}
                    onUpdateGroupName={onUpdateGroupName}
                    onUpdateHeader={onUpdateHeader}
                    onAddCast={onAddCast}
                    onUpdateCast={onUpdateCast}
                    onDeleteCast={onDeleteCast}
                    onNext={() => setActiveSection('schedule')}
                />
            </Accordion>

            {/* 2. スケジュール詳細 */}
            <Accordion
                title="2. スケジュール詳細"
                isOpen={activeSection === 'schedule'}
                onToggle={() => toggleSection('schedule')}
            >
                <ScheduleSection
                    currentDay={currentDay}
                    castMaster={projectData.castMaster}
                    onAddSceneRow={onAddSceneRow}
                    onAddBreakRow={onAddBreakRow}
                    onAddLocationRow={onAddLocationRow}
                    onUpdateRow={onUpdateRow}
                    onDeleteRow={onDeleteRow}
                    onMoveRow={onMoveRow}
                    onToggleCast={onToggleCast}
                    onToggleUpCast={onToggleUpCast}
                    onToggleBreakOption={onToggleBreakOption}
                    onUpdateLastDay={onUpdateLastDay}
                    onUpdateLastDayMessage={onUpdateLastDayMessage}
                    onNext={() => setActiveSection('footer')}
                />
            </Accordion>

            {/* 3. フッター情報 */}
            <Accordion
                title="3. フッター情報"
                isOpen={activeSection === 'footer'}
                onToggle={() => toggleSection('footer')}
            >
                <FooterSection
                    currentDay={currentDay}
                    castMaster={projectData.castMaster}
                    onUpdateFooter={onUpdateFooter}
                    onUpdateTimeTableRow={onUpdateTimeTableRow}
                    onAddTimeTableRow={onAddTimeTableRow}
                    onDeleteTimeTableRow={onDeleteTimeTableRow}
                    onUpdateContact={onUpdateContact}
                    onAddDay={handleAddDay}
                    onPrint={() => window.print()}
                />
            </Accordion>
        </div>
    );
};

export default Editor;
