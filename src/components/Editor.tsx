import React, { useState, useEffect } from 'react';
import type { ProjectData, DayData, SceneRow, LocationRow, BreakRow, CastMaster, ContactInfo } from '../types.ts';

interface EditorProps {
    projectData: ProjectData;
    setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
    currentDayId: string;
    setCurrentDayId: (id: string) => void;
    createNewDay: (id: string) => DayData;
}

const Editor: React.FC<EditorProps> = ({
    projectData,
    setProjectData,
    currentDayId,
    setCurrentDayId,
    createNewDay,
}) => {
    const [activeSection, setActiveSection] = useState<'basic' | 'schedule' | 'footer'>('basic');

    const currentDay = projectData.days.find(d => d.id === currentDayId);
    if (!currentDay) return null;

    const toggleSection = (section: 'basic' | 'schedule' | 'footer') => {
        setActiveSection(activeSection === section ? 'basic' : section);
    };

    // Scroll to top when section changes
    useEffect(() => {
        // Try to find the scrollable container in desktop view
        const scrollContainer = document.querySelector('.lg\\:overflow-y-auto');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // Also scroll window for mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeSection]);

    // --- Project Level Handlers ---
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProjectData(prev => ({ ...prev, title: e.target.value }));
    };

    const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProjectData(prev => ({ ...prev, groupName: e.target.value }));
    };

    // --- Day Management ---
    const handleAddDay = () => {
        const newId = crypto.randomUUID();
        const newDay = createNewDay(newId);

        // Copy previous day's data if available (except date/time/version)
        const lastDay = projectData.days[projectData.days.length - 1];
        if (lastDay) {
            newDay.headerInfo.meetingPlace = lastDay.headerInfo.meetingPlace;
            newDay.headerInfo.meetingTime = lastDay.headerInfo.meetingTime;
            newDay.footerInfo = JSON.parse(JSON.stringify(lastDay.footerInfo)); // Deep copy footer
        }

        setProjectData(prev => ({
            ...prev,
            days: [...prev.days, newDay]
        }));
        setCurrentDayId(newId);
        setActiveSection('basic');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const scrollContainer = document.querySelector('.lg\\:overflow-y-auto');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleDaySelect = (id: string) => {
        setCurrentDayId(id);
    };

    const updateCurrentDay = (updater: (day: DayData) => DayData) => {
        setProjectData(prev => ({
            ...prev,
            days: prev.days.map(d => d.id === currentDayId ? updater(d) : d)
        }));
    };

    // --- Header Handlers ---
    const handleHeaderChange = (field: keyof DayData['headerInfo'], value: string) => {
        updateCurrentDay(day => ({
            ...day,
            headerInfo: { ...day.headerInfo, [field]: value }
        }));
    };

    // --- Cast Master Handlers ---
    const handleAddCast = () => {
        const newCast: CastMaster = {
            id: crypto.randomUUID(),
            role: '',
            name: '',
        };
        setProjectData(prev => ({
            ...prev,
            castMaster: [...prev.castMaster, newCast]
        }));
    };

    const handleCastChange = (id: string, field: keyof CastMaster, value: string) => {
        setProjectData(prev => ({
            ...prev,
            castMaster: prev.castMaster.map((cast) =>
                cast.id === id ? { ...cast, [field]: value } : cast
            ),
        }));
    };

    const handleDeleteCast = (id: string) => {
        setProjectData(prev => ({
            ...prev,
            castMaster: prev.castMaster.filter((cast) => cast.id !== id),
        }));
    };

    // --- Schedule Handlers ---
    const addSceneRow = () => {
        // Find last row that has an endTime (scene or break)
        let lastEndTimeRow = null;
        for (let i = currentDay.scheduleRows.length - 1; i >= 0; i--) {
            const row = currentDay.scheduleRows[i];
            if (row.type === 'scene' || row.type === 'break') {
                lastEndTimeRow = row;
                break;
            }
        }

        let initialStartTime = '';

        if (lastEndTimeRow) {
            initialStartTime = lastEndTimeRow.endTime;
        } else if (currentDay.headerInfo.meetingTime) {
            const [h, m] = currentDay.headerInfo.meetingTime.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
                const date = new Date();
                date.setHours(h + 1, m);
                initialStartTime = date.toTimeString().slice(0, 5);
            }
        }

        const newRow: SceneRow = {
            id: crypto.randomUUID(),
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
        updateCurrentDay(day => ({
            ...day,
            scheduleRows: [...day.scheduleRows, newRow]
        }));
    };

    const addBreakRow = () => {
        // Find last row that has an endTime (scene or break)
        let lastEndTimeRow = null;
        for (let i = currentDay.scheduleRows.length - 1; i >= 0; i--) {
            const row = currentDay.scheduleRows[i];
            if (row.type === 'scene' || row.type === 'break') {
                lastEndTimeRow = row;
                break;
            }
        }

        let initialStartTime = '';

        if (lastEndTimeRow) {
            initialStartTime = lastEndTimeRow.endTime;
        } else if (currentDay.headerInfo.meetingTime) {
            const [h, m] = currentDay.headerInfo.meetingTime.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
                const date = new Date();
                date.setHours(h + 1, m);
                initialStartTime = date.toTimeString().slice(0, 5);
            }
        }

        let initialEndTime = '';
        if (initialStartTime) {
            const [h, m] = initialStartTime.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
                const date = new Date();
                date.setHours(h + 1, m);
                initialEndTime = date.toTimeString().slice(0, 5);
            }
        }

        const newRow: BreakRow = {
            id: crypto.randomUUID(),
            type: 'break',
            startTime: initialStartTime,
            endTime: initialEndTime,
            selectedOptions: [],
            otherText: '',
        };
        updateCurrentDay(day => ({
            ...day,
            scheduleRows: [...day.scheduleRows, newRow]
        }));
    };

    const addLocationRow = () => {
        const newRow: LocationRow = {
            id: crypto.randomUUID(),
            type: 'location',
            location: '',
        };
        updateCurrentDay(day => ({
            ...day,
            scheduleRows: [...day.scheduleRows, newRow]
        }));
    };

    const handleRowChange = (id: string, field: keyof SceneRow | keyof LocationRow | keyof BreakRow, value: any) => {
        updateCurrentDay(day => ({
            ...day,
            scheduleRows: day.scheduleRows.map((row) => {
                if (row.id !== id) return row;
                if (row.type === 'scene') {
                    return { ...row, [field]: value };
                } else if (row.type === 'break') {
                    return { ...row, [field]: value };
                } else {
                    return { ...row, [field]: value };
                }
            })
        }));
    };

    const handleBreakOptionChange = (rowId: string, option: string) => {
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
    };

    const handleCastSelection = (rowId: string, castId: string) => {
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
    };

    const handleUpCastSelection = (rowId: string, castId: string) => {
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
    };

    const handleDeleteRow = (id: string) => {
        updateCurrentDay(day => ({
            ...day,
            scheduleRows: day.scheduleRows.filter((row) => row.id !== id)
        }));
    };

    const handleMoveRow = (index: number, direction: 'up' | 'down') => {
        const newRows = [...currentDay.scheduleRows];
        if (direction === 'up' && index > 0) {
            [newRows[index], newRows[index - 1]] = [newRows[index - 1], newRows[index]];
        } else if (direction === 'down' && index < newRows.length - 1) {
            [newRows[index], newRows[index + 1]] = [newRows[index + 1], newRows[index]];
        }
        updateCurrentDay(day => ({ ...day, scheduleRows: newRows }));
    };

    // --- Footer Handlers ---
    const handleFooterChange = (field: keyof typeof currentDay.footerInfo, value: any) => {
        updateCurrentDay(day => ({
            ...day,
            footerInfo: { ...day.footerInfo, [field]: value }
        }));
    };

    const handleTimeTableChange = (index: number, field: string, value: string) => {
        const newTimeTable = [...currentDay.footerInfo.timeTable];
        newTimeTable[index] = { ...newTimeTable[index], [field]: value };
        handleFooterChange('timeTable', newTimeTable);
    };

    const handleAddTimeTableRow = () => {
        const newRow = {
            time: '',
            location: '',
            cast1: '',
            cast2: '',
            cast3: '',
            remarks: '',
        };
        handleFooterChange('timeTable', [...currentDay.footerInfo.timeTable, newRow]);
    };

    const handleDeleteTimeTableRow = (index: number) => {
        const newTimeTable = currentDay.footerInfo.timeTable.filter((_, i) => i !== index);
        handleFooterChange('timeTable', newTimeTable);
    };

    const handleContactChange = (type: 'directorContact' | 'assistantDirectorContact', field: keyof ContactInfo, value: string) => {
        let newValue = value;
        if (field === 'phone') {
            const numbers = value.replace(/[^\d]/g, '');
            if (numbers.length === 11) {
                newValue = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
            }
        }
        updateCurrentDay(day => ({
            ...day,
            footerInfo: {
                ...day.footerInfo,
                [type]: { ...day.footerInfo[type], [field]: newValue }
            }
        }));
    };

    const handleLastDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateCurrentDay(day => ({ ...day, isLastDay: e.target.checked }));
    };

    const handleLastDayMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateCurrentDay(day => ({ ...day, lastDayMessage: e.target.value }));
    };

    const handleDeleteDay = (dayId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (projectData.days.length <= 1) {
            alert('最後の日付は削除できません。');
            return;
        }
        if (!window.confirm('この日付を削除しますか？')) return;

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
    };

    return (
        <div className="space-y-6">
            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b">
                {projectData.days.map((day, index) => (
                    <div
                        key={day.id}
                        onClick={() => handleDaySelect(day.id)}
                        className={`flex items-center px-4 py-2 rounded whitespace-nowrap cursor-pointer ${day.id === currentDayId
                            ? 'bg-[#8c1822] text-white font-bold'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                    >
                        <span>{day.headerInfo.date || `Day ${index + 1}`}</span>
                        {projectData.days.length > 1 && (
                            <button
                                onClick={(e) => handleDeleteDay(day.id, e)}
                                className={`ml-2 w-5 h-5 flex items-center justify-center rounded-full ${day.id === currentDayId
                                    ? 'bg-[#a63a44] hover:bg-[#d94552] text-white'
                                    : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
                                    }`}
                                title="削除"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
                <button
                    onClick={handleAddDay}
                    className="px-4 py-2 bg-[#32353d] hover:bg-[#1f2126] text-white rounded whitespace-nowrap font-bold"
                >
                    + 日付追加
                </button>
            </div>

            {/* Accordion: Basic Info & Cast */}
            <div className="border rounded-lg overflow-hidden">
                <button
                    className="w-full px-4 py-3 bg-gray-100 text-left font-bold flex justify-between items-center hover:bg-gray-200"
                    onClick={() => toggleSection('basic')}
                >
                    <span>1. 基本情報 & キャスト登録</span>
                    <span>{activeSection === 'basic' ? '▼' : '▶'}</span>
                </button>
                {activeSection === 'basic' && (
                    <div className="p-4 space-y-6 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-base font-bold mb-2">タイトル</label>
                                <input
                                    type="text"
                                    value={projectData.title}
                                    onChange={handleTitleChange}
                                    className="w-full border p-3 rounded text-base"
                                    placeholder="撮影香盤表"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-bold mb-2">組名</label>
                                <input
                                    type="text"
                                    value={projectData.groupName}
                                    onChange={handleGroupNameChange}
                                    className="w-full border p-3 rounded text-base"
                                    placeholder="〇〇組"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-bold mb-2">日付</label>
                                <input
                                    type="date"
                                    value={currentDay.headerInfo.date}
                                    onChange={(e) => handleHeaderChange('date', e.target.value)}
                                    className="w-full border p-3 rounded text-base"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-bold mb-2">集合場所</label>
                                <input
                                    type="text"
                                    value={currentDay.headerInfo.meetingPlace}
                                    onChange={(e) => handleHeaderChange('meetingPlace', e.target.value)}
                                    className="w-full border p-3 rounded text-base"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-bold mb-2">集合時間</label>
                                <input
                                    type="time"
                                    value={currentDay.headerInfo.meetingTime}
                                    onChange={(e) => handleHeaderChange('meetingTime', e.target.value)}
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
                                            onChange={() => handleHeaderChange('versionType', 'decision')}
                                            className="w-5 h-5"
                                        />
                                        決定稿
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-base">
                                        <input
                                            type="radio"
                                            name="versionType"
                                            checked={currentDay.headerInfo.versionType === 'provisional'}
                                            onChange={() => handleHeaderChange('versionType', 'provisional')}
                                            className="w-5 h-5"
                                        />
                                        仮
                                    </label>
                                    {currentDay.headerInfo.versionType === 'provisional' && (
                                        <input
                                            type="number"
                                            value={currentDay.headerInfo.versionNumber}
                                            onChange={(e) => handleHeaderChange('versionNumber', e.target.value)}
                                            className="w-20 border p-2 rounded text-base"
                                            placeholder="番号"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-6">
                            <h3 className="font-bold mb-4 text-lg">キャスト登録</h3>
                            <div className="space-y-4">
                                {projectData.castMaster.map((cast) => (
                                    <div key={cast.id} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-gray-50 p-2 rounded">
                                        <input
                                            type="text"
                                            placeholder="役名"
                                            value={cast.role}
                                            onChange={(e) => handleCastChange(cast.id, 'role', e.target.value)}
                                            className="border p-3 rounded w-full sm:w-1/3 text-base"
                                        />
                                        <input
                                            type="text"
                                            placeholder="キャスト名"
                                            value={cast.name}
                                            onChange={(e) => handleCastChange(cast.id, 'name', e.target.value)}
                                            className="border p-3 rounded w-full sm:w-1/3 text-base"
                                        />
                                        <button
                                            onClick={() => handleDeleteCast(cast.id)}
                                            className="text-red-500 hover:text-red-700 px-4 py-2 w-full sm:w-auto text-center border border-red-200 rounded bg-white"
                                        >
                                            削除
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddCast}
                                    className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 font-bold text-base"
                                >
                                    + キャストを追加
                                </button>
                            </div>
                        </div>
                        <div className="text-right mt-6">
                            <button
                                onClick={() => toggleSection('schedule')}
                                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 text-base font-bold w-full sm:w-auto"
                            >
                                次へ
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Accordion: Schedule Details */}
            <div className="border rounded-lg overflow-hidden">
                <button
                    className="w-full px-4 py-3 bg-gray-100 text-left font-bold flex justify-between items-center hover:bg-gray-200"
                    onClick={() => toggleSection('schedule')}
                >
                    <span>2. スケジュール詳細</span>
                    <span>{activeSection === 'schedule' ? '▼' : '▶'}</span>
                </button>
                {activeSection === 'schedule' && (
                    <div className="p-4 space-y-6 bg-white">
                        <div className="space-y-6">
                            {currentDay.scheduleRows.map((row, index) => (
                                <div key={row.id} className="border p-4 rounded bg-gray-50 relative shadow-sm">
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button onClick={() => handleMoveRow(index, 'up')} disabled={index === 0} className="p-2 text-gray-500 hover:text-black bg-white rounded border">↑</button>
                                        <button onClick={() => handleMoveRow(index, 'down')} disabled={index === currentDay.scheduleRows.length - 1} className="p-2 text-gray-500 hover:text-black bg-white rounded border">↓</button>
                                        <button onClick={() => handleDeleteRow(row.id)} className="p-2 text-red-500 hover:text-red-700 bg-white rounded border">×</button>
                                    </div>

                                    {row.type === 'location' ? (
                                        <div className="mt-8">
                                            <label className="block text-sm font-bold mb-2">場所 (見出し)</label>
                                            <input
                                                type="text"
                                                value={row.location}
                                                onChange={(e) => handleRowChange(row.id, 'location', e.target.value)}
                                                className="w-full border p-3 rounded font-bold text-base"
                                                placeholder="ロケ地名を入力"
                                            />
                                        </div>
                                    ) : row.type === 'break' ? (
                                        <div className="grid grid-cols-12 gap-4 mt-10">
                                            <div className="col-span-12 sm:col-span-4">
                                                <label className="block text-sm font-bold mb-2">時間</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="time"
                                                        value={row.startTime}
                                                        onChange={(e) => handleRowChange(row.id, 'startTime', e.target.value)}
                                                        className="w-full border p-3 rounded text-base"
                                                    />
                                                    <span>-</span>
                                                    <input
                                                        type="time"
                                                        value={row.endTime}
                                                        onChange={(e) => handleRowChange(row.id, 'endTime', e.target.value)}
                                                        className="w-full border p-3 rounded text-base"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-12">
                                                <label className="block text-sm font-bold mb-2">SCENE (移動・休憩・撤収)</label>
                                                <div className="flex flex-wrap gap-3">
                                                    {/* Meal Option Group */}
                                                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border cursor-pointer hover:bg-green-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={['朝飯', '昼飯', '夕飯', '夜飯'].some(m => row.selectedOptions.includes(m))}
                                                            onChange={() => {
                                                                const currentMeal = ['朝飯', '昼飯', '夕飯', '夜飯'].find(m => row.selectedOptions.includes(m));
                                                                if (currentMeal) {
                                                                    // Uncheck: remove all meal options
                                                                    const newOptions = row.selectedOptions.filter(o => !['朝飯', '昼飯', '夕飯', '夜飯'].includes(o));
                                                                    handleRowChange(row.id, 'selectedOptions', newOptions);
                                                                } else {
                                                                    // Check: add default meal (e.g., 昼飯)
                                                                    const newOptions = [...row.selectedOptions, '昼飯'];
                                                                    handleRowChange(row.id, 'selectedOptions', newOptions);
                                                                }
                                                            }}
                                                            className="w-5 h-5"
                                                        />
                                                        <span className="text-base">飯</span>
                                                        {['朝飯', '昼飯', '夕飯', '夜飯'].some(m => row.selectedOptions.includes(m)) && (
                                                            <select
                                                                value={['朝飯', '昼飯', '夕飯', '夜飯'].find(m => row.selectedOptions.includes(m)) || '昼飯'}
                                                                onChange={(e) => {
                                                                    const newMeal = e.target.value;
                                                                    const newOptions = row.selectedOptions.filter(o => !['朝飯', '昼飯', '夕飯', '夜飯'].includes(o));
                                                                    newOptions.push(newMeal);
                                                                    handleRowChange(row.id, 'selectedOptions', newOptions);
                                                                }}
                                                                className="ml-2 border rounded p-1 text-sm"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {['朝飯', '昼飯', '夕飯', '夜飯'].map(m => (
                                                                    <option key={m} value={m}>{m}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>

                                                    {/* Other Options */}
                                                    {['移動', '休憩', '完全撤収', '他'].map((option) => (
                                                        <label key={option} className="flex items-center gap-2 bg-white px-3 py-2 rounded border cursor-pointer hover:bg-green-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={row.selectedOptions.includes(option)}
                                                                onChange={() => handleBreakOptionChange(row.id, option)}
                                                                className="w-5 h-5"
                                                            />
                                                            <span className="text-base">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                {row.selectedOptions.includes('他') && (
                                                    <div className="mt-2">
                                                        <input
                                                            type="text"
                                                            value={row.otherText}
                                                            onChange={(e) => handleRowChange(row.id, 'otherText', e.target.value)}
                                                            className="w-full border p-3 rounded text-base"
                                                            placeholder="その他の内容を入力"
                                                        />
                                                    </div>
                                                )}
                                                <div className="mt-4">
                                                    <label className="block text-sm font-bold mb-2">備考</label>
                                                    <input
                                                        type="text"
                                                        value={row.remarks || ''}
                                                        onChange={(e) => handleRowChange(row.id, 'remarks', e.target.value)}
                                                        className="w-full border p-3 rounded text-base"
                                                        placeholder="備考を入力"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-12 gap-4 mt-10">
                                            <div className="col-span-12 sm:col-span-4">
                                                <label className="block text-sm font-bold mb-2">時間</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="time"
                                                        value={row.startTime}
                                                        onChange={(e) => handleRowChange(row.id, 'startTime', e.target.value)}
                                                        className="w-full border p-3 rounded text-base"
                                                    />
                                                    <span>-</span>
                                                    <input
                                                        type="time"
                                                        value={row.endTime}
                                                        onChange={(e) => handleRowChange(row.id, 'endTime', e.target.value)}
                                                        className="w-full border p-3 rounded text-base"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-4 sm:col-span-2">
                                                <label className="block text-sm font-bold mb-2">S#</label>
                                                <input
                                                    type="text"
                                                    value={row.sceneNumber}
                                                    onChange={(e) => handleRowChange(row.id, 'sceneNumber', e.target.value)}
                                                    className="w-full border p-3 rounded text-base"
                                                />
                                            </div>
                                            <div className="col-span-4 sm:col-span-2">
                                                <label className="block text-sm font-bold mb-2">P</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={row.pageNumber}
                                                    onChange={(e) => handleRowChange(row.id, 'pageNumber', e.target.value)}
                                                    className="w-full border p-3 rounded text-base"
                                                />
                                            </div>
                                            <div className="col-span-4 sm:col-span-2">
                                                <label className="block text-sm font-bold mb-2">D/N</label>
                                                <select
                                                    value={row.dn}
                                                    onChange={(e) => handleRowChange(row.id, 'dn', e.target.value)}
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
                                                    value={row.description}
                                                    onChange={(e) => handleRowChange(row.id, 'description', e.target.value)}
                                                    className="w-full border p-3 rounded text-base h-24"
                                                />
                                            </div>
                                            <div className="col-span-12">
                                                <label className="block text-sm font-bold mb-2">備考</label>
                                                <input
                                                    type="text"
                                                    value={row.remarks || ''}
                                                    onChange={(e) => handleRowChange(row.id, 'remarks', e.target.value)}
                                                    className="w-full border p-3 rounded text-base"
                                                    placeholder="備考を入力"
                                                />
                                            </div>
                                            <div className="col-span-12">
                                                <label className="block text-sm font-bold mb-2">出演</label>
                                                <div className="flex flex-wrap gap-3">
                                                    {projectData.castMaster.map((cast) => (
                                                        <div key={cast.id} className="flex items-center gap-1 bg-white px-3 py-2 rounded border hover:bg-blue-50">
                                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={row.castIds.includes(cast.id)}
                                                                    onChange={() => handleCastSelection(row.id, cast.id)}
                                                                    className="w-5 h-5"
                                                                />
                                                                <span className="text-base">{cast.role}</span>
                                                            </label>
                                                            {row.castIds.includes(cast.id) && (
                                                                <label className="flex items-center gap-1 cursor-pointer ml-2 border-l pl-2 select-none" title={`${cast.role} UP`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={row.upCastIds?.includes(cast.id)}
                                                                        onChange={() => handleUpCastSelection(row.id, cast.id)}
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
                                                            checked={row.castIds.includes('EX')}
                                                            onChange={() => handleCastSelection(row.id, 'EX')}
                                                            className="w-5 h-5"
                                                        />
                                                        <span className="text-base font-bold">EX</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={addSceneRow}
                                className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 font-bold text-base"
                            >
                                +撮影
                            </button>
                            <button
                                onClick={addBreakRow}
                                className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 font-bold text-base"
                            >
                                +飯/移動/撤収
                            </button>
                            <button
                                onClick={addLocationRow}
                                className="w-full bg-gray-500 text-white py-3 rounded hover:bg-gray-600 font-bold text-base"
                            >
                                +場所
                            </button>
                        </div>

                        {/* Last Day Checkbox */}
                        <div className="mt-6 border-t pt-6">
                            <label className="flex items-center gap-2 font-bold cursor-pointer p-2 hover:bg-gray-50 rounded">
                                <input
                                    type="checkbox"
                                    checked={currentDay.isLastDay}
                                    onChange={handleLastDayChange}
                                    className="w-5 h-5"
                                />
                                最終日としてマーク
                            </label>
                            {currentDay.isLastDay && (
                                <div className="mt-4">
                                    <label className="block text-base font-bold mb-2">最終日メッセージ</label>
                                    <input
                                        type="text"
                                        value={currentDay.lastDayMessage}
                                        onChange={handleLastDayMessageChange}
                                        className="w-full border p-3 rounded text-base"
                                        placeholder="例: お疲れ様でした！"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="text-right mt-6">
                            <button
                                onClick={() => toggleSection('footer')}
                                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 text-base font-bold w-full sm:w-auto"
                            >
                                次へ
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Accordion: Footer Info */}
            <div className="border rounded-lg overflow-hidden">
                <button
                    className="w-full px-4 py-3 bg-gray-100 text-left font-bold flex justify-between items-center hover:bg-gray-200"
                    onClick={() => toggleSection('footer')}
                >
                    <span>3. フッター情報</span>
                    <span>{activeSection === 'footer' ? '▼' : '▶'}</span>
                </button>
                {activeSection === 'footer' && (
                    <div className="p-4 space-y-6 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-base font-bold mb-2">備考</label>
                                <textarea
                                    value={currentDay.footerInfo.remarks}
                                    onChange={(e) => handleFooterChange('remarks', e.target.value)}
                                    className="w-full border p-3 rounded h-32 text-base"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-bold mb-2">車両 等</label>
                                <textarea
                                    value={currentDay.footerInfo.vehicles}
                                    onChange={(e) => handleFooterChange('vehicles', e.target.value)}
                                    className="w-full border p-3 rounded h-32 text-base"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-bold mb-2">エキストラ</label>
                                <textarea
                                    value={currentDay.footerInfo.extras}
                                    onChange={(e) => handleFooterChange('extras', e.target.value)}
                                    className="w-full border p-3 rounded h-32 text-base"
                                />
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="font-bold mb-4 text-lg">入り時間・キャスト表</h3>
                            <div className="space-y-6">
                                {currentDay.footerInfo.timeTable.map((row, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded shadow-sm relative">
                                        <div className="absolute top-2 right-2">
                                            <button
                                                onClick={() => handleDeleteTimeTableRow(index)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                                title="行を削除"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pr-8">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    placeholder="時間"
                                                    value={row.time}
                                                    onChange={(e) => handleTimeTableChange(index, 'time', e.target.value)}
                                                    className="border p-3 rounded w-full text-base"
                                                />
                                                <button
                                                    onClick={() => handleTimeTableChange(index, 'time', '')}
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
                                                    onChange={(e) => handleTimeTableChange(index, 'location', e.target.value)}
                                                    className="border p-3 rounded w-full text-base"
                                                />
                                                {index > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            const prevRow = currentDay.footerInfo.timeTable[index - 1];
                                                            handleTimeTableChange(index, 'location', prevRow.location);
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
                                            <select
                                                value={row.cast1}
                                                onChange={(e) => handleTimeTableChange(index, 'cast1', e.target.value)}
                                                className="border p-3 rounded w-full text-base bg-white"
                                            >
                                                <option value="">キャスト1を選択</option>
                                                {projectData.castMaster.map(c => <option key={c.id} value={`${c.name} (${c.role})`}>{c.name} ({c.role})</option>)}
                                            </select>
                                            <select
                                                value={row.cast2}
                                                onChange={(e) => handleTimeTableChange(index, 'cast2', e.target.value)}
                                                className="border p-3 rounded w-full text-base bg-white"
                                            >
                                                <option value="">キャスト2を選択</option>
                                                {projectData.castMaster.map(c => <option key={c.id} value={`${c.name} (${c.role})`}>{c.name} ({c.role})</option>)}
                                            </select>
                                            <select
                                                value={row.cast3}
                                                onChange={(e) => handleTimeTableChange(index, 'cast3', e.target.value)}
                                                className="border p-3 rounded w-full text-base bg-white"
                                            >
                                                <option value="">キャスト3を選択</option>
                                                {projectData.castMaster.map(c => <option key={c.id} value={`${c.name} (${c.role})`}>{c.name} ({c.role})</option>)}
                                            </select>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="備考"
                                            value={row.remarks}
                                            onChange={(e) => handleTimeTableChange(index, 'remarks', e.target.value)}
                                            className="border p-3 rounded w-full text-base"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddTimeTableRow}
                                    className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 font-bold text-base"
                                >
                                    + 行を追加
                                </button>
                            </div>
                        </div>

                        <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold mb-2 text-lg">監督連絡先</h3>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input
                                        type="text"
                                        placeholder="名前"
                                        value={currentDay.footerInfo.directorContact.name}
                                        onChange={(e) => handleContactChange('directorContact', 'name', e.target.value)}
                                        className="border p-3 rounded w-full text-base"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="電話番号"
                                        value={currentDay.footerInfo.directorContact.phone}
                                        onChange={(e) => handleContactChange('directorContact', 'phone', e.target.value)}
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
                                        value={currentDay.footerInfo.assistantDirectorContact.name}
                                        onChange={(e) => handleContactChange('assistantDirectorContact', 'name', e.target.value)}
                                        className="border p-3 rounded w-full text-base"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="電話番号"
                                        value={currentDay.footerInfo.assistantDirectorContact.phone}
                                        onChange={(e) => handleContactChange('assistantDirectorContact', 'phone', e.target.value)}
                                        className="border p-3 rounded w-full text-base"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Print Button */}
                        <div className="mt-8 flex justify-end gap-4">
                            <button
                                onClick={handleAddDay}
                                className="bg-[#32353d] hover:bg-[#1f2126] text-white font-bold py-3 px-6 rounded shadow transition text-base"
                            >
                                + 日付追加
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="bg-[#32353d] hover:bg-[#1f2126] text-white font-bold py-3 px-6 rounded shadow transition text-base"
                            >
                                印刷 / PDF
                            </button>
                        </div>
                    </div >
                )}
            </div >
        </div >
    );
};

export default Editor;
