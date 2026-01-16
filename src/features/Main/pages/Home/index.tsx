import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-dialog';

type Cover = { path: string; base64: string };

export default function Home() {
  const [covers, setCovers] = useState<Cover[]>([]);
  const [scanning, setScanning] = useState(false);

  const startScan = async () => {
    const dir = await open({ directory: true, multiple: false });
    if (!dir || Array.isArray(dir)) return;
    setCovers([]);
    setScanning(true);
    listen<Cover>('cover', event => {
      console.log('收到了');
      setCovers(prev => [...prev, event.payload]);
    });
    await invoke('video_cover', { dir });
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">MKV 封面流扫描</h1>
        <button className="btn btn-primary" onClick={startScan} disabled={scanning}>
          {scanning ? <span className="loading loading-spinner"></span> : '选择目录'}
        </button>
      </div>

      {scanning && (
        <div className="text-center text-sm text-base-content/70 mb-4">扫描中，每找到一个封面会实时显示…</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {covers.map(c => (
          <div key={c.path} className="card card-compact bg-base-100 shadow">
            <figure>
              <img src={c.base64} alt="cover" className="h-40 w-full object-cover" />
            </figure>
            <div className="card-body">
              <p className="text-xs text-base-content/70 break-all">{c.path.split(/[\\/]/).pop()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
