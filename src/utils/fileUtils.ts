/**
 * ファイル操作関連のユーティリティ関数
 */
import type { ProjectData } from '../types';

/**
 * プロジェクトデータをJSONファイルとして保存
 * @param projectData 保存するプロジェクトデータ
 */
export const saveProjectToFile = (projectData: ProjectData): void => {
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kouban_data_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * JSONファイルからプロジェクトデータを読み込む
 * @param file 読み込むファイル
 * @returns Promise<ProjectData | null>
 */
export const loadProjectFromFile = (file: File): Promise<ProjectData | null> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedData = JSON.parse(event.target?.result as string) as ProjectData;
                // 基本的なバリデーション
                if (loadedData.days && Array.isArray(loadedData.days)) {
                    resolve(loadedData);
                } else {
                    resolve(null);
                }
            } catch {
                resolve(null);
            }
        };
        reader.readAsText(file);
    });
};
