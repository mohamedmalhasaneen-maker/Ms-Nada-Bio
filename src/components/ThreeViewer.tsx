import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  BodySystem,
  RenderMode,
  CameraPreset,
  AnatomicalItem,
  DisplayLayoutMode,
  AnatomicalViewMode,
} from '../types';
import { ANATOMY_MODELS, ANATOMICAL_HOTSPOTS, Hotspot3D } from '../data/modelsConfig';
import { ANATOMICAL_ITEMS } from '../data/anatomyData';
import {
  loadModelWithPersistentCache,
  isModelCached,
  getCacheStats,
  clearModelsCache,
} from '../utils/modelCache';
import {
  Sparkles,
  Rotate3d,
  Compass,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info,
  Bone,
  Activity,
  Zap,
  Layers,
  Eye,
  EyeOff,
  RotateCcw,
  X,
  Columns3,
  Crosshair,
  HardDrive,
  Check,
} from 'lucide-react';

interface ThreeViewerProps {
  system: BodySystem;
  selectedItem: AnatomicalItem | null;
  onSelectItem: (item: AnatomicalItem | null) => void;
  renderMode: RenderMode;
  autoRotate: boolean;
  cameraPreset: CameraPreset;
  onResetPreset: () => void;
  displayLayout?: DisplayLayoutMode;
  activeViewMode?: AnatomicalViewMode | 'free';
  onChangeViewMode?: (mode: AnatomicalViewMode | 'free') => void;
}

// In-memory cache for loaded GLTF scenes to avoid re-fetching
const gltfCache = new Map<string, THREE.Group>();

// 3D Precise Anchors Map (X, Y, Z, distance) with lateral offset for limbs
export const BONE_3D_TARGETS: Record<string, { x: number; y: number; z: number; distance: number }> = {
  // Head & Skull
  skull: { x: 0, y: 1.65, z: 0, distance: 0.8 },
  bone_skull_parietal: { x: 0, y: 1.65, z: 0, distance: 0.8 },
  bone_skull_frontal: { x: 0, y: 1.60, z: 0.1, distance: 0.7 },
  bone_skull_occipital: { x: 0, y: 1.58, z: -0.1, distance: 0.7 },
  mandible: { x: 0, y: 1.45, z: 0.1, distance: 0.6 },
  bone_mandible: { x: 0, y: 1.45, z: 0.1, distance: 0.6 },
  bone_maxilla: { x: 0, y: 1.50, z: 0.1, distance: 0.6 },

  // Spine & Thorax
  spine_cervical: { x: 0, y: 1.35, z: -0.05, distance: 0.9 },
  bone_cervical_vertebrae: { x: 0, y: 1.35, z: -0.05, distance: 0.9 },
  spine_thoracic_lumbar: { x: 0, y: 0.90, z: -0.07, distance: 1.2 },
  bone_thoracic_vertebrae: { x: 0, y: 1.05, z: -0.08, distance: 1.2 },
  bone_lumbar_vertebrae: { x: 0, y: 0.70, z: -0.05, distance: 1.1 },
  ribcage_sternum: { x: 0, y: 1.10, z: 0.12, distance: 1.0 },
  bone_sternum: { x: 0, y: 1.10, z: 0.12, distance: 0.9 },
  bone_ribs: { x: 0, y: 1.10, z: 0.15, distance: 1.3 },

  // Upper Limb & Shoulder (with lateral X offset to prevent clipping inside ribcage)
  clavicle: { x: 0.20, y: 1.30, z: 0.05, distance: 0.8 },
  bone_clavicle: { x: 0.20, y: 1.30, z: 0.05, distance: 0.8 },
  scapula: { x: 0.25, y: 1.25, z: -0.10, distance: 0.9 },
  bone_scapula: { x: 0.25, y: 1.25, z: -0.10, distance: 0.9 },
  humerus: { x: 0.40, y: 1.05, z: 0.0, distance: 1.1 },
  bone_humerus: { x: 0.40, y: 1.05, z: 0.0, distance: 1.1 },
  radius_ulna: { x: 0.50, y: 0.75, z: 0.0, distance: 0.9 },
  bone_radius: { x: 0.50, y: 0.75, z: 0.0, distance: 0.9 },
  bone_ulna: { x: 0.48, y: 0.75, z: -0.02, distance: 0.9 },
  bone_hand: { x: 0.55, y: 0.50, z: 0.0, distance: 0.7 },
  bone_carpals: { x: 0.55, y: 0.50, z: 0.0, distance: 0.7 },

  // Pelvis & Lower Limbs
  pelvis: { x: 0, y: 0.45, z: 0, distance: 1.3 },
  bone_hip: { x: 0, y: 0.45, z: 0, distance: 1.3 },
  bone_sacrum: { x: 0, y: 0.48, z: -0.08, distance: 0.9 },
  bone_coccyx: { x: 0, y: 0.38, z: -0.08, distance: 0.7 },
  femur: { x: 0.18, y: 0.10, z: 0.0, distance: 1.3 },
  bone_femur: { x: 0.18, y: 0.10, z: 0.0, distance: 1.3 },
  patella: { x: 0.18, y: -0.22, z: 0.08, distance: 0.7 },
  bone_patella: { x: 0.18, y: -0.22, z: 0.08, distance: 0.7 },
  tibia_fibula: { x: 0.18, y: -0.45, z: 0.0, distance: 1.1 },
  bone_tibia: { x: 0.18, y: -0.45, z: 0.0, distance: 1.1 },
  bone_fibula: { x: 0.23, y: -0.45, z: -0.02, distance: 1.1 },
  foot_bones: { x: 0.18, y: -0.75, z: 0.05, distance: 0.8 },
  bone_tarsals: { x: 0.18, y: -0.75, z: 0.05, distance: 0.8 },

  // Muscles
  biceps_brachii: { x: 0.42, y: 0.95, z: 0.06, distance: 0.9 },
  triceps_brachii: { x: 0.42, y: 0.95, z: -0.06, distance: 0.9 },
  deltoid: { x: 0.35, y: 1.22, z: 0.0, distance: 0.9 },
  pectoralis_major: { x: 0.15, y: 1.12, z: 0.12, distance: 0.9 },
  rectus_abdominis: { x: 0, y: 0.75, z: 0.12, distance: 1.0 },
  trapezius: { x: 0, y: 1.25, z: -0.12, distance: 1.0 },
  latissimus_dorsi: { x: 0.20, y: 0.90, z: -0.12, distance: 1.1 },
  gluteus_maximus: { x: 0.20, y: 0.45, z: -0.14, distance: 1.1 },
  quadriceps_femoris: { x: 0.18, y: 0.10, z: 0.12, distance: 1.2 },
  hamstrings: { x: 0.18, y: 0.08, z: -0.12, distance: 1.2 },
  gastrocnemius_soleus: { x: 0.18, y: -0.42, z: -0.12, distance: 1.0 },

  // Nervous
  cerebrum_cortex: { x: 0, y: 1.68, z: 0.02, distance: 0.8 },
  cerebellum: { x: 0, y: 1.58, z: -0.08, distance: 0.7 },
  brainstem: { x: 0, y: 1.48, z: 0.0, distance: 0.7 },
  cranial_nerves: { x: 0.06, y: 1.30, z: 0.04, distance: 0.8 },
  brachial_plexus: { x: 0.25, y: 1.25, z: 0.03, distance: 0.8 },
  sciatic_nerve: { x: 0.18, y: 0.15, z: -0.10, distance: 1.2 },
  femoral_nerve: { x: 0.16, y: 0.25, z: 0.08, distance: 1.0 },
};

