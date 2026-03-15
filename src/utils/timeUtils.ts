/**
 * 時刻関連のユーティリティ関数
 */

/**
 * 時刻文字列に指定時間を加算する
 * @param time HH:mm形式の時刻文字列
 * @param hours 加算する時間数
 * @returns HH:mm形式の時刻文字列、無効な入力の場合は空文字列
 */
export const addHoursToTime = (time: string, hours: number): string => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '';
  
  const date = new Date();
  date.setHours(h + hours, m);
  return date.toTimeString().slice(0, 5);
};

/**
 * 電話番号をフォーマットする
 * @param value 電話番号文字列
 * @returns フォーマット済み電話番号（11桁の場合はハイフン区切り）
 */
export const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }
  return value;
};
