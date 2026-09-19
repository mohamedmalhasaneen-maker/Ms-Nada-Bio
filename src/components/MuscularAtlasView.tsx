import React, { useState, useMemo } from 'react';
import { AnatomicalItem, DisplayLayoutMode, AnatomicalViewMode, CameraPreset } from '../types';
import { ANATOMICAL_ITEMS } from '../data/anatomyData';
import {
  Layers,
  Eye,
  Columns3,
  Rotate3d,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Volume2,
  Crosshair,
  Compass,
} from 'lucide-react';

interface MuscularAtlasViewProps {
  selectedItem: AnatomicalItem | null;
  onSelectItem: (item: AnatomicalItem | null) => void;
  displayLayout: DisplayLayoutMode;
  onChangeDisplayLayout: (layout: DisplayLayoutMode) => void;
  onSelectPreset: (preset: CameraPreset) => void;
  activeView: AnatomicalViewMode | 'free';
  onChangeView: (view: AnatomicalViewMode | 'free') => void;
}

interface MuscleGroupCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  count: number;
  itemIds: string[];
}

export const MUSCLE_CATEGORIES: MuscleGroupCategory[] = [
  {
    id: 'head_neck',
    nameAr: 'عضلات الرأس والرقبة والفك',
    nameEn: 'Head, Neck & Jaw',
    count: 3,
    itemIds: ['muscle_masseter', 'muscle_sternocleidomastoid', 'masseter', 'temporalis', 'sternocleidomastoid'],
  },
  {
    id: 'chest_shoulder',
    nameAr: 'عضلات الصدر والكتف',
    nameEn: 'Chest & Shoulder',
    count: 3,
    itemIds: ['muscle_pectoralis_major', 'muscle_deltoid', 'pectoralis_major', 'deltoid', 'rotator_cuff'],
  },
  {
    id: 'arms',
    nameAr: 'عضلات الذراعين والساعد',
    nameEn: 'Arms & Forearms',
    count: 4,
    itemIds: ['muscle_biceps', 'muscle_triceps', 'muscle_brachioradialis', 'biceps', 'triceps', 'forearm_muscles'],
  },
  {
    id: 'torso_back_abs',
    nameAr: 'عضلات الجذع والظهر والبطن',
    nameEn: 'Torso, Back & Abdomen',
    count: 5,
    itemIds: ['muscle_trapezius', 'muscle_latissimus_dorsi', 'muscle_rectus_abdominis', 'muscle_obliques', 'trapezius', 'latissimus_dorsi', 'rectus_abdominis', 'obliques', 'erector_spinae'],
  },
  {
    id: 'pelvis_glutes',
    nameAr: 'عضلات الحوض والأرداف',
    nameEn: 'Pelvis & Glutes',
    count: 1,
    itemIds: ['muscle_gluteus_maximus', 'gluteus_maximus'],
  },
  {
    id: 'legs_feet',
    nameAr: 'عضلات الساقين والفخذ والقدم',
    nameEn: 'Legs & Lower Limbs',
    count: 6,
    itemIds: ['muscle_quadriceps', 'muscle_hamstrings', 'muscle_gastrocnemius', 'muscle_soleus', 'muscle_tibialis_anterior', 'quadriceps', 'hamstrings', 'gastrocnemius', 'soleus', 'tibialis_anterior'],
  },
];

