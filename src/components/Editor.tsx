import React, { useState } from 'react';
import type { ProjectData, DayData, SceneRow, LocationRow, CastMaster, ContactInfo } from '../types.ts';

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
        const lastRow = currentDay.scheduleRows[currentDay.scheduleRows.length - 1];
        let initialStartTime = '';

        if (lastRow && lastRow.type === 'scene') {
            initialStartTime = lastRow.endTime;
        } else if (currentDay.scheduleRows.length === 0 && currentDay.headerInfo.meetingTime) {
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

    const handleRowChange = (id: string, field: keyof SceneRow | keyof LocationRow, value: any) => {
        updateCurrentDay(day => ({
            ...day,
            scheduleRows: day.scheduleRows.map((row) => {
                if (row.id !== id) return row;
                if (row.type === 'scene') {
                    return { ...row, [field]: value };
                } else {
                    return { ...row, [field]: value };
                }
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

    const handleContactChange = (type: 'directorContact' | 'assistantDirectorContact', field: keyof ContactInfo, value: string) => {
        updateCurrentDay(day => ({
            ...day,
            footerInfo: {
                ...day.footerInfo,
                [type]: { ...day.footerInfo[type], [field]: value }
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
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                    >
                        <span>{day.headerInfo.date || `Day ${index + 1}`}</span>
                        {projectData.days.length > 1 && (
                            <button
                                onClick={(e) => handleDeleteDay(day.id, e)}
                                className={`ml-2 w-5 h-5 flex items-center justify-center rounded-full ${day.id === currentDayId
                                    ? 'bg-blue-500 hover:bg-blue-400 text-white'
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
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded whitespace-nowrap font-bold"
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
                    <div className="p-4 space-y-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">タイトル</label>
                                <input
                                    type="text"
                                    value={projectData.title}
                                    onChange={handleTitleChange}
                                    className="w-full border p-2 rounded"
                                    placeholder="撮影香盤表"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">組名</label>
                                <input
                                    type="text"
                                    value={projectData.groupName}
                                    onChange={handleGroupNameChange}
                                    className="w-full border p-2 rounded"
                                    placeholder="〇〇組"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">日付</label>
                                <input
                                    type="date"
                                    value={currentDay.headerInfo.date}
                                    onChange={(e) => handleHeaderChange('date', e.target.value)}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">集合場所</label>
                                <input
                                    type="text"
                                    value={currentDay.headerInfo.meetingPlace}
                                    onChange={(e) => handleHeaderChange('meetingPlace', e.target.value)}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">集合時間</label>
                                <input
                                    type="time"
                                    value={currentDay.headerInfo.meetingTime}
                                    onChange={(e) => handleHeaderChange('meetingTime', e.target.value)}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">版数</label>
                                <div className="flex gap-4 items-center h-10">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="versionType"
                                            checked={currentDay.headerInfo.versionType === 'decision'}
                                            onChange={() => handleHeaderChange('versionType', 'decision')}
                                        />
                                        決定稿
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="versionType"
                                            checked={currentDay.headerInfo.versionType === 'provisional'}
                                            onChange={() => handleHeaderChange('versionType', 'provisional')}
                                        />
                                        仮
                                    </label>
                                    {currentDay.headerInfo.versionType === 'provisional' && (
                                        <input
                                            type="number"
                                            value={currentDay.headerInfo.versionNumber}
                                            onChange={(e) => handleHeaderChange('versionNumber', e.target.value)}
                                            className="w-16 border p-1 rounded"
                                            placeholder="番号"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 border-t pt-4">
                            <h3 className="font-bold mb-2">キャスト登録</h3>
                            <div className="space-y-2">
                                {projectData.castMaster.map((cast) => (
                                    <div key={cast.id} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="役名"
                                            value={cast.role}
                                            onChange={(e) => handleCastChange(cast.id, 'role', e.target.value)}
                                            className="border p-2 rounded w-1/3"
                                        />
                                        <input
                                            type="text"
                                            placeholder="キャスト名"
                                            value={cast.name}
                                            onChange={(e) => handleCastChange(cast.id, 'name', e.target.value)}
                                            className="border p-2 rounded w-1/3"
                                        />
                                        <button
                                            onClick={() => handleDeleteCast(cast.id)}
                                            className="text-red-500 hover:text-red-700 px-2"
                                        >
                                            削除
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddCast}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                                >
                                    + キャストを追加
                                </button>
                            </div>
                        </div>
                        <div className="text-right mt-4">
                            <button
                                onClick={() => toggleSection('schedule')}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
                    <div className="p-4 space-y-4 bg-white">
                        <div className="space-y-4">
                            {currentDay.scheduleRows.map((row, index) => (
                                <div key={row.id} className="border p-4 rounded bg-gray-50 relative">
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button onClick={() => handleMoveRow(index, 'up')} disabled={index === 0} className="text-gray-500 hover:text-black">↑</button>
                                        <button onClick={() => handleMoveRow(index, 'down')} disabled={index === currentDay.scheduleRows.length - 1} className="text-gray-500 hover:text-black">↓</button>
                                        <button onClick={() => handleDeleteRow(row.id)} className="text-red-500 hover:text-red-700">×</button>
                                    </div>

                                    {row.type === 'location' ? (
                                        <div className="mt-2">
                                            <label className="block text-xs font-bold mb-1">場所 (見出し)</label>
                                            <input
                                                type="text"
                                                value={row.location}
                                                onChange={(e) => handleRowChange(row.id, 'location', e.target.value)}
                                                className="w-full border p-2 rounded font-bold"
                                                placeholder="ロケ地名を入力"
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-12 gap-2 mt-4">
                                            <div className="col-span-3">
                                                <label className="block text-xs font-bold mb-1">時間</label>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="time"
                                                        value={row.startTime}
                                                        onChange={(e) => handleRowChange(row.id, 'startTime', e.target.value)}
                                                        className="w-full border p-1 rounded text-sm"
                                                    />
                                                    <span>-</span>
                                                    <input
                                                        type="time"
                                                        value={row.endTime}
                                                        onChange={(e) => handleRowChange(row.id, 'endTime', e.target.value)}
                                                        className="w-full border p-1 rounded text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold mb-1">S#</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={row.sceneNumber}
                                                    onChange={(e) => handleRowChange(row.id, 'sceneNumber', e.target.value)}
                                                    className="w-full border p-1 rounded text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold mb-1">P</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={row.pageNumber}
                                                    onChange={(e) => handleRowChange(row.id, 'pageNumber', e.target.value)}
                                                    className="w-full border p-1 rounded text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold mb-1">D/N</label>
                                                <select
                                                    value={row.dn}
                                                    onChange={(e) => handleRowChange(row.id, 'dn', e.target.value)}
                                                    className="w-full border p-1 rounded text-sm"
                                                >
                                                    <option value="D">D</option>
                                                    <option value="N">N</option>
                                                    <option value="E">E</option>
                                                </select>
                                            </div>
                                            <div className="col-span-12">
                                                <label className="block text-xs font-bold mb-1">内容</label>
                                                <textarea
                                                    value={row.description}
                                                    onChange={(e) => handleRowChange(row.id, 'description', e.target.value)}
                                                    className="w-full border p-1 rounded text-sm h-16"
                                                />
                                            </div>
                                            <div className="col-span-12">
                                                <label className="block text-xs font-bold mb-1">出演</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {projectData.castMaster.map((cast) => (
                                                        <label key={cast.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded border cursor-pointer hover:bg-blue-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={row.castIds.includes(cast.id)}
                                                                onChange={() => handleCastSelection(row.id, cast.id)}
                                                            />
                                                            <span className="text-sm">{cast.role}</span>
                                                        </label>
                                                    ))}
                                                    <label className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded border border-yellow-200 cursor-pointer hover:bg-yellow-100 ml-auto">
                                                        <input
                                                            type="checkbox"
                                                            checked={row.castIds.includes('EX')}
                                                            onChange={() => handleCastSelection(row.id, 'EX')}
                                                        />
                                                        <span className="text-sm font-bold">EX</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={addSceneRow}
                                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 font-bold"
                            >
                                + 行を追加
                            </button>
                            <button
                                onClick={addLocationRow}
                                className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 font-bold"
                            >
                                + 場所を追加
                            </button>
                        </div>

                        {/* Last Day Checkbox */}
                        <div className="mt-4 border-t pt-4">
                            <label className="flex items-center gap-2 font-bold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={currentDay.isLastDay}
                                    onChange={handleLastDayChange}
                                />
                                最終日としてマーク
                            </label>
                            {currentDay.isLastDay && (
                                <div className="mt-2">
                                    <label className="block text-sm font-bold mb-1">最終日メッセージ</label>
                                    <input
                                        type="text"
                                        value={currentDay.lastDayMessage}
                                        onChange={handleLastDayMessageChange}
                                        className="w-full border p-2 rounded"
                                        placeholder="例: お疲れ様でした！"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="text-right mt-4">
                            <button
                                onClick={() => toggleSection('footer')}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
                    <div className="p-4 space-y-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">備考</label>
                                <textarea
                                    value={currentDay.footerInfo.remarks}
                                    onChange={(e) => handleFooterChange('remarks', e.target.value)}
                                    className="w-full border p-2 rounded h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">車両 等</label>
                                <textarea
                                    value={currentDay.footerInfo.vehicles}
                                    onChange={(e) => handleFooterChange('vehicles', e.target.value)}
                                    className="w-full border p-2 rounded h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">エキストラ</label>
                                <textarea
                                    value={currentDay.footerInfo.extras}
                                    onChange={(e) => handleFooterChange('extras', e.target.value)}
                                    className="w-full border p-2 rounded h-24"
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-bold mb-2">入り時間・キャスト表</h3>
                            <div className="space-y-2">
                                {currentDay.footerInfo.timeTable.map((row, index) => (
                                    <div key={index} className="grid grid-cols-6 gap-2 text-sm">
                                        <input
                                            type="time"
                                            placeholder="時間"
                                            value={row.time}
                                            onChange={(e) => handleTimeTableChange(index, 'time', e.target.value)}
                                            className="border p-1 rounded col-span-1"
                                        />
                                        <input
                                            type="text"
                                            placeholder="場所"
                                            value={row.location}
                                            onChange={(e) => handleTimeTableChange(index, 'location', e.target.value)}
                                            className="border p-1 rounded col-span-1"
                                        />
                                        <select
                                            value={row.cast1}
                                            onChange={(e) => handleTimeTableChange(index, 'cast1', e.target.value)}
                                            className="border p-1 rounded col-span-1"
                                        >
                                            <option value="">-</option>
                                            {projectData.castMaster.map(c => <option key={c.id} value={`${c.name} (${c.role})`}>{c.name} ({c.role})</option>)}
                                        </select>
                                        <select
                                            value={row.cast2}
                                            onChange={(e) => handleTimeTableChange(index, 'cast2', e.target.value)}
                                            className="border p-1 rounded col-span-1"
                                        >
                                            <option value="">-</option>
                                            {projectData.castMaster.map(c => <option key={c.id} value={`${c.name} (${c.role})`}>{c.name} ({c.role})</option>)}
                                        </select>
                                        <select
                                            value={row.cast3}
                                            onChange={(e) => handleTimeTableChange(index, 'cast3', e.target.value)}
                                            className="border p-1 rounded col-span-1"
                                        >
                                            <option value="">-</option>
                                            {projectData.castMaster.map(c => <option key={c.id} value={`${c.name} (${c.role})`}>{c.name} ({c.role})</option>)}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="備考"
                                            value={row.remarks}
                                            onChange={(e) => handleTimeTableChange(index, 'remarks', e.target.value)}
                                            className="border p-1 rounded col-span-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-bold mb-2">監督連絡先</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="名前"
                                        value={currentDay.footerInfo.directorContact.name}
                                        onChange={(e) => handleContactChange('directorContact', 'name', e.target.value)}
                                        className="border p-2 rounded w-1/2"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="電話番号"
                                        value={currentDay.footerInfo.directorContact.phone}
                                        onChange={(e) => handleContactChange('directorContact', 'phone', e.target.value)}
                                        className="border p-2 rounded w-1/2"
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold mb-2">助監督連絡先</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="名前"
                                        value={currentDay.footerInfo.assistantDirectorContact.name}
                                        onChange={(e) => handleContactChange('assistantDirectorContact', 'name', e.target.value)}
                                        className="border p-2 rounded w-1/2"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="電話番号"
                                        value={currentDay.footerInfo.assistantDirectorContact.phone}
                                        onChange={(e) => handleContactChange('assistantDirectorContact', 'phone', e.target.value)}
                                        className="border p-2 rounded w-1/2"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Editor;
