export interface CastMaster {
  id: string;
  role: string; // 役名 (例: 津田)
  name: string; // キャスト名 (例: 田中或剛)
}

// 共通のプロパティ
interface BaseRow {
  id: string;
  type: 'scene' | 'location' | 'break';
}

// シーン行
export interface SceneRow extends BaseRow {
  type: 'scene';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  sceneNumber: string; // NumberInput (step 0.1) -> string
  pageNumber: string;  // NumberInput (step 0.1) -> string
  dn: 'D' | 'N' | 'E' | 'M';
  description: string;
  remarks?: string; // 備考
  castIds: string[]; // チェックされたCastMasterのIDリスト
  upCastIds?: string[]; // UP(撮影終了)のCastMasterのIDリスト (optional)
}

// 場所行
export interface LocationRow extends BaseRow {
  type: 'location';
  location: string;
}

// 移動・休憩・撤収行
export interface BreakRow extends BaseRow {
  type: 'break';
  startTime: string;
  endTime: string;
  selectedOptions: string[]; // 選択されたオプション (朝飯, 昼飯, etc.)
  otherText: string; // 「他」の入力テキスト
  remarks?: string; // 備考
}

export type ScheduleRow = SceneRow | LocationRow | BreakRow;

export interface ScheduleHeader {
  date: string; // YYYY-MM-DD
  meetingPlace: string;
  meetingTime: string; // HH:mm
  versionType: 'decision' | 'provisional'; // 決 or 仮
  versionNumber: string; // 仮の場合の番号
}

export interface ContactInfo {
  name: string;
  phone: string;
}

// タイムテーブル行
export interface TimeTableRow {
  time: string;
  location: string;
  cast1: string;
  cast2: string;
  cast3: string;
  remarks: string;
}

export interface FooterInfo {
  remarks: string; // 備考
  vehicles: string; // 車両等
  extras: string; // エキストラ

  // セクションB: 入り時間・キャスト表
  timeTable: TimeTableRow[];

  // セクションC
  directorContact: ContactInfo;
  assistantDirectorContact: ContactInfo;
}

export interface DayData {
  id: string;
  headerInfo: ScheduleHeader;
  scheduleRows: ScheduleRow[];
  footerInfo: FooterInfo;
  isLastDay: boolean; // 最終日フラグ
  lastDayMessage: string; // 最終日メッセージ
}

export interface ProjectData {
  title: string; // 香盤表タイトル (共通)
  groupName: string; // 組名 (共通)
  castMaster: CastMaster[]; // キャストマスタ (共通)
  days: DayData[]; // 日ごとのデータ
}
