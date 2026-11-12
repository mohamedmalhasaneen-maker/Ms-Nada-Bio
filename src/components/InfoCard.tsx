import React, { useState } from 'react';
import { AnatomicalItem } from '../types';
import {
  X,
  Stethoscope,
  Activity,
  Lightbulb,
  Crosshair,
  Compass,
  Layers,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface InfoCardProps {
  item: AnatomicalItem;
  onClose: () => void;
  onFocus: () => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({ item, onClose, onFocus }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clinical' | 'facts'>('overview');
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const getSystemBadge = () => {
    switch (item.system) {
      case 'skeletal':
        return {
          labelAr: 'الهيكل العظمي',
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        };
      case 'muscular':
        return {
          labelAr: 'الجهاز العضلي',
          bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        };
      case 'nervous':
        return {
          labelAr: 'الجهاز العصبي',
          bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        };
      default:
        return {
          labelAr: 'تشريحي',
          bg: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
        };
    }
  };

  const badge = getSystemBadge();

  return (
    <div
      id="anatomy-info-card"
      className={`w-full sm:w-[420px] flex flex-col rounded-2xl sm:rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-black/80 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-left-4 ${
        isMobileExpanded ? 'max-h-[78vh]' : 'max-h-auto sm:max-h-[85vh]'
      }`}
      dir="rtl"
    >
      {/* Mobile-Only Pull-up Handle & Toggle Bar */}
      <div
        onClick={() => setIsMobileExpanded((prev) => !prev)}
        className="sm:hidden flex items-center justify-between px-4 py-1.5 bg-slate-950/80 border-b border-slate-800/80 cursor-pointer active:bg-slate-900 select-none"
      >
        <div className="w-8 h-1 rounded-full bg-slate-700 mx-auto" />
        <button
          className="text-[11px] font-semibold text-teal-300 flex items-center gap-1 hover:text-teal-200"
        >
          <span>{isMobileExpanded ? 'تصغير لرؤية المجسم' : 'عرض الشرح والتفاصيل الكاملة'}</span>
          {isMobileExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Card Header */}
      <div className="relative p-3.5 sm:p-5 pb-3 sm:pb-4 border-b border-slate-800 bg-gradient-to-b from-slate-850 to-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className={`text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                {badge.labelAr}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {item.regionAr}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">
              {item.nameAr}
            </h2>

            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 truncate" dir="ltr">
              <span className="text-teal-400 font-semibold">{item.nameEn}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 italic">[{item.latinName}]</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Close card button */}
            <button
              id="btn-close-card"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="إغلاق البطاقة والرجوع للهيكل بالكامل"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action quick button */}
        <div className="mt-2.5 sm:mt-3 flex items-center gap-2">
          <button
            onClick={onFocus}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold transition-colors min-h-[36px]"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>تركيز الكاميرا</span>
          </button>
        </div>

        {/* Tab switcher: On mobile, visible when expanded or on desktop */}
        <div
          className={`items-center gap-1 mt-3 p-1 rounded-xl bg-slate-950/70 border border-slate-800/80 ${
            isMobileExpanded ? 'flex' : 'hidden sm:flex'
          }`}
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 min-h-[34px] ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-teal-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>الوظيفة الحيوية</span>
          </button>

          <button
            onClick={() => setActiveTab('clinical')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 min-h-[34px] ${
              activeTab === 'clinical'
                ? 'bg-slate-800 text-rose-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>الطب والتشريح</span>
          </button>

          <button
            onClick={() => setActiveTab('facts')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 min-h-[34px] ${
              activeTab === 'facts'
                ? 'bg-slate-800 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>حقائق علمية</span>
          </button>
        </div>
      </div>

      {/* Card Body with Scroll: on mobile only shown when expanded */}
      <div
        className={`p-4 sm:p-5 overflow-y-auto space-y-4 text-sm leading-relaxed text-slate-200 ${
          isMobileExpanded ? 'block' : 'hidden sm:block'
        }`}
      >
        {activeTab === 'overview' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {(item.exactLocationAr || item.anatomicalLocationAr) && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                  <Crosshair className="w-4 h-4" />
                  <span>الموقع التشريحي الدقيق ({item.categoryAr || 'التشريح العضلي والعظمي'})</span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  {item.exactLocationAr || item.anatomicalLocationAr}
                </p>
              </div>
            )}

            {item.infoAr && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <Lightbulb className="w-4 h-4" />
                  <span>الشرح والمعلومات التشريحية</span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  {item.infoAr}
                </p>
              </div>
            )}

            {item.primaryFunctionAr && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <Activity className="w-4 h-4" />
                  <span>الوظيفة الحركية الأساسية</span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  {item.primaryFunctionAr}
                </p>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
                <Compass className="w-4 h-4" />
                <span>الوصف والبيوميكانيكا الحيوية</span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm">
                {item.functionAr}
              </p>
            </div>

            {item.movementOrPathwayAr && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                  <Activity className="w-4 h-4" />
                  <span>المسار العصبي أو الحركة الميكانيكية</span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm">
                  {item.movementOrPathwayAr}
                </p>
              </div>
            )}

            {item.compositionAr && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <Layers className="w-4 h-4" />
                  <span>البنية والتركيب النسيجي</span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm">
                  {item.compositionAr}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'clinical' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                <Stethoscope className="w-4 h-4" />
                <span>الملاحظات السريرية والإصابات الشائعة</span>
              </div>
              <p className="text-slate-200 text-xs sm:text-sm">
                {item.clinicalNotesAr}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>معلومة موثقة وفق مراجع التشريح وعلم وظائف الأعضاء البشري.</span>
            </div>
          </div>
        )}

        {activeTab === 'facts' && (
          <div className="space-y-2.5 animate-in fade-in duration-200">
            {item.factsAr.map((fact, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs sm:text-sm text-slate-300"
              >
                <div className="p-1 rounded-md bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <p className="flex-1">{fact}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: on mobile shown only when expanded */}
      <div
        className={`p-3 border-t border-slate-800/80 bg-slate-950/80 text-[11px] text-slate-400 items-center justify-between ${
          isMobileExpanded ? 'flex' : 'hidden sm:flex'
        }`}
      >
        <span>مقياس التشريح: نسبي 1:1</span>
        <button
          onClick={onClose}
          className="text-teal-400 hover:underline font-semibold"
        >
          تمت المعاينة والرجوع
        </button>
      </div>
    </div>
  );
};
