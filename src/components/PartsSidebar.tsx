import React, { useState, useMemo } from 'react';
import { BodySystem, BodyRegion, AnatomicalItem } from '../types';
import { ANATOMICAL_ITEMS } from '../data/anatomyData';
import {
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Crosshair,
  Sparkles,
  BookOpen,
  X,
} from 'lucide-react';

interface PartsSidebarProps {
  system: BodySystem;
  selectedItem: AnatomicalItem | null;
  onSelectItem: (item: AnatomicalItem | null) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const PartsSidebar: React.FC<PartsSidebarProps> = ({
  system,
  selectedItem,
  onSelectItem,
  isOpen,
  onToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | 'all'>('all');

  const regions: { id: BodyRegion | 'all'; labelAr: string }[] = [
    { id: 'all', labelAr: 'الكل' },
    { id: 'head', labelAr: 'الرأس والعنق' },
    { id: 'torso', labelAr: 'الجذع والصدر' },
    { id: 'upper_limbs', labelAr: 'الأطراف العلوية' },
    { id: 'lower_limbs', labelAr: 'الأطراف السفلية' },
  ];

  // Filter items based on active system, region, and search query
  const filteredItems = useMemo(() => {
    return Object.values(ANATOMICAL_ITEMS).filter((item) => {
      // System match
      if (system !== 'all' && item.system !== system) {
        return false;
      }

      // Region match
      if (selectedRegion !== 'all' && item.region !== selectedRegion) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAr = item.nameAr.toLowerCase().includes(q);
        const matchEn = item.nameEn.toLowerCase().includes(q);
        const matchLatin = item.latinName.toLowerCase().includes(q);
        const matchCategory = (item.categoryAr || '').toLowerCase().includes(q);
        const matchLoc = (item.exactLocationAr || '').toLowerCase().includes(q);
        const matchInfo = (item.infoAr || '').toLowerCase().includes(q);
        return matchAr || matchEn || matchLatin || matchCategory || matchLoc || matchInfo;
      }

      return true;
    });
  }, [system, selectedRegion, searchQuery]);

  return (
    <>
      {/* Backdrop on mobile when sidebar is open */}
      {isOpen && (
        <div
          id="parts-sidebar-backdrop"
          onClick={onToggle}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-35 sm:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Toggle button on right edge with smooth outward sliding transition */}
      <button
        id="btn-toggle-sidebar"
        onClick={onToggle}
        className={`fixed top-16 sm:top-20 z-45 flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900/95 hover:bg-slate-850 text-slate-200 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs font-semibold transition-all duration-300 ease-in-out min-h-[44px] ${
          isOpen
            ? 'right-[85vw] max-w-sm:right-full sm:right-96 translate-x-0 border-r-0 rounded-r-none bg-slate-850/95 text-teal-300 border-teal-500/40 shadow-teal-950/40'
            : 'right-3 sm:right-4 translate-x-0 hover:border-teal-500/50 hover:text-white'
        }`}
        title={isOpen ? 'طي الفهرس التشريحي وإظهار المشهد بالكامل' : 'فتح فهرس واستكشاف الأعضاء'}
      >
        <BookOpen className="w-4 h-4 text-teal-400" />
        <span className="hidden sm:inline">{isOpen ? 'إخفاء الفهرس' : 'فهرس الأجزاء'}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-teal-300 font-mono">
          {filteredItems.length}
        </span>
        {isOpen ? (
          <ChevronRight className="w-4 h-4 text-teal-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Slide-out Sidebar Drawer */}
      <aside
        id="parts-explorer-sidebar"
        className={`fixed top-0 sm:top-16 right-0 bottom-0 z-40 sm:z-25 w-[85vw] max-w-sm sm:w-96 bg-slate-950/98 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        dir="rtl"
      >
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
              <h3 className="font-bold text-slate-100 text-sm">
                الفهرس التشريحي الشامل
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                {filteredItems.length} عنصر
              </span>
              <button
                id="btn-close-sidebar-mobile"
                onClick={onToggle}
                className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="إغلاق الفهرس"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-anatomy-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعربية أو الإنجليزية (مثلاً: فخذ، عضد، مخ)..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/40 transition-all min-h-[40px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Region filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin">
            {regions.map((reg) => (
              <button
                key={reg.id}
                onClick={() => setSelectedRegion(reg.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border min-h-[32px] ${
                  selectedRegion === reg.id
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800/80'
                }`}
              >
                {reg.labelAr}
              </button>
            ))}
          </div>
        </div>

        {/* Anatomical List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-medium">لم يتم العثور على نتائج</p>
              <p className="text-xs">جرب البحث بكلمة أخرى أو تغيير قسم التصفية</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  id={`item-${item.id}`}
                  onClick={() => {
                    onSelectItem(isSelected ? null : item);
                    if (window.innerWidth < 640 && !isSelected) {
                      onToggle(); // Close sidebar on mobile so user views focused 3D organ
                    }
                  }}
                  className={`w-full text-right p-3 rounded-xl border transition-all flex items-start gap-3 group min-h-[48px] active:scale-[0.98] ${
                    isSelected
                      ? 'bg-teal-500/15 border-teal-500/50 shadow-md shadow-teal-950/40'
                      : 'bg-slate-900/50 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full mt-1 shrink-0 ring-2 ring-slate-800 transition-transform group-hover:scale-125"
                    style={{ backgroundColor: item.color }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${
                        isSelected ? 'text-teal-300' : 'text-slate-100 group-hover:text-teal-200'
                      }`}>
                        {item.nameAr}
                      </h4>
                      <Crosshair className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                        isSelected ? 'text-teal-400 opacity-100' : 'text-slate-500 opacity-0 group-hover:opacity-100'
                      }`} />
                    </div>

                    <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5" dir="ltr">
                      {item.nameEn}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                        {item.regionAr}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {item.latinName}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer tip */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-400 flex items-center justify-between">
          <span>انقر على أي عنصر للتحليق المباشر نحوه</span>
          <span className="text-teal-400 font-mono">3D Camera</span>
        </div>
      </aside>
    </>
  );
};