export const MuscularAtlasView: React.FC<MuscularAtlasViewProps> = ({
  selectedItem,
  onSelectItem,
  displayLayout,
  onChangeDisplayLayout,
  onSelectPreset,
  activeView,
  onChangeView,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // 20 Core Muscular Items
  const allMuscularItems = useMemo(() => {
    return Object.values(ANATOMICAL_ITEMS).filter((item) => item.system === 'muscular');
  }, []);

  const filteredMuscles = useMemo(() => {
    return allMuscularItems.filter((m) => {
      // Category match
      if (selectedCategory !== 'all') {
        const cat = MUSCLE_CATEGORIES.find((c) => c.id === selectedCategory);
        if (cat && !cat.itemIds.includes(m.id)) {
          return false;
        }
      }

      // View match if not 'free' and in single view
      if (activeView !== 'free' && displayLayout === 'single' && m.primaryView && m.primaryView !== activeView) {
        // Still allow search to override
        if (!searchFilter) {
          return false;
        }
      }

      // Search match
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        return (
          m.nameAr.toLowerCase().includes(q) ||
          m.nameEn.toLowerCase().includes(q) ||
          m.latinName.toLowerCase().includes(q) ||
          (m.anatomicalLocationAr && m.anatomicalLocationAr.toLowerCase().includes(q)) ||
          (m.primaryFunctionAr && m.primaryFunctionAr.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [allMuscularItems, selectedCategory, activeView, displayLayout, searchFilter]);

  // Handle switching to a specific anatomical view
  const handleSwitchView = (view: AnatomicalViewMode) => {
    onChangeView(view);
    if (displayLayout === 'triple') {
      onChangeDisplayLayout('single');
    }
    switch (view) {
      case 'anterior':
        onSelectPreset('front');
        break;
      case 'posterior':
        onSelectPreset('back');
        break;
      case 'lateral':
        onSelectPreset('side');
        break;
    }
  };

  const handleToggleTriple = () => {
    if (displayLayout === 'triple') {
      onChangeDisplayLayout('single');
    } else {
      onChangeDisplayLayout('triple');
      onChangeView('free');
    }
  };

  return (
    <div
      id="muscular-system-atlas-bar"
      className="absolute top-2 sm:top-4 right-2 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-25 max-w-[calc(100vw-1rem)] sm:max-w-4xl pointer-events-auto"
      dir="rtl"
    >
      <div className="flex flex-col rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-rose-950/40 shadow-2xl shadow-black/80 overflow-hidden ring-1 ring-white/5">
        {/* Main View Switcher Bar */}
        <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2">
          {/* Anatomical Views Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {/* Triple View Toggle Button */}
            <button
              id="btn-atlas-triple-view"
              onClick={handleToggleTriple}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] border ${
                displayLayout === 'triple'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-950/60 ring-1 ring-rose-400/50'
                  : 'bg-slate-900/90 hover:bg-slate-850 text-slate-300 border-slate-800'
              }`}
              title="عرض 3 مجسمات تشريحية كاملة جنباً إلى جنب (أمامي • جانبي • خلفي)"
            >
              <Columns3 className="w-4 h-4 text-rose-300" />
              <span className="hidden sm:inline">المخطط الثلاثي</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/70 text-rose-300 border border-rose-500/30">
                3D Triple
              </span>
            </button>

            {/* Anterior View (أمامية) */}
            <button
              id="btn-view-anterior"
              onClick={() => handleSwitchView('anterior')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap min-h-[38px] border ${
                displayLayout === 'single' && activeView === 'anterior'
                  ? 'bg-rose-500/20 text-rose-200 border-rose-500/50 shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-850 text-slate-300 border-slate-800'
              }`}
              title="الرؤية الأمامية (عضلات الصدر، البطن، الفخذ الأمامي، الذراعين)"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>أمامية (Anterior)</span>
            </button>

            {/* Posterior View (خلفية) */}
            <button
              id="btn-view-posterior"
              onClick={() => handleSwitchView('posterior')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap min-h-[38px] border ${
                displayLayout === 'single' && activeView === 'posterior'
                  ? 'bg-rose-500/20 text-rose-200 border-rose-500/50 shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-850 text-slate-300 border-slate-800'
              }`}
              title="الرؤية الخلفية (عضلات الظهر، الأرداف، الكتف الخلفي، الساق الخلفي)"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>خلفية (Posterior)</span>
            </button>

            {/* Lateral View (جانبية) */}
            <button
              id="btn-view-lateral"
              onClick={() => handleSwitchView('lateral')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap min-h-[38px] border ${
                displayLayout === 'single' && activeView === 'lateral'
                  ? 'bg-rose-500/20 text-rose-200 border-rose-500/50 shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-850 text-slate-300 border-slate-800'
              }`}
              title="الرؤية الجانبية (العضلة الدالية، عضلات الخاصرة، الساق الجانبية)"
            >
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>جانبية (Lateral)</span>
            </button>

            {/* Free 360° Orbit */}
            <button
              id="btn-view-free"
              onClick={() => {
                onChangeView('free');
                if (displayLayout === 'triple') onChangeDisplayLayout('single');
              }}
              className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap min-h-[38px] border ${
                displayLayout === 'single' && activeView === 'free'
                  ? 'bg-slate-800 text-slate-100 border-slate-600'
                  : 'bg-slate-900/40 hover:bg-slate-850 text-slate-400 border-slate-800'
              }`}
              title="تدوير حر بزاوية 360 درجة"
            >
              <Rotate3d className="w-3.5 h-3.5 text-slate-400" />
              <span>حر 360°</span>
            </button>
          </div>

          {/* Quick Expand Drawer for the 20 Muscle Groups */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="btn-toggle-muscles-drawer"
              onClick={() => setIsExpanded((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] border ${
                isExpanded
                  ? 'bg-slate-850 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800'
              }`}
              title="استعراض المجموعات العضلية الـ 20"
            >
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden xs:inline">المجموعات الـ 20</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-mono">
                {allMuscularItems.length}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Drawer: 20 Muscle Groups Catalog & Quick Select */}
        {isExpanded && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/95 space-y-3 animate-in fade-in slide-in-from-top-2 max-h-[55vh] overflow-y-auto">
            {/* Category Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border ${
                    selectedCategory === 'all'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  جميع العضلات (20)
                </button>
                {MUSCLE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border ${
                      selectedCategory === cat.id
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {cat.nameAr}
                  </button>
                ))}
              </div>

              {/* Fast Search input */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="ابحث عن عضلة..."
                  className="w-full pr-8 pl-3 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                />
              </div>
            </div>

            {/* Muscle Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredMuscles.map((muscle) => {
                const isSelected = selectedItem?.id === muscle.id;
                const viewBadge =
                  muscle.primaryView === 'anterior'
                    ? { text: 'رؤية أمامية', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30' }
                    : muscle.primaryView === 'posterior'
                    ? { text: 'رؤية خلفية', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' }
                    : { text: 'رؤية جانبية', color: 'text-sky-300 bg-sky-500/15 border-sky-500/30' };

                return (
                  <button
                    key={muscle.id}
                    id={`atlas-card-${muscle.id}`}
                    onClick={() => {
                      onSelectItem(muscle);
                      // In single mode, if user selects a muscle, auto-align to its primary view
                      if (displayLayout === 'single' && muscle.primaryView) {
                        onChangeView(muscle.primaryView);
                      }
                      setIsExpanded(false);
                    }}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 group active:scale-[0.98] ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500/60 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/40'
                        : 'bg-slate-900/70 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <h4 className={`text-xs font-bold truncate ${
                          isSelected ? 'text-rose-200' : 'text-slate-200 group-hover:text-rose-300'
                        }`}>
                          {muscle.nameAr}
                        </h4>
                        <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5" dir="ltr">
                          {muscle.nameEn}
                        </p>
                      </div>

                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0 ${viewBadge.color}`}>
                        {viewBadge.text}
                      </span>
                    </div>

                    {muscle.primaryFunctionAr && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {muscle.primaryFunctionAr}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500">
                      <span className="truncate">{muscle.regionAr}</span>
                      <span className="flex items-center gap-1 text-rose-400 group-hover:text-rose-300">
                        <span>فحص وتركيز</span>
                        <Crosshair className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
