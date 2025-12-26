/**
 * スクロール関連のユーティリティ関数
 */

/**
 * スクロールコンテナとウィンドウをトップにスクロールする
 * @param containerSelector CSSセレクタ（オプション）
 */
export const scrollToTop = (containerSelector?: string): void => {
    if (containerSelector) {
        const scrollContainer = document.querySelector(containerSelector);
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * デスクトップビュー用のスクロールコンテナセレクタ
 */
export const DESKTOP_SCROLL_CONTAINER = '.lg\\:overflow-y-auto';
