// =========================================================================
// استوديو ولوحة تحكم إدارة التسجيلات الصوتية البشرية والمكتبة الشاملة
// رفع وتجربة وتسجيل الصوت البشري المباشر (مس/ ندى بدوي) لجميع أعضاء الأطلس
// =========================================================================
(function () {
  'use strict';

  let allLibraryItems = [];
  let currentSystemFilter = 'all';
  let searchQuery = '';
  let activeRecordingState = {
    isRecording: false,
    itemId: '',
    sectionKey: 'overview',
    audioBase64: '',
    mimeType: 'audio/webm',
    durationSeconds: 0,
    audioUrl: ''
  };

  // 1. استخراج وفهرسة جميع عناصر الأطلس وموسوعة الأجهزة
  function buildLibraryRegistryIndex() {
    const itemsMap = new Map();

    if (window.ACADEMIC_CURRICULUM) {
      const curriculum = window.ACADEMIC_CURRICULUM;
      for (const sysKey in curriculum) {
        const sysObj = curriculum[sysKey];
        if (!sysObj || !Array.isArray(sysObj.sections)) continue;

        sysObj.sections.forEach(sec => {
          if (!Array.isArray(sec.items)) return;
          sec.items.forEach(item => {
            if (!item || !item.id) return;
            const segments = window.BioAudioDictionary
              ? window.BioAudioDictionary.parseAnatomicalSentences(item)
              : [];

            itemsMap.set(item.id, {
              id: item.id,
              name: item.name || item.id,
              englishName: item.englishName || '',
              systemId: sysObj.id || sysKey,
              systemName: sysObj.name || sysKey,
              sectionName: sec.name || '',
              accentColor: sysObj.accent || '#38bdf8',
              rawItem: item,
              segments: segments,
              totalSegments: segments.length,
              totalWords: segments.reduce((acc, s) => acc + (s.spokenText ? s.spokenText.split(/\s+/).length : 0), 0)
            });
          });
        });
      }
    }

    if (window.SYSTEMS_ENCYCLOPEDIA) {
      const enc = window.SYSTEMS_ENCYCLOPEDIA;
      for (const sysKey in enc) {
        const sysObj = enc[sysKey];
        if (!sysObj || !Array.isArray(sysObj.organs)) continue;

        sysObj.organs.forEach(organ => {
          if (!organ || !organ.id || itemsMap.has(organ.id)) return;
          const segments = window.BioAudioDictionary
            ? window.BioAudioDictionary.parseAnatomicalSentences(organ)
            : [];

          itemsMap.set(organ.id, {
            id: organ.id,
            name: organ.name || organ.id,
            englishName: organ.englishName || '',
            systemId: sysObj.id || sysKey,
            systemName: sysObj.name || sysKey,
            sectionName: 'موسوعة الأجهزة الحيوية',
            accentColor: sysObj.accent || '#10b981',
            rawItem: organ,
            segments: segments,
            totalSegments: segments.length,
            totalWords: segments.reduce((acc, s) => acc + (s.spokenText ? s.spokenText.split(/\s+/).length : 0), 0)
          });
        });
      }
    }

    allLibraryItems = Array.from(itemsMap.values());
    return allLibraryItems;
  }

  // 2. تحديث مؤشرات وإحصائيات التسجيلات البشرية
  async function refreshAudioCacheStatus() {
    if (allLibraryItems.length === 0) buildLibraryRegistryIndex();
    if (window.BioHumanAudioEngine) {
      await window.BioHumanAudioEngine.fetchHumanAudioManifest();
    }
    updateStatsAndRenderModal();
  }

  // 3. حساب تغطية التسجيلات البشرية
  function computeLibraryOverviewStats() {
    if (allLibraryItems.length === 0) buildLibraryRegistryIndex();

    let totalItems = allLibraryItems.length;
    let itemsWithHumanVoice = 0;
    let totalSectionsRecorded = 0;
    let totalSectionsCount = totalItems * 4; // 4 أقسام لكل عضو

    allLibraryItems.forEach(item => {
      let organSectionsRecorded = 0;
      ['name', 'overview', 'landmarks', 'exam'].forEach(secKey => {
        if (window.BioHumanAudioEngine && window.BioHumanAudioEngine.hasHumanRecording(item.id, secKey)) {
          organSectionsRecorded++;
          totalSectionsRecorded++;
        }
      });
      if (organSectionsRecorded === 4) {
        itemsWithHumanVoice++;
      }
    });

    const completionPct = totalSectionsCount > 0
      ? Math.round((totalSectionsRecorded / totalSectionsCount) * 100)
      : 100;

    return {
      totalItems,
      itemsWithHumanVoice,
      pendingItems: totalItems - itemsWithHumanVoice,
      totalSectionsRecorded,
      totalSectionsCount,
      completionPct
    };
  }

  // 4. بناء واجهة استوديو التسجيلات البشرية
  function createAudioLibraryModalHTML() {
    if (document.getElementById('audio-library-control-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'audio-library-control-modal';
    modal.className = 'hidden fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-5 select-text';

    modal.innerHTML = `
      <div class="w-full max-w-5xl med-glass-strong rounded-3xl overflow-hidden flex flex-col max-h-[94dvh] shadow-2xl border border-sky-500/30">
        <!-- شريط الرأس -->
        <div class="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-800/90 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/25 to-sky-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <svg class="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base sm:text-lg font-extrabold text-white">استوديو ولوحة تحكم التسجيلات الصوتية البشرية</h2>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">صوت معلمة الأحياء</span>
              </div>
              <p class="text-xs text-slate-300">تسجيل مباشر بالميكروفون، رفع واستبدال الملفات الصوتية البشرية لكافة أعضاء الجسم</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" onclick="window.BioAudioLibraryRegistry.refreshAudioCacheStatus()" class="px-3 py-1.5 rounded-xl viewer-ctrl-btn text-xs font-bold flex items-center gap-1 text-sky-300">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span>تحديث الفهرس</span>
            </button>
            <button type="button" onclick="window.BioAudioLibraryRegistry.closeAudioLibraryModal()" class="w-8 h-8 rounded-lg viewer-ctrl-btn flex items-center justify-center text-slate-300 hover:text-white" aria-label="إغلاق">✕</button>
          </div>
        </div>

        <!-- بطاقات الإحصائيات -->
        <div class="p-4 sm:p-5 bg-slate-900/60 border-b border-slate-800/80 shrink-0 space-y-3">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-right">
              <div class="text-[11px] text-slate-400 font-medium">إجمالي أعضاء الأطلس</div>
              <div id="lib-stat-total-items" class="font-mono text-xl font-extrabold text-white mt-0.5 tabular-nums">0</div>
              <div class="text-[10px] text-sky-300 mt-1">كافة أجهزة الجسم البشري</div>
            </div>

            <div class="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-right">
              <div class="text-[11px] text-slate-400 font-medium">أعضاء بتسجيلات مكتملة</div>
              <div id="lib-stat-cached-clips" class="font-mono text-xl font-extrabold text-emerald-400 mt-0.5 tabular-nums">0</div>
              <div class="text-[10px] text-emerald-300 mt-1">4 أجزاء مسجلة بالكامل</div>
            </div>

            <div class="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-right">
              <div class="text-[11px] text-slate-400 font-medium">أقسام مسجلة بشرية</div>
              <div id="lib-stat-pending-items" class="font-mono text-xl font-extrabold text-cyan-400 mt-0.5 tabular-nums">0</div>
              <div class="text-[10px] text-cyan-300 mt-1">مقطع بشري حقيقي</div>
            </div>

            <div class="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-right">
              <div class="text-[11px] text-slate-400 font-medium">نسبة الجاهزية البشرية</div>
              <div id="lib-stat-pct" class="font-mono text-xl font-extrabold text-emerald-400 mt-0.5 tabular-nums">0%</div>
              <div class="text-[10px] text-slate-400 mt-1">تسجيلات بصوت معلمة أحياء</div>
            </div>
          </div>

          <div class="space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-300 font-bold">مستوى اكتمال المكتبة الصوتية البشرية:</span>
              <span id="lib-progress-pct-text" class="font-mono font-bold text-emerald-300">0%</span>
            </div>
            <div class="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div id="lib-progress-bar-fill" class="h-full bg-gradient-to-l from-emerald-400 via-sky-400 to-cyan-300 transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
        </div>

        <!-- أدوات التصفية والبحث -->
        <div class="p-3 sm:px-5 sm:py-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full text-xs">
            <button type="button" onclick="window.BioAudioLibraryRegistry.setSystemFilter('all')" data-lib-sys="all" class="chip-btn is-active">الكل</button>
            <button type="button" onclick="window.BioAudioLibraryRegistry.setSystemFilter('skeletal')" data-lib-sys="skeletal" class="chip-btn">الهيكل العظمي</button>
            <button type="button" onclick="window.BioAudioLibraryRegistry.setSystemFilter('muscular')" data-lib-sys="muscular" class="chip-btn">الجهاز العضلي</button>
            <button type="button" onclick="window.BioAudioLibraryRegistry.setSystemFilter('nervous')" data-lib-sys="nervous" class="chip-btn">الجهاز العصبي</button>
            <button type="button" onclick="window.BioAudioLibraryRegistry.setSystemFilter('circulatory')" data-lib-sys="circulatory" class="chip-btn">الدوري والقلب</button>
            <button type="button" onclick="window.BioAudioLibraryRegistry.setSystemFilter('respiratory')" data-lib-sys="respiratory" class="chip-btn">التنفسي</button>
            <button type="button" onclick="window.BioAudioLibraryRegistry.setSystemFilter('digestive')" data-lib-sys="digestive" class="chip-btn">الهضمي</button>
            <button type="button" onclick="window.BioAudioLibraryRegistry.setSystemFilter('urinary')" data-lib-sys="urinary" class="chip-btn">البولي</button>
            <button type="button" onclick="window.BioAudioLibraryRegistry.setSystemFilter('endocrine')" data-lib-sys="endocrine" class="chip-btn">الغدد الصماء</button>
            <button type="button" onclick="window.BioAudioLibraryRegistry.setSystemFilter('lymphatic_immune')" data-lib-sys="lymphatic_immune" class="chip-btn">المناعي</button>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <input type="text" id="lib-search-input" oninput="window.BioAudioLibraryRegistry.setSearchQuery(this.value)" placeholder="ابحث باسم العضو..." class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 w-full sm:w-56" />
          </div>
        </div>

        <!-- شبكة العناصر مع حالة تسجيل الأقسام الأربعة لكل عضو -->
        <div id="lib-items-container" class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          <!-- التوليد التلقائي -->
        </div>

        <!-- التذييل -->
        <div class="p-3 sm:px-5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs shrink-0">
          <div class="text-slate-400">
            المتحدث المحقق: <span class="text-emerald-300 font-bold">مس / ندى بدوي (معلمة أحياء ثانوية عامة)</span>
          </div>
          <button type="button" onclick="window.BioAudioLibraryRegistry.closeAudioLibraryModal()" class="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold">إغلاق</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  // 5. رسم وتحديث شبكة عناصر الأعضاء واستوديو التسجيل لكل عضو
  function updateStatsAndRenderModal() {
    createAudioLibraryModalHTML();

    const stats = computeLibraryOverviewStats();

    const totalEl = document.getElementById('lib-stat-total-items');
    const cachedEl = document.getElementById('lib-stat-cached-clips');
    const pendingEl = document.getElementById('lib-stat-pending-items');
    const pctEl = document.getElementById('lib-stat-pct');
    const barFill = document.getElementById('lib-progress-bar-fill');
    const barText = document.getElementById('lib-progress-pct-text');

    if (totalEl) totalEl.textContent = stats.totalItems;
    if (cachedEl) cachedEl.textContent = stats.itemsWithHumanVoice;
    if (pendingEl) pendingEl.textContent = `${stats.totalSectionsRecorded} / ${stats.totalSectionsCount}`;
    if (pctEl) pctEl.textContent = `${stats.completionPct}%`;
    if (barFill) barFill.style.width = `${stats.completionPct}%`;
    if (barText) barText.textContent = `${stats.completionPct}% (${stats.totalSectionsRecorded} من أصل ${stats.totalSectionsCount} مقطع بشري)`;

    let filtered = allLibraryItems.filter(item => {
      if (currentSystemFilter !== 'all' && item.systemId !== currentSystemFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const engMatch = (item.englishName || '').toLowerCase().includes(q);
        const secMatch = (item.sectionName || '').toLowerCase().includes(q);
        if (!nameMatch && !engMatch && !secMatch) return false;
      }
      return true;
    });

    const container = document.getElementById('lib-items-container');
    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-slate-400 space-y-2">
          <div class="font-bold text-sm">لا توجد أعضاء مطابقة للتصفية الحالية</div>
        </div>
      `;
      return;
    }

    let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">';
    filtered.forEach(item => {
      const cov = window.BioHumanAudioEngine
        ? window.BioHumanAudioEngine.getItemHumanCoverage(item.id, item.segments)
        : { total: 4, recorded: 0, pct: 0 };

      html += `
        <div class="p-4 rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between gap-3">
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${item.accentColor}"></span>
                  <h3 class="text-sm font-extrabold text-white">${item.name}</h3>
                </div>
                ${item.englishName ? `<div class="text-[11px] text-slate-400 font-mono text-right mt-0.5">${item.englishName}</div>` : ''}
              </div>
              <div>
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-bold text-sky-300">
                  ${cov.recorded} / 4 مقاطع مسجلة
                </span>
              </div>
            </div>

            <!-- عرض حالة الأقسام الأربعة لهذا العضو (الاسم، البيان والوظيفة، المعالم والتراكيب، أسرار الامتحان) -->
            <div class="grid grid-cols-2 gap-1.5 pt-1">
              ${renderSectionStatusBadge(item.id, 'name', '1. اسم العضو')}
              ${renderSectionStatusBadge(item.id, 'overview', '2. البيان والوظيفة')}
              ${renderSectionStatusBadge(item.id, 'landmarks', '3. المعالم والتراكيب')}
              ${renderSectionStatusBadge(item.id, 'exam', '4. أسرار الامتحان')}
            </div>
          </div>

          <!-- إجراءات التحكم والتشغيل -->
          <div class="flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <button type="button" onclick="window.BioAudioLibraryRegistry.playItemAudio('${item.id}')" class="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-sky-500/20 to-cyan-500/15 hover:from-sky-500/30 border border-sky-400/40 text-sky-200 font-extrabold text-xs flex items-center justify-center gap-1.5">
              <svg class="w-4 h-4 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>تشغيل الشرح الصوتي 🔊</span>
            </button>

            <button type="button" onclick="window.BioAudioLibraryRegistry.openStudioRecordModal('${item.id}')" class="py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-bold text-xs flex items-center gap-1">
              <span>تسجيل / رفع صوت بشري 🎙️</span>
            </button>
          </div>
        </div>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
  }

  function renderSectionStatusBadge(itemId, sectionKey, label) {
    const hasRec = window.BioHumanAudioEngine && window.BioHumanAudioEngine.hasHumanRecording(itemId, sectionKey);

    if (hasRec) {
      return `
        <div class="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-[10.5px]">
          <span class="text-emerald-200 font-bold truncate">${label}</span>
          <span class="text-emerald-300 font-mono text-[9.5px]">🎙️ مسجل</span>
        </div>
      `;
    } else {
      return `
        <div class="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[10.5px]">
          <span class="text-slate-400 font-medium truncate">${label}</span>
          <span class="text-amber-400/90 font-mono text-[9.5px]">⏳ بانتظار الرفع</span>
        </div>
      `;
    }
  }

  // 6. فتح نافذة تسجيل بالميكروفون أو رفع ملف بشري لهذا العضو
  function openStudioRecordModal(itemId) {
    const item = allLibraryItems.find(i => i.id === itemId);
    if (!item) return;

    activeRecordingState = {
      isRecording: false,
      itemId: item.id,
      sectionKey: 'overview',
      audioBase64: '',
      mimeType: 'audio/webm',
      durationSeconds: 0,
      audioUrl: ''
    };

    let recordModal = document.getElementById('studio-record-dialog');
    if (!recordModal) {
      recordModal = document.createElement('div');
      recordModal.id = 'studio-record-dialog';
      recordModal.className = 'fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5';
      document.body.appendChild(recordModal);
    }

    recordModal.innerHTML = `
      <div class="w-full max-w-lg med-glass-strong rounded-3xl p-5 space-y-4 border border-emerald-500/40 shadow-2xl text-right">
        <!-- رأس الحوار -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">تسجيل بشري مباشر</span>
            <h3 class="text-base font-extrabold text-white mt-1">${item.name}</h3>
          </div>
          <button type="button" onclick="document.getElementById('studio-record-dialog').remove()" class="text-slate-400 hover:text-white font-bold text-sm px-2.5 py-1 rounded bg-slate-800">✕</button>
        </div>

        <!-- اختيار القسم المراد تسجيله -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-300 block">اختر القسم المراد تسجيله بصوتك:</label>
          <select id="studio-select-section" onchange="window.BioAudioLibraryRegistry.onSelectRecordSection(this.value)" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400">
            <option value="name">1. اسم العضو بالعربية واللاتينية</option>
            <option value="overview" selected>2. البيان والوظيفة الحيوية بالكامل</option>
            <option value="landmarks">3. المعالم والتراكيب والمفاصل والتعصيب</option>
            <option value="exam">4. أسرار الامتحان والتلميحات المنهجية</option>
          </select>
        </div>

        <!-- نص المعاينة للقسم المحدد -->
        <div class="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">
          <div class="text-[10px] font-bold text-sky-300">النص العلمي المعتمد للنطق:</div>
          <p id="studio-section-text-preview" class="text-xs text-slate-200 leading-relaxed max-h-32 overflow-y-auto"></p>
        </div>

        <!-- خيار 1: التسجيل المباشر بالميكروفون -->
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-emerald-300">الخيار 1: التسجيل المباشر عبر ميكروفون الجهاز</span>
            <span id="studio-timer-display" class="font-mono text-xs font-extrabold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800 tabular-nums">00:00</span>
          </div>

          <div class="flex items-center justify-center gap-2 pt-1">
            <button type="button" id="btn-studio-start-rec" onclick="window.BioAudioLibraryRegistry.startStudioMicRecording()" class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all">
              <span>🎙️ ابدأ التسجيل الآن</span>
            </button>
            <button type="button" id="btn-studio-stop-rec" onclick="window.BioAudioLibraryRegistry.stopStudioMicRecording()" class="hidden flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all animate-pulse">
              <span>⏹️ إيقاف ومعاينة الصوت</span>
            </button>
          </div>
        </div>

        <!-- خيار 2: رفع ملف صوتی جاهز -->
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <label class="text-xs font-bold text-slate-300 block">الخيار 2: رفع ملف صوتی مسجل مسبقاً (MP3 / WAV / OGG / M4A)</label>
          <input type="file" id="studio-audio-file-input" accept="audio/*" onchange="window.BioAudioLibraryRegistry.handleStudioAudioFileUpload(this)" class="w-full text-xs text-slate-400 file:ml-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-sky-500/20 file:text-sky-300 file:font-bold hover:file:bg-sky-500/30 cursor-pointer" />
        </div>

        <!-- مشغل المعاينة قبل الحفظ -->
        <div id="studio-audio-preview-box" class="hidden p-3 rounded-xl bg-slate-950 border border-sky-500/30 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-sky-300">معاينة الصوت المسجل قبل النشر:</span>
            <span id="studio-preview-duration" class="font-mono text-slate-400 text-[10px]">0 ثواني</span>
          </div>
          <audio id="studio-preview-player" controls class="w-full h-9 rounded-lg"></audio>
        </div>

        <!-- زر الحفظ والنشر النهائي -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button type="button" onclick="document.getElementById('studio-record-dialog').remove()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">إلغاء</button>
          <button type="button" id="btn-studio-save-recording" onclick="window.BioAudioLibraryRegistry.saveStudioRecording()" class="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg disabled:opacity-40 disabled:pointer-events-none" disabled>
            حفظ ونشر التسجيل البشري 🚀
          </button>
        </div>
      </div>
    `;

    recordModal.classList.remove('hidden');
    onSelectRecordSection('overview');
  }

  function onSelectRecordSection(secKey) {
    activeRecordingState.sectionKey = secKey;
    const item = allLibraryItems.find(i => i.id === activeRecordingState.itemId);
    if (!item) return;

    const previewEl = document.getElementById('studio-section-text-preview');
    if (!previewEl) return;

    const matchedSegs = item.segments.filter(s => s.type === secKey || (secKey === 'overview' && s.type === 'name'));
    if (matchedSegs.length > 0) {
      previewEl.innerText = matchedSegs.map(s => s.spokenText).join(' ');
    } else {
      previewEl.innerText = 'نص الشرح الخاص بهذا القسم المعتمد في المنهج الدراسي.';
    }
  }

  async function startStudioMicRecording() {
    const startBtn = document.getElementById('btn-studio-start-rec');
    const stopBtn = document.getElementById('btn-studio-stop-rec');
    const timerDisplay = document.getElementById('studio-timer-display');

    if (!window.BioHumanAudioEngine) return;

    const ok = await window.BioHumanAudioEngine.startLiveMicrophoneRecording((elapsedSec) => {
      if (timerDisplay) {
        const m = Math.floor(elapsedSec / 60);
        const s = elapsedSec % 60;
        timerDisplay.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      }
    }, (errMsg) => alert(errMsg));

    if (ok) {
      activeRecordingState.isRecording = true;
      if (startBtn) startBtn.classList.add('hidden');
      if (stopBtn) stopBtn.classList.remove('hidden');
    }
  }

  async function stopStudioMicRecording() {
    const startBtn = document.getElementById('btn-studio-start-rec');
    const stopBtn = document.getElementById('btn-studio-stop-rec');

    if (!window.BioHumanAudioEngine) return;

    const res = await window.BioHumanAudioEngine.stopLiveMicrophoneRecording();
    activeRecordingState.isRecording = false;

    if (startBtn) startBtn.classList.remove('hidden');
    if (stopBtn) stopBtn.classList.add('hidden');

    if (res && res.base64Data) {
      activeRecordingState.audioBase64 = res.base64Data;
      activeRecordingState.mimeType = res.mimeType;
      activeRecordingState.durationSeconds = res.durationSeconds;
      activeRecordingState.audioUrl = res.audioUrl;

      showStudioPreviewPlayer();
    }
  }

  async function handleStudioAudioFileUpload(inputEl) {
    if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
    const file = inputEl.files[0];

    try {
      const res = await window.BioHumanAudioEngine.readUploadedAudioFile(file);
      activeRecordingState.audioBase64 = res.base64Data;
      activeRecordingState.mimeType = res.mimeType;
      activeRecordingState.durationSeconds = res.durationSeconds;
      activeRecordingState.audioUrl = res.audioUrl;

      showStudioPreviewPlayer();
    } catch (e) {
      alert('تعذر قراءة الملف الصوتي المرفوع.');
    }
  }

  function showStudioPreviewPlayer() {
    const box = document.getElementById('studio-audio-preview-box');
    const player = document.getElementById('studio-preview-player');
    const durEl = document.getElementById('studio-preview-duration');
    const saveBtn = document.getElementById('btn-studio-save-recording');

    if (box && player) {
      box.classList.remove('hidden');
      player.src = activeRecordingState.audioUrl;
      if (durEl) durEl.innerText = `${activeRecordingState.durationSeconds} ثواني`;
    }
    if (saveBtn) saveBtn.disabled = false;
  }

  async function saveStudioRecording() {
    if (!activeRecordingState.audioBase64) {
      alert('يرجى تسجيل الميكروفون أولاً أو رفع ملف صوتی.');
      return;
    }

    const saveBtn = document.getElementById('btn-studio-save-recording');
    if (saveBtn) saveBtn.innerText = 'جاري الحفظ والنشر... ⏳';

    const res = await window.BioHumanAudioEngine.publishHumanVoiceRecording(
      activeRecordingState.itemId,
      activeRecordingState.sectionKey,
      activeRecordingState.audioBase64,
      activeRecordingState.mimeType,
      activeRecordingState.durationSeconds,
      'مس / ندى بدوي (تسجيل بشري حقيقي)'
    );

    if (res.success) {
      const recordModal = document.getElementById('studio-record-dialog');
      if (recordModal) recordModal.remove();

      alert('تم حفظ ونشر التسجيل الصوتي البشري المباشر بنجاح!');
      refreshAudioCacheStatus();
    } else {
      alert(res.error || 'حدث خطأ أثناء حفظ التسجيل.');
      if (saveBtn) saveBtn.innerText = 'حفظ ونشر التسجيل البشري 🚀';
    }
  }

  // 7. التحكم والتصدير
  function playItemAudio(itemId) {
    const item = allLibraryItems.find(i => i.id === itemId);
    if (!item) return;

    closeAudioLibraryModal();

    if (window.speakAnatomicalCard) {
      window.speakAnatomicalCard(item.rawItem);
    }
  }

  function setSystemFilter(sysId) {
    currentSystemFilter = sysId;
    document.querySelectorAll('[data-lib-sys]').forEach(btn => {
      btn.classList.toggle('is-active', btn.getAttribute('data-lib-sys') === sysId);
    });
    updateStatsAndRenderModal();
  }

  function setSearchQuery(query) {
    searchQuery = query || '';
    updateStatsAndRenderModal();
  }

  function openAudioLibraryModal() {
    createAudioLibraryModalHTML();
    const modal = document.getElementById('audio-library-control-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
    refreshAudioCacheStatus();
  }

  function closeAudioLibraryModal() {
    const modal = document.getElementById('audio-library-control-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  window.BioAudioLibraryRegistry = {
    buildLibraryRegistryIndex,
    refreshAudioCacheStatus,
    computeLibraryOverviewStats,
    openAudioLibraryModal,
    closeAudioLibraryModal,
    setSystemFilter,
    setSearchQuery,
    playItemAudio,
    openStudioRecordModal,
    onSelectRecordSection,
    startStudioMicRecording,
    stopStudioMicRecording,
    handleStudioAudioFileUpload,
    saveStudioRecording
  };

  document.addEventListener('DOMContentLoaded', () => {
    buildLibraryRegistryIndex();
  });
})();