// Check if a mesh name corresponds to fibrous connective tissue (tendon, ligament, fascia, etc.)
export const isTendinousOrFascial = (name: string): boolean => {
  const lower = name.toLowerCase();
  return (
    lower.includes('tendon') ||
    lower.includes('tendinous') ||
    lower.includes('ligament') ||
    lower.includes('aponeurosis') ||
    lower.includes('aponeurotica') ||
    lower.includes('membrane') ||
    lower.includes('linea alba') ||
    lower.includes('linea') ||
    lower.includes('fascia') ||
    lower.includes('fascial') ||
    lower.includes('galea') ||
    lower.includes('retinaculum') ||
    lower.includes('retinacula') ||
    lower.includes('capsule') ||
    lower.includes('cartilage') ||
    lower.includes('labrum') ||
    lower.includes('bursa') ||
    lower.includes('fat pad') ||
    lower.includes('interosseous') ||
    lower.includes('tract') ||
    lower.includes('raphe') ||
    lower.includes('sheath') ||
    lower.includes('intersection') ||
    lower.includes('band') ||
    lower.includes('iliotibial') ||
    lower.includes('trochlea') ||
    lower.includes('annular') ||
    lower.includes('achilles') ||
    lower.includes('calcaneal') ||
    lower.includes('plantar') ||
    lower.includes('palmar') ||
    lower.includes('patellar') ||
    lower.includes('thoracolumbar') ||
    lower.includes('chiasm')
  );
};

// Procedural high-resolution muscle fiber striation and normal bump maps
let muscleColorTexture: THREE.CanvasTexture | null = null;
let muscleBumpTexture: THREE.CanvasTexture | null = null;

export const getMuscleFiberTextures = () => {
  if (muscleColorTexture && muscleBumpTexture) {
    return { colorMap: muscleColorTexture, bumpMap: muscleBumpTexture };
  }

  // 1. Color Map (Warm biological crimson muscle fascicles matching anatomical atlas)
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = 512;
  colorCanvas.height = 512;
  const ctx = colorCanvas.getContext('2d');

  // 2. Bump Map (Microscopic striations & sarcomere grooves)
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d');

  if (ctx && bCtx) {
    // Vivid anatomical red base #ef4444 with high-definition fiber details
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, 0, 512, 512);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 512, 512);

    // Longitudinal fascicle fiber lines
    for (let y = 0; y < 512; y += 2) {
      const alpha = 0.30 + Math.random() * 0.38;
      const isDark = Math.random() > 0.46;

      // Color texture: Deep crimson shadows to bright vivid scarlet highlights
      ctx.strokeStyle = isDark
        ? `rgba(185, 28, 28, ${alpha})`
        : `rgba(254, 202, 202, ${alpha * 0.75})`;
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y + (Math.random() - 0.5) * 4);
      ctx.stroke();

      // Bump texture (height map for 3D striation ridges)
      const bumpVal = isDark
        ? Math.floor(60 + Math.random() * 35)
        : Math.floor(195 + Math.random() * 50);
      bCtx.strokeStyle = `rgba(${bumpVal}, ${bumpVal}, ${bumpVal}, ${alpha * 1.4})`;
      bCtx.lineWidth = 1 + Math.random() * 1.3;
      bCtx.beginPath();
      bCtx.moveTo(0, y);
      bCtx.lineTo(512, y + (Math.random() - 0.5) * 4);
      bCtx.stroke();
    }

    // Sarcomere cross-striation banding
    for (let x = 0; x < 512; x += 5) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();

      bCtx.strokeStyle = 'rgba(230, 230, 230, 0.15)';
      bCtx.lineWidth = 1;
      bCtx.beginPath();
      bCtx.moveTo(x, 0);
      bCtx.lineTo(x, 512);
      bCtx.stroke();
    }
  }

  muscleColorTexture = new THREE.CanvasTexture(colorCanvas);
  muscleColorTexture.wrapS = THREE.RepeatWrapping;
  muscleColorTexture.wrapT = THREE.RepeatWrapping;
  muscleColorTexture.repeat.set(5, 10);

  muscleBumpTexture = new THREE.CanvasTexture(bumpCanvas);
  muscleBumpTexture.wrapS = THREE.RepeatWrapping;
  muscleBumpTexture.wrapT = THREE.RepeatWrapping;
  muscleBumpTexture.repeat.set(5, 10);

  return { colorMap: muscleColorTexture, bumpMap: muscleBumpTexture };
};

// Normalize any model into standard 5.0 units height centered at [0, 0, 0]
export const normalizeModel = (model: THREE.Group, targetHeight = 5.0): THREE.Group => {
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.scale.set(1, 1, 1);
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = targetHeight / (maxDim || 1);
  model.scale.set(scale, scale, scale);

  model.position.set(
    -center.x * scale,
    -center.y * scale,
    -center.z * scale
  );

  const pivotGroup = new THREE.Group();
  pivotGroup.add(model);
  return pivotGroup;
};

// Calculate camera distance to frame the entire human model (height 5.0) head-to-toe with comfortable margins
export const calcFullBodyDistance = (aspect: number): number => {
  const isMobile = aspect < 0.75;
  const vDist = isMobile ? 10.4 : 9.3;
  const hDist = (isMobile ? 4.9 : 4.4) / Math.max(aspect, 0.35);
  return Math.max(vDist, hDist);
};

