import React, { useEffect, useState } from 'react';
import { Download, Smartphone, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // If prompt not available yet (e.g. desktop/iOS or browser already prompted), explain or guide
      alert('لتنزيل التطبيق، استخدم خيار "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية" من قائمة المتصفح.');
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>التطبيق مثبت بالفعل</span>
      </div>
    );
  }

  // On Android / Desktop with install prompt support or generic download trigger
  return (
    <>
      <button
        onClick={isIOS ? () => setShowIOSGuide(true) : handleInstall}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/90 via-emerald-500/90 to-sky-500/90 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-extrabold shadow-[0_0_20px_rgba(20,184,166,0.35)] transition-all hover:scale-105 active:scale-95 shrink-0"
        title="تنزيل التطبيق وتثبيته على الجهاز"
      >
        <Download className="w-4 h-4 text-slate-950 animate-bounce" />
        <span>تنزيل التطبيق</span>
      </button>

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir="rtl">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-teal-500/40 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">تنزيل التطبيق على آيفون / آيباد</h3>
                <p className="text-xs text-teal-300">خطوات بسيطة لإضافة الأطلس للشاشة الرئيسية</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed space-y-2">
              1. اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح سفاري.<br />
              2. انزل لأسفل القائمة واضغط على <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.<br />
              3. اضغط <strong>إضافة (Add)</strong> لتثبيت التطبيق وتشغيله بدون إنترنت!
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs transition"
            >
              فهمت، شكراً
            </button>
          </div>
        </div>
      )}
    </>
  );
};
