// =========================================================================
// المحرك الرئيسي ثلاثي الأبعاد والواجهة التفاعلية (3D Anatomy Atlas Engine)
// =========================================================================
(function () {
  const ACADEMIC_CURRICULUM = window.ACADEMIC_CURRICULUM || {};
  const QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];

  // --- 1. تهيئة المشهد والكاميرا والإضاءة الاحترافية ---
  const canvasContainer = document.getElementById("canvas-container");
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.05, 500);
  const DEFAULT_CAM_POS = new THREE.Vector3(0, 0.12, 2.55);
  const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 0.05, 0);
  camera.position.copy(DEFAULT_CAM_POS);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  if (canvasContainer) {
    canvasContainer.appendChild(renderer.domElement);
  }

  // معالجة فقدان واستعادة سياق WebGL على الهواتف
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    setInteractionStatus("تم إيقاف WebGL مؤقتاً لتوفير الذاكرة...", "warn");
  });
  renderer.domElement.addEventListener("webglcontextrestored", () => {
    setInteractionStatus("تمت استعادة محرك العرض ثلاثي الأبعاد", "ready");
  });

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.maxDistance = 6.5;
  controls.minDistance = 0.32;
  controls.target.copy(DEFAULT_CAM_TARGET);
  controls.panSpeed = 0.85;
  controls.rotateSpeed = 0.85;
  controls.zoomSpeed = 0.95;

  // إضاءة طبية استوديو ثلاثية النقاط + إضاءة حواف سماوية
  const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x091326, 0.95);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.05);
  keyLight.position.set(3.5, 5.5, 4.5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.15);
  fillLight.position.set(-4.5, 2.2, 2.5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.35);
  rimLight.position.set(0, 3.2, -4.8);
  scene.add(rimLight);

  // منصة أرضية طبية هادئة لتعزيز الإحساس بالعمق الفراغي
  const stageGroup = new THREE.Group();
  stageGroup.position.y = -1.03;
  const ringInner = new THREE.Mesh(
    new THREE.RingGeometry(0.46, 0.475, 64),
    new THREE.MeshBasicMaterial({ color: 0x0ea5e9, side: THREE.DoubleSide, transparent: true, opacity: 0.32 })
  );
  ringInner.rotation.x = -Math.PI / 2;
  const ringOuter = new THREE.Mesh(
    new THREE.RingGeometry(0.76, 0.77, 64),
    new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.16 })
  );
  ringOuter.rotation.x = -Math.PI / 2;
  const stageDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.76, 64),
    new THREE.MeshBasicMaterial({ color: 0x082f49, transparent: true, opacity: 0.14 })
  );
  stageDisc.rotation.x = -Math.PI / 2;
  stageDisc.position.y = -0.002;
  stageGroup.add(stageDisc, ringInner, ringOuter);
  scene.add(stageGroup);

  // --- 2. المواد الفيزيائية الواقعية (Medical PBR Materials) ---
  const boneMaterial = new THREE.MeshStandardMaterial({
    color: 0xf4efe4,
    roughness: 0.42,
    metalness: 0.06
  });

  const muscleMaterial = new THREE.MeshStandardMaterial({
    color: 0xb93838,
    roughness: 0.52,
    metalness: 0.08
  });

  const nerveMaterial = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xca8a04,
    emissiveIntensity: 0.35,
    roughness: 0.28,
    metalness: 0.12
  });

  const highlightMaterial = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.65,
    roughness: 0.22,
    metalness: 0.15
  });

  const dimmedMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
    transparent: true,
    opacity: 0.14,
    depthWrite: false
  });

  // --- 3. نظام الجزيئات ثلاثي الأبعاد (3D Particle Aura System) ---
  const selectionParticlesGroup = new THREE.Group();
  selectionParticlesGroup.visible = false;
  scene.add(selectionParticlesGroup);

  function createGlowingParticleTexture() {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext("2d");
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.28, "rgba(56, 189, 248, 0.92)");
    grad.addColorStop(0.65, "rgba(14, 165, 233, 0.32)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  const particleTexture = createGlowingParticleTexture();
  const CLOUD_COUNT = 150;
  const cloudGeo = new THREE.BufferGeometry();
  const cloudPositions = new Float32Array(CLOUD_COUNT * 3);
  const cloudBaseOffsets = [];
  const cloudSpeeds = [];
  const cloudPhases = [];

  for (let i = 0; i < CLOUD_COUNT; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 0.22 + Math.random() * 0.4;
    const sinPhi = Math.sin(phi);
    const x = r * sinPhi * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * sinPhi * Math.sin(theta);

    cloudPositions[i * 3] = x;
    cloudPositions[i * 3 + 1] = y;
    cloudPositions[i * 3 + 2] = z;

    cloudBaseOffsets.push(new THREE.Vector3(x, y, z));
    cloudSpeeds.push(0.5 + Math.random() * 0.85);
    cloudPhases.push(Math.random() * Math.PI * 2);
  }
  cloudGeo.setAttribute("position", new THREE.BufferAttribute(cloudPositions, 3));

  const cloudMaterial = new THREE.PointsMaterial({
    size: 0.05,
    map: particleTexture,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    color: 0x38bdf8
  });
  selectionParticlesGroup.add(new THREE.Points(cloudGeo, cloudMaterial));

  const RING_COUNT = 52;
  function createOrbitalRing(tiltX, tiltZ) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(RING_COUNT * 3);
    for (let i = 0; i < RING_COUNT; i++) {
      const angle = (i / RING_COUNT) * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * 0.38;
      pos[i * 3 + 1] = Math.sin(angle * 3) * 0.02;
      pos[i * 3 + 2] = Math.sin(angle) * 0.38;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.044,
      map: particleTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x38bdf8
    });
    const ring = new THREE.Points(geo, mat);
    ring.rotation.x = tiltX;
    ring.rotation.z = tiltZ;
    return ring;
  }

  const orbitalRing1 = createOrbitalRing(0.55, 0.35);
  const orbitalRing2 = createOrbitalRing(-0.45, -0.5);
  selectionParticlesGroup.add(orbitalRing1, orbitalRing2);

  const focalAuraLight = new THREE.PointLight(0x0ea5e9, 0, 2.0);
  selectionParticlesGroup.add(focalAuraLight);

  function activateSelectionParticles(center, size, sysKey, isIsolated) {
    selectionParticlesGroup.position.copy(center);
    const maxDim = Math.max(size.x, size.y, size.z, 0.22);
    const targetScale = Math.max(maxDim * 1.5, 0.42);
    selectionParticlesGroup.scale.set(targetScale, targetScale, targetScale);

    let col = 0x38bdf8;
    let lightCol = 0x0ea5e9;
    if (sysKey === "muscular") {
      col = 0xfb7185;
      lightCol = 0xe11d48;
    } else if (sysKey === "nervous") {
      col = 0xfacc15;
      lightCol = 0xeab308;
    } else if (sysKey === "integrated") {
      col = 0x2dd4bf;
      lightCol = 0x06b6d4;
    }

    cloudMaterial.color.setHex(col);
    orbitalRing1.material.color.setHex(col);
    orbitalRing2.material.color.setHex(col);
    focalAuraLight.color.setHex(lightCol);

    selectionParticlesGroup.visible = true;
    const targetOpacity = isIsolated ? 0.96 : 0.78;
    const targetLightIntensity = isIsolated ? 2.1 : 1.3;

    gsap.killTweensOf([cloudMaterial, orbitalRing1.material, orbitalRing2.material, focalAuraLight]);
    gsap.to(cloudMaterial, { opacity: targetOpacity, duration: 0.45, ease: "power2.out" });
    gsap.to([orbitalRing1.material, orbitalRing2.material], { opacity: targetOpacity * 0.88, duration: 0.45, ease: "power2.out" });
    gsap.to(focalAuraLight, { intensity: targetLightIntensity, duration: 0.45, ease: "power2.out" });
  }

  function hideSelectionParticles() {
    gsap.killTweensOf([cloudMaterial, orbitalRing1.material, orbitalRing2.material, focalAuraLight]);
    gsap.to([cloudMaterial, orbitalRing1.material, orbitalRing2.material], {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        selectionParticlesGroup.visible = false;
      }
    });
    gsap.to(focalAuraLight, { intensity: 0, duration: 0.3, ease: "power2.in" });
  }

  function updateSelectionParticlesAnimation(elapsedTime) {
    if (!selectionParticlesGroup.visible || cloudMaterial.opacity <= 0.001) return;
    orbitalRing1.rotation.y += 0.02;
    orbitalRing2.rotation.y -= 0.016;
    focalAuraLight.intensity = (isIsolatedMode ? 2.1 : 1.3) + Math.sin(elapsedTime * 3.8) * 0.24;

    const positions = cloudGeo.attributes.position.array;
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const base = cloudBaseOffsets[i];
      const spd = cloudSpeeds[i];
      const phase = cloudPhases[i];
      const pulse = 1.0 + Math.sin(elapsedTime * 2.4 * spd + phase) * 0.16;
      const swirl = elapsedTime * 0.75 * spd + phase;
      const cosS = Math.cos(swirl);
      const sinS = Math.sin(swirl);

      positions[i * 3] = (base.x * cosS - base.z * sinS) * pulse;
      positions[i * 3 + 1] = base.y * pulse + Math.sin(elapsedTime * 2.8 + phase) * 0.035;
      positions[i * 3 + 2] = (base.x * sinS + base.z * cosS) * pulse;
    }
    cloudGeo.attributes.position.needsUpdate = true;
  }

  // --- 4. إدارة المجموعات وتحميل المجسمات الذكي (Caching & Lazy Preloading) ---
  const masterGroup = new THREE.Group();
  scene.add(masterGroup);

  const systemGroups = {
    skeletal: new THREE.Group(),
    muscular: new THREE.Group(),
    nervous: new THREE.Group()
  };
  systemGroups.skeletal.visible = true;
  systemGroups.muscular.visible = false;
  systemGroups.nervous.visible = false;
  masterGroup.add(systemGroups.skeletal, systemGroups.muscular, systemGroups.nervous);

  const allMeshesBySystem = {
    skeletal: [],
    muscular: [],
    nervous: []
  };

  const modelLoadState = {
    skeletal: { status: "idle", progress: 0, callbacks: [] },
    muscular: { status: "idle", progress: 0, callbacks: [] },
    nervous: { status: "idle", progress: 0, callbacks: [] }
  };

  // المسارات المحلية السريعة أولاً مع الاحتفاظ بجميع المسارات البديلة والسحابية
  const MODEL_URLS = {
    skeletal: [
      "/models/skeleton.glb",
      "./models/skeleton.glb",
      "/models/skeletal_system.glb",
      "https://cdn.jsdelivr.net/gh/Z-Anatomy/Z-Anatomy@main/files/Skeleton.glb"
    ],
    muscular: [
      "/models/muscles.glb",
      "./models/muscles.glb",
      "/models/muscular_system.glb",
      "https://cdn.jsdelivr.net/gh/Z-Anatomy/Z-Anatomy@main/files/Muscles.glb"
    ],
    nervous: [
      "/models/nerves.glb",
      "./models/nerves.glb",
      "/models/nervous_system.glb",
      "./models/nervous_system.glb",
      "/models/brain.glb",
      "https://cdn.jsdelivr.net/gh/Z-Anatomy/Z-Anatomy@main/files/Nervous_system.glb"
    ]
  };

  const SYSTEM_LABELS_AR = {
    skeletal: "الهيكل العظمي",
    muscular: "الجهاز العضلي",
    nervous: "الجهاز العصبي"
  };

  let activeSystem = "skeletal";
  let currentSelectedItem = null;
  let currentSelectedMeta = { sectionName: "", systemName: "" };
  let currentHighlightedMeshes = [];
  let isAutoRotating = false;
  let isMainWireframe = false;
  let isIsolatedMode = false;
  let currentSubFilter = "all";
  let sidebarSystemFilter = "active";
  let sideToggleRight = true;
  let isMobileSheetMinimized = false;

  window.getCurrentSelectedItem = () => currentSelectedItem;

  // تحديث مؤشرات حالة التحميل في الهيدر والصفحة الرئيسية
  function updateModelStatusUI() {
    const keys = ["skeletal", "muscular", "nervous"];
    let loadedCount = 0;
    let totalPct = 0;

    keys.forEach((k) => {
      const st = modelLoadState[k];
      if (st.status === "loaded") loadedCount++;
      totalPct += st.status === "loaded" ? 100 : st.progress;

      const dotEl = document.getElementById(`status-dot-${k}`);
      const textEl = document.getElementById(`status-text-${k}`);
      const barEl = document.getElementById(`status-bar-${k}`);

      if (barEl) {
        barEl.style.width = `${st.status === "loaded" ? 100 : st.progress}%`;
      }
      if (dotEl) {
        dotEl.className =
          st.status === "loaded"
            ? "w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            : st.status === "loading"
            ? "w-2 h-2 rounded-full bg-sky-400 animate-ping"
            : st.status === "error"
            ? "w-2 h-2 rounded-full bg-rose-500"
            : "w-2 h-2 rounded-full bg-slate-600";
      }
      if (textEl) {
        textEl.innerText =
          st.status === "loaded"
            ? "جاهز 100%"
            : st.status === "loading"
            ? `جارِ التحميل ${st.progress}%`
            : st.status === "error"
            ? "إعادة المحاولة"
            : "في الانتظار";
      }
    });

    const globalBadge = document.getElementById("header-models-status");
    if (globalBadge) {
      if (loadedCount === 3) {
        globalBadge.innerText = "المجسمات الثلاثية جاهزة (3/3)";
        globalBadge.dataset.ready = "true";
      } else {
        const avg = Math.round(totalPct / 3);
        globalBadge.innerText = `تحميل النماذج (${loadedCount}/3 • ${avg}%)`;
        globalBadge.dataset.ready = "false";
      }
    }
  }

  function setInteractionStatus(message, tone) {
    const el = document.getElementById("interaction-status-text");
    const dot = document.getElementById("interaction-status-dot");
    if (el) el.innerText = message;
    if (dot) {
      dot.className =
        tone === "active"
          ? "w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"
          : tone === "warn"
          ? "w-2 h-2 rounded-full bg-amber-400 animate-pulse"
          : "w-2 h-2 rounded-full bg-emerald-400";
    }
  }

  const gltfLoader = new THREE.GLTFLoader();

  function normalizeMeshLookupKey(str) {
    return (str || "")
      .toLowerCase()
      .replace(/\.l$|\.r$|_l$|_r$/g, "")
      .replace(/[_\-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function loadSystemModel(sysKey, urlIndex, onComplete) {
    const st = modelLoadState[sysKey];
    if (st.status === "loaded") {
      if (onComplete) onComplete(true);
      return;
    }
    if (onComplete && !st.callbacks.includes(onComplete)) {
      st.callbacks.push(onComplete);
    }
    if (st.status === "loading" && urlIndex === 0) {
      return;
    }

    const urls = MODEL_URLS[sysKey] || [];
    if (urlIndex >= urls.length) {
      st.status = "error";
      updateModelStatusUI();
      showModelErrorBanner(sysKey);
      const cbs = st.callbacks.splice(0);
      cbs.forEach((cb) => cb(false));
      return;
    }

    st.status = "loading";
    updateModelStatusUI();

    const loadingStatus = document.getElementById("loading-status");
    if (loadingStatus && sysKey === "skeletal") {
      loadingStatus.innerText = `جاري تجهيز مجسم ${SYSTEM_LABELS_AR[sysKey]} الواقعي...`;
    }

    gltfLoader.load(
      urls[urlIndex],
      function (gltf) {
        const root = gltf.scene;

        // توحيد الأبعاد والمركز بدقة عالية في نطاق [-1, 1]
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 2.0 / maxDim;
        root.scale.set(scale, scale, scale);
        root.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

        systemGroups[sysKey].add(root);

        const defaultMat =
          sysKey === "skeletal" ? boneMaterial : sysKey === "muscular" ? muscleMaterial : nerveMaterial;

        allMeshesBySystem[sysKey] = [];
        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const mat = defaultMat.clone();
            mat.wireframe = isMainWireframe;
            child.material = mat;
            child.userData.originalMaterial = mat;
            child.userData.meshName = child.name || "";
            child.userData.normName = normalizeMeshLookupKey(child.name || "");
            child.userData.system = sysKey;
            allMeshesBySystem[sysKey].push(child);
          }
        });

        if (sysKey === "skeletal") {
          prepareSkeletalExplodeVectors();
        }

        st.status = "loaded";
        st.progress = 100;
        updateModelStatusUI();
        hideModelErrorBanner();

        const cbs = st.callbacks.splice(0);
        cbs.forEach((cb) => cb(true));
      },
      function (xhr) {
        if (xhr && xhr.lengthComputable && xhr.total > 0) {
          const pct = Math.min(99, Math.round((xhr.loaded / xhr.total) * 100));
          st.progress = pct;
          updateModelStatusUI();

          if (sysKey === "skeletal") {
            const pctEl = document.getElementById("loading-percentage");
            const barEl = document.getElementById("loading-bar");
            if (pctEl) pctEl.innerText = `${pct}%`;
            if (barEl) barEl.style.width = `${pct}%`;
          }
        }
      },
      function () {
        loadSystemModel(sysKey, urlIndex + 1);
      }
    );
  }

  function showModelErrorBanner(sysKey) {
    const errBox = document.getElementById("model-error-toast");
    const errText = document.getElementById("model-error-text");
    if (errText) errText.innerText = `تعذر تحميل مجسم ${SYSTEM_LABELS_AR[sysKey]}. تحقق من الاتصال ثم أعد المحاولة.`;
    if (errBox) errBox.classList.remove("hidden");
  }

  function hideModelErrorBanner() {
    const errBox = document.getElementById("model-error-toast");
    if (errBox) errBox.classList.add("hidden");
  }

  function retryFailedModels() {
    hideModelErrorBanner();
    ["skeletal", "muscular", "nervous"].forEach((k) => {
      if (modelLoadState[k].status === "error" || modelLoadState[k].status === "idle") {
        modelLoadState[k].status = "idle";
        loadSystemModel(k, 0);
      }
    });
  }
  window.retryFailedModels = retryFailedModels;

  // التحميل التدريجي السريع: الهيكل العظمي أولاً لفتح الواجهة فوراً، ثم العضلي والعصبي في الخلفية دون تجميد
  function initProgressiveModels() {
    const loadingOverlay = document.getElementById("loading-overlay");
    const loadingPercentage = document.getElementById("loading-percentage");
    const loadingBar = document.getElementById("loading-bar");
    const loadingStatus = document.getElementById("loading-status");

    if (loadingPercentage) loadingPercentage.innerText = "12%";
    if (loadingBar) loadingBar.style.width = "12%";

    loadSystemModel("skeletal", 0, () => {
      if (loadingPercentage) loadingPercentage.innerText = "100%";
      if (loadingBar) loadingBar.style.width = "100%";
      if (loadingStatus) loadingStatus.innerText = "اكتمل تجهيز الهيكل العظمي التفاعلي!";

      if (loadingOverlay) {
        setTimeout(() => {
          loadingOverlay.classList.add("opacity-0", "pointer-events-none");
          setTimeout(() => {
            loadingOverlay.style.display = "none";
          }, 420);
        }, 180);
      }

      switchSystem("skeletal");
      setInteractionStatus("وضع الاستكشاف الحر • اسحب للتدوير أو انقر على أي عنصر تشريحي", "ready");

      // تحميل كسول في الخلفية لباقي الأجهزة لمنع أي انتظار عند التبديل
      const scheduleBg = window.requestIdleCallback || ((fn) => setTimeout(fn, 350));
      scheduleBg(() => {
        loadSystemModel("muscular", 0, () => {
          loadSystemModel("nervous", 0);
        });
      });
    });
  }

  // --- 5. الصفحة الرئيسية والانتقال السلس للعارض ---
  let isHeroOpen = true;

  function enterAtlasWorkspace(targetSystem) {
    const hero = document.getElementById("hero-overview-panel");
    const reopenBtn = document.getElementById("btn-reopen-hero");
    isHeroOpen = false;
    if (hero) {
      hero.classList.add("opacity-0", "pointer-events-none", "scale-[0.98]");
      setTimeout(() => hero.classList.add("hidden"), 320);
    }
    if (reopenBtn) reopenBtn.classList.remove("hidden");
    if (targetSystem) {
      switchSystem(targetSystem);
    }
  }

  function openHeroOverview() {
    const hero = document.getElementById("hero-overview-panel");
    isHeroOpen = true;
    if (hero) {
      hero.classList.remove("hidden");
      requestAnimationFrame(() => {
        hero.classList.remove("opacity-0", "pointer-events-none", "scale-[0.98]");
      });
    }
  }

  function toggleHeroOverview() {
    if (isHeroOpen) enterAtlasWorkspace();
    else openHeroOverview();
  }

  window.enterAtlasWorkspace = enterAtlasWorkspace;
  window.openHeroOverview = openHeroOverview;
  window.toggleHeroOverview = toggleHeroOverview;

  // --- 6. التبديل بين الأجهزة والطبقات المدمجة ---
  function ensureSystemLoaded(sysKey, afterLoad) {
    if (sysKey === "integrated") {
      ["skeletal", "muscular", "nervous"].forEach((k) => {
        if (modelLoadState[k].status !== "loaded") loadSystemModel(k, 0, afterLoad);
      });
      if (afterLoad) afterLoad();
      return;
    }
    if (modelLoadState[sysKey].status === "loaded") {
      if (afterLoad) afterLoad();
    } else {
      setInteractionStatus(`جاري تجهيز مجسم ${SYSTEM_LABELS_AR[sysKey]}...`, "active");
      loadSystemModel(sysKey, 0, () => {
        if (afterLoad) afterLoad();
        setInteractionStatus(`تم عرض ${SYSTEM_LABELS_AR[sysKey]} بنجاح`, "ready");
      });
    }
  }

  function switchSystem(systemKey) {
    activeSystem = systemKey;
    currentSubFilter = "all";
    resetSceneAndIsolation(false);

    // تحديث جميع أزرار التبديل (الهيدر والموبايل)
    document.querySelectorAll("[data-sys-btn]").forEach((btn) => {
      const key = btn.getAttribute("data-sys-btn");
      const isActive = key === systemKey;
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      btn.classList.toggle("is-active", isActive);
    });

    const badge = document.getElementById("current-system-badge");
    if (badge) {
      if (systemKey === "skeletal") {
        badge.innerText = "الهيكل العظمي • 206 عظمة";
      } else if (systemKey === "muscular") {
        badge.innerText = "الجهاز العضلي • 600+ عضلة";
      } else if (systemKey === "nervous") {
        badge.innerText = "الجهاز العصبي • 43 زوجاً";
      } else {
        badge.innerText = "العرض المتكامل • 3 أجهزة";
      }
    }

    // إظهار شريط تفكيك العظام فقط مع الهيكل العظمي أو المتكامل
    const explodeTrigger = document.getElementById("btn-open-explode");
    const explodeBar = document.getElementById("exploded-view-bar");
    if (systemKey !== "skeletal" && systemKey !== "integrated") {
      if (explodeBar) explodeBar.classList.add("hidden");
      if (explodeTrigger) explodeTrigger.classList.add("opacity-50");
    } else if (explodeTrigger) {
      explodeTrigger.classList.remove("opacity-50");
    }

    const integratedControls = document.getElementById("integrated-layers-control");
    ensureSystemLoaded(systemKey, () => {
      if (activeSystem === "integrated") {
        systemGroups.skeletal.visible = true;
        systemGroups.muscular.visible = true;
        systemGroups.nervous.visible = true;
        if (integratedControls) integratedControls.classList.remove("hidden");
      } else {
        systemGroups.skeletal.visible = activeSystem === "skeletal";
        systemGroups.muscular.visible = activeSystem === "muscular";
        systemGroups.nervous.visible = activeSystem === "nervous";
        if (integratedControls) integratedControls.classList.add("hidden");
      }
    });

    renderCurriculumSidebar(getSearchInputValue());
  }
  window.switchSystem = switchSystem;

  function toggleLayerVisibility(sysKey, visible) {
    if (systemGroups[sysKey]) {
      systemGroups[sysKey].visible = visible;
    }
  }
  window.toggleLayerVisibility = toggleLayerVisibility;

  function setLayerOpacity(sysKey, val) {
    const opacity = parseFloat(val);
    const pctEl = document.getElementById(`layer-opacity-val-${sysKey}`);
    if (pctEl) pctEl.innerText = `${Math.round(opacity * 100)}%`;

    (allMeshesBySystem[sysKey] || []).forEach((mesh) => {
      if (mesh.material) {
        mesh.material.transparent = opacity < 0.99;
        mesh.material.opacity = opacity;
        mesh.material.depthWrite = opacity >= 0.85;
      }
    });
  }
  window.setLayerOpacity = setLayerOpacity;

  // --- 7. محرك تفكيك الهيكل العظمي السلس المحافظ على الترتيب التشريحي ---
  const originalMeshPositions = new Map();
  let currentExplodeRatio = 0;
  let explodeTweenObj = { ratio: 0 };

  function prepareSkeletalExplodeVectors() {
    if (!allMeshesBySystem.skeletal.length) return;
    const prevMasterRot = masterGroup.rotation.y;
    masterGroup.rotation.y = 0;
    systemGroups.skeletal.updateMatrixWorld(true);

    const meshWorldBox = new THREE.Box3();
    const worldCenter = new THREE.Vector3();
    const meshWorldOrigin = new THREE.Vector3();
    const targetWorldOrigin = new THREE.Vector3();

    allMeshesBySystem.skeletal.forEach((mesh) => {
      meshWorldBox.setFromObject(mesh);
      meshWorldBox.getCenter(worldCenter);
      mesh.getWorldPosition(meshWorldOrigin);

      const n = (mesh.name || "").toLowerCase();
      const wx = worldCenter.x;
      const wy = worldCenter.y;
      const wz = worldCenter.z;
      const side = Math.abs(wx) < 0.018 ? 0 : wx > 0 ? 1 : -1;

      // إزاحة رتيبة (Monotonic) متناسبة مع الإحداثيات الأصلية لمنع أي تقاطع أو تغير في ترتيب الفقرات والضلوع
      const worldDelta = new THREE.Vector3(0, 0, 0);

      if (
        n.includes("vertebra") ||
        n.includes("atlas") ||
        n.includes("axis") ||
        n.includes("sacrum") ||
        n.includes("coccyx") ||
        n.includes("intervertebral") ||
        n.includes("disc")
      ) {
        // تباعد رأسي رتيب يحافظ بدقة على ترتيب C1..C7 -> T1..T12 -> L1..L5 -> العجز -> العصعص
        worldDelta.set(wx * 0.12, wy * 0.52, -0.16);
      } else if (n.includes("sternum") || n.includes("manubrium") || n.includes("xiphoid")) {
        worldDelta.set(0, wy * 0.46, 0.34);
      } else if (n.includes("rib") || n.includes("costa")) {
        // الضلوع تتفتح جانبياً مع الحفاظ على ترتيب الأزواج 1..12 رأسياً
        worldDelta.set(side * 0.22 + wx * 0.55, wy * 0.48, 0.12 + wz * 0.35);
      } else if (
        n.includes("frontal") ||
        n.includes("parietal") ||
        n.includes("occipital") ||
        n.includes("temporal") ||
        n.includes("sphenoid") ||
        n.includes("ethmoid") ||
        n.includes("maxilla") ||
        n.includes("mandible") ||
        n.includes("zygomatic") ||
        n.includes("nasal") ||
        n.includes("lacrimal") ||
        n.includes("vomer") ||
        n.includes("palatine") ||
        n.includes("hyoid") ||
        wy > 0.72
      ) {
        worldDelta.set(wx * 0.45, wy * 0.52 + 0.08, wz * 0.42);
      } else if (n.includes("clavicle") || n.includes("scapula")) {
        worldDelta.set(side * 0.2 + wx * 0.45, wy * 0.46, wz * 0.35);
      } else {
        // الحوض والأطراف العلوية والسفلية: تباعد شعاعي وطولي يحافظ على تسلسل المفاصل
        worldDelta.set(side * 0.14 + wx * 0.62, wy * 0.42, wz * 0.32);
      }

      targetWorldOrigin.copy(meshWorldOrigin).add(worldDelta);
      const localTarget = mesh.parent
        ? mesh.parent.worldToLocal(targetWorldOrigin.clone())
        : targetWorldOrigin.clone();
      const localDelta = localTarget.sub(mesh.position);

      originalMeshPositions.set(mesh.uuid, {
        pos: mesh.position.clone(),
        localDelta: localDelta
      });
    });

    masterGroup.rotation.y = prevMasterRot;
    systemGroups.skeletal.updateMatrixWorld(true);
  }

  function updateExplodeUI(ratio) {
    const pct = Math.round(ratio * 100);
    const pctLabel = document.getElementById("exploded-pct-label");
    if (pctLabel) pctLabel.innerText = `${pct}%`;

    const fillTrack = document.getElementById("exploded-progress-fill");
    if (fillTrack) fillTrack.style.width = `${pct}%`;

    const slider = document.getElementById("exploded-slider");
    if (slider && Math.abs(parseFloat(slider.value) - pct) >= 1) {
      slider.value = pct;
    }

    // تمييز زر المستوى النشط (مجمع / تباعد الفقرات / تفكيك كامل)
    document.querySelectorAll("[data-explode-preset]").forEach((btn) => {
      const p = parseInt(btn.getAttribute("data-explode-preset"), 10);
      const isMatch =
        (p === 0 && pct <= 5) ||
        (p === 45 && pct >= 35 && pct <= 60) ||
        (p === 100 && pct >= 92);
      btn.classList.toggle("is-active", isMatch);
    });

    if (pct > 0) {
      setInteractionStatus(`وضع تفكيك الهيكل العظمي نشط (${pct}%) • الترتيب التشريحي محفوظ`, "active");
    }
  }

  function applyExplodeRatio(ratio) {
    const clamped = Math.max(0, Math.min(1, ratio));
    currentExplodeRatio = clamped;
    explodeTweenObj.ratio = clamped;
    updateExplodeUI(clamped);

    if (!originalMeshPositions.size && allMeshesBySystem.skeletal.length) {
      prepareSkeletalExplodeVectors();
    }

    allMeshesBySystem.skeletal.forEach((mesh) => {
      const orig = originalMeshPositions.get(mesh.uuid);
      if (!orig) return;
      mesh.position.copy(orig.pos).addScaledVector(orig.localDelta, clamped);
    });
  }

  function handleExplodeSlider(ratioVal) {
    if (activeSystem !== "skeletal" && activeSystem !== "integrated") {
      switchSystem("skeletal");
    }
    gsap.killTweensOf(explodeTweenObj);
    const numVal = parseFloat(ratioVal) || 0;
    const ratio = numVal > 1 ? numVal / 100 : numVal;
    applyExplodeRatio(ratio);
  }
  window.handleExplodeSlider = handleExplodeSlider;

  function setExplodePreset(targetPercent) {
    if (activeSystem !== "skeletal" && activeSystem !== "integrated") {
      switchSystem("skeletal");
    }
    const targetRatio = targetPercent > 1 ? targetPercent / 100 : targetPercent;
    gsap.killTweensOf(explodeTweenObj);
    gsap.to(explodeTweenObj, {
      ratio: targetRatio,
      duration: 0.78,
      ease: "power2.inOut",
      onUpdate: () => applyExplodeRatio(explodeTweenObj.ratio),
      onComplete: () => {
        if (targetRatio === 0) {
          setInteractionStatus("تمت إعادة تجميع الهيكل العظمي بالكامل", "ready");
        }
      }
    });
  }
  window.setExplodePreset = setExplodePreset;

  function toggleExplodedBar(forceState) {
    const bar = document.getElementById("exploded-view-bar");
    if (!bar) return;
    if (activeSystem !== "skeletal" && activeSystem !== "integrated") {
      switchSystem("skeletal");
    }
    const shouldShow = typeof forceState === "boolean" ? forceState : bar.classList.contains("hidden");
    bar.classList.toggle("hidden", !shouldShow);
    const btn = document.getElementById("btn-open-explode");
    if (btn) btn.classList.toggle("is-active", shouldShow);
  }
  window.toggleExplodedBar = toggleExplodedBar;

  // --- 8. نظام حفظ العناصر المفضلة (Bookmarks) والفهرس التشريحي المتقدم ---
  const BOOKMARKS_STORAGE_KEY = "ms_nada_atlas_bookmarks_v1";
  let bookmarksMemoryFallback = [];
  let confirmClearBookmarksPending = false;
  let confirmClearTimer = null;

  function loadBookmarksFromStorage() {
    try {
      const raw = window.localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (!raw) return bookmarksMemoryFallback.slice();
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        bookmarksMemoryFallback = parsed.filter((entry) => entry && entry.id && entry.name);
        return bookmarksMemoryFallback.slice();
      }
    } catch (e) {
      // المتابعة بالنسخة المحفوظة في الذاكرة عند تقييد التخزين المحلي داخل الإطارات
    }
    return bookmarksMemoryFallback.slice();
  }

  let bookmarksList = loadBookmarksFromStorage();

  function saveBookmarksToStorage() {
    bookmarksMemoryFallback = bookmarksList.slice();
    try {
      window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarksList));
    } catch (e) {
      // الاعتماد على النسخة الذاكرية خلال الجلسة عند تقييد التخزين
    }
  }

  function findCurriculumEntryById(itemId) {
    if (!itemId) return null;
    const sysKeys = ["skeletal", "muscular", "nervous"];
    for (const sk of sysKeys) {
      const sys = ACADEMIC_CURRICULUM[sk];
      if (!sys || !Array.isArray(sys.sections)) continue;
      for (const sec of sys.sections) {
        if (!Array.isArray(sec.items)) continue;
        for (const it of sec.items) {
          if (it.id === itemId) {
            return {
              item: it,
              sectionName: sec.name,
              systemName: sys.name,
              sysAccent: sys.accent || "#38bdf8"
            };
          }
        }
      }
    }
    return null;
  }

  function isItemBookmarked(itemId) {
    if (!itemId) return false;
    return bookmarksList.some((entry) => entry.id === itemId);
  }

  function serializeBookmarkEntry(item, meta) {
    const sysKey = item.system || (activeSystem === "integrated" ? "skeletal" : activeSystem);
    const exactMeshNames =
      Array.isArray(item.exactNames) && item.exactNames.length > 0
        ? item.exactNames.slice()
        : item.isDynamicMesh && Array.isArray(item.exactMeshes)
        ? item.exactMeshes.map((m) => m && m.name).filter(Boolean)
        : [];

    return {
      id: item.id,
      name: item.name,
      count: item.count || 1,
      system: sysKey,
      keys: Array.isArray(item.keys) ? item.keys.slice() : [],
      exactNames: exactMeshNames,
      boneId: item.boneId || null,
      isHandPhalanx: Boolean(item.isHandPhalanx),
      isFootPhalanx: Boolean(item.isFootPhalanx),
      isDynamicMesh: Boolean(item.isDynamicMesh),
      functionDesc: item.functionDesc || "",
      examNote: item.examNote || "",
      sectionName: (meta && meta.sectionName) || "القسم المنهجي",
      systemName: (meta && meta.systemName) || SYSTEM_LABELS_AR[sysKey] || "الأطلس التشريحي",
      savedAt: Date.now()
    };
  }

  function resolveBookmarkEntry(savedEntry) {
    const found = findCurriculumEntryById(savedEntry.id);
    if (found) {
      return {
        item: found.item,
        sectionName: found.sectionName,
        systemName: found.systemName,
        sysAccent: found.sysAccent,
        savedAt: savedEntry.savedAt || 0
      };
    }
    const sysKey = savedEntry.system || "skeletal";
    const sysObj = ACADEMIC_CURRICULUM[sysKey];
    return {
      item: {
        id: savedEntry.id,
        name: savedEntry.name,
        count: savedEntry.count || 1,
        system: sysKey,
        keys: Array.isArray(savedEntry.keys) ? savedEntry.keys : [],
        exactNames: Array.isArray(savedEntry.exactNames) ? savedEntry.exactNames : [],
        boneId: savedEntry.boneId || null,
        isHandPhalanx: Boolean(savedEntry.isHandPhalanx),
        isFootPhalanx: Boolean(savedEntry.isFootPhalanx),
        isDynamicMesh: Boolean(savedEntry.isDynamicMesh),
        functionDesc: savedEntry.functionDesc || "",
        examNote: savedEntry.examNote || ""
      },
      sectionName: savedEntry.sectionName || "تحديد تشريحي مباشر",
      systemName: savedEntry.systemName || (sysObj && sysObj.name) || SYSTEM_LABELS_AR[sysKey] || "الأطلس التشريحي",
      sysAccent: (sysObj && sysObj.accent) || "#38bdf8",
      savedAt: savedEntry.savedAt || 0
    };
  }

  function createHeartSvgMarkup(filled, sizeCls) {
    return `<svg class="${sizeCls || "w-3.5 h-3.5"} transition-transform duration-200 pointer-events-none" fill="${
      filled ? "currentColor" : "none"
    }" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
  }

  function updateFavoritesBadgesUI() {
    const count = bookmarksList.length;
    const countEl = document.getElementById("sidebar-favorites-count");
    const tabIcon = document.getElementById("sidebar-fav-tab-icon");
    if (countEl) {
      countEl.innerText = `${count} عنصر`;
    }
    if (tabIcon) {
      const shouldFill = count > 0 || sidebarSystemFilter === "favorites";
      tabIcon.setAttribute("fill", shouldFill ? "currentColor" : "none");
    }
  }

  function updateCardBookmarkButtonUI(animatePop) {
    const btn = document.getElementById("btn-card-bookmark");
    const icon = document.getElementById("card-bookmark-icon");
    if (!btn || !icon) return;

    const bookmarked = Boolean(currentSelectedItem && isItemBookmarked(currentSelectedItem.id));
    btn.classList.toggle("is-bookmarked", bookmarked);
    btn.setAttribute("aria-pressed", bookmarked ? "true" : "false");
    btn.setAttribute("data-tip", bookmarked ? "إزالة من المفضلة" : "حفظ في المفضلة");
    btn.setAttribute("aria-label", bookmarked ? "إزالة العنصر التشريحي من المفضلة" : "حفظ العنصر التشريحي في المفضلة");
    icon.setAttribute("fill", bookmarked ? "currentColor" : "none");

    if (animatePop && typeof gsap !== "undefined") {
      gsap.fromTo(icon, { scale: 0.65 }, { scale: 1, duration: 0.34, ease: "back.out(2.4)" });
    }
  }

  function toggleItemBookmarkByData(item, meta, animateCardBtn) {
    if (!item || !item.id) return;
    confirmClearBookmarksPending = false;

    const existingIdx = bookmarksList.findIndex((entry) => entry.id === item.id);
    let added = false;

    if (existingIdx >= 0) {
      bookmarksList.splice(existingIdx, 1);
    } else {
      bookmarksList.unshift(serializeBookmarkEntry(item, meta));
      added = true;
    }

    saveBookmarksToStorage();
    updateFavoritesBadgesUI();
    updateCardBookmarkButtonUI(Boolean(animateCardBtn));
    renderCurriculumSidebar(getSearchInputValue());

    setInteractionStatus(
      added ? `تم حفظ «${item.name}» في قائمة المفضلة` : `تمت إزالة «${item.name}» من المفضلة`,
      added ? "active" : "ready"
    );
  }

  function toggleCurrentItemBookmark() {
    if (!currentSelectedItem) return;
    toggleItemBookmarkByData(currentSelectedItem, currentSelectedMeta, true);
  }
  window.toggleCurrentItemBookmark = toggleCurrentItemBookmark;

  function removeBookmarkById(itemId) {
    const target = bookmarksList.find((entry) => entry.id === itemId);
    if (!target) return;
    bookmarksList = bookmarksList.filter((entry) => entry.id !== itemId);
    saveBookmarksToStorage();
    updateFavoritesBadgesUI();
    updateCardBookmarkButtonUI(false);
    renderCurriculumSidebar(getSearchInputValue());
    setInteractionStatus(`تمت إزالة «${target.name}» من المفضلة`, "ready");
  }
  window.removeBookmarkById = removeBookmarkById;

  function toggleFavoritesSidebarView() {
    if (sidebarSystemFilter === "favorites") {
      setSidebarSystemFilter("active");
    } else {
      setSidebarSystemFilter("favorites");
    }
  }
  window.toggleFavoritesSidebarView = toggleFavoritesSidebarView;

  function clearAllBookmarks() {
    if (!bookmarksList.length) return;
    if (!confirmClearBookmarksPending) {
      confirmClearBookmarksPending = true;
      clearTimeout(confirmClearTimer);
      confirmClearTimer = setTimeout(() => {
        confirmClearBookmarksPending = false;
        if (sidebarSystemFilter === "favorites") {
          renderCurriculumSidebar(getSearchInputValue());
        }
      }, 3200);
      renderCurriculumSidebar(getSearchInputValue());
      return;
    }
    confirmClearBookmarksPending = false;
    clearTimeout(confirmClearTimer);
    bookmarksList = [];
    currentSubFilter = "all";
    saveBookmarksToStorage();
    updateFavoritesBadgesUI();
    updateCardBookmarkButtonUI(false);
    renderCurriculumSidebar(getSearchInputValue());
    setInteractionStatus("تم إفراغ قائمة العناصر المفضلة", "ready");
  }
  window.clearAllBookmarks = clearAllBookmarks;

  let flatRenderedItems = [];

  function getSearchInputValue() {
    const el = document.getElementById("curriculum-search");
    return el ? el.value : "";
  }

  function setSidebarSystemFilter(filterVal) {
    sidebarSystemFilter = filterVal;
    currentSubFilter = "all";
    confirmClearBookmarksPending = false;
    document.querySelectorAll("[data-index-sys]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-index-sys") === filterVal);
    });
    updateFavoritesBadgesUI();
    renderCurriculumSidebar(getSearchInputValue());
  }
  window.setSidebarSystemFilter = setSidebarSystemFilter;

  function clearCurriculumSearch() {
    const input = document.getElementById("curriculum-search");
    if (input) {
      input.value = "";
      input.focus();
    }
    renderCurriculumSidebar("");
  }
  window.clearCurriculumSearch = clearCurriculumSearch;

  function renderFavoritesListInSidebar(q, treeContainer, subFilterContainer, sidebarTitle, sidebarDot, countLabel) {
    if (sidebarTitle) sidebarTitle.innerText = "العناصر التشريحية المفضلة";
    if (sidebarDot) sidebarDot.style.backgroundColor = "#fb7185";

    const resolvedAll = bookmarksList.map((entry) => resolveBookmarkEntry(entry));

    const sysCounts = {
      all: resolvedAll.length,
      skeletal: resolvedAll.filter((r) => r.item.system === "skeletal").length,
      muscular: resolvedAll.filter((r) => r.item.system === "muscular").length,
      nervous: resolvedAll.filter((r) => r.item.system === "nervous").length
    };

    if (subFilterContainer) {
      if (resolvedAll.length === 0) {
        subFilterContainer.innerHTML = "";
      } else {
        const subFilters = [
          { key: "all", label: `الكل (${sysCounts.all})` },
          { key: "skeletal", label: `العظمي (${sysCounts.skeletal})` },
          { key: "muscular", label: `العضلي (${sysCounts.muscular})` },
          { key: "nervous", label: `العصبي (${sysCounts.nervous})` }
        ];
        let chipsHtml = subFilters
          .filter((sf) => sf.key === "all" || sysCounts[sf.key] > 0)
          .map(
            (sf) =>
              `<button type="button" onclick="filterBySubGroup('${sf.key}')" class="chip-btn tabular-nums ${
                currentSubFilter === sf.key ? "is-active" : ""
              }">${sf.label}</button>`
          )
          .join("");

        chipsHtml += `<button type="button" onclick="clearAllBookmarks()" class="chip-btn shrink-0 ${
          confirmClearBookmarksPending
            ? "!text-rose-100 !bg-rose-600/40 !border-rose-400"
            : "!text-rose-300/90 !border-rose-500/35 hover:!bg-rose-500/20"
        }">${confirmClearBookmarksPending ? "تأكيد مسح الكل؟" : "مسح الكل"}</button>`;

        subFilterContainer.innerHTML = chipsHtml;
      }
    }

    const filteredFavorites = resolvedAll.filter((entry) => {
      if (currentSubFilter !== "all" && entry.item.system !== currentSubFilter) {
        return false;
      }
      if (!q) return true;
      const it = entry.item;
      return (
        it.name.toLowerCase().includes(q) ||
        (entry.sectionName && entry.sectionName.toLowerCase().includes(q)) ||
        (it.functionDesc && it.functionDesc.toLowerCase().includes(q)) ||
        (it.examNote && it.examNote.toLowerCase().includes(q))
      );
    });

    if (countLabel) {
      countLabel.innerText = `${filteredFavorites.length} في المفضلة`;
    }

    if (resolvedAll.length === 0) {
      treeContainer.innerHTML = `
        <div class="p-6 rounded-2xl bg-slate-900/65 border border-slate-800/90 text-center space-y-3 my-2">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-400/30 flex items-center justify-center text-rose-400">
            ${createHeartSvgMarkup(false, "w-6 h-6")}
          </div>
          <div class="space-y-1">
            <p class="text-xs font-extrabold text-slate-200">قائمة المفضلة فارغة حالياً</p>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              انقر على زر القلب داخل بطاقة المعلومات التشريحية أو بجوار أي عنصر لحفظ العظام والعضلات والأعصاب المهمة للمراجعة السريعة.
            </p>
          </div>
          <button type="button" onclick="setSidebarSystemFilter('active')" class="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 text-xs font-bold border border-sky-400/40 transition-colors">
            استكشاف الفهرس المنهجي
          </button>
        </div>
      `;
      return;
    }

    if (filteredFavorites.length === 0) {
      treeContainer.innerHTML = `
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <p class="text-xs font-bold text-slate-300">لا توجد عناصر مفضلة مطابقة للبحث أو التصفية</p>
          <button type="button" onclick="filterBySubGroup('all'); clearCurriculumSearch();" class="mt-2 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-200 text-xs font-bold border border-rose-400/40">
            إظهار كل المفضلة
          </button>
        </div>
      `;
      return;
    }

    const listCard = document.createElement("div");
    listCard.className = "rounded-2xl bg-slate-900/75 border border-slate-800/90 overflow-hidden divide-y divide-slate-800/60";

    filteredFavorites.forEach((entry) => {
      const { item, sectionName, systemName, sysAccent } = entry;
      flatRenderedItems.push({ item, sectionName, systemName });

      const isSelected = Boolean(currentSelectedItem && currentSelectedItem.id === item.id);
      const unitLabel = item.system === "skeletal" ? "عظمة" : item.system === "muscular" ? "عضلة" : "عصب";
      const sysShortLabel = SYSTEM_LABELS_AR[item.system] || systemName;

      const row = document.createElement("div");
      row.id = `tree-item-${item.id}`;
      row.className = `index-item-card w-full flex items-center justify-between gap-1.5 transition-all ${
        isSelected ? "is-selected" : ""
      }`;

      const selectBtn = document.createElement("button");
      selectBtn.type = "button";
      selectBtn.className = "flex-1 min-w-0 py-2.5 pr-3.5 pl-1 text-right flex items-center justify-between gap-2";
      selectBtn.onclick = () => {
        if (item.system && activeSystem !== "integrated" && item.system !== activeSystem) {
          switchSystem(item.system);
        }
        selectItem(item, sectionName, systemName, true);
        if (window.innerWidth < 768) {
          toggleSidebar(false);
        }
      };

      selectBtn.innerHTML = `
        <div class="flex items-start gap-2.5 min-w-0">
          <span class="w-2 h-2 rounded-full mt-1.5 shrink-0" style="background-color: ${
            isSelected ? "#38bdf8" : sysAccent
          }"></span>
          <div class="min-w-0">
            <div class="font-semibold text-xs text-slate-100 leading-snug truncate">${item.name}</div>
            <div class="text-[10px] text-slate-400 truncate mt-0.5">${sysShortLabel} • ${sectionName.split("(")[0].trim()}</div>
          </div>
        </div>
        <span class="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-950/90 text-sky-300/90 border border-slate-800 shrink-0 tabular-nums">
          ${item.count || 1} ${unitLabel}
        </span>
      `;

      const removeFavBtn = document.createElement("button");
      removeFavBtn.type = "button";
      removeFavBtn.className =
        "bookmark-heart-btn is-bookmarked w-7 h-7 ml-2.5 rounded-lg viewer-ctrl-btn flex items-center justify-center shrink-0";
      removeFavBtn.setAttribute("data-tip", "إزالة من المفضلة");
      removeFavBtn.setAttribute("aria-label", `إزالة ${item.name} من المفضلة`);
      removeFavBtn.innerHTML = createHeartSvgMarkup(true, "w-3.5 h-3.5");
      removeFavBtn.onclick = (e) => {
        e.stopPropagation();
        removeBookmarkById(item.id);
      };

      row.appendChild(selectBtn);
      row.appendChild(removeFavBtn);
      listCard.appendChild(row);
    });

    treeContainer.appendChild(listCard);
  }

  function renderCurriculumSidebar(searchQuery) {
    const treeContainer = document.getElementById("tree-container");
    const subFilterContainer = document.getElementById("sub-filter-buttons");
    const sidebarTitle = document.getElementById("sidebar-system-title");
    const sidebarDot = document.getElementById("sidebar-system-dot");
    const clearBtn = document.getElementById("btn-clear-search");
    const countLabel = document.getElementById("search-results-count");
    if (!treeContainer) return;

    updateFavoritesBadgesUI();
    treeContainer.innerHTML = "";
    flatRenderedItems = [];

    const q = (searchQuery || "").trim().toLowerCase();
    if (clearBtn) clearBtn.classList.toggle("hidden", q.length === 0);

    // وضع عرض قائمة العناصر المفضلة (Bookmarks)
    if (sidebarSystemFilter === "favorites") {
      renderFavoritesListInSidebar(q, treeContainer, subFilterContainer, sidebarTitle, sidebarDot, countLabel);
      return;
    }

    // تحديد الأجهزة المعروضة في الفهرس
    const effectiveFilter =
      sidebarSystemFilter === "active"
        ? activeSystem === "integrated"
          ? "all"
          : activeSystem
        : sidebarSystemFilter;

    let targetSystems = [];
    if (effectiveFilter === "all") {
      targetSystems = [
        ACADEMIC_CURRICULUM.skeletal,
        ACADEMIC_CURRICULUM.muscular,
        ACADEMIC_CURRICULUM.nervous
      ].filter(Boolean);
      if (sidebarTitle) sidebarTitle.innerText = "جميع الأجهزة التشريحية";
      if (sidebarDot) sidebarDot.style.backgroundColor = "#38bdf8";
      if (subFilterContainer) {
        subFilterContainer.innerHTML = `<button type="button" onclick="filterBySubGroup('all')" class="chip-btn is-active">جميع الأقسام المنهجية</button>`;
      }
    } else {
      const sys = ACADEMIC_CURRICULUM[effectiveFilter];
      if (!sys) return;
      targetSystems = [sys];
      if (sidebarTitle) sidebarTitle.innerText = sys.name;
      if (sidebarDot) sidebarDot.style.backgroundColor = sys.accent;

      if (subFilterContainer) {
        let html = `<button type="button" onclick="filterBySubGroup('all')" class="chip-btn ${currentSubFilter === "all" ? "is-active" : ""}">الكل</button>`;
        sys.sections.forEach((sec) => {
          const shortTitle = sec.name.split("(")[0].trim();
          const activeCls = currentSubFilter === sec.key ? "is-active" : "";
          html += `<button type="button" onclick="filterBySubGroup('${sec.key}')" class="chip-btn ${activeCls}">${shortTitle}</button>`;
        });
        subFilterContainer.innerHTML = html;
      }
    }

    let totalMatches = 0;

    targetSystems.forEach((sys) => {
      sys.sections.forEach((sec) => {
        if (effectiveFilter !== "all" && currentSubFilter !== "all" && sec.key !== currentSubFilter) {
          return;
        }

        const filteredItems = sec.items.filter((item) => {
          if (!q) return true;
          return (
            item.name.toLowerCase().includes(q) ||
            (item.functionDesc && item.functionDesc.toLowerCase().includes(q)) ||
            (item.examNote && item.examNote.toLowerCase().includes(q))
          );
        });

        if (filteredItems.length === 0) return;

        const sectionCard = document.createElement("div");
        sectionCard.className = "rounded-2xl bg-slate-900/75 border border-slate-800/90 overflow-hidden";

        const secHeader = document.createElement("button");
        secHeader.type = "button";
        secHeader.className =
          "w-full px-3.5 py-2.5 bg-slate-900/95 border-b border-slate-800/80 flex items-center justify-between text-right hover:bg-slate-800/60 transition-colors";
        secHeader.innerHTML = `
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${sys.accent}"></span>
            <span class="font-bold text-xs text-slate-100 truncate">${sec.name}</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-[10px] font-mono text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded tabular-nums">${filteredItems.length}</span>
            <svg class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        `;

        const itemsList = document.createElement("div");
        itemsList.className = "divide-y divide-slate-800/60";

        filteredItems.forEach((item) => {
          totalMatches++;
          flatRenderedItems.push({ item, sectionName: sec.name, systemName: sys.name });

          const isSelected = Boolean(currentSelectedItem && currentSelectedItem.id === item.id);
          const bookmarked = isItemBookmarked(item.id);

          const itemRow = document.createElement("div");
          itemRow.id = `tree-item-${item.id}`;
          itemRow.className = `index-item-card w-full flex items-center justify-between gap-1.5 transition-all ${
            isSelected ? "is-selected" : ""
          }`;

          const itemBtn = document.createElement("button");
          itemBtn.type = "button";
          itemBtn.className = "flex-1 min-w-0 py-2.5 pr-3.5 pl-1 text-right flex items-center justify-between gap-2";
          itemBtn.onclick = () => {
            if (item.system && activeSystem !== "integrated" && item.system !== activeSystem) {
              switchSystem(item.system);
            }
            selectItem(item, sec.name, sys.name, true);
            if (window.innerWidth < 768) {
              toggleSidebar(false);
            }
          };

          const unitLabel = item.system === "skeletal" ? "عظمة" : item.system === "muscular" ? "عضلة" : "عصب";

          itemBtn.innerHTML = `
            <div class="flex items-start gap-2.5 min-w-0">
              <span class="w-2 h-2 rounded-full mt-1.5 shrink-0 transition-colors ${
                isSelected ? "bg-sky-400 shadow-[0_0_8px_#38bdf8]" : "bg-slate-600"
              }"></span>
              <div class="min-w-0">
                <div class="font-semibold text-xs text-slate-100 leading-snug">${item.name}</div>
                ${
                  q && item.functionDesc
                    ? `<div class="text-[11px] text-slate-400 truncate mt-0.5">${item.functionDesc}</div>`
                    : ""
                }
              </div>
            </div>
            <span class="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-950/90 text-sky-300/90 border border-slate-800 shrink-0 tabular-nums">
              ${item.count} ${unitLabel}
            </span>
          `;

          const favBtn = document.createElement("button");
          favBtn.type = "button";
          favBtn.className = `bookmark-heart-btn w-7 h-7 ml-2.5 rounded-lg viewer-ctrl-btn flex items-center justify-center shrink-0 ${
            bookmarked ? "is-bookmarked" : ""
          }`;
          favBtn.setAttribute("data-tip", bookmarked ? "إزالة من المفضلة" : "حفظ في المفضلة");
          favBtn.setAttribute("aria-label", bookmarked ? `إزالة ${item.name} من المفضلة` : `حفظ ${item.name} في المفضلة`);
          favBtn.setAttribute("aria-pressed", bookmarked ? "true" : "false");
          favBtn.innerHTML = createHeartSvgMarkup(bookmarked, "w-3.5 h-3.5");
          favBtn.onclick = (e) => {
            e.stopPropagation();
            toggleItemBookmarkByData(item, { sectionName: sec.name, systemName: sys.name }, false);
          };

          itemRow.appendChild(itemBtn);
          itemRow.appendChild(favBtn);
          itemsList.appendChild(itemRow);
        });

        secHeader.onclick = () => {
          const isHidden = itemsList.classList.toggle("hidden");
          const icon = secHeader.querySelector("svg");
          if (icon) icon.style.transform = isHidden ? "rotate(90deg)" : "rotate(0deg)";
        };

        sectionCard.appendChild(secHeader);
        sectionCard.appendChild(itemsList);
        treeContainer.appendChild(sectionCard);
      });
    });

    if (countLabel) {
      countLabel.innerText = `${totalMatches} عنصر تشريحي`;
    }

    if (totalMatches === 0) {
      treeContainer.innerHTML = `
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <p class="text-xs font-bold text-slate-300">لا توجد عناصر مطابقة لعبارة البحث</p>
          <p class="text-[11px] text-slate-500">جرّب البحث باسم العظمة أو العضلة أو العصب (مثل: الفخذ، الأطلس، الحائر، الوركي).</p>
          <button type="button" onclick="clearCurriculumSearch()" class="mt-2 px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/40">إظهار جميع العناصر</button>
        </div>
      `;
    }
  }

  function filterBySubGroup(key) {
    currentSubFilter = key;
    confirmClearBookmarksPending = false;
    renderCurriculumSidebar(getSearchInputValue());
  }
  window.filterBySubGroup = filterBySubGroup;

  function handleSearch(val) {
    renderCurriculumSidebar(val);
  }
  window.handleSearch = handleSearch;

  function selectAdjacentCurriculumItem(dir) {
    if (!flatRenderedItems.length) {
      renderCurriculumSidebar("");
    }
    if (!flatRenderedItems.length) return;
    const curIdx = currentSelectedItem
      ? flatRenderedItems.findIndex((entry) => entry.item.id === currentSelectedItem.id)
      : -1;
    const nextIdx = (curIdx + dir + flatRenderedItems.length) % flatRenderedItems.length;
    const nextEntry = flatRenderedItems[nextIdx];
    if (nextEntry) {
      if (nextEntry.item.system && activeSystem !== "integrated" && nextEntry.item.system !== activeSystem) {
        switchSystem(nextEntry.item.system);
      }
      selectItem(nextEntry.item, nextEntry.sectionName, nextEntry.systemName, true);
    }
  }
  window.selectAdjacentCurriculumItem = selectAdjacentCurriculumItem;

  // --- 9. مطابقة المجسمات بدقة، العزل، بطاقة المعلومات، والنطق الصوتي ---
  function getItemMeshes(item) {
    if (!item) return [];
    if (item.exactMeshes && item.exactMeshes.length > 0) {
      return item.exactMeshes;
    }

    const sysKey = item.system || activeSystem;
    const targetPool =
      activeSystem === "integrated"
        ? [...allMeshesBySystem.skeletal, ...allMeshesBySystem.muscular, ...allMeshesBySystem.nervous]
        : allMeshesBySystem[sysKey] || [];

    if (!targetPool.length) return [];

    // أولوية المطابقة الدقيقة لأسماء Z-Anatomy
    if (item.exactNames && item.exactNames.length > 0) {
      const exactSet = new Set(item.exactNames.map((n) => normalizeMeshLookupKey(n)));
      const exactHits = targetPool.filter((mesh) => exactSet.has(mesh.userData.normName));
      if (exactHits.length > 0) return exactHits;
    }

    if (!item.keys || !item.keys.length) return [];
    const normKeys = item.keys.map((k) => normalizeMeshLookupKey(k));

    return targetPool.filter((mesh) => {
      const normName = mesh.userData.normName || normalizeMeshLookupKey(mesh.name || "");
      if (item.isHandPhalanx) {
        return normName.includes("phalanx") && (normName.includes("hand") || (normName.includes("finger") && !normName.includes("foot")));
      }
      if (item.isFootPhalanx) {
        return (normName.includes("phalanx") || normName.includes("sesamoid")) && (normName.includes("foot") || normName.includes("toe"));
      }
      return normKeys.some((nk) => nk && normName.includes(nk));
    });
  }

  function resetAllMaterials() {
    Object.keys(allMeshesBySystem).forEach((sysKey) => {
      allMeshesBySystem[sysKey].forEach((mesh) => {
        if (mesh.userData.originalMaterial) {
          mesh.userData.originalMaterial.wireframe = isMainWireframe;
          mesh.material = mesh.userData.originalMaterial;
        }
        mesh.visible = true;
      });
    });
    currentHighlightedMeshes = [];
  }

  function selectItem(item, sectionName, systemName, focusCamera) {
    if (!item) return;

    const targetSys = item.system || (activeSystem === "integrated" ? "skeletal" : activeSystem);
    ensureSystemLoaded(targetSys, () => {
      const resolvedSystemName =
        systemName ||
        (item.system === "muscular"
          ? "الجهاز العضلي"
          : item.system === "nervous"
          ? "الجهاز العصبي"
          : "الجهاز الهيكلي");
      const resolvedSectionName = sectionName || "القسم المنهجي";

      currentSelectedItem = item;
      currentSelectedMeta = {
        sectionName: resolvedSectionName,
        systemName: resolvedSystemName
      };
      isIsolatedMode = false;

      const isolateBtnText = document.getElementById("isolate-btn-text");
      if (isolateBtnText) isolateBtnText.innerText = "عزل العنصر";

      resetAllMaterials();

      const targetMeshes = getItemMeshes(item);
      currentHighlightedMeshes = targetMeshes;

      const allActiveMeshes =
        activeSystem === "integrated"
          ? [...allMeshesBySystem.skeletal, ...allMeshesBySystem.muscular, ...allMeshesBySystem.nervous]
          : allMeshesBySystem[activeSystem] || [];

      if (targetMeshes.length > 0) {
        dimmedMaterial.wireframe = isMainWireframe;
        highlightMaterial.wireframe = isMainWireframe;

        allActiveMeshes.forEach((mesh) => {
          mesh.material = dimmedMaterial;
          mesh.visible = true;
        });

        targetMeshes.forEach((mesh) => {
          mesh.material = highlightMaterial;
          mesh.visible = true;
        });

        const box = new THREE.Box3();
        targetMeshes.forEach((m) => box.expandByObject(m));
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        activateSelectionParticles(center, size, item.system || activeSystem, false);

        if (focusCamera !== false) {
          focusOnMeshes(targetMeshes);
        }
      }

      // تحديث بطاقة المعلومات التشريحية وحالة زر القلب (المفضلة)
      const cardTitleAr = document.getElementById("card-title-ar");
      const cardSysBadge = document.getElementById("card-system-pill");
      const cardGroupName = document.getElementById("card-group-name");
      const cardCountBadge = document.getElementById("card-count-badge");
      const cardFunction = document.getElementById("card-function");
      const cardExamNote = document.getElementById("card-exam-note");
      const extractBtn = document.getElementById("btn-card-extract");
      const itemInfoCard = document.getElementById("item-info-card");

      if (cardTitleAr) cardTitleAr.innerText = item.name;
      if (cardSysBadge) cardSysBadge.innerText = resolvedSystemName;
      if (cardGroupName) cardGroupName.innerText = resolvedSectionName;
      if (cardCountBadge) {
        const unit = item.system === "muscular" ? "عضلة" : item.system === "nervous" ? "عصب" : "عظمة";
        cardCountBadge.innerText = `${item.count || 1} ${unit}`;
      }
      if (cardFunction) {
        cardFunction.innerText = item.functionDesc || "الوظيفة الحيوية والتكامل التشريحي وفق منهج الأحياء.";
      }
      if (cardExamNote) {
        cardExamNote.innerText = item.examNote || "راجع تفاصيل الاتصال والتمفصل وتنسيق السيالات العصبية في المنهج.";
      }
      if (extractBtn) {
        const isSkeletalItem = (item.system || activeSystem) === "skeletal" || Boolean(item.boneId);
        extractBtn.classList.toggle("hidden", !isSkeletalItem);
      }

      updateCardBookmarkButtonUI(false);

      if (itemInfoCard) {
        itemInfoCard.classList.remove("hidden");
        setMobileCardMinimized(false);
      }

      setInteractionStatus(`محدد حالياً: ${item.name}`, "active");

      // القراءة الصوتية التلقائية عند فتح البطاقة (إن كانت مفعلة)
      speakCardContent(item, false);

      // تمييز العنصر في الفهرس
      document.querySelectorAll(".index-item-card").forEach((el) => el.classList.remove("is-selected"));
      const activeTreeEl = document.getElementById(`tree-item-${item.id}`);
      if (activeTreeEl) {
        activeTreeEl.classList.add("is-selected");
        activeTreeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }
  window.selectItem = selectItem;

  function setMobileCardMinimized(minimized) {
    isMobileSheetMinimized = minimized;
    const body = document.getElementById("card-collapsible-body");
    const chevron = document.getElementById("card-sheet-chevron");
    if (body) body.classList.toggle("hidden-mobile-sheet", minimized);
    if (chevron) chevron.style.transform = minimized ? "rotate(180deg)" : "rotate(0deg)";
  }

  function toggleMobileCardSheet() {
    setMobileCardMinimized(!isMobileSheetMinimized);
  }
  window.toggleMobileCardSheet = toggleMobileCardSheet;

  // --- محرك القراءة الصوتية العربية (Arabic TTS) ---
  let isSpeechEnabled = true;
  let isSpeakingNow = false;

  function cleanTextForSpeech(text) {
    if (!text) return "";
    return text.replace(/[•()\/\\_\-–—]/g, " ").replace(/\s+/g, " ").trim();
  }

  function updateSpeechUI(speaking) {
    const iconPlaying = document.getElementById("icon-speaker-playing");
    const iconIdle = document.getElementById("icon-speaker-idle");
    const statusText = document.getElementById("speech-status-text");
    const btn = document.getElementById("btn-speak-card");

    if (iconPlaying && iconIdle && statusText) {
      iconPlaying.classList.toggle("hidden", !speaking);
      iconIdle.classList.toggle("hidden", speaking);
      statusText.innerText = speaking ? "إيقاف القراءة" : "الاستماع للشرح";
      if (btn) btn.classList.toggle("is-speaking", speaking);
    }
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    isSpeakingNow = false;
    updateSpeechUI(false);
  }

  function speakCardContent(item, force) {
    if (!("speechSynthesis" in window)) return;
    if (!isSpeechEnabled && !force) return;

    stopSpeaking();
    if (!item) return;

    let textToRead = `${item.name || ""}. `;
    if (item.functionDesc) textToRead += `الوظيفة والأهمية التشريحية: ${item.functionDesc}. `;
    if (item.examNote) textToRead += `التلميح الامتحاني: ${item.examNote}.`;

    const cleanText = cleanTextForSpeech(textToRead);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ar-SA";
    utterance.rate = 0.96;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang && (v.lang.startsWith("ar") || v.lang.toLowerCase().includes("arab")));
    if (arabicVoice) utterance.voice = arabicVoice;

    utterance.onstart = () => {
      isSpeakingNow = true;
      updateSpeechUI(true);
    };
    utterance.onend = () => {
      isSpeakingNow = false;
      updateSpeechUI(false);
    };
    utterance.onerror = () => {
      isSpeakingNow = false;
      updateSpeechUI(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  function toggleCardSpeech() {
    if (isSpeakingNow) {
      stopSpeaking();
    } else if (currentSelectedItem) {
      speakCardContent(currentSelectedItem, true);
    }
  }
  window.toggleCardSpeech = toggleCardSpeech;

  function toggleAutoSpeech() {
    isSpeechEnabled = !isSpeechEnabled;
    const autoBtn = document.getElementById("btn-auto-speech");
    if (autoBtn) {
      autoBtn.classList.toggle("text-sky-300", isSpeechEnabled);
      autoBtn.classList.toggle("border-sky-500/40", isSpeechEnabled);
      autoBtn.classList.toggle("text-slate-500", !isSpeechEnabled);
      autoBtn.innerText = isSpeechEnabled ? "قراءة تلقائية: مفعلة" : "قراءة تلقائية: متوقفة";
    }
    if (!isSpeechEnabled) stopSpeaking();
  }
  window.toggleAutoSpeech = toggleAutoSpeech;

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  // --- العزل وإعادة الضبط وتركيز الكاميرا ---
  function resetSceneAndIsolation(resetCameraFlag = true) {
    stopSpeaking();
    resetAllMaterials();
    currentSelectedItem = null;
    currentSelectedMeta = { sectionName: "", systemName: "" };
    isIsolatedMode = false;
    updateCardBookmarkButtonUI(false);

    const itemInfoCard = document.getElementById("item-info-card");
    if (itemInfoCard) itemInfoCard.classList.add("hidden");

    const isolateBtnText = document.getElementById("isolate-btn-text");
    if (isolateBtnText) isolateBtnText.innerText = "عزل العنصر";

    hideSelectionParticles();

    if (currentExplodeRatio > 0) {
      setExplodePreset(0);
    }

    if (resetCameraFlag) {
      gsap.to(masterGroup.rotation, { x: 0, y: 0, z: 0, duration: 0.85, ease: "power2.out" });
      gsap.to(camera.position, {
        x: DEFAULT_CAM_POS.x,
        y: DEFAULT_CAM_POS.y,
        z: DEFAULT_CAM_POS.z,
        duration: 0.9,
        ease: "power2.out"
      });
      gsap.to(controls.target, {
        x: DEFAULT_CAM_TARGET.x,
        y: DEFAULT_CAM_TARGET.y,
        z: DEFAULT_CAM_TARGET.z,
        duration: 0.9,
        ease: "power2.out",
        onUpdate: () => controls.update()
      });
      highlightActiveCameraBtn("front");
      setInteractionStatus("وضع الاستكشاف الحر • المجسم في الوضع القياسي", "ready");
    }

    document.querySelectorAll(".index-item-card").forEach((el) => el.classList.remove("is-selected"));
  }
  window.resetSceneAndIsolation = resetSceneAndIsolation;

  function closeInfoCard() {
    stopSpeaking();
    const itemInfoCard = document.getElementById("item-info-card");
    if (itemInfoCard) itemInfoCard.classList.add("hidden");
    resetAllMaterials();
    currentSelectedItem = null;
    currentSelectedMeta = { sectionName: "", systemName: "" };
    isIsolatedMode = false;
    updateCardBookmarkButtonUI(false);
    hideSelectionParticles();
    document.querySelectorAll(".index-item-card").forEach((el) => el.classList.remove("is-selected"));
    setInteractionStatus("وضع الاستكشاف الحر • اسحب للتدوير أو انقر على أي عنصر", "ready");
  }
  window.closeInfoCard = closeInfoCard;

  function focusCurrentSelectedItem() {
    if (currentHighlightedMeshes.length > 0) {
      focusOnMeshes(currentHighlightedMeshes);
    }
  }
  window.focusCurrentSelectedItem = focusCurrentSelectedItem;

  function toggleIsolateMode() {
    if (!currentSelectedItem || currentHighlightedMeshes.length === 0) return;
    isIsolatedMode = !isIsolatedMode;

    const isolateBtnText = document.getElementById("isolate-btn-text");
    const isolateBtn = document.getElementById("btn-card-isolate");
    const allActiveMeshes =
      activeSystem === "integrated"
        ? [...allMeshesBySystem.skeletal, ...allMeshesBySystem.muscular, ...allMeshesBySystem.nervous]
        : allMeshesBySystem[activeSystem] || [];

    const box = new THREE.Box3();
    currentHighlightedMeshes.forEach((m) => box.expandByObject(m));

    if (isIsolatedMode) {
      if (isolateBtnText) isolateBtnText.innerText = "إلغاء العزل";
      if (isolateBtn) isolateBtn.classList.add("is-active");
      allActiveMeshes.forEach((mesh) => {
        mesh.visible = currentHighlightedMeshes.includes(mesh);
      });
      activateSelectionParticles(
        box.getCenter(new THREE.Vector3()),
        box.getSize(new THREE.Vector3()),
        currentSelectedItem.system || activeSystem,
        true
      );
      focusOnMeshes(currentHighlightedMeshes);
      setInteractionStatus(`وضع العزل التشريحي النشط: ${currentSelectedItem.name}`, "active");
    } else {
      if (isolateBtnText) isolateBtnText.innerText = "عزل العنصر";
      if (isolateBtn) isolateBtn.classList.remove("is-active");
      allActiveMeshes.forEach((mesh) => {
        mesh.visible = true;
        mesh.material = currentHighlightedMeshes.includes(mesh) ? highlightMaterial : dimmedMaterial;
      });
      activateSelectionParticles(
        box.getCenter(new THREE.Vector3()),
        box.getSize(new THREE.Vector3()),
        currentSelectedItem.system || activeSystem,
        false
      );
      setInteractionStatus(`محدد حالياً: ${currentSelectedItem.name}`, "active");
    }
  }
  window.toggleIsolateMode = toggleIsolateMode;

  function focusOnMeshes(meshes) {
    if (!meshes || meshes.length === 0) return;
    const box = new THREE.Box3();
    meshes.forEach((m) => box.expandByObject(m));

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetDistance = Math.min(Math.max(maxDim * 2.15, 0.45), 2.15);

    const isMobile = window.innerWidth < 768;
    const yOffset = isMobile ? -0.08 : 0.0;

    gsap.to(camera.position, {
      x: center.x + (camera.position.x >= 0 ? 0.3 : -0.3),
      y: center.y + 0.14,
      z: center.z + targetDistance,
      duration: 1.05,
      ease: "power2.inOut"
    });

    gsap.to(controls.target, {
      x: center.x,
      y: center.y + yOffset,
      z: center.z,
      duration: 1.05,
      ease: "power2.inOut",
      onUpdate: () => controls.update()
    });
  }

  // --- 10. النقر ثلاثي الأبعاد والتلميحات الذكية (Raycasting & Hover/Long-Press Tooltips) ---
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let isDragging = false;
  let mouseDownPos = { x: 0, y: 0 };
  let lastHoverCheck = 0;

  renderer.domElement.addEventListener("pointerdown", (e) => {
    isDragging = false;
    mouseDownPos = { x: e.clientX, y: e.clientY };
  });

  renderer.domElement.addEventListener("pointermove", (e) => {
    if (e.buttons > 0) {
      const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
      if (dist > 6) isDragging = true;
    }
    if (e.pointerType === "mouse") {
      const now = performance.now();
      if (now - lastHoverCheck > 45) {
        lastHoverCheck = now;
        handle3DHoverTooltip(e);
      }
    }
  });

  renderer.domElement.addEventListener("pointerup", (e) => {
    const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
    if (!isDragging && dist <= 6) {
      handle3DClick(e);
    }
  });

  function findItemByMesh(mesh) {
    if (!mesh || !mesh.name) return null;
    const normMesh = mesh.userData.normName || normalizeMeshLookupKey(mesh.name);

    const systems =
      activeSystem === "integrated"
        ? [ACADEMIC_CURRICULUM.skeletal, ACADEMIC_CURRICULUM.muscular, ACADEMIC_CURRICULUM.nervous]
        : [ACADEMIC_CURRICULUM[activeSystem]];

    let bestMatch = null;
    let highestScore = 0;

    for (const sys of systems) {
      if (!sys) continue;
      for (const sec of sys.sections) {
        for (const item of sec.items) {
          if (item.exactNames) {
            for (const ex of item.exactNames) {
              if (normalizeMeshLookupKey(ex) === normMesh) {
                return { item, section: sec, system: sys };
              }
            }
          }
          for (const k of item.keys || []) {
            const nk = normalizeMeshLookupKey(k);
            if (nk && normMesh.includes(nk)) {
              let score = nk.length;
              if (normMesh === nk) score += 60;
              else if (normMesh.startsWith(nk) || normMesh.endsWith(nk)) score += 20;
              if (score > highestScore) {
                highestScore = score;
                bestMatch = { item, section: sec, system: sys };
              }
            }
          }
        }
      }
    }
    return bestMatch;
  }

  function getActiveIntersectPool() {
    if (activeSystem === "integrated") {
      const pool = [];
      if (systemGroups.skeletal.visible) pool.push(...allMeshesBySystem.skeletal);
      if (systemGroups.muscular.visible) pool.push(...allMeshesBySystem.muscular);
      if (systemGroups.nervous.visible) pool.push(...allMeshesBySystem.nervous);
      return pool;
    }
    return allMeshesBySystem[activeSystem] || [];
  }

  function handle3DClick(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const pool = getActiveIntersectPool().filter((m) => m.visible);
    const intersects = raycaster.intersectObjects(pool, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const match = findItemByMesh(hitMesh);
      if (match) {
        const selectedObj = Object.assign({}, match.item, { exactMeshes: [hitMesh] });
        selectItem(selectedObj, match.section.name, match.system.name, true);
      } else {
        const rawName = (hitMesh.name || "عنصر تشريحي منفرد").replace(/[_\.]/g, " ");
        const meshSys = hitMesh.userData.system || (activeSystem === "integrated" ? "skeletal" : activeSystem);
        const stableDynamicId = hitMesh.name
          ? "mesh_" + meshSys + "_" + normalizeMeshLookupKey(hitMesh.name)
          : "dynamic_" + hitMesh.uuid.slice(0, 8);
        selectItem(
          {
            id: stableDynamicId,
            name: rawName,
            count: 1,
            system: meshSys,
            isDynamicMesh: true,
            exactNames: hitMesh.name ? [hitMesh.name] : [],
            exactMeshes: [hitMesh],
            functionDesc: "عنصر تشريحي دقيق محدد مباشرة من المجسم الواقعي ثلاثي الأبعاد.",
            examNote: "استخدم أدوات العزل أو الدوران لفحص علاقته التشريحية بالعناصر المجاورة."
          },
          "تحديد تشريحي مباشر",
          SYSTEM_LABELS_AR[meshSys] || "الأطلس التشريحي",
          true
        );
      }
    }
  }

  const hoverTooltip = document.getElementById("hover-tooltip");

  function showFloatingTooltip(text, x, y) {
    if (!hoverTooltip || !text) return;
    hoverTooltip.innerText = text;
    const maxX = window.innerWidth - 220;
    const clampedX = Math.max(12, Math.min(x + 14, maxX));
    const clampedY = Math.max(12, y - 36);
    hoverTooltip.style.left = `${clampedX}px`;
    hoverTooltip.style.top = `${clampedY}px`;
    hoverTooltip.classList.remove("hidden");
  }

  function hideFloatingTooltip() {
    if (hoverTooltip) hoverTooltip.classList.add("hidden");
  }

  function handle3DHoverTooltip(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const pool = getActiveIntersectPool().filter((m) => m.visible);
    const intersects = raycaster.intersectObjects(pool, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const match = findItemByMesh(hitMesh);
      renderer.domElement.style.cursor = "pointer";
      const label = match ? match.item.name : (hitMesh.name || "").replace(/_/g, " ");
      if (label) {
        showFloatingTooltip(label, e.clientX, e.clientY);
        return;
      }
    }
    renderer.domElement.style.cursor = "grab";
    hideFloatingTooltip();
  }

  // تلميحات الأزرار عند التمرير (Hover) أو الضغط المطول على الموبايل (Long-Press)
  function initControlTooltips() {
    let longPressTimer = null;

    document.addEventListener("mouseover", (e) => {
      const target = e.target.closest("[data-tip]");
      if (target && window.matchMedia("(hover: hover)").matches) {
        const r = target.getBoundingClientRect();
        showFloatingTooltip(target.getAttribute("data-tip"), r.left + r.width / 2 - 40, r.top);
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("[data-tip]")) {
        hideFloatingTooltip();
      }
    });

    document.addEventListener(
      "touchstart",
      (e) => {
        const target = e.target.closest("[data-tip]");
        if (!target) return;
        const touch = e.touches[0];
        clearTimeout(longPressTimer);
        longPressTimer = setTimeout(() => {
          showFloatingTooltip(target.getAttribute("data-tip"), touch.clientX - 40, touch.clientY - 18);
          setTimeout(hideFloatingTooltip, 1800);
        }, 420);
      },
      { passive: true }
    );

    document.addEventListener("touchend", () => clearTimeout(longPressTimer), { passive: true });
    document.addEventListener("touchmove", () => clearTimeout(longPressTimer), { passive: true });
  }
  initControlTooltips();

  // --- 11. أدوات الكاميرا الاحترافية، التكبير، الدوران التلقائي، والهيكل الشبكي ---
  function highlightActiveCameraBtn(angle) {
    document.querySelectorAll("[data-cam-angle]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-cam-angle") === angle);
    });
  }

  function setCameraAngle(angle) {
    const target = controls.target.clone();
    const dist = Math.max(camera.position.distanceTo(target), 2.15);
    let targetPos;
    let statusLabel = "";

    gsap.to(masterGroup.rotation, { x: 0, y: 0, z: 0, duration: 0.75, ease: "power2.out" });

    switch (angle) {
      case "front":
        targetPos = new THREE.Vector3(target.x, target.y + 0.05, target.z + dist);
        statusLabel = "زاوية العرض الأمامي (Anterior View)";
        break;
      case "back":
        targetPos = new THREE.Vector3(target.x, target.y + 0.05, target.z - dist);
        statusLabel = "زاوية العرض الخلفي (Posterior View)";
        break;
      case "side":
        sideToggleRight = !sideToggleRight;
        targetPos = new THREE.Vector3(target.x + (sideToggleRight ? dist : -dist), target.y + 0.05, target.z);
        statusLabel = sideToggleRight ? "زاوية العرض الجانبي الأيمن (Lateral R)" : "زاوية العرض الجانبي الأيسر (Lateral L)";
        break;
      case "top":
        targetPos = new THREE.Vector3(target.x, target.y + dist, target.z + 0.08);
        statusLabel = "زاوية العرض العلوي (Superior View)";
        break;
      default:
        targetPos = DEFAULT_CAM_POS.clone();
        statusLabel = "الزاوية القياسية";
    }

    highlightActiveCameraBtn(angle);
    setInteractionStatus(statusLabel, "active");

    gsap.to(camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 0.85,
      ease: "power2.inOut",
      onUpdate: () => controls.update()
    });
  }
  window.setCameraAngle = setCameraAngle;

  function zoomCamera(factor) {
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
    const curLen = dir.length();
    const nextLen = Math.min(controls.maxDistance, Math.max(controls.minDistance, curLen * factor));
    dir.setLength(nextLen);
    const nextPos = new THREE.Vector3().addVectors(controls.target, dir);

    gsap.to(camera.position, {
      x: nextPos.x,
      y: nextPos.y,
      z: nextPos.z,
      duration: 0.35,
      ease: "power2.out",
      onUpdate: () => controls.update()
    });
  }
  window.zoomCamera = zoomCamera;

  function toggleAutoRotate() {
    isAutoRotating = !isAutoRotating;
    const btn = document.getElementById("btn-autorotate");
    if (btn) btn.classList.toggle("is-active", isAutoRotating);
    setInteractionStatus(
      isAutoRotating ? "الدوران التلقائي 360° مفعل" : "تم إيقاف الدوران التلقائي",
      isAutoRotating ? "active" : "ready"
    );
  }
  window.toggleAutoRotate = toggleAutoRotate;

  function toggleMainWireframe() {
    isMainWireframe = !isMainWireframe;
    const btn = document.getElementById("btn-main-wireframe");
    if (btn) btn.classList.toggle("is-active", isMainWireframe);

    [boneMaterial, muscleMaterial, nerveMaterial, highlightMaterial, dimmedMaterial].forEach((m) => {
      m.wireframe = isMainWireframe;
    });
    Object.keys(allMeshesBySystem).forEach((sysKey) => {
      allMeshesBySystem[sysKey].forEach((mesh) => {
        if (mesh.material) mesh.material.wireframe = isMainWireframe;
        if (mesh.userData.originalMaterial) mesh.userData.originalMaterial.wireframe = isMainWireframe;
      });
    });

    setInteractionStatus(
      isMainWireframe ? "وضع الهيكل الشبكي الهندسي (Wireframe) مفعل" : "وضع الإظهار التشريحي الواقعي مفعل",
      isMainWireframe ? "active" : "ready"
    );
  }
  window.toggleMainWireframe = toggleMainWireframe;

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }
  window.toggleFullscreen = toggleFullscreen;

  // --- 12. القائمة الجانبية للفهرس ---
  let isSidebarOpen = false;
  function toggleSidebar(forceState) {
    const sidebar = document.getElementById("curriculum-sidebar");
    const sidebarBackdrop = document.getElementById("sidebar-backdrop");
    const toggleBtn = document.getElementById("btn-toggle-sidebar");
    if (!sidebar) return;

    isSidebarOpen = typeof forceState === "boolean" ? forceState : !isSidebarOpen;
    sidebar.classList.toggle("translate-x-full", !isSidebarOpen);
    if (sidebarBackdrop) sidebarBackdrop.classList.toggle("hidden", !isSidebarOpen);
    if (toggleBtn) toggleBtn.classList.toggle("is-active", isSidebarOpen);
  }
  window.toggleSidebar = toggleSidebar;

  // --- 13. بنك الأسئلة والتحديات المطور (بدون أي window.alert) ---
  let currentQuestionIdx = 0;
  let quizScore = 0;
  let userAnswers = [];

  function openQuizModal() {
    currentQuestionIdx = 0;
    quizScore = 0;
    userAnswers = new Array(QUIZ_QUESTIONS.length).fill(null);

    const modal = document.getElementById("quiz-modal");
    const bodyView = document.getElementById("quiz-question-view");
    const summaryView = document.getElementById("quiz-summary-view");
    if (modal) modal.classList.remove("hidden");
    if (bodyView) bodyView.classList.remove("hidden");
    if (summaryView) summaryView.classList.add("hidden");

    loadQuizQuestion(0);
  }
  window.openQuizModal = openQuizModal;

  function closeQuizModal() {
    const modal = document.getElementById("quiz-modal");
    if (modal) modal.classList.add("hidden");
  }
  window.closeQuizModal = closeQuizModal;

  function renderQuizStepDots() {
    const dotsEl = document.getElementById("quiz-step-dots");
    if (!dotsEl) return;
    dotsEl.innerHTML = "";
    QUIZ_QUESTIONS.forEach((q, idx) => {
      const ans = userAnswers[idx];
      const dot = document.createElement("button");
      dot.type = "button";
      dot.onclick = () => loadQuizQuestion(idx);
      let cls = "h-2 rounded-full transition-all ";
      if (idx === currentQuestionIdx) cls += "w-6 bg-sky-400 ";
      else if (ans === null) cls += "w-2 bg-slate-700 hover:bg-slate-500 ";
      else if (ans === q.correctIndex) cls += "w-2.5 bg-emerald-400 ";
      else cls += "w-2.5 bg-rose-400 ";
      dot.className = cls;
      dot.setAttribute("aria-label", `السؤال ${idx + 1}`);
      dotsEl.appendChild(dot);
    });
  }

  function loadQuizQuestion(idx) {
    if (!QUIZ_QUESTIONS.length) return;
    currentQuestionIdx = idx;
    const q = QUIZ_QUESTIONS[idx];
    const savedAns = userAnswers[idx];

    const numEl = document.getElementById("quiz-question-num");
    const topicEl = document.getElementById("quiz-topic-badge");
    const textEl = document.getElementById("quiz-question-text");
    const scoreEl = document.getElementById("quiz-score");
    const progressEl = document.getElementById("quiz-progress-bar");
    const prevBtn = document.getElementById("btn-quiz-prev");
    const nextBtn = document.getElementById("btn-quiz-next");

    if (numEl) numEl.innerText = `السؤال ${idx + 1} من ${QUIZ_QUESTIONS.length}`;
    if (topicEl) topicEl.innerText = q.topic;
    if (textEl) textEl.innerText = q.question;
    if (scoreEl) scoreEl.innerText = `${quizScore} / ${QUIZ_QUESTIONS.length}`;
    if (progressEl) progressEl.style.width = `${Math.round(((idx + 1) / QUIZ_QUESTIONS.length) * 100)}%`;
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) {
      nextBtn.innerText = idx === QUIZ_QUESTIONS.length - 1 ? "عرض النتيجة النهائية" : "السؤال التالي ←";
    }

    renderQuizStepDots();

    const optsContainer = document.getElementById("quiz-options");
    const feedback = document.getElementById("quiz-feedback");
    if (!optsContainer) return;
    optsContainer.innerHTML = "";

    const letters = ["أ", "ب", "ج", "د"];
    q.options.forEach((opt, optIdx) => {
      const optBtn = document.createElement("button");
      optBtn.type = "button";
      optBtn.className =
        "w-full p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-right hover:border-sky-400/60 hover:bg-slate-800/80 transition-all text-slate-100 flex items-center justify-between gap-3";
      optBtn.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 text-sky-300 font-bold text-xs flex items-center justify-center shrink-0">${letters[optIdx] || optIdx + 1}</span>
          <span class="text-xs sm:text-sm font-medium leading-relaxed">${opt}</span>
        </div>
        <span class="quiz-state-icon text-sm font-bold shrink-0"></span>
      `;
      optBtn.onclick = () => answerQuiz(optIdx);
      optsContainer.appendChild(optBtn);
    });

    if (savedAns !== null) {
      applyQuizAnswerStyles(savedAns, false);
    } else if (feedback) {
      feedback.classList.add("hidden");
    }
  }

  function applyQuizAnswerStyles(selectedIdx, animateEffect) {
    const q = QUIZ_QUESTIONS[currentQuestionIdx];
    const isCorrect = selectedIdx === q.correctIndex;
    const optsContainer = document.getElementById("quiz-options");
    const feedback = document.getElementById("quiz-feedback");

    if (optsContainer) {
      Array.from(optsContainer.children).forEach((btn, i) => {
        const iconSpan = btn.querySelector(".quiz-state-icon");
        if (i === q.correctIndex) {
          btn.className =
            "w-full p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-400/80 text-emerald-100 text-right font-bold flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
          if (iconSpan) iconSpan.innerText = "✓ صحيحة";
        } else if (i === selectedIdx && !isCorrect) {
          btn.className =
            "w-full p-3.5 rounded-xl bg-rose-950/60 border border-rose-400/80 text-rose-100 text-right font-bold flex items-center justify-between gap-3";
          if (iconSpan) iconSpan.innerText = "✕ خاطئة";
        } else {
          btn.className =
            "w-full p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/40 text-slate-500 text-right flex items-center justify-between gap-3 opacity-70";
          if (iconSpan) iconSpan.innerText = "";
        }
      });
    }

    if (feedback) {
      feedback.className = `p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed transition-all ${
        isCorrect
          ? "bg-emerald-950/35 border-emerald-500/40 text-emerald-100"
          : "bg-rose-950/35 border-rose-500/40 text-rose-100"
      }`;
      feedback.innerHTML = `
        <div class="font-bold mb-1 flex items-center gap-2">
          <span>${isCorrect ? "✓ إجابة علمية صحيحة وممتازة!" : "✕ إجابة غير دقيقة — راجع التفسير العلمي:"}</span>
        </div>
        <p class="text-slate-200/95 leading-relaxed">${q.explanation}</p>
      `;
      feedback.classList.remove("hidden");
      if (animateEffect) {
        gsap.fromTo(feedback, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: "power2.out" });
      }
    }
  }

  function answerQuiz(selectedIdx) {
    if (userAnswers[currentQuestionIdx] !== null) return;
    userAnswers[currentQuestionIdx] = selectedIdx;

    const q = QUIZ_QUESTIONS[currentQuestionIdx];
    if (selectedIdx === q.correctIndex) {
      quizScore++;
    }

    const scoreEl = document.getElementById("quiz-score");
    if (scoreEl) scoreEl.innerText = `${quizScore} / ${QUIZ_QUESTIONS.length}`;

    applyQuizAnswerStyles(selectedIdx, true);
    renderQuizStepDots();
  }
  window.answerQuiz = answerQuiz;

  function prevQuizQuestion() {
    if (currentQuestionIdx > 0) {
      loadQuizQuestion(currentQuestionIdx - 1);
    }
  }
  window.prevQuizQuestion = prevQuizQuestion;

  function nextQuizQuestion() {
    if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
      loadQuizQuestion(currentQuestionIdx + 1);
    } else {
      showQuizSummary();
    }
  }
  window.nextQuizQuestion = nextQuizQuestion;

  function showQuizSummary() {
    const bodyView = document.getElementById("quiz-question-view");
    const summaryView = document.getElementById("quiz-summary-view");
    const finalScoreEl = document.getElementById("quiz-final-score");
    const finalMsgEl = document.getElementById("quiz-final-message");

    if (bodyView) bodyView.classList.add("hidden");
    if (summaryView) summaryView.classList.remove("hidden");

    const pct = Math.round((quizScore / (QUIZ_QUESTIONS.length || 1)) * 100);
    if (finalScoreEl) finalScoreEl.innerText = `${quizScore} / ${QUIZ_QUESTIONS.length} (${pct}%)`;
    if (finalMsgEl) {
      finalMsgEl.innerText =
        pct >= 80
          ? "مستوى متميز! إتقان رائع لتفاصيل الدعامة والحركة والتنسيق العصبي."
          : pct >= 60
          ? "مستوى جيد جداً! راجع التلميحات الامتحانية في البطاقات التشريحية للوصول للدرجة النهائية."
          : "فرصة رائعة للمراجعة! استكشف المجسمات ثلاثية الأبعاد والتلميحات الامتحانية ثم أعد الاختبار.";
    }
  }

  // --- 14. التجاوب وحلقة العرض الرئيسية (Render Loop) ---
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const animClock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = animClock.getElapsedTime();
    updateSelectionParticlesAnimation(elapsedTime);

    if (isAutoRotating) {
      masterGroup.rotation.y += 0.0055;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  updateModelStatusUI();
  renderCurriculumSidebar("");
  initProgressiveModels();
  animate();
})();
