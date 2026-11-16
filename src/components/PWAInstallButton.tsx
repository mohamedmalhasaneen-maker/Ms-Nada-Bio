import React, { useEffect, useState } from 'react';
import { Download, Smartphone, CheckCircle2, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideTitle, setGuideTitle] = useState('');
  const [guideText, setGuideText] = useState('');

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

  const handleInstallClick = async () => {
    if (isIOS) {
      setGuideTitle('تنزيل التطبيق على آيفون / آيباد');
      setGuideText('1. اضغط على زر المشاركة (Share) في شريط متصفح سفاري.\n2. انزل لأسفل القائمة واضغط على "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).\n3. اضغط إضافة لتثبيت الأطلس على جهازك.');
      setShowGuideModal(true);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
      return;
    }

    // Fallback guide if beforeinstallprompt hasn't fired yet or browser doesn't support auto-prompt
    setGuideTitle('تنزيل وتثبيت أطلس الأحياء');
    setGuideText('للتثبيت السريع على جهازك:\n• في متصفح كروم (Chrome): انقر على زر القائمة (النقاط الثلاث أعلى اليمين) ثم اختر "تثبيت التطبيق" (Install App) أو "إضافة إلى الشاشة الرئيسية".\n• التطبيق يدعم العمل بالكامل دون إنترنت بعد التثبيت!');
    setShowGuideModal(true);
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">التطبيق مثبت بالفعل</span>
        <span className="xs:hidden">مُثبّت</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-sky-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-extrabold shadow-[0_0_20px_rgba(20,184,166,0.35)] transition-all hover:scale-105 active:scale-95 shrink-0"
        title="تنزيل التطبيق وتثبيته على الجهاز"
      >
        <Download className="w-4 h-4 text-slate-950 animate-bounce" />
        <span>تنزيل التطبيق</span>
      </button>

      {/* Guide Modal for installation instructions */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir="rtl">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-teal-500/40 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{guideTitle}</h3>
                  <p className="text-xs text-teal-300">تثبيت الأطلس للعمل دون إنترنت</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line p-3 rounded-2xl bg-slate-950 border border-slate-800">
              {guideText}
            </p>

            <button
              onClick={() => setShowGuideModal(false)}
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
