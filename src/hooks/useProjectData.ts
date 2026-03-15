/**
 * プロジェクトデータ管理のカスタムフック
 */
import { useState, useEffect, useCallback } from 'react';
import type { ProjectData, DayData, CastMaster, SceneRow, LocationRow, BreakRow } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { createNewDay, generateId, createDefaultTimeTableRow } from '../utils';
import { addHoursToTime, formatPhoneNumber } from '../utils/timeUtils';

const STORAGE_KEY = 'kouban_project_v1';

/**
 * デフォルトのプロジェクトデータ
 */
const createDefaultProjectData = (): ProjectData => ({
    title: '撮影香盤表',
    groupName: '',
    castMaster: [{ id: '1', role: '', name: '' }],
    days: [createNewDay(generateId())],
});

/**
 * プロジェクトデータを管理するフック
 */
export function useProjectData() {
    const [projectData, setProjectData] = useLocalStorage<ProjectData>(
        STORAGE_KEY,
        createDefaultProjectData()
    );

    const [currentDayId, setCurrentDayId] = useState<string>(() => {
        return projectData.days[0]?.id || '';
    });

    // currentDayIdの有効性を保証
    useEffect(() => {
        if (!projectData.days.find(d => d.id === currentDayId)) {
            if (projectData.days.length > 0) {
                setCurrentDayId(projectData.days[0].id);
            }
        }
    }, [projectData.days, currentDayId]);

    // 現在の日データを取得
    const currentDay = projectData.days.find(d => d.id === currentDayId) || projectData.days[0];

    // 現在の日データを更新するヘルパー
    const updateCurrentDay = useCallback((updater: (day: DayData) => DayData) => {
        setProjectData(prev => ({
            ...prev,
            days: prev.days.map(d => d.id === currentDayId ? updater(d) : d)
        }));
    }, [currentDayId, setProjectData]);

    // === プロジェクトレベルの操作 ===

    const updateTitle = useCallback((title: string) => {
        setProjectData(prev => ({ ...prev, title }));
    }, [setProjectData]);

    const updateGroupName = useCallback((groupName: string) => {
        setProjectData(prev => ({ ...prev, groupName }));
    }, [setProjectData]);

    // === キャスト管理 ===

    const addCast = useCallback(() => {
        const newCast: CastMaster = {
            id: generateId(),
            role: '',
            name: '',
        };
        setProjectData(prev => ({
            ...prev,
            castMaster: [...prev.castMaster, newCast]
        }));
    }, [setProjectData]);

    const updateCast = useCallback((id: string, field: keyof CastMaster, value: string) => {
        setProjectData(prev => ({
            ...prev,
            castMaster: prev.castMaster.map((cast) =>
                cast.id === id ? { ...cast, [field]: value } : cast
            ),
        }));
    }, [setProjectData]);

    const deleteCast = useCallback((id: string) => {
        setProjectData(prev => ({
            ...prev,
            castMaster: prev.castMaster.filter((cast) => cast.id !== id),
        }));
    }, [setProjectData]);

    // === 日付管理 ===

    const addDay = useCallback(() => {
        const newId = generateId();
        const newDay = createNewDay(newId);

        // 前日のデータをコピー
        const lastDay = projectData.days[projectData.days.length - 1];
        if (lastDay) {
            newDay.headerInfo.meetingPlace = lastDay.headerInfo.meetingPlace;
            newDay.headerInfo.meetingTime = lastDay.headerInfo.meetingTime;
            newDay.footerInfo = JSON.parse(JSON.stringify(lastDay.footerInfo));
        }

        setProjectData(prev => ({
            ...prev,
            days: [...prev.days, newDay]
        }));
        setCurrentDayId(newId);
        return newId;
    }, [projectData.days, setProjectData]);

    const deleteDay = useCallback((dayId: string) => {
        if (projectData.days.length <= 1) {
            return false;
        }

        const dayIndex = projectData.days.findIndex(d => d.id === dayId);
        const newDays = projectData.days.filter(d => d.id !== dayId);

        setProjectData(prev => ({ ...prev, days: newDays }));

        if (currentDayId === dayId) {
            let newIndex = dayIndex;
            if (newIndex >= newDays.length) {
                newIndex = newDays.length - 1;
            }
            setCurrentDayId(newDays[newIndex].id);
        }
        return true;
    }, [projectData.days, currentDayId, setProjectData]);

    const selectDay = useCallback((dayId: string) => {
        setCurrentDayId(dayId);
    }, []);

    // === ヘッダー情報 ===

    const updateHeader = useCallback((field: keyof DayData['headerInfo'], value: string) => {
        updateCurrentDay(day => ({
            ...day,
            headerInfo: { ...day.headerInfo, [field]: value }
        }));
    }, [updateCurrentDay]);

    // === スケジュール行管理 ===

    const getLastEndTime = useCallback((): string => {
        if (!currentDay) return '';

        for (let i = currentDay.scheduleRows.length - 1; i >= 0; i--) {
            const row = currentDay.scheduleRows[i];
            if (row.type === 'scene' || row.type === 'break') {
                return row.endTime;
            }
        }

        // 最後の行がなければ集合時間+1時間
        if (currentDay.headerInfo.meetingTime) {
            return addHoursToTime(currentDay.headerInfo.meetingTime, 1);
        }

        return '';
    }, [currentDay]);

    const addSceneRow = useCallback((index?: number) => {
        const initialStartTime = getLastEndTime();
        const newRow: SceneRow = {
            id: generateId(),
            type: 'scene',
            startTime: initialStartTime,
            endTime: '',
            sceneNumber: '',
            pageNumber: '',
            dn: 'D',
            description: '',
            castIds: [],
            upCastIds: [],
        };
        updateCurrentDay(day => {
            const newRows = [...day.scheduleRows];
            if (index !== undefined && index >= 0 && index <= newRows.length) {
                newRows.splice(index, 0, newRow);
            } else {
                newRows.push(newRow);
            }
            return { ...day, scheduleRows: newRows };
        });
    }, [getLastEndTime, updateCurrentDay]);

    const addBreakRow = useCallback((index?: number) => {
        const initialStartTime = getLastEndTime();
        const initialEndTime = initialStartTime ? addHoursToTime(initialStartTime, 1) : '';

        const newRow: BreakRow = {
            id: generateId(),
            type: 'break',
            startTime: initialStartTime,
            endTime: initialEndTime,
            selectedOptions: [],
            otherText: '',
        };
        updateCurrentDay(day => {
            const newRows = [...day.scheduleRows];
            if (index !== undefined && index >= 0 && index <= newRows.length) {
                newRows.splice(index, 0, newRow);
            } else {
                newRows.push(newRow);
            }
            return { ...day, scheduleRows: newRows };
        });
    }, [getLastEndTime, updateCurrentDay]);

    const addLocationRow = useCallback((index?: number) => {
        const newRow: LocationRow = {
            id: generateId(),
            type: 'location',
            location: '',
        };
        updateCurrentDay(day => {
            const newRows = [...day.scheduleRows];
            if (index !== undefined && index >= 0 && index <= newRows.length) {
                newRows.splice(index, 0, newRow);
            } else {
                newRows.push(newRow);
            }
            return { ...day, scheduleRows: newRows };
        });
    }, [updateCurrentDay]);

    const updateRow = useCallback((id: string, field: string, value: unknown) => {
        updateCurrentDay(day => ({
            ...day,
            scheduleRows: day.scheduleRows.map((row) =>
                row.id === id ? { ...row, [field]: value } : row
            )
        }));
    }, [updateCurrentDay]);

    const deleteRow = useCallback((id: string) => {
        updateCurrentDay(day => ({
            ...day,
            scheduleRows: day.scheduleRows.filter((row) => row.id !== id)
        }));
    }, [updateCurrentDay]);

    const moveRow = useCallback((index: number, direction: 'up' | 'down') => {
        updateCurrentDay(day => {
            const newRows = [...day.scheduleRows];
            if (direction === 'up' && index > 0) {
                [newRows[index], newRows[index - 1]] = [newRows[index - 1], newRows[index]];
            } else if (direction === 'down' && index < newRows.length - 1) {
                [newRows[index], newRows[index + 1]] = [newRows[index + 1], newRows[index]];
            }
            return { ...day, scheduleRows: newRows };
        });
    }, [updateCurrentDay]);

    const toggleCastSelection = useCallback((rowId: string, castId: string) => {
        updateCurrentDay(day => ({
            ...day,
            scheduleRows: day.scheduleRows.map((row) => {
                if (row.id !== rowId || row.type !== 'scene') return row;
                const newCastIds = row.castIds.includes(castId)
                    ? row.castIds.filter((id) => id !== castId)
                    : [...row.castIds, castId];
                return { ...row, castIds: newCastIds };
            })
        }));
    }, [updateCurrentDay]);

    const toggleUpCastSelection = useCallback((rowId: string, castId: string) => {
        updateCurrentDay(day => ({
            ...day,
            scheduleRows: day.scheduleRows.map((row) => {
                if (row.id !== rowId || row.type !== 'scene') return row;
                const currentUpCastIds = row.upCastIds || [];
                const newUpCastIds = currentUpCastIds.includes(castId)
                    ? currentUpCastIds.filter((id) => id !== castId)
                    : [...currentUpCastIds, castId];
                return { ...row, upCastIds: newUpCastIds };
            })
        }));
    }, [updateCurrentDay]);

    const toggleBreakOption = useCallback((rowId: string, option: string) => {
        updateCurrentDay(day => ({
            ...day,
            scheduleRows: day.scheduleRows.map((row) => {
                if (row.id !== rowId || row.type !== 'break') return row;
                const newOptions = row.selectedOptions.includes(option)
                    ? row.selectedOptions.filter((o) => o !== option)
                    : [...row.selectedOptions, option];
                return { ...row, selectedOptions: newOptions };
            })
        }));
    }, [updateCurrentDay]);

    // === フッター情報 ===

    const updateFooter = useCallback((field: keyof DayData['footerInfo'], value: unknown) => {
        updateCurrentDay(day => ({
            ...day,
            footerInfo: { ...day.footerInfo, [field]: value }
        }));
    }, [updateCurrentDay]);

    const updateTimeTableRow = useCallback((index: number, field: string, value: string) => {
        updateCurrentDay(day => {
            const newTimeTable = [...day.footerInfo.timeTable];
            newTimeTable[index] = { ...newTimeTable[index], [field]: value };
            return {
                ...day,
                footerInfo: { ...day.footerInfo, timeTable: newTimeTable }
            };
        });
    }, [updateCurrentDay]);

    const addTimeTableRow = useCallback(() => {
        updateCurrentDay(day => ({
            ...day,
            footerInfo: {
                ...day.footerInfo,
                timeTable: [...day.footerInfo.timeTable, createDefaultTimeTableRow()]
            }
        }));
    }, [updateCurrentDay]);

    const deleteTimeTableRow = useCallback((index: number) => {
        updateCurrentDay(day => ({
            ...day,
            footerInfo: {
                ...day.footerInfo,
                timeTable: day.footerInfo.timeTable.filter((_, i) => i !== index)
            }
        }));
    }, [updateCurrentDay]);

    const updateContact = useCallback((
        type: 'directorContact' | 'assistantDirectorContact',
        field: 'name' | 'phone',
        value: string
    ) => {
        const newValue = field === 'phone' ? formatPhoneNumber(value) : value;
        updateCurrentDay(day => ({
            ...day,
            footerInfo: {
                ...day.footerInfo,
                [type]: { ...day.footerInfo[type], [field]: newValue }
            }
        }));
    }, [updateCurrentDay]);

    const updateLastDay = useCallback((isLastDay: boolean) => {
        updateCurrentDay(day => ({ ...day, isLastDay }));
    }, [updateCurrentDay]);

    const updateLastDayMessage = useCallback((message: string) => {
        updateCurrentDay(day => ({ ...day, lastDayMessage: message }));
    }, [updateCurrentDay]);

    // === 初期化 ===

    const initialize = useCallback(() => {
        const newData = createDefaultProjectData();
        setProjectData(newData);
        setCurrentDayId(newData.days[0].id);
    }, [setProjectData]);

    // === データ読み込み ===

    const loadData = useCallback((data: ProjectData) => {
        setProjectData(data);
        if (data.days.length > 0) {
            setCurrentDayId(data.days[0].id);
        }
    }, [setProjectData]);

    return {
        // データ
        projectData,
        currentDay,
        currentDayId,

        // プロジェクトレベル
        updateTitle,
        updateGroupName,
        initialize,
        loadData,

        // キャスト
        addCast,
        updateCast,
        deleteCast,

        // 日付
        addDay,
        deleteDay,
        selectDay,

        // ヘッダー
        updateHeader,

        // スケジュール行
        addSceneRow,
        addBreakRow,
        addLocationRow,
        updateRow,
        deleteRow,
        moveRow,
        toggleCastSelection,
        toggleUpCastSelection,
        toggleBreakOption,

        // フッター
        updateFooter,
        updateTimeTableRow,
        addTimeTableRow,
        deleteTimeTableRow,
        updateContact,
        updateLastDay,
        updateLastDayMessage,
    };
}
