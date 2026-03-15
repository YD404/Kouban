/**
 * アプリケーションルートコンポーネント
 */
import { useProjectData } from './hooks';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { saveProjectToFile, loadProjectFromFile } from './utils';

function App() {
    const pd = useProjectData();

    const handlePrint = () => {
        window.print();
    };

    const handleSave = () => {
        saveProjectToFile(pd.projectData);
    };

    const handleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = await loadProjectFromFile(file);
        if (data) {
            pd.loadData(data);
        } else {
            alert('無効なファイル形式です。');
        }
        e.target.value = '';
    };

    const handleInitialize = () => {
        if (window.confirm('本当に初期化しますか？\n入力したデータはすべて消去されます。')) {
            pd.initialize();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <div className="container mx-auto p-4 flex flex-col gap-4">
                {/* フィードバックバナー */}
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 no-print" role="alert">
                    <p className="font-bold">ベータ版として公開中</p>
                    <p>
                        不具合・ご要望は
                        <a
                            href="https://forms.gle/pP3WoxS2an3MjTcT6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-800 ml-1"
                        >
                            こちらのフォーム
                        </a>
                        よりお知らせください。
                    </p>
                </div>

                {/* ヘッダー */}
                <div className="flex justify-between items-center no-print flex-wrap gap-2">
                    <h1 className="text-2xl font-bold text-gray-800">スケジェネ (ベータ版)</h1>
                    <div className="flex gap-2">
                        <label className="bg-[#8c1822] hover:bg-[#70131b] text-white font-bold py-2 px-4 rounded shadow transition cursor-pointer">
                            読込
                            <input type="file" accept=".json" onChange={handleLoad} className="hidden" />
                        </label>
                        <button
                            onClick={handleSave}
                            className="bg-[#8c1822] hover:bg-[#70131b] text-white font-bold py-2 px-4 rounded shadow transition"
                        >
                            保存
                        </button>
                        <button
                            onClick={handlePrint}
                            className="bg-[#32353d] hover:bg-[#1f2126] text-white font-bold py-2 px-4 rounded shadow transition"
                        >
                            印刷 / PDF
                        </button>
                        <button
                            onClick={handleInitialize}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow transition"
                        >
                            初期化
                        </button>
                    </div>
                </div>

                {/* メインコンテント */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 編集パネル */}
                    <div className="no-print bg-white p-6 rounded-lg shadow-md lg:overflow-y-auto lg:max-h-[calc(100vh-100px)]">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">編集</h2>
                        {pd.currentDay && (
                            <Editor
                                projectData={pd.projectData}
                                currentDay={pd.currentDay}
                                currentDayId={pd.currentDayId}
                                onUpdateTitle={pd.updateTitle}
                                onUpdateGroupName={pd.updateGroupName}
                                onAddCast={pd.addCast}
                                onUpdateCast={pd.updateCast}
                                onDeleteCast={pd.deleteCast}
                                onAddDay={pd.addDay}
                                onDeleteDay={pd.deleteDay}
                                onSelectDay={pd.selectDay}
                                onUpdateHeader={pd.updateHeader}
                                onAddSceneRow={pd.addSceneRow}
                                onAddBreakRow={pd.addBreakRow}
                                onAddLocationRow={pd.addLocationRow}
                                onUpdateRow={pd.updateRow}
                                onDeleteRow={pd.deleteRow}
                                onMoveRow={pd.moveRow}
                                onToggleCast={pd.toggleCastSelection}
                                onToggleUpCast={pd.toggleUpCastSelection}
                                onToggleBreakOption={pd.toggleBreakOption}
                                onUpdateFooter={pd.updateFooter}
                                onUpdateTimeTableRow={pd.updateTimeTableRow}
                                onAddTimeTableRow={pd.addTimeTableRow}
                                onDeleteTimeTableRow={pd.deleteTimeTableRow}
                                onUpdateContact={pd.updateContact}
                                onUpdateLastDay={pd.updateLastDay}
                                onUpdateLastDayMessage={pd.updateLastDayMessage}
                            />
                        )}
                    </div>

                    {/* プレビューパネル */}
                    <div className="bg-white p-0 lg:p-6 rounded-lg shadow-md lg:overflow-y-auto lg:max-h-[calc(100vh-100px)] print:shadow-none print:p-0 print:overflow-visible print:max-h-none print:w-full print:hidden">
                        <div className="no-print mb-4 text-sm text-gray-500">
                            印刷プレビュー。モバイル端末の場合、画面を横にしないと正常に表示されませんが印刷には影響ございません。
                        </div>
                        {pd.currentDay && (
                            <Preview
                                projectData={pd.projectData}
                                dayData={pd.currentDay}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* 印刷用: 全日付をレンダリング */}
            <div className="hidden print:block">
                {pd.projectData.days.map((day) => (
                    <div key={day.id} className="print-page-break">
                        <Preview
                            projectData={pd.projectData}
                            dayData={day}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