export const ThreeViewer: React.FC<ThreeViewerProps> = ({
  system,
  selectedItem,
  onSelectItem,
  renderMode,
  autoRotate,
  cameraPreset,
  onResetPreset,
  displayLayout = 'single',
  activeViewMode = 'free',
  onChangeViewMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js Core Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Triple Layout Specialized Perspective Cameras
  const cameraAnteriorRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraLateralRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraPosteriorRef = useRef<THREE.PerspectiveCamera | null>(null);
  const displayLayoutRef = useRef<DisplayLayoutMode>(displayLayout);
  displayLayoutRef.current = displayLayout;

  // Model Groups
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const hotspotsGroupRef = useRef<THREE.Group | null>(null);
  const particlesGroupRef = useRef<THREE.Points | null>(null);

  // Loading and Error state
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingText, setLoadingText] = useState<string>('جاري تحضير النموذج التشريحي...');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [isPermanentlySaved, setIsPermanentlySaved] = useState<boolean>(false);
  const [cachedStats, setCachedStats] = useState<{ count: number; totalMb: string }>({ count: 0, totalMb: '0' });

  // Update persistent cache stats
  const refreshCacheStats = useCallback(async () => {
    try {
      const stats = await getCacheStats();
      const mb = (stats.totalSizeBytes / (1024 * 1024)).toFixed(1);
      setCachedStats({ count: stats.count, totalMb: mb });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshCacheStats();
  }, [refreshCacheStats]);

  // Integrated Layers Visibility and Opacity (when system === 'all')
  const [integratedLayers, setIntegratedLayers] = useState({
    skeletal: true,
    muscular: true,
    nervous: true,
    muscleOpacity: 0.76,
  });

  // Hover state
  const [hoveredItem, setHoveredItem] = useState<{
    item: AnatomicalItem;
    x: number;
    y: number;
  } | null>(null);

  // Camera transition lerping
  const isTransitioning = useRef<boolean>(false);
  const transitionStartTarget = useRef<THREE.Vector3>(new THREE.Vector3());
  const transitionEndTarget = useRef<THREE.Vector3>(new THREE.Vector3());
  const transitionStartPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const transitionEndPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const transitionProgress = useRef<number>(1.0);

  // Map hotspot meshes to itemId
  const hotspotMeshMap = useRef<Map<THREE.Object3D, string>>(new Map());

  // Track selection state for transitions
  const prevSelectedItemRef = useRef<AnatomicalItem | null>(null);
  const selectedItemRef = useRef<AnatomicalItem | null>(selectedItem);
  selectedItemRef.current = selectedItem;

  // Raycaster for user interactions
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const pointerDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1. Initialize Three.js Scene, Cameras, Lights, and OrbitControls
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene with Deep Charcoal/Black (#0a0a0c) luxury aesthetic
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0c);
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.035);
    sceneRef.current = scene;

    // 2. Primary 360 Camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.01, 1000);
    const initDist = calcFullBodyDistance(aspect);
    camera.position.set(0, 0, initDist);
    camera.near = 0.01;
    camera.far = 1000;
    camera.updateProjectionMatrix();
    cameraRef.current = camera;

    // 3. Triple Layout Specialized Cameras
    const colAspect = (container.clientWidth / 3) / container.clientHeight;
    const tripleDist = calcFullBodyDistance(colAspect);

    // Anterior Camera (Facing Front Z+)
    const camAnterior = new THREE.PerspectiveCamera(40, colAspect, 0.01, 1000);
    camAnterior.position.set(0, 0, tripleDist);
    camAnterior.lookAt(0, 0, 0);
    cameraAnteriorRef.current = camAnterior;

    // Lateral Camera (Facing Side X+)
    const camLateral = new THREE.PerspectiveCamera(40, colAspect, 0.01, 1000);
    camLateral.position.set(tripleDist, 0, 0);
    camLateral.lookAt(0, 0, 0);
    cameraLateralRef.current = camLateral;

    // Posterior Camera (Facing Back Z-)
    const camPosterior = new THREE.PerspectiveCamera(40, colAspect, 0.01, 1000);
    camPosterior.position.set(0, 0, -tripleDist);
    camPosterior.lookAt(0, 0, 0);
    cameraPosteriorRef.current = camPosterior;

    // 4. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // 5. OrbitControls (Full 360 rotation, Zoom In/Out, and Pan supported)
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 0, 0);
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 0.4;
    controls.maxDistance = 25.0;
    controls.maxPolarAngle = Math.PI - 0.05;
    controls.minPolarAngle = 0.05;
    controlsRef.current = controls;

    // 6. Studio Medical Lighting with High Definition Muscular Rim Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    // Primary Key front light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(3.5, 5, 5.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Muscle Contour Definition Light (Cross-Angle for striations & groove shadows)
    const muscleContourLight = new THREE.DirectionalLight(0xffffff, 1.25);
    muscleContourLight.position.set(-3.5, 3.5, 4.5);
    scene.add(muscleContourLight);

    // Rim back light (clinical blue)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-4.5, 5, -4.5);
    scene.add(rimLight);

    // Warm side light for anatomical depth
    const warmLight = new THREE.DirectionalLight(0xfef08a, 0.7);
    warmLight.position.set(4.5, -1, -3);
    scene.add(warmLight);

    // Under-fill light
    const underFill = new THREE.DirectionalLight(0x64748b, 0.5);
    underFill.position.set(0, -6, 2);
    scene.add(underFill);

    // Circular ground grid with circular fade
    const gridHelper = new THREE.GridHelper(10, 20, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -2.65;
    scene.add(gridHelper);

    // Create group for Hotspots (kept clean without visual dots covering the model)
    const hotspotsGroup = new THREE.Group();
    scene.add(hotspotsGroup);
    hotspotsGroupRef.current = hotspotsGroup;

    // 7. Animation Frame Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Handle smooth camera transition to focused item
      if (isTransitioning.current) {
        transitionProgress.current += delta * 2.2;
        const t = Math.min(transitionProgress.current, 1.0);
        const ease = 1 - Math.pow(1 - t, 3);

        controls.target.lerpVectors(
          transitionStartTarget.current,
          transitionEndTarget.current,
          ease
        );
        camera.position.lerpVectors(
          transitionStartPos.current,
          transitionEndPos.current,
          ease
        );

        if (t >= 1.0) {
          isTransitioning.current = false;
        }
      } else {
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 2.0;
      }

      controls.update();

      // Animate neural particle pulses if present
      if (particlesGroupRef.current) {
        const positions = particlesGroupRef.current.geometry.attributes.position;
        if (positions) {
          const arr = positions.array as Float32Array;
          for (let i = 1; i < arr.length; i += 3) {
            arr[i] -= delta * 0.8;
            if (arr[i] < -2.5) {
              arr[i] = 2.2;
            }
          }
          positions.needsUpdate = true;
        }
      }

      // Render: Triple side-by-side viewports OR single full-width view
      const canvasElem = renderer.domElement;
      const width = canvasElem.clientWidth;
      const height = canvasElem.clientHeight;

      if (displayLayoutRef.current === 'triple' && width > 640) {
        const colW = Math.floor(width / 3);
        renderer.setScissorTest(true);

        // 1. Anterior Viewport (Left column)
        renderer.setViewport(0, 0, colW, height);
        renderer.setScissor(0, 0, colW, height);
        if (cameraAnteriorRef.current) {
          cameraAnteriorRef.current.aspect = colW / height;
          cameraAnteriorRef.current.updateProjectionMatrix();
          renderer.render(scene, cameraAnteriorRef.current);
        }

        // 2. Lateral Viewport (Center column)
        renderer.setViewport(colW, 0, colW, height);
        renderer.setScissor(colW, 0, colW, height);
        if (cameraLateralRef.current) {
          cameraLateralRef.current.aspect = colW / height;
          cameraLateralRef.current.updateProjectionMatrix();
          renderer.render(scene, cameraLateralRef.current);
        }

        // 3. Posterior Viewport (Right column)
        const col3W = width - colW * 2;
        renderer.setViewport(colW * 2, 0, col3W, height);
        renderer.setScissor(colW * 2, 0, col3W, height);
        if (cameraPosteriorRef.current) {
          cameraPosteriorRef.current.aspect = col3W / height;
          cameraPosteriorRef.current.updateProjectionMatrix();
          renderer.render(scene, cameraPosteriorRef.current);
        }

        renderer.setScissorTest(false);
      } else {
        renderer.setViewport(0, 0, width, height);
        renderer.setScissorTest(false);
        renderer.render(scene, camera);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // 8. Resize Observer for fluid responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          const newDist = calcFullBodyDistance(camera.aspect);
          if (!isTransitioning.current && !selectedItemRef.current) {
            const dir = camera.position.clone().sub(controls.target).normalize();
            if (dir.lengthSq() < 0.001) dir.set(0, 0, 1);
            camera.position.copy(controls.target).addScaledVector(dir, newDist);
          }

          // Update triple cameras
          const colAspect = (width / 3) / height;
          const tripleDist = calcFullBodyDistance(colAspect);
          if (cameraAnteriorRef.current) {
            cameraAnteriorRef.current.aspect = colAspect;
            cameraAnteriorRef.current.position.set(0, 0, tripleDist);
            cameraAnteriorRef.current.updateProjectionMatrix();
          }
          if (cameraLateralRef.current) {
            cameraLateralRef.current.aspect = colAspect;
            cameraLateralRef.current.position.set(tripleDist, 0, 0);
            cameraLateralRef.current.updateProjectionMatrix();
          }
          if (cameraPosteriorRef.current) {
            cameraPosteriorRef.current.aspect = colAspect;
            cameraPosteriorRef.current.position.set(0, 0, -tripleDist);
            cameraPosteriorRef.current.updateProjectionMatrix();
          }
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // 2. Clear 3D Hotspot Markers (no visual dots on model)
  const rebuildHotspots = useCallback((activeSystem: BodySystem) => {
    const group = hotspotsGroupRef.current;
    if (!group) return;

    // Clear any previous markers so the model is 100% clean and realistic
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    hotspotMeshMap.current.clear();
  }, []);

  // 3. Load Realistic GLTF Model(s) with GLTFLoader
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove previous model if any
    if (currentModelGroupRef.current) {
      scene.remove(currentModelGroupRef.current);
      currentModelGroupRef.current = null;
    }

    // Remove previous neural particles
    if (particlesGroupRef.current) {
      scene.remove(particlesGroupRef.current);
      particlesGroupRef.current = null;
    }

    // ==========================================
    // CASE A: INTEGRATED VIEW (ALL 3 SYSTEMS)
    // ==========================================
    if (system === 'all') {
      setIsLoading(true);
      setLoadError(null);
      setLoadingProgress(15);
      setLoadingText('جاري تجميع الأجهزة الحيوية الثلاثة (الهيكلي، العضلي، والعصبي)...');

      // Check cache first
      if (gltfCache.has('all')) {
        const cachedGroup = gltfCache.get('all')!.clone(true);
        currentModelGroupRef.current = cachedGroup;
        scene.add(cachedGroup);
        setupNeuralPulseParticles(scene);
        applyRenderMode(cachedGroup, renderMode);
        rebuildHotspots('all');

        if (!selectedItem && cameraRef.current && controlsRef.current) {
          const dist = calcFullBodyDistance(cameraRef.current.aspect);
          cameraRef.current.position.set(0, 0, dist);
          controlsRef.current.target.set(0, 0, 0);
        }

        setIsLoading(false);
        setLoadingProgress(100);
        return;
      }

      const loader = new GLTFLoader();

      const loadSingleModel = async (
        key: string,
        primaryUrl: string,
        fallbackUrl?: string
      ): Promise<THREE.Group> => {
        const { data, fromCache } = await loadModelWithPersistentCache(
          key,
          primaryUrl,
          fallbackUrl,
          (progress, loaded, total, cached) => {
            if (cached) {
              setIsFromCache(true);
              setLoadingText('⚡ تم استرجاع النموذج من التخزين المحلي الدائم (IndexedDB)...');
              setLoadingProgress(100);
            } else {
              setIsFromCache(false);
              setLoadingProgress(progress);
              const mb = (loaded / (1024 * 1024)).toFixed(1);
              setLoadingText(`تحميل النموذج التشريحي (${progress}% - ${mb}MB)...`);
            }
          }
        );

        if (fromCache) {
          setIsFromCache(true);
        }

        return new Promise((resolve, reject) => {
          loader.parse(
            data,
            '',
            (gltf) => resolve(gltf.scene),
            (parseErr) => reject(parseErr)
          );
        });
      };

      Promise.all([
        loadSingleModel('skeletal', ANATOMY_MODELS.skeletal.localPath, ANATOMY_MODELS.skeletal.cdnUrl),
        loadSingleModel('muscular', ANATOMY_MODELS.muscular.localPath, ANATOMY_MODELS.muscular.cdnUrl),
        loadSingleModel('nervous', ANATOMY_MODELS.nervous.localPath, ANATOMY_MODELS.nervous.cdnUrl),
      ])
        .then(([skelScene, muscScene, nervScene]) => {
          // Normalize and scale all 3 models to exactly height 5.0 and center (0, 0, 0)
          const skelPivot = normalizeModel(skelScene);
          const muscPivot = normalizeModel(muscScene);
          const nervPivot = normalizeModel(nervScene);

          // Apply realistic anatomical materials
          setupAnatomicalMaterials(skelPivot, 'skeletal', true);
          setupAnatomicalMaterials(muscPivot, 'muscular', true, integratedLayers.muscleOpacity);
          setupAnatomicalMaterials(nervPivot, 'nervous', true);

          skelPivot.name = 'layer_skeletal';
          muscPivot.name = 'layer_muscular';
          nervPivot.name = 'layer_nervous';

          const compositeGroup = new THREE.Group();
          compositeGroup.add(skelPivot);
          compositeGroup.add(muscPivot);
          compositeGroup.add(nervPivot);

          gltfCache.set('all', compositeGroup.clone(true));

          currentModelGroupRef.current = compositeGroup;
          scene.add(compositeGroup);

          setupNeuralPulseParticles(scene);
          applyRenderMode(compositeGroup, renderMode);
          rebuildHotspots('all');

          if (!selectedItem && cameraRef.current && controlsRef.current) {
            const dist = calcFullBodyDistance(cameraRef.current.aspect);
            cameraRef.current.position.set(0, 0, dist);
            controlsRef.current.target.set(0, 0, 0);
          }

          setIsLoading(false);
          setLoadingProgress(100);
          setIsPermanentlySaved(true);
          refreshCacheStats();
        })
        .catch((err) => {
          console.error('Failed to load all systems:', err);
          setLoadError('تعذر تجميع كافة الأجهزة التشريحية. يرجى التحقق من الاتصال.');
          setIsLoading(false);
        });

      return;
    }

    // ==========================================
    // CASE B: SINGLE ANATOMICAL SYSTEM
    // ==========================================
    const modelKey = system;
    const modelInfo = ANATOMY_MODELS[modelKey] || ANATOMY_MODELS.skeletal;

    setIsLoading(true);
    setLoadError(null);
    setLoadingProgress(10);
    setLoadingText(`جاري استدعاء وتحضير ${modelInfo.titleAr}...`);

    // Check in-memory cache
    if (gltfCache.has(modelKey)) {
      const cachedGroup = gltfCache.get(modelKey)!.clone(true);
      currentModelGroupRef.current = cachedGroup;
      scene.add(cachedGroup);
      applyRenderMode(cachedGroup, renderMode);
      rebuildHotspots(system);

      if (system === 'nervous') {
        setupNeuralPulseParticles(scene);
      }

      if (!selectedItem && cameraRef.current && controlsRef.current) {
        const dist = calcFullBodyDistance(cameraRef.current.aspect);
        cameraRef.current.position.set(0, 0, dist);
        controlsRef.current.target.set(0, 0, 0);
      }

      setIsLoading(false);
      setLoadingProgress(100);
      return;
    }

    const loader = new GLTFLoader();

    // Load with persistent IndexedDB caching and fallback URLs
    const executeLoad = async () => {
      try {
        const { data, fromCache } = await loadModelWithPersistentCache(
          modelKey,
          modelInfo.localPath,
          modelInfo.cdnUrl,
          (progress, loaded, total, cached) => {
            if (cached) {
              setIsFromCache(true);
              setLoadingText('⚡ تم استدعاء النموذج فوراً من التخزين المحلي الدائم (IndexedDB)...');
              setLoadingProgress(100);
            } else {
              setIsFromCache(false);
              setLoadingProgress(progress);
              const mb = (loaded / (1024 * 1024)).toFixed(1);
              setLoadingText(`تحميل النموذج التشريحي الواقعي (${progress}% - ${mb}MB)...`);
            }
          }
        );

        setIsFromCache(fromCache);

        loader.parse(
          data,
          '',
          (gltf: GLTF) => {
            const model = gltf.scene;
            const pivotGroup = normalizeModel(model);

            // Apply realistic anatomical materials
            setupAnatomicalMaterials(pivotGroup, system, false, 1.0);

            // Cache normalized model in memory
            gltfCache.set(modelKey, pivotGroup.clone(true));

            currentModelGroupRef.current = pivotGroup;
            scene.add(pivotGroup);

            applyRenderMode(pivotGroup, renderMode);
            rebuildHotspots(system);

            if (system === 'nervous') {
              setupNeuralPulseParticles(scene);
            }

            if (!selectedItem && cameraRef.current && controlsRef.current) {
              const dist = calcFullBodyDistance(cameraRef.current.aspect);
              cameraRef.current.position.set(0, 0, dist);
              controlsRef.current.target.set(0, 0, 0);
            }

            setIsLoading(false);
            setLoadingProgress(100);
            setIsPermanentlySaved(true);
            refreshCacheStats();
          },
          (parseErr) => {
            console.error('Error parsing GLTF arrayBuffer:', parseErr);
            setLoadError('تعذر معالجة النموذج التشريحي ثلاثي الأبعاد.');
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.warn('Failed to load with persistent cache, attempting fallback CDN direct:', error);
        // Fallback to direct loader.load if arrayBuffer fails
        loader.load(
          modelInfo.cdnUrl,
          (gltf: GLTF) => {
            const model = gltf.scene;
            const pivotGroup = normalizeModel(model);
            setupAnatomicalMaterials(pivotGroup, system, false, 1.0);
            gltfCache.set(modelKey, pivotGroup.clone(true));
            currentModelGroupRef.current = pivotGroup;
            scene.add(pivotGroup);
            applyRenderMode(pivotGroup, renderMode);
            rebuildHotspots(system);

            if (system === 'nervous') {
              setupNeuralPulseParticles(scene);
            }

            setIsLoading(false);
            setLoadingProgress(100);
          },
          undefined,
          (finalErr) => {
            console.error('Failed all load attempts:', finalErr);
            setLoadError('تعذر استدعاء النموذج ثلاثي الأبعاد. يرجى التحقق من الاتصال بالإنترنت.');
            setIsLoading(false);
          }
        );
      }
    };

    executeLoad();
  }, [system, rebuildHotspots]);

  // 4. Realistic Anatomical Materials Setup with High Definition Muscle Fibers & Tendons
  const setupAnatomicalMaterials = (
    model: THREE.Object3D,
    currentSystem: BodySystem,
    isIntegrated = false,
    muscleOpacity = 0.76
  ) => {
    const textures = getMuscleFiberTextures();

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (currentSystem === 'skeletal') {
          // Bone ivory PBR material
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0xf6f0e2,
            roughness: 0.35,
            metalness: 0.04,
          });
        } else if (currentSystem === 'muscular') {
          const meshName = mesh.name || mesh.parent?.name || '';
          if (isTendinousOrFascial(meshName)) {
            // Pearlescent silver/ivory glistening tendon, aponeurosis, fascia & ligament
            // Matches the white glistening fibers in the medical atlas reference
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xf4f6f9,
              roughness: 0.22,
              metalness: 0.08,
              bumpMap: textures.bumpMap,
              bumpScale: 0.02,
              transparent: isIntegrated && muscleOpacity < 0.99,
              opacity: isIntegrated ? Math.min(1.0, muscleOpacity + 0.15) : 1.0,
              depthWrite: true,
            });
          } else {
            // Striated muscle belly in vivid red (#ef4444) with high specular light reflection & fiber detail:
            const hash = meshName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
            const toneVar = ((hash % 11) - 5) * 0.015; // subtle natural biological variance
            const muscleColor = new THREE.Color(0xef4444).offsetHSL(0, toneVar * 0.1, toneVar * 0.25);

            mesh.material = new THREE.MeshStandardMaterial({
              color: muscleColor,
              map: textures.colorMap,
              bumpMap: textures.bumpMap,
              bumpScale: 0.085, // Real 3D muscle fiber ridges with clear definition
              roughness: 0.24, // Increased light reflection & glossy hydrated tissue sheen
              metalness: 0.10, // Enhanced specular response under clinical spotlights
              transparent: isIntegrated && muscleOpacity < 0.99,
              opacity: isIntegrated ? muscleOpacity : 1.0,
              depthWrite: true,
            });
          }
        } else if (currentSystem === 'nervous') {
          // Electric luminous neural material
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            roughness: 0.2,
            metalness: 0.1,
            emissive: new THREE.Color(0x0284c7),
            emissiveIntensity: 1.25,
          });
        }
      }
    });
  };

  // Sync integrated layer visibility and opacity in real time
  useEffect(() => {
    if (system === 'all' && currentModelGroupRef.current) {
      const skel = currentModelGroupRef.current.getObjectByName('layer_skeletal');
      const musc = currentModelGroupRef.current.getObjectByName('layer_muscular');
      const nerv = currentModelGroupRef.current.getObjectByName('layer_nervous');

      if (skel) skel.visible = integratedLayers.skeletal;
      if (musc) {
        musc.visible = integratedLayers.muscular;
        musc.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat && !isTendinousOrFascial(mesh.name || '')) {
              mat.opacity = integratedLayers.muscleOpacity;
              mat.transparent = integratedLayers.muscleOpacity < 0.99;
              mat.needsUpdate = true;
            }
          }
        });
      }
      if (nerv) nerv.visible = integratedLayers.nervous;
      if (particlesGroupRef.current) particlesGroupRef.current.visible = integratedLayers.nervous;
    }
  }, [integratedLayers, system]);

  // 5. Neural Impulse Particle Stream
  const setupNeuralPulseParticles = (scene: THREE.Scene) => {
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      // Stream along central spine axis and limbs
      const t = (i / particleCount) * 4.4 - 2.2;
      const spreadX = (Math.random() - 0.5) * 0.4;
      const spreadZ = (Math.random() - 0.5) * 0.3;

      positions[i * 3] = spreadX;
      positions[i * 3 + 1] = t;
      positions[i * 3 + 2] = spreadZ;

      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesGroupRef.current = particles;
  };

  // 6. Apply Render Modes (Solid / X-Ray / Wireframe)
  const applyRenderMode = (group: THREE.Group, mode: RenderMode) => {
    group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (Array.isArray(mesh.material)) return;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (!mat) return;

        if (mode === 'wireframe') {
          mat.wireframe = true;
          mat.transparent = false;
          mat.opacity = 1.0;
        } else if (mode === 'xray') {
          mat.wireframe = false;
          mat.transparent = true;
          mat.opacity = 0.38;
          mat.depthWrite = false;
        } else {
          // Solid
          mat.wireframe = false;
          const isMuscularLayer = mesh.parent?.name === 'layer_muscular' || mesh.name.toLowerCase().includes('muscle');
          if (system === 'all' && isMuscularLayer && !isTendinousOrFascial(mesh.name)) {
            mat.transparent = integratedLayers.muscleOpacity < 0.99;
            mat.opacity = integratedLayers.muscleOpacity;
            mat.depthWrite = true;
          } else {
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.depthWrite = true;
          }
        }
        mat.needsUpdate = true;
      }
    });
  };

  useEffect(() => {
    if (currentModelGroupRef.current) {
      applyRenderMode(currentModelGroupRef.current, renderMode);
    }
  }, [renderMode]);

  // 7. Focus & Zoom in on selected organ, and return smoothly to natural full-body framing on exit
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (!selectedItem) {
      // User exited the organ! Smoothly glide camera back to natural full-body view
      if (prevSelectedItemRef.current) {
        prevSelectedItemRef.current = null;
        const isMobile = camera.aspect < 0.75;
        const fullDist = calcFullBodyDistance(camera.aspect);
        const naturalTarget = new THREE.Vector3(0, isMobile ? 0.08 : 0, 0);

        // Retain current view direction but extend back to full-body overview distance
        const currentDir = camera.position.clone().sub(controls.target).normalize();
        if (currentDir.lengthSq() < 0.001) currentDir.set(0, 0, 1);
        const naturalCamPos = naturalTarget.clone().addScaledVector(currentDir, fullDist);

        transitionStartTarget.current.copy(controls.target);
        transitionEndTarget.current.copy(naturalTarget);
        transitionStartPos.current.copy(camera.position);
        transitionEndPos.current.copy(naturalCamPos);
        transitionProgress.current = 0;
        isTransitioning.current = true;

        // Restore standard render materials
        if (currentModelGroupRef.current) {
          applyRenderMode(currentModelGroupRef.current, renderMode);
        }
      }
      return;
    }

    // Organ selected: Focus and Zoom in!
    prevSelectedItemRef.current = selectedItem;

    const id = selectedItem.id;
    const target3D = BONE_3D_TARGETS[id];
    let target = new THREE.Vector3(0, 0, 0);
    let zoomDist = 1.1;

    if (target3D) {
      target.set(target3D.x, target3D.y, target3D.z);
      zoomDist = Math.max(target3D.distance, 0.65);
    } else {
      const hotspot = ANATOMICAL_HOTSPOTS.find((h) => h.itemId === selectedItem.id);
      if (hotspot) {
        target.set(...hotspot.position);
      }
    }

    // Optional highlight traversal for mesh
    if (currentModelGroupRef.current) {
      currentModelGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child.name) {
          const nameLower = child.name.toLowerCase();
          const cleanId = id.replace(/^(bone_|muscle_|nerve_)/, '').toLowerCase();
          if (nameLower.includes(cleanId) || id.toLowerCase().includes(nameLower)) {
            const mesh = child as THREE.Mesh;
            if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).emissive) {
              (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x00ff88);
              (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.0;
            }
          }
        }
      });
    }

    const isMobile = camera.aspect < 0.75;
    if (isMobile) {
      zoomDist *= 1.15;
    }

    // On mobile portrait, shift the target center slightly up so the organ is centered above the bottom card
    const finalTarget = target.clone();
    if (isMobile) {
      finalTarget.y += 0.12;
    }

    // Determine optimal camera orientation (back, side, or front)
    const isPosterior = selectedItem.primaryView === 'posterior' || target.z < -0.05 || ['spine_cervical', 'spine_thoracic_lumbar', 'triceps_brachii', 'latissimus_dorsi', 'trapezius', 'gluteus_maximus', 'hamstrings', 'scapula', 'bone_scapula'].includes(id);
    const isLateral = selectedItem.primaryView === 'lateral';

    let endCamPos: THREE.Vector3;
    if (isPosterior) {
      endCamPos = new THREE.Vector3(finalTarget.x, finalTarget.y + 0.05, finalTarget.z - zoomDist);
    } else if (isLateral) {
      const sideFactor = target.x >= 0 ? 1 : -1;
      endCamPos = new THREE.Vector3(finalTarget.x + sideFactor * zoomDist * 0.95, finalTarget.y + 0.05, finalTarget.z + zoomDist * 0.25);
    } else {
      endCamPos = new THREE.Vector3(finalTarget.x, finalTarget.y + 0.05, finalTarget.z + zoomDist);
    }

    transitionStartTarget.current.copy(controls.target);
    transitionEndTarget.current.copy(finalTarget);
    transitionStartPos.current.copy(camera.position);
    transitionEndPos.current.copy(endCamPos);
    transitionProgress.current = 0;
    isTransitioning.current = true;
  }, [selectedItem, renderMode]);

  // 8. Camera Angle Presets Handler (Locked full body distance - no zooming)
  const handleSetPreset = useCallback((preset: CameraPreset) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || !preset) return;

    const dist = calcFullBodyDistance(camera.aspect);
    let target = new THREE.Vector3(0, 0, 0);
    let endPos = new THREE.Vector3(0, 0, dist);

    switch (preset) {
      case 'front':
        target.set(0, 0, 0);
        endPos.set(0, 0, dist);
        break;
      case 'back':
        target.set(0, 0, 0);
        endPos.set(0, 0, -dist);
        break;
      case 'side':
        target.set(0, 0, 0);
        endPos.set(dist, 0, 0);
        break;
      case 'top':
        target.set(0, 0, 0);
        endPos.set(0, dist, 0.01);
        break;
      case 'head':
        target.set(0, 1.4, 0);
        endPos.set(0, 1.4, dist);
        break;
      case 'torso':
        target.set(0, 0.35, 0);
        endPos.set(0, 0.35, dist);
        break;
      case 'limbs':
        target.set(0, -1.1, 0);
        endPos.set(0, -1.1, dist);
        break;
      case 'reset':
      default:
        target.set(0, 0, 0);
        endPos.set(0, 0, dist);
        break;
    }

    transitionStartTarget.current.copy(controls.target);
    transitionEndTarget.current.copy(target);
    transitionStartPos.current.copy(camera.position);
    transitionEndPos.current.copy(endPos);
    transitionProgress.current = 0;
    isTransitioning.current = true;
  }, []);

  useEffect(() => {
    if (cameraPreset) {
      handleSetPreset(cameraPreset);
      onResetPreset();
    }
  }, [cameraPreset, handleSetPreset, onResetPreset]);

  // 9. Pointer Move for 3D Raycasting directly on the clean anatomical model
  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    const isTriple = displayLayoutRef.current === 'triple' && rect.width > 640;

    let activeCam = camera;
    let targetView: AnatomicalViewMode | undefined;

    if (isTriple) {
      const colWidth = rect.width / 3;
      const colIndex = Math.min(2, Math.max(0, Math.floor((e.clientX - rect.left) / colWidth)));
      const localX = (e.clientX - rect.left) - colIndex * colWidth;
      mouse.current.x = (localX / colWidth) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (colIndex === 0) {
        activeCam = cameraAnteriorRef.current || camera;
        targetView = 'anterior';
      } else if (colIndex === 1) {
        activeCam = cameraLateralRef.current || camera;
        targetView = 'lateral';
      } else {
        activeCam = cameraPosteriorRef.current || camera;
        targetView = 'posterior';
      }
    } else {
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    raycaster.current.setFromCamera(mouse.current, activeCam);

    // Check direct model mesh intersection
    if (currentModelGroupRef.current) {
      const meshHits = raycaster.current.intersectObjects(
        currentModelGroupRef.current.children,
        true
      );
      if (meshHits.length > 0) {
        const hitPoint = meshHits[0].point;
        let nearestHs: Hotspot3D | null = null;
        let minDist = Infinity;

        let currentHotspots = ANATOMICAL_HOTSPOTS.filter(
          (h) => system === 'all' || h.system === system
        );

        if (isTriple && targetView) {
          const viewSpecific = currentHotspots.filter((h) => h.view === targetView);
          if (viewSpecific.length > 0) {
            currentHotspots = viewSpecific;
          }
        }

        currentHotspots.forEach((hs) => {
          const hsVec = new THREE.Vector3(...hs.position);
          const dist = hitPoint.distanceTo(hsVec);
          if (dist < minDist) {
            minDist = dist;
            nearestHs = hs;
          }
        });

        if (nearestHs && minDist < 1.4) {
          const item = ANATOMICAL_ITEMS[(nearestHs as Hotspot3D).itemId];
          if (item) {
            setHoveredItem({
              item,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
            container.style.cursor = 'pointer';
            return;
          }
        }
      }
    }

    setHoveredItem(null);
    container.style.cursor = 'grab';
  };

  // 10. Click directly on model to Select Anatomical Item (Filtering out rotation drags)
  const handleClick = (e: React.MouseEvent) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    // Check if this was a rotation drag rather than a deliberate tap/click
    const distMoved = Math.hypot(
      e.clientX - pointerDownPos.current.x,
      e.clientY - pointerDownPos.current.y
    );
    if (distMoved > 8) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const isTriple = displayLayoutRef.current === 'triple' && rect.width > 640;

    let activeCam = camera;
    let targetView: AnatomicalViewMode | undefined;

    if (isTriple) {
      const colWidth = rect.width / 3;
      const colIndex = Math.min(2, Math.max(0, Math.floor((e.clientX - rect.left) / colWidth)));
      const localX = (e.clientX - rect.left) - colIndex * colWidth;
      mouse.current.x = (localX / colWidth) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (colIndex === 0) {
        activeCam = cameraAnteriorRef.current || camera;
        targetView = 'anterior';
      } else if (colIndex === 1) {
        activeCam = cameraLateralRef.current || camera;
        targetView = 'lateral';
      } else {
        activeCam = cameraPosteriorRef.current || camera;
        targetView = 'posterior';
      }
    } else {
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    raycaster.current.setFromCamera(mouse.current, activeCam);

    // Direct Mesh click
    if (currentModelGroupRef.current) {
      const meshHits = raycaster.current.intersectObjects(
        currentModelGroupRef.current.children,
        true
      );
      if (meshHits.length > 0) {
        const hitPoint = meshHits[0].point;
        let nearestHs: Hotspot3D | null = null;
        let minDist = Infinity;

        let currentHotspots = ANATOMICAL_HOTSPOTS.filter(
          (h) => system === 'all' || h.system === system
        );

        if (isTriple && targetView) {
          const viewSpecific = currentHotspots.filter((h) => h.view === targetView);
          if (viewSpecific.length > 0) {
            currentHotspots = viewSpecific;
          }
        }

        currentHotspots.forEach((hs) => {
          const hsVec = new THREE.Vector3(...hs.position);
          const dist = hitPoint.distanceTo(hsVec);
          if (dist < minDist) {
            minDist = dist;
            nearestHs = hs;
          }
        });

        if (nearestHs && minDist < 1.4) {
          const item = ANATOMICAL_ITEMS[(nearestHs as Hotspot3D).itemId];
          if (item) {
            onSelectItem(item);
            return;
          }
        }
      } else if (selectedItem) {
        onSelectItem(null);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      id="three-viewport-container"
      className="relative w-full h-full overflow-hidden select-none bg-radial from-slate-900/60 via-slate-950 to-slate-950"
      onPointerDown={(e) => {
        pointerDownPos.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />

      {/* Triple Anatomical View Overlays & Visual Dividers */}
      {displayLayout === 'triple' && !selectedItem && (
        <div className="absolute inset-0 pointer-events-none hidden sm:grid grid-cols-3 z-15" dir="rtl">
          {/* Column 1: Anterior View (أمامي) */}
          <div className="relative flex flex-col justify-between p-3 border-l border-slate-800/60 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/40">
            <div className="pointer-events-auto space-y-1.5 max-w-[280px]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-xs font-bold">الرؤية الأمامية (Anterior)</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                الصدر • البطن • الفخذ الأمامي • الذراعين
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  { id: 'pectoralis_major', label: 'الصدرية الكبرى' },
                  { id: 'rectus_abdominis', label: 'المستقيمة البطنية' },
                  { id: 'quadriceps', label: 'رباعية الرؤوس' },
                  { id: 'biceps', label: 'ذات الرأسين' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const anItem = ANATOMICAL_ITEMS[item.id];
                      if (anItem) onSelectItem(anItem);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-rose-500/20 hover:text-rose-200 border border-slate-800 hover:border-rose-500/40 text-[10px] text-slate-400 transition-colors shadow-sm"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Anterior Viewport • Z+
            </div>
          </div>

          {/* Column 2: Lateral View (جانبي) */}
          <div className="relative flex flex-col justify-between p-3 border-l border-slate-800/60 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/40">
            <div className="pointer-events-auto space-y-1.5 max-w-[280px]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="text-xs font-bold">الرؤية الجانبية (Lateral)</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                العضلة الدالية • الخاصرة (الأوبليكس) • الساق الجانبية
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  { id: 'deltoid', label: 'العضلة الدالية' },
                  { id: 'obliques', label: 'المائلة الخارجية' },
                  { id: 'masseter', label: 'الماضغة' },
                  { id: 'soleus', label: 'النعلية' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const anItem = ANATOMICAL_ITEMS[item.id];
                      if (anItem) onSelectItem(anItem);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-sky-500/20 hover:text-sky-200 border border-slate-800 hover:border-sky-500/40 text-[10px] text-slate-400 transition-colors shadow-sm"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Lateral Viewport • X+
            </div>
          </div>

          {/* Column 3: Posterior View (خلفي) */}
          <div className="relative flex flex-col justify-between p-3 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/40">
            <div className="pointer-events-auto space-y-1.5 max-w-[280px]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-bold">الرؤية الخلفية (Posterior)</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                الظهر • الأرداف • الكتف الخلفي • الساق الخلفي
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  { id: 'trapezius', label: 'شبه المنحرفة' },
                  { id: 'latissimus_dorsi', label: 'العريضة الظهرية' },
                  { id: 'gluteus_maximus', label: 'الألوية الكبرى' },
                  { id: 'hamstrings', label: 'عضلات المأبض' },
                  { id: 'gastrocnemius', label: 'السمانة / التوأمية' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const anItem = ANATOMICAL_ITEMS[item.id];
                      if (anItem) onSelectItem(anItem);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-amber-500/20 hover:text-amber-200 border border-slate-800 hover:border-amber-500/40 text-[10px] text-slate-400 transition-colors shadow-sm"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Posterior Viewport • Z-
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay with Progress Percentage & IndexedDB Persistence Badge */}
      {isLoading && (
        <div
          id="three-loader-backdrop"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            id="three-loader-card"
            className="w-full max-w-md p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-slate-900/98 via-slate-900/95 to-slate-950/98 border border-teal-500/30 shadow-2xl shadow-teal-950/40 text-center space-y-5 ring-1 ring-white/5"
          >
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-teal-500/20 border-t-teal-400 animate-spin" />
              <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center backdrop-blur-sm">
                {isFromCache ? (
                  <Zap className="w-6 h-6 text-amber-300 animate-bounce" />
                ) : (
                  <Sparkles className="w-6 h-6 text-teal-300 animate-pulse" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                <HardDrive className="w-3.5 h-3.5" />
                <span>{isFromCache ? 'استدعاء فوري من التخزين الدائم' : 'حفظ تلقائي دائم بالمتصفح'}</span>
              </div>
              <h3 className="font-bold text-slate-100 text-base sm:text-lg">
                {isFromCache ? 'تحميل فوري من الذاكرة المحلية' : 'استدعاء وتجميع النماذج ثلاثية الأبعاد (GLB)'}
              </h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">{loadingText}</p>
            </div>

            {/* Progress Bar with Glow */}
            <div className="space-y-1.5">
              <div className="relative w-full h-2.5 rounded-full bg-slate-800/90 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-sky-400 transition-all duration-300 rounded-full shadow-lg shadow-teal-500/30"
                  style={{ width: `${Math.max(8, loadingProgress)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-teal-400">
                  <Check className="w-3 h-3" />
                  <span>تخزين IndexedDB</span>
                </span>
                <span className="text-teal-300 font-bold">{loadingProgress}%</span>
              </div>
            </div>

            {/* Offline persistence guarantee note */}
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>يتم الحفظ تلقائياً ولن تحتاج للتحميل من الإنترنت مجدداً</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Focused Organ Bar & Quick Return Button */}
      {selectedItem && (
        <div
          id="organ-focus-bar"
          className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-3 px-3 py-1.5 sm:py-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-teal-500/50 shadow-2xl shadow-teal-950/50 text-xs animate-in fade-in slide-in-from-top-2 duration-200 select-none max-w-[94vw]"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
            <span className="text-slate-400 hidden sm:inline">تركيز:</span>
            <span className="font-bold text-teal-300 truncate max-w-[110px] sm:max-w-[180px]">
              {selectedItem.nameAr}
            </span>
          </div>

          <div className="w-px h-3.5 bg-slate-800 mx-0.5 shrink-0" />

          <button
            id="btn-exit-organ-focus"
            onClick={(e) => {
              e.stopPropagation();
              onSelectItem(null);
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-teal-500/20 hover:bg-rose-500/25 text-teal-200 hover:text-rose-200 border border-teal-500/40 hover:border-rose-500/40 font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm text-[11px] sm:text-xs shrink-0"
            title="الخروج من العضو والرجوع للهيكل بالكامل بالشكل الطبيعي"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>رجوع للهيكل</span>
            <X className="w-3 h-3 ml-0.5 opacity-70 hidden sm:inline" />
          </button>
        </div>
      )}

      {/* Load Error Notice */}
      {loadError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs shadow-xl backdrop-blur-md">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Floating 3D Hover Tooltip */}
      {hoveredItem && (
        <div
          className="absolute z-20 pointer-events-none px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-teal-500/40 shadow-xl shadow-teal-950/40 text-right transform -translate-x-1/2 -translate-y-full mb-3 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${hoveredItem.x}px`,
            top: `${hoveredItem.y}px`,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full ring-2 ring-teal-400/40 animate-pulse"
              style={{ backgroundColor: hoveredItem.item.color }}
            />
            <p className="text-sm font-bold text-slate-100">{hoveredItem.item.nameAr}</p>
          </div>
          <p className="text-[11px] font-mono text-teal-400 mt-0.5" dir="ltr">
            {hoveredItem.item.nameEn}
          </p>
          <span className="inline-block mt-1 text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
            انقر لاستعراض التفاصيل الطبية والتشريحية
          </span>
        </div>
      )}

      {/* Persistent Cache & Orientation Indicator */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-auto flex flex-col items-start gap-1.5 bg-slate-950/80 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-teal-500/30 text-[11px] text-slate-400 shadow-xl shadow-black/40">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-teal-300 font-bold">حفظ دائم في الذاكرة (IndexedDB)</span>
          {cachedStats.count > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-[10px] text-teal-200 font-mono">
              {cachedStats.totalMb} MB
            </span>
          )}
        </div>
        <p className="text-slate-400 text-[10px]">
          • تدوير: سحب بالفأرة / لمس | تكبير: عجلة الفأرة | تركيز: نقر مباشر
        </p>
      </div>
    </div>
  );
};
