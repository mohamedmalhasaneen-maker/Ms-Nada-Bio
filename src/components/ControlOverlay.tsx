import React, { useState } from 'react';
import { RenderMode, CameraPreset, ViewerEngine } from '../types';
import {
  Rotate3d,
  Eye,
  Box,
  Compass,
  Layers,
  Sparkles,
  Cpu,
  SlidersHorizontal,
  X,
} from 'lucide-react';

interface ControlOverlayProps {
  renderMode: RenderMode;
  onChangeRenderMode: (mode: RenderMode) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onSelectPreset: (preset: CameraPreset) => void;
  viewerEngine: ViewerEngine;
  onChangeViewerEngine: (engine: ViewerEngine) => void;
}

export const ControlOverlay: React.FC<ControlOverlayProps> = ({
  renderMode,
  onChangeRenderMode,
  autoRotate,
  onToggleAutoRotate,
  onSelectPreset,
  viewerEngine,
  onChangeViewerEngine,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const presets: { id: CameraPreset; labelAr: string }[] = [
    { id: 'front', labelAr: 'أمامي' },
    { id: 'back', labelAr: 'خلفي' },
    { id: 'side', labelAr: 'جانبي' },
    { id: 'top', labelAr: 'علوي' },
    { id: 'head', labelAr: 'الرأس' },
    { id: 'torso', labelAr: 'الجذع' },
    { id: 'limbs', labelAr: 'الأطراف' },
  ];

  const renderModeLabels: Record<RenderMode, string> = {
    solid: 'صلب',
    xray: 'أشعة X',
    wireframe: 'شبكي',
  };

  return (
    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 pointer-events-none">
      {/* Mobile-Only Compact Quick Trigger Bar */}
      <div className="flex sm:hidden items-center gap-1.5 pointer-events-auto">
        <button
          id="btn-mobile-tools-toggle"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/90 backdrop-blur-md border shadow-lg text-xs font-semibold transition-all active:scale-95 min-h-[44px] ${
            isMobileOpen
              ? 'border-teal-500/60 text-teal-300 bg-slate-900 ring-1 ring-teal-500/40'
              : 'border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="أدوات العرض وزوايا الكاميرا"
        >
          <SlidersHorizontal className="w-4 h-4 text-teal-400" />
          <span>أدوات العرض</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700">
            {renderModeLabels[renderMode]}
          </span>
        </button>

        <button
          id="btn-mobile-autorotate"
          onClick={onToggleAutoRotate}
          className={`p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center ${
            autoRotate
              ? 'border-teal-500/50 bg-teal-500/20 text-teal-300'
              : 'border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="دوران تلقائي 360°"
        >
          <Rotate3d className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        </button>
      </div>

      {/* Desktop View & Mobile Expanded Panel */}
      <div
        className={`flex-col gap-2 max-w-[calc(100vw-2rem)] sm:max-w-none transition-all duration-200 ${
          isMobileOpen
            ? 'flex mt-2 p-2.5 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-2 sm:p-0 sm:bg-transparent sm:border-0 sm:shadow-none'
            : 'hidden sm:flex'
        }`}
      >
        {/* Mobile Header when open */}
        <div className="flex sm:hidden items-center justify-between pb-2 border-b border-slate-800/80 pointer-events-auto">
          <span className="text-xs font-bold text-slate-200">إعدادات العرض ثلاثي الأبعاد</span>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Modes & Rotation Controls */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-xl pointer-events-auto flex-wrap">
          {/* Engine Switcher (Three.js vs Google Model-Viewer) */}
          <div className="flex items-center rounded-lg bg-slate-900/90 p-0.5 border border-slate-700/60">
            <button
              id="btn-engine-three"
              onClick={() => onChangeViewerEngine('three')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all min-h-[32px] sm:min-h-0 ${
                viewerEngine === 'three'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="محرك Three.js المتقدم مع الأشعة السينية والنبضات العصبية"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Three.js</span>
            </button>
            <button
              id="btn-engine-modelviewer"
              onClick={() => onChangeViewerEngine('model-viewer')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all min-h-[32px] sm:min-h-0 ${
                viewerEngine === 'model-viewer'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="محرك Google Model-Viewer الرسمي لعرض المجسم ثلاثي الأبعاد"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Model-Viewer</span>
            </button>
          </div>

          <div className="hidden sm:block w-px h-4 bg-slate-800 mx-0.5" />

          {/* Auto Rotate Toggle (Desktop) */}
          <button
            id="btn-toggle-autorotate"
            onClick={onToggleAutoRotate}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              autoRotate
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent'
            }`}
            title="تشغيل / إيقاف الدوران التلقائي 360 درجة"
          >
            <Rotate3d className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span>دوران 360°</span>
          </button>

          {viewerEngine === 'three' && (
            <>
              <div className="w-px h-4 bg-slate-800 mx-0.5" />

              {/* Solid Shading */}
              <button
                id="btn-mode-solid"
                onClick={() => {
                  onChangeRenderMode('solid');
                  if (window.innerWidth < 640) setIsMobileOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] sm:min-h-0 ${
                  renderMode === 'solid'
                    ? 'bg-slate-850 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
                title="عرض النسيج التشريحي الكامل"
              >
                <Box className="w-3.5 h-3.5 text-teal-400" />
                <span>تشريح صلب</span>
              </button>

              {/* X-Ray Mode */}
              <button
                id="btn-mode-xray"
                onClick={() => {
                  onChangeRenderMode('xray');
                  if (window.innerWidth < 640) setIsMobileOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] sm:min-h-0 ${
                  renderMode === 'xray'
                    ? 'bg-sky-500/20 text-sky-300 shadow-sm border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
                title="وضع الأشعة السينية الشفاف لرؤية الطبقات الداخلية"
              >
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>أشعة X</span>
              </button>

              {/* Wireframe */}
              <button
                id="btn-mode-wireframe"
                onClick={() => {
                  onChangeRenderMode('wireframe');
                  if (window.innerWidth < 640) setIsMobileOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] sm:min-h-0 ${
                  renderMode === 'wireframe'
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
                title="عرض الهيكل الشبكي ثلاثي الأبعاد"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>شبكي</span>
              </button>
            </>
          )}
        </div>

        {/* Camera Angle Preset Pills */}
        {viewerEngine === 'three' && (
          <div className="flex items-center gap-1 p-1 sm:p-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-lg pointer-events-auto overflow-x-auto max-w-[90vw] scrollbar-thin">
            <div className="flex items-center gap-1 px-2 text-[11px] text-slate-400 font-medium shrink-0">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">الزوايا:</span>
            </div>
            {presets.map((preset) => (
              <button
                key={preset.id}
                id={`preset-${preset.id}`}
                onClick={() => {
                  onSelectPreset(preset.id);
                  if (window.innerWidth < 640) setIsMobileOpen(false);
                }}
                className="px-2.5 py-1.5 rounded-md text-[11px] sm:text-xs font-medium text-slate-300 hover:text-teal-300 hover:bg-slate-850 transition-colors whitespace-nowrap min-h-[32px] flex items-center justify-center active:bg-slate-800"
              >
                {preset.labelAr}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
