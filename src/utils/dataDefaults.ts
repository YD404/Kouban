/**
 * デフォルト値生成のユーティリティ関数
 */
import type { ScheduleHeader, FooterInfo, DayData, TimeTableRow } from '../types';

/**
 * デフォルトヘッダーを作成
 */
export const createDefaultHeader = (): ScheduleHeader => ({
    date: '',
    meetingPlace: '',
    meetingTime: '',
    versionType: 'decision',
    versionNumber: '',
});

/**
 * デフォルトのタイムテーブル行を作成
 */
export const createDefaultTimeTableRow = (): TimeTableRow => ({
    time: '',
    location: '',
    cast1: '',
    cast2: '',
    cast3: '',
    remarks: '',
});

/**
 * デフォルトフッター情報を作成
 */
export const createDefaultFooterInfo = (): FooterInfo => ({
    remarks: '',
    vehicles: '',
    extras: '',
    timeTable: [createDefaultTimeTableRow()],
    directorContact: { name: '', phone: '' },
    assistantDirectorContact: { name: '', phone: '' },
});

/**
 * 新しい日データを作成
 * @param id 日のユニークID
 */
export const createNewDay = (id: string): DayData => ({
    id,
    headerInfo: createDefaultHeader(),
    scheduleRows: [],
    footerInfo: createDefaultFooterInfo(),
    isLastDay: false,
    lastDayMessage: '',
});

/**
 * ユニークIDを生成
 */
export const generateId = (): string => crypto.randomUUID();
