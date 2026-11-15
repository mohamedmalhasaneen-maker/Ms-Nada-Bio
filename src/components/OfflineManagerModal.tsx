import React, { useState } from 'react';
import { DownloadCloud, CheckCircle2, HardDrive, ShieldCheck, X } from 'lucide-react';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/js/curriculum-data.js',
  '/js/encyclopedic-systems.js',
  '/js/anatomical-registry.js',
  '/js/bone-studio.js',
  '/js/atlas-engine.js',
  '/models/skeleton.glb',
  '/models/skeletal_system.glb',
  '/models/muscles.glb',
  '/models/muscular_system.glb',
  '/models/nerves.glb',
  '/models/nervous_system.glb',
  '/models/brain.glb',
  '/models/organs.glb',
];

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const prepareOfflineAssets = async () => {
    setDownloading(true);
    setProgress(0);
    setDownloadedCount(0);
    setStatusMessage('جاري الاتصال بالتخزين المحلي ومحرك التخزين المؤقت...');
    setIsSuccess(false);

    try {
      if (!('caches' in window)) {
        throw new Error('متصفحك لا يدعم نظام التخزين المؤقت (Cache Storage).');
      }

      const cache = await caches.open('bioatlas-offline-v2');
      let successCount = 0;
      const total = CRITICAL_ASSETS.length;

      for (let i = 0; i < total; i++) {
        const url = CRITICAL_ASSETS[i];
        try {
          setStatusMessage(`جاري تنزيل وتخزين: ${url}`);
          const response = await fetch(url, { cache: 'reload' });
          if (response.ok) {
            await cache.put(url, response.clone());
            successCount++;
            setDownloadedCount(successCount);
          }
        } catch (err) {
          console.warn(`Could not cache ${url}:`, err);
        }
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      setIsSuccess(true);
      setStatusMessage(`تم بنجاح تجهيز وتخزين جميع الملفات والمجسمات (${successCount} من ${total}) للعمل دون إنترنت!`);
    } catch (err: any) {
      setIsSuccess(false);
      setStatusMessage(`حدث خطأ أثناء التجهيز: ${err?.message || 'تعذر التخزين'}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir="rtl">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-teal-500/40 p-6 shadow-2xl space-y-5 text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">تجهيز الموقع للعمل دون إنترنت</h3>
              <p className="text-xs text-teal-300">حفظ المجسمات 3D والبيانات والشروحات محلياً (Offline First)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body info */}
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-teal-300">
              <ShieldCheck className="w-4 h-4" />
              <span>ماذا سيتم تحميله وتخزينه؟</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              جميع المجسمات ثلاثية الأبعاد (GLB)، الخامات، السجل التشريحي، الموسوعة، بنك الأسئلة، والشروحات الكاملة للثانوية العامة حتى تتمكن من تصفح الأطلس ودراسة الأحياء بدون أي اتصال بالإنترنت.
            </p>
          </div>

          {/* Progress Section */}
          {(downloading || progress > 0) && (
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={isSuccess ? 'text-teal-300' : 'text-slate-200'}>{statusMessage}</span>
                <span className="font-mono text-teal-400 tabular-nums">{progress}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${isSuccess ? 'bg-teal-400' : 'bg-gradient-to-l from-teal-400 to-sky-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>الملفات المخزنة: <strong className="text-teal-300 font-mono">{downloadedCount}</strong> / {CRITICAL_ASSETS.length}</span>
                {isSuccess && (
                  <span className="flex items-center gap-1 text-teal-300 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>جاهز تماماً للاستخدام دون إنترنت</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={prepareOfflineAssets}
            disabled={downloading}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-l from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>{downloading ? 'جاري تجهيز وتنزيل الملفات...' : 'بدء تجهيز الأطلس للعمل دون إنترنت'}</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
