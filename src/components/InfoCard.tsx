import React, { useState, useEffect, useRef } from 'react';
import { AnatomicalItem } from '../types';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Square,
  Stethoscope,
  Activity,
  Lightbulb,
  Crosshair,
  Compass,
  Layers,
  Sparkles,
  ChevronUp,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

interface InfoCardProps {
  item: AnatomicalItem;
  onClose: () => void;
  onFocus: () => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({ item, onClose, onFocus }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clinical' | 'facts'>('overview');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSpeechCategory, setActiveSpeechCategory] = useState<string | null>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isAutoNarrate, setIsAutoNarrate] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bioatlas_auto_tts') !== 'false';
    } catch {
      return true;
    }
  });

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setActiveSpeechCategory(null);
  };

  const speakText = (text: string, lang: 'ar' | 'en' = 'ar', category: string = 'general') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = lang === 'ar' ? 0.95 : 0.92;
    utterance.pitch = 1.0;

    // Pick a matching native voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(lang === 'ar' ? 'ar' : 'en')
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setActiveSpeechCategory(category);
    };
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setActiveSpeechCategory(null);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setActiveSpeechCategory(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Full explanation text composed for natural scientific narration
  const getFullExplanationText = () => {
    const location = item.exactLocationAr ? `الموقع الدقيق: ${item.exactLocationAr}.` : item.anatomicalLocationAr ? `الموقع التشريحي: ${item.anatomicalLocationAr}.` : `يقع في منطقة ${item.regionAr}.`;
    const func = item.infoAr ? `الشرح الطبي: ${item.infoAr}` : item.primaryFunctionAr ? `الوظيفة الأساسية: ${item.primaryFunctionAr}.` : `الوظيفة الحيوية: ${item.functionAr}`;
    return `${item.nameAr}. ${location} ${func}`;
  };

  // Toggle Auto-TTS on/off and persist
  const handleToggleAutoNarrate = () => {
    const next = !isAutoNarrate;
    setIsAutoNarrate(next);
    try {
      localStorage.setItem('bioatlas_auto_tts', String(next));
    } catch {
      // ignore
    }
    if (!next) {
      stopSpeaking();
    } else {
      speakText(getFullExplanationText(), 'ar', 'overview');
    }
  };

  // Auto-speak explanation when InfoCard opens or selected item changes
  useEffect(() => {
    if (!isAutoNarrate) {
      stopSpeaking();
      return;
    }

    // A brief 250ms delay allows smooth visual opening and audio focus
    const timer = setTimeout(() => {
      speakText(getFullExplanationText(), 'ar', 'overview');
    }, 280);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [item.id, isAutoNarrate]);

  // Handle voices loading asynchronously in browser
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        // triggers re-evaluation if needed
      };
    }
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleClose = () => {
    stopSpeaking();
    onClose();
  };

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
            {/* Pronounce name button */}
            <button
              id="btn-pronounce"
              onClick={() => {
                if (isPlayingAudio && activeSpeechCategory === 'name') {
                  stopSpeaking();
                } else {
                  speakText(item.nameAr, 'ar', 'name');
                }
              }}
              className={`p-2 rounded-xl text-slate-400 hover:text-teal-300 hover:bg-slate-800 border border-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
                isPlayingAudio && activeSpeechCategory === 'name' ? 'text-teal-300 bg-slate-800 ring-2 ring-teal-500/40' : ''
              }`}
              title="نطق اسم العضو"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Close card button */}
            <button
              id="btn-close-card"
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="إغلاق البطاقة والرجوع للهيكل بالكامل"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TTS Audio Narration Bar */}
        <div
          id="tts-narration-bar"
          className="mt-2.5 p-2 px-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 shadow-inner"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                isPlayingAudio
                  ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/50 shadow-xs'
                  : 'bg-slate-800/80 text-slate-400'
              }`}
            >
              {isPlayingAudio ? (
                <div className="flex items-center gap-0.5 h-3.5 px-0.5" title="جاري النطق الصوتي">
                  <span className="w-1 h-3 bg-teal-400 rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-teal-300 rounded-full animate-bounce" />
                  <span className="w-1 h-2 bg-teal-400 rounded-full animate-pulse" />
                </div>
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-200 truncate flex items-center gap-1.5">
                <span>{isPlayingAudio ? 'جاري القراءة الصوتية للشرح...' : 'النطق الصوتي التلقائي (TTS)'}</span>
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {isPlayingAudio ? item.nameAr : 'قراءة تفاعلية للمعلومات عند الاختيار'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Play / Stop narration */}
            {isPlayingAudio ? (
              <button
                id="btn-tts-stop"
                onClick={stopSpeaking}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95 min-h-[30px]"
                title="إيقاف القراءة الصوتية"
              >
                <Square className="w-3 h-3 fill-rose-300" />
                <span>إيقاف</span>
              </button>
            ) : (
              <button
                id="btn-tts-play"
                onClick={() => speakText(getFullExplanationText(), 'ar', 'overview')}
                className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95 min-h-[30px]"
                title="إعادة الاستماع لشرح العضو"
              >
                <Play className="w-3 h-3 fill-teal-300" />
                <span>استماع</span>
              </button>
            )}

            {/* Toggle Auto-TTS preference */}
            <button
              id="btn-tts-toggle-auto"
              onClick={handleToggleAutoNarrate}
              className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition-all flex items-center gap-1 min-h-[30px] ${
                isAutoNarrate
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/40 hover:bg-teal-500/25'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title={isAutoNarrate ? 'النطق التلقائي مفعّل: انقر للتعطيل' : 'النطق التلقائي معطّل: انقر للتفعيل'}
            >
              {isAutoNarrate ? (
                <Sparkles className="w-3 h-3 text-teal-400" />
              ) : (
                <VolumeX className="w-3 h-3 text-slate-400" />
              )}
              <span className="text-[10px] hidden xs:inline">{isAutoNarrate ? 'تلقائي' : 'يدوي'}</span>
            </button>
          </div>
        </div>

        {/* Action quick buttons */}
        <div className="mt-2.5 sm:mt-3 flex items-center gap-2">
          <button
            onClick={onFocus}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold transition-colors min-h-[36px]"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>تركيز الكاميرا</span>
          </button>
          <button
            onClick={() => speakText(`${item.nameEn}. In Latin: ${item.latinName}`, 'en', 'english')}
            className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs transition-colors min-h-[36px]"
            title="Pronounce English & Latin"
          >
            <Volume2 className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-[11px] font-mono">English</span>
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
                <div className="flex items-center justify-between text-rose-400 font-semibold text-xs">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4" />
                    <span>الموقع التشريحي الدقيق ({item.categoryAr || 'التشريح العضلي والعظمي'})</span>
                  </div>
                  <button
                    onClick={() => speakText(item.exactLocationAr || item.anatomicalLocationAr || '', 'ar', 'location')}
                    className="text-slate-400 hover:text-rose-300 p-1 rounded transition-colors"
                    title="استمع للموقع التشريحي"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  {item.exactLocationAr || item.anatomicalLocationAr}
                </p>
              </div>
            )}

            {item.infoAr && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-amber-400 font-semibold text-xs">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    <span>الشرح والمعلومات التشريحية</span>
                  </div>
                  <button
                    onClick={() => speakText(item.infoAr || '', 'ar', 'info')}
                    className="text-slate-400 hover:text-amber-300 p-1 rounded transition-colors"
                    title="استمع للمعلومات التشريحية"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  {item.infoAr}
                </p>
              </div>
            )}

            {item.primaryFunctionAr && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-emerald-400 font-semibold text-xs">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>الوظيفة الحركية الأساسية</span>
                  </div>
                  <button
                    onClick={() => speakText(item.primaryFunctionAr || '', 'ar', 'primary-func')}
                    className="text-slate-400 hover:text-emerald-300 p-1 rounded transition-colors"
                    title="استمع للوظيفة الحركية"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  {item.primaryFunctionAr}
                </p>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-teal-400 font-semibold text-xs">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  <span>الوصف والبيوميكانيكا الحيوية</span>
                </div>
                <button
                  onClick={() => speakText(item.functionAr, 'ar', 'function')}
                  className="text-slate-400 hover:text-teal-300 p-1 rounded transition-colors"
                  title="استمع للوصف الحركي والبيوميكانيكا"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm">
                {item.functionAr}
              </p>
            </div>

            {item.movementOrPathwayAr && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-sky-400 font-semibold text-xs">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>المسار العصبي أو الحركة الميكانيكية</span>
                  </div>
                  <button
                    onClick={() => speakText(item.movementOrPathwayAr || '', 'ar', 'movement')}
                    className="text-slate-400 hover:text-sky-300 p-1 rounded transition-colors"
                    title="استمع للمسار العصبي أو الحركة"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm">
                  {item.movementOrPathwayAr}
                </p>
              </div>
            )}

            {item.compositionAr && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-amber-400 font-semibold text-xs">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>البنية والتركيب النسيجي</span>
                  </div>
                  <button
                    onClick={() => speakText(item.compositionAr || '', 'ar', 'composition')}
                    className="text-slate-400 hover:text-amber-300 p-1 rounded transition-colors"
                    title="استمع للتركيب النسيجي"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
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
              <div className="flex items-center justify-between text-rose-300 font-semibold text-xs">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  <span>الملاحظات السريرية والإصابات الشائعة</span>
                </div>
                <button
                  onClick={() => speakText(item.clinicalNotesAr, 'ar', 'clinical')}
                  className="text-slate-400 hover:text-rose-300 p-1 rounded transition-colors"
                  title="استمع للملاحظات السريرية"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
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
                <button
                  onClick={() => speakText(fact, 'ar', `fact-${idx}`)}
                  className="text-slate-500 hover:text-amber-300 p-1 rounded transition-colors shrink-0"
                  title="استمع لهذه الحقيقة"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
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
          onClick={handleClose}
          className="text-teal-400 hover:underline font-semibold"
        >
          تمت المعاينة والرجوع
        </button>
      </div>
    </div>
  );
};

