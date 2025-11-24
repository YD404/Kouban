export interface CastMaster {
  id: string;
  role: string; // 役名 (例: 津田)
  name: string; // キャスト名 (例: 田中或剛)
}

// 共通のプロパティ
interface BaseRow {
  id: string;
  type: 'scene' | 'location';
}

// シーン行
export interface SceneRow extends BaseRow {
  type: 'scene';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  sceneNumber: string; // NumberInput (step 0.1) -> string
  pageNumber: string;  // NumberInput (step 0.1) -> string
  dn: 'D' | 'N' | 'E';
  description: string;
  castIds: string[]; // チェックされたCastMasterのIDリスト
}

// 場所行
export interface LocationRow extends BaseRow {
  type: 'location';
  location: string;
}

export type ScheduleRow = SceneRow | LocationRow;

export interface ScheduleHeader {
  // titleはProjectDataに移動したが、互換性のため残すか、DayDataには不要か検討。
  // 要件: "タイトルとキャスト登録は最初に編集したものを引きついて" -> ProjectDataで管理
  // Date, Meeting Info, VersionはDayごとに異なる
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

export interface FooterInfo {
  remarks: string; // 備考
  vehicles: string; // 車両等
  extras: string; // エキストラ

  // セクションB: 入り時間・キャスト表
  timeTable: {
    time: string;
    location: string;
    cast1: string;
    cast2: string;
    cast3: string;
    remarks: string;
  }[];

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
