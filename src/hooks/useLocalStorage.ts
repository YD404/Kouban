/**
 * LocalStorage操作のカスタムフック
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * LocalStorageと同期するステート管理フック
 * @param key LocalStorageのキー
 * @param initialValue 初期値
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    // 初期値の取得
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    // LocalStorageへの保存
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }, [key, storedValue]);

    // 値の更新関数
    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        setStoredValue((prev) => {
            const newValue = value instanceof Function ? value(prev) : value;
            return newValue;
        });
    }, []);

    return [storedValue, setValue];
}
