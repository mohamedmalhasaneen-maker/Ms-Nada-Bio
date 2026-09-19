import React from 'react';
import { BodySystem } from '../types';
import {
  Bone,
  Activity,
  Zap,
  Maximize,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentSystem: BodySystem;
  onSelectSystem: (system: BodySystem) => void;
  onOpenQuiz?: () => void;
  onOpenGuide?: () => void;
  onResetView: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSystem,
  onSelectSystem,
  onResetView,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const systems = [
    {
      id: 'skeletal' as BodySystem,
      labelAr: 'الهيكل العظمي',
      labelEn: 'Skeletal System',
      icon: Bone,
      color: 'text-amber-200',
      activeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10',
    },
    {
      id: 'muscular' as BodySystem,
      labelAr: 'الجهاز العضلي',
      labelEn: 'Muscular System',
      icon: Activity,
      color: 'text-rose-400',
      activeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10',
    },
    {
      id: 'nervous' as BodySystem,
      labelAr: 'الجهاز العصبي',
      labelEn: 'Nervous System',
      icon: Zap,
      color: 'text-sky-400',
      activeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sky-500/10',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-teal-500/20 via-emerald-500/30 to-amber-500/20 border border-teal-500/40 flex items-center justify-center shadow-lg shadow-teal-900/30 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-base md:text-lg font-bold text-white truncate max-w-[110px] xs:max-w-[140px] sm:max-w-none font-['Cairo',sans-serif]">
                أطلس الأحياء 3D
              </h1>
              <span className="hidden md:inline-flex text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold">
                BioAnatomy
              </span>
            </div>
            {/* Cheerful Educational Slogan in Arabic & English */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-gradient-to-r from-amber-300 via-rose-300 to-teal-300 bg-clip-text text-transparent drop-shadow-sm">
                <span>الأحياء أسهل مع مس/ ندى بدوي</span>
              </span>
              <span className="hidden xl:inline-block text-[10px] font-semibold text-teal-300/90 font-mono tracking-tight">
                • Biology is Easier with Ms. Nada Badawi
              </span>
            </div>
          </div>
        </div>

        {/* Primary Navigation Tabs: The 3 Systems requested */}
        <nav className="flex items-center gap-1 p-0.5 sm:p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner overflow-x-auto max-w-[55vw] sm:max-w-full scrollbar-none">
          {systems.map((sys) => {
            const Icon = sys.icon;
            const isActive = currentSystem === sys.id;
            return (
              <button
                key={sys.id}
                id={`tab-${sys.id}`}
                onClick={() => onSelectSystem(sys.id)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs md:text-sm font-semibold transition-all whitespace-nowrap border min-h-[32px] sm:min-h-[36px] ${
                  isActive
                    ? `${sys.activeBg} shadow-md`
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={sys.labelEn}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'scale-110' : ''}`} />
                <span className="truncate max-w-[70px] sm:max-w-none">{sys.labelAr}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Reset, Fullscreen */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            id="btn-reset-view"
            onClick={onResetView}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="إعادة ضبط زاوية الكاميرا"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="btn-fullscreen"
            onClick={toggleFullscreen}
            className="hidden sm:flex p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors"
            title="ملء الشاشة"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
