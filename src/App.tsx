import { useState, useEffect } from 'react';
import type { ProjectData, DayData, ScheduleHeader, FooterInfo } from './types.ts';
import Editor from './components/Editor.tsx';
import Preview from './components/Preview.tsx';

const defaultHeader: ScheduleHeader = {
  date: '',
  meetingPlace: '',
  meetingTime: '',
  versionType: 'decision',
  versionNumber: '',
};

const defaultFooterInfo: FooterInfo = {
  remarks: '',
  vehicles: '',
  extras: '',
  timeTable: Array(1).fill({
    time: '',
    location: '',
    cast1: '',
    cast2: '',
    cast3: '',
    remarks: '',
  }),
  directorContact: { name: '', phone: '' },
  assistantDirectorContact: { name: '', phone: '' },
};

const createNewDay = (id: string): DayData => ({
  id,
  headerInfo: { ...defaultHeader },
  scheduleRows: [],
  footerInfo: { ...defaultFooterInfo },
  isLastDay: false,
  lastDayMessage: '',
});

const defaultProjectData: ProjectData = {
  title: '撮影香盤表',
  groupName: '',
  castMaster: [{ id: '1', role: '', name: '' }],
  days: [createNewDay(crypto.randomUUID())],
};

function App() {
  const [projectData, setProjectData] = useState<ProjectData>(() => {
    const saved = localStorage.getItem('kouban_project_v1');
    return saved ? JSON.parse(saved) : defaultProjectData;
  });

  const [currentDayId, setCurrentDayId] = useState<string>(() => {
    return projectData.days[0]?.id || '';
  });

  useEffect(() => {
    localStorage.setItem('kouban_project_v1', JSON.stringify(projectData));
  }, [projectData]);

  // Ensure currentDayId is valid
  useEffect(() => {
    if (!projectData.days.find(d => d.id === currentDayId)) {
      if (projectData.days.length > 0) {
        setCurrentDayId(projectData.days[0].id);
      }
    }
  }, [projectData.days, currentDayId]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
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

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedData = JSON.parse(event.target?.result as string) as ProjectData;
        // Basic validation
        if (loadedData.days && Array.isArray(loadedData.days)) {
          setProjectData(loadedData);
          if (loadedData.days.length > 0) {
            setCurrentDayId(loadedData.days[0].id);
          }
        } else {
          alert('無効なファイル形式です。');
        }
      } catch (error) {
        console.error('Failed to parse JSON', error);
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  };

  const currentDay = projectData.days.find(d => d.id === currentDayId) || projectData.days[0];



  const handleInitialize = () => {
    if (window.confirm('本当に初期化しますか？\n入力したデータはすべて消去されます。')) {
      setProjectData(defaultProjectData);
      setCurrentDayId(defaultProjectData.days[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="container mx-auto p-4 flex flex-col gap-4">
        {/* Feedback Banner */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="no-print bg-white p-6 rounded-lg shadow-md lg:overflow-y-auto lg:max-h-[calc(100vh-100px)]">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">編集</h2>
            {currentDay && (
              <Editor
                projectData={projectData}
                setProjectData={setProjectData}
                currentDayId={currentDayId}
                setCurrentDayId={setCurrentDayId}
                createNewDay={createNewDay}
              />
            )}
          </div>

          <div className="bg-white p-0 lg:p-6 rounded-lg shadow-md lg:overflow-y-auto lg:max-h-[calc(100vh-100px)] print:shadow-none print:p-0 print:overflow-visible print:max-h-none print:w-full print:hidden">
            <div className="no-print mb-4 text-sm text-gray-500">
              印刷プレビュー。モバイル端末の場合、画面を横にしないと正常に表示されませんが印刷には影響ございません。
            </div>
            {currentDay && (
              <Preview
                projectData={projectData}
                dayData={currentDay}
              />
            )}
          </div>
        </div>
      </div>

      {/* Print Only Section: Render All Days */}
      <div className="hidden print:block">
        {projectData.days.map((day) => (
          <div key={day.id} className="print-page-break">
            <Preview
              projectData={projectData}
              dayData={day}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
