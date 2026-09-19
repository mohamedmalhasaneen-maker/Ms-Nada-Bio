import React, { useRef, useEffect } from 'react';
import { BodySystem, AnatomicalItem } from '../types';
import { ANATOMY_MODELS, ANATOMICAL_HOTSPOTS } from '../data/modelsConfig';

interface ModelViewerWrapperProps {
  system: BodySystem;
  selectedItem: AnatomicalItem | null;
  onSelectItem: (item: AnatomicalItem) => void;
  autoRotate: boolean;
}

export const ModelViewerWrapper: React.FC<ModelViewerWrapperProps> = ({
  system,
  selectedItem,
  onSelectItem,
  autoRotate,
}) => {
  const viewerRef = useRef<any>(null);

  const modelKey = system === 'all' ? 'skeletal' : system;
  const modelInfo = ANATOMY_MODELS[modelKey] || ANATOMY_MODELS.skeletal;

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    if (selectedItem) {
      const hs = ANATOMICAL_HOTSPOTS.find((h) => h.itemId === selectedItem.id);
      if (hs) {
        const [x, y, z] = hs.position;
        el.cameraTarget = `${x.toFixed(2)}m ${y.toFixed(2)}m ${z.toFixed(2)}m`;
        el.cameraOrbit = `0deg 85deg 45%`;
      }
    } else {
      el.cameraTarget = '0m 0m 0m';
      el.cameraOrbit = '0deg 90deg 125%';
    }
  }, [selectedItem]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-radial from-slate-900/60 via-slate-950 to-slate-950 select-none">
      {/* Google Model Viewer Web Component without dots, framing full body, zoom disabled */}
      <model-viewer
        ref={viewerRef}
        src={modelInfo.localPath}
        alt={modelInfo.titleAr}
        camera-controls
        disable-zoom
        touch-action="pan-y"
        auto-rotate={autoRotate ? true : undefined}
        rotation-per-second="25deg"
        camera-orbit="0deg 90deg 125%"
        camera-target="0m 0m 0m"
        field-of-view="32deg"
        shadow-intensity="1.2"
        shadow-softness="0.7"
        exposure="1.1"
        loading="eager"
        poster=""
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      />

      {/* Floating Badge Indicator for Google Model Viewer */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none flex flex-col items-start gap-1 bg-slate-950/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-xl">
        <div className="flex items-center gap-2 font-semibold text-teal-300">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span>محرك Google Model-Viewer الرسمي</span>
        </div>
        <p className="text-[10px] text-slate-400">
          عرض كامل للمجسم التشريحي مع دوران حر 360 درجة (إطار رؤية ثابت بدون تكبير).
        </p>
      </div>
    </div>
  );
};
