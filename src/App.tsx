import React, { useState, useCallback } from 'react';
import { BodySystem, RenderMode, CameraPreset, AnatomicalItem, ViewerEngine } from './types';
import { Navbar } from './components/Navbar';
import { ThreeViewer } from './components/ThreeViewer';
import { ModelViewerWrapper } from './components/ModelViewerWrapper';
import { InfoCard } from './components/InfoCard';
import { ControlOverlay } from './components/ControlOverlay';
import { PartsSidebar } from './components/PartsSidebar';
import { GuideModal } from './components/GuideModal';
import { ANATOMICAL_ITEMS } from './data/anatomyData';
import {
  Bone,
  Activity,
  Zap,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Layers,
} from 'lucide-react';

export default function App() {
  const [currentSystem, setCurrentSystem] = useState<BodySystem>('skeletal');
  const [selectedItem, setSelectedItem] = useState<AnatomicalItem | null>(null);
  const [renderMode, setRenderMode] = useState<RenderMode>('solid');
  const [viewerEngine, setViewerEngine] = useState<ViewerEngine>('three');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Switch biological system
  const handleSelectSystem = useCallback((system: BodySystem) => {
    setCurrentSystem(system);
    // If the currently selected item is not in this system, reset selection
    if (selectedItem && system !== 'all' && selectedItem.system !== system) {
      setSelectedItem(null);
    }
    // Return to full-body view when switching systems
    setCameraPreset('reset');
  }, [selectedItem]);

  // Select item from 3D scene or sidebar
  const handleSelectItem = useCallback((item: AnatomicalItem | null) => {
    setSelectedItem(item);
    if (item && !isSidebarOpen && window.innerWidth >= 1280) {
      // Keep viewport clear
    }
  }, [isSidebarOpen]);

  // Reset Camera View to show entire model
  const handleResetView = useCallback(() => {
    setSelectedItem(null);
    setCameraPreset('reset');
  }, []);

  const handleSelectPreset = useCallback((preset: CameraPreset) => {
    setCameraPreset(preset);
  }, []);

  const handleResetPresetFlag = useCallback(() => {
    setCameraPreset(null);
  }, []);

  const [isSummaryExpanded, setIsSummaryExpanded] = useState<boolean>(false);

  // Contextual system stats & detailed anatomical breakdown
  const getSystemSummary = () => {
    switch (currentSystem) {
      case 'skeletal':
        return {
          titleAr: 'الجهاز الهيكلي العظمي',
          titleEn: 'Human Skeletal System',
          statsAr: '206 عظمة • حماية الأعضاء ودعم الحركة وإنتاج خلايا الدم',
          accent: 'text-amber-300',
          badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          accentBorder: 'hover:border-amber-500/50',
          primaryFunctions: [
            {
              title: 'الدعامة الهيكلية وحمل القوام',
              desc: 'يشكل الإطار الصلب الذي يحمل عضلات الجسم وأنسجته ويمنحه التماسك والوقفة القائمة.',
            },
            {
              title: 'الحماية الفائقة للأعضاء الحيوية',
              desc: 'الجمجمة تحمي الدماغ، القفص الصدري يحمي القلب والرئتين، والعمود الفقري يحمي الحبل الشوكي.',
            },
            {
              title: 'تكوين خلايا الدم (Hematopoiesis)',
              desc: 'يحتوي نخاع العظام الأحمر على الخلايا الجذعية المسؤولة عن تصنيع كريات الدم الحمراء والبيضاء والصفائح.',
            },
            {
              title: 'مخزن رئيسي للمعادن والأملاح',
              desc: 'يخزن 99% من كالسيوم الجسم و85% من الفوسفور، وينظم توازنها الأيوني في الدم باستمرار.',
            },
          ],
          quickFacts: [
            { label: 'أطول عظمة', val: 'عظم الفخذ (Femur)' },
            { label: 'أصغر عظمة', val: 'عظم الركاب (Stapes)' },
            { label: 'عدد المفاصل', val: 'أكثر من 230 مفصل' },
          ],
        };
      case 'muscular':
        return {
          titleAr: 'الجهاز العضلي البشري',
          titleEn: 'Human Muscular System',
          statsAr: 'أكثر من 600 عضلة • توليد القوة الميكانيكية والحرارة والاتزان',
          accent: 'text-rose-400',
          badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          accentBorder: 'hover:border-rose-500/50',
          primaryFunctions: [
            {
              title: 'توليد القوة والحركة الميكانيكية',
              desc: 'تعمل الألياف العضلية بالانقباض والانبساط (الأكتين والميوسين) لتحريك العظام والمفاصل بسلاسة.',
            },
            {
              title: 'التنظيم الحراري للجسم',
              desc: 'تنتج العضلات أكثر من 85% من حرارة الجسم الإجمالية أثناء النشاط الأيضي والانقباض.',
            },
            {
              title: 'الحفاظ على الاتزان والوضعية',
              desc: 'انقباض نغمي مستمر لعضلات الظهر والجذع لمقاومة الجاذبية الأرضية وثبات الوقوف.',
            },
            {
              title: 'تدوير الدم وحركة الأعضاء الداخلية',
              desc: 'عضلات القلب تضخ الدم بدون توقف، والعضلات الملساء تدفع الطعام في القناة الهضمية والأوعية.',
            },
          ],
          quickFacts: [
            { label: 'أقوى عضلة بالضغط', val: 'الماضغة (Masseter)' },
            { label: 'أكبر عضلة حجماً', val: 'الألوية الكبرى (Gluteus)' },
            { label: 'نسبة وزن الجسم', val: 'حوالي 40% من الوزن' },
          ],
        };
      case 'nervous':
        return {
          titleAr: 'الجهاز العصبي والشبكة العصبية',
          titleEn: 'Human Nervous System',
          statsAr: '86 مليار عصبون • نقل السيالات العصبية بسرعة تصل لـ 120 م/ث',
          accent: 'text-sky-400',
          badgeBg: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
          accentBorder: 'hover:border-sky-500/50',
          primaryFunctions: [
            {
              title: 'الاستشعار واستقبال المنبهات',
              desc: 'ملايين المستقبلات الحسية ترصد التغيرات البيئية الداخلية والخارجية (الضوء، الصوت، الألم، الحرارة).',
            },
            {
              title: 'المعالجة والتكامل والتحليل',
              desc: 'يقوم الدماغ والحبل الشوكي بمعالجة البيانات الحسية، تكوين الذاكرة، واتخاذ القرارات الإرادية.',
            },
            {
              title: 'الاستجابة الحركية والتحكم الإفرازي',
              desc: 'إرسال إشارات كهروكيميائية سريعة لتحفيز انقباض العضلات أو تنشيط إفراز الغدد الصماء.',
            },
            {
              title: 'التنظيم الذاتي التلقائي (Autonomic)',
              desc: 'ضبط مستمر للوظائف الحيوية اللاإرادية كضربات القلب، ضغط الدم، والتنفس بتناغم فوري.',
            },
          ],
          quickFacts: [
            { label: 'عدد العصبونات', val: '~86 مليار خلية عصبية' },
            { label: 'سرعة السيال العصبي', val: 'تصل إلى 120 م/ثانية' },
            { label: 'استهلاك الأكسجين', val: '20% من أكسجين الجسم' },
          ],
        };
      case 'all':
      default:
        return {
          titleAr: 'العرض التشريحي المتكامل',
          titleEn: 'Integrated Anatomical Overview',
          statsAr: 'طبقات متزامنة لتوضيح التناغم الوظيفي بين العظام والعضلات والأعصاب',
          accent: 'text-teal-300',
          badgeBg: 'bg-teal-500/15 border-teal-500/30 text-teal-300',
          accentBorder: 'hover:border-teal-500/50',
          primaryFunctions: [
            {
              title: 'التآزر الحركي الميكانيكي',
              desc: 'الهيكل العظمي يمثل الروافع ونقاط الارتكاز، بينما تمثل العضلات قوة الشد المحركة.',
            },
            {
              title: 'التحكم والتوجيه العصبي الدقيق',
              desc: 'الأعصاب الحركية تتشابك مع الألياف العضلية في الوصلات العصبية العضلية لتنسيق كل حركة.',
            },
            {
              title: 'التغذية والأيض والحماية المشتركة',
              desc: 'تكامل كامل للأوعية الدموية والأعصاب المارة عبر القنوات العظمية لتغذية العضلات والأعضاء.',
            },
            {
              title: 'الاتزان الداخلي (Homeostasis)',
              desc: 'تعاون وثيق بين كافة الأجهزة للحفاظ على ثبات درجة الحرارة، ضغط الدم، ومستويات المعادن.',
            },
          ],
          quickFacts: [
            { label: 'الأجهزة المدمجة', val: 'عظام + عضلات + أعصاب' },
            { label: 'نوع العرض', val: 'تفكيك وتشريح متعدد الطبقات' },
            { label: 'التوافق الحيوي', val: 'تزامن ثلاثي الأبعاد فوري' },
          ],
        };
    }
  };

  const summary = getSystemSummary();

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 font-['Cairo',sans-serif] text-slate-100 select-none">
      {/* 1. Top Navbar */}
      <Navbar
        currentSystem={currentSystem}
        onSelectSystem={handleSelectSystem}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetView={handleResetView}
      />

      {/* 2. Main 3D Stage & Interactive UI Overlay */}
      <main className="relative flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* 3D Canvas Viewport (Three.js or Google Model-Viewer) */}
        {viewerEngine === 'three' ? (
          <ThreeViewer
            system={currentSystem}
            selectedItem={selectedItem}
            onSelectItem={handleSelectItem}
            renderMode={renderMode}
            autoRotate={autoRotate}
            cameraPreset={cameraPreset}
            onResetPreset={handleResetPresetFlag}
          />
        ) : (
          <ModelViewerWrapper
            system={currentSystem}
            selectedItem={selectedItem}
            onSelectItem={handleSelectItem}
            autoRotate={autoRotate}
          />
        )}

        {/* 3D Controls Overlay (Top-Left) */}
        <ControlOverlay
          renderMode={renderMode}
          onChangeRenderMode={setRenderMode}
          autoRotate={autoRotate}
          onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
          onSelectPreset={handleSelectPreset}
          viewerEngine={viewerEngine}
          onChangeViewerEngine={setViewerEngine}
        />

        {/* System Summary Floating Card on the Side (Bottom-Right) - Expandable on hover with detailed breakdown & subtle floating animation */}
        <div
          id="system-summary-side-card"
          onMouseEnter={() => setIsSummaryExpanded(true)}
          onMouseLeave={() => setIsSummaryExpanded(false)}
          className={`hidden md:flex absolute bottom-4 right-4 z-20 pointer-events-auto flex-col items-start gap-2 p-3.5 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 shadow-2xl transition-all duration-300 ease-out ring-1 ring-white/5 group animate-subtle-float ${
            summary.accentBorder
          } ${
            isSidebarOpen ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
          } ${
            isSummaryExpanded
              ? 'w-[380px] lg:w-[420px] max-h-[75vh] overflow-y-auto scrollbar-thin shadow-teal-950/30'
              : 'w-[320px] cursor-pointer'
          }`}
          dir="rtl"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className={`font-bold text-xs sm:text-sm ${summary.accent} flex items-center gap-1.5`}>
                <span>{summary.titleAr}</span>
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${summary.badgeBg}`}>
                {summary.titleEn}
              </span>
              <span className="text-slate-400 transition-transform duration-200">
                {isSummaryExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-300" />
                )}
              </span>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{summary.statsAr}</p>

          {/* Expandable Breakdown (Triggered on hover or toggle) */}
          {isSummaryExpanded ? (
            <div className="w-full pt-2.5 mt-1 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-200">
              {/* Primary Biological Functions Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>الوظائف الحيوية والفسيولوجية الرئيسية:</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {summary.primaryFunctions.map((fn, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/60 hover:border-slate-700/80 transition-colors space-y-0.5 text-right"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                        <span>{fn.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal pr-3">{fn.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Scientific Facts Pills */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>حقائق ومعلومات علمية دقيقة:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {summary.quickFacts.map((fact, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center flex flex-col items-center justify-center gap-0.5"
                    >
                      <span className="text-[9px] text-slate-400 font-medium">{fact.label}</span>
                      <span className="text-[10px] font-bold text-slate-200 font-mono">{fact.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slogan footnote */}
              <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span className="text-teal-400 font-semibold">الأحياء أسهل مع مس/ ندى بدوي</span>
                <span className="text-slate-500 font-mono">BioAnatomy 3D Explorer</span>
              </div>
            </div>
          ) : (
            <div className="w-full pt-1 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-teal-400/90 group-hover:text-teal-300">
                <Sparkles className="w-3 h-3" />
                <span>مرر الفأرة لعرض التفاصيل والوظائف الحيوية</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">4 وظائف</span>
            </div>
          )}
        </div>

        {/* Floating Detailed Info Card (Bottom / Left on larger screens) */}
        {selectedItem && (
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-auto z-30 max-w-none sm:max-w-[420px] pointer-events-auto">
            <InfoCard
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onFocus={() => {
                setCameraPreset('reset');
                // Trigger camera focus by re-setting item
                setSelectedItem({ ...selectedItem });
              }}
            />
          </div>
        )}

        {/* Parts Explorer Sidebar (Right Side) */}
        <PartsSidebar
          system={currentSystem}
          selectedItem={selectedItem}
          onSelectItem={handleSelectItem}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Bottom Quick System Switcher for Mobile & Tablet */}
        <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-2xl">
          <button
            onClick={() => handleSelectSystem('skeletal')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
              currentSystem === 'skeletal'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400'
            }`}
          >
            <Bone className="w-3.5 h-3.5" />
            <span>عظام</span>
          </button>

          <button
            onClick={() => handleSelectSystem('muscular')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
              currentSystem === 'muscular'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>عضلات</span>
          </button>

          <button
            onClick={() => handleSelectSystem('nervous')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
              currentSystem === 'nervous'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>أعصاب</span>
          </button>
        </div>
      </main>

      {/* User & Educational Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
