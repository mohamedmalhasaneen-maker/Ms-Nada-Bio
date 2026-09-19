export type BodySystem = 'skeletal' | 'muscular' | 'nervous' | 'all';

export type BodyRegion = 'head' | 'torso' | 'upper_limbs' | 'lower_limbs';

export type DisplayLayoutMode = 'single' | 'triple';

export type AnatomicalViewMode = 'anterior' | 'posterior' | 'lateral';

export interface AnatomicalItem {
  id: string;
  system: 'skeletal' | 'muscular' | 'nervous';
  nameAr: string;
  nameEn: string;
  latinName: string;
  region: BodyRegion;
  regionAr: string;
  color: string;
  
  // Specific required fields for the anatomy atlas
  anatomicalLocationAr?: string; // الموقع التشريحي الدقيق
  primaryFunctionAr?: string;    // الوظيفة الحركية الأساسية
  categoryAr?: string;           // الفئة التشريحية من قاعدة البيانات التعليمية
  exactLocationAr?: string;      // الموقع الدقيق
  infoAr?: string;               // المعلومات والوظيفة العلمية
  
  // Biological and medical info
  functionAr: string;
  clinicalNotesAr: string;
  factsAr: string[];
  movementOrPathwayAr?: string;
  compositionAr?: string;
  
  // 3D positioning metadata
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
  primaryView?: AnatomicalViewMode;
}

export type RenderMode = 'solid' | 'xray' | 'wireframe';

export type ViewerEngine = 'three' | 'model-viewer';

export type CameraPreset = 'front' | 'back' | 'side' | 'top' | 'head' | 'torso' | 'limbs' | 'reset' | null;

export interface QuizQuestion {
  id: number;
  questionAr: string;
  optionsAr: string[];
  correctIndex: number;
  explanationAr: string;
  relatedItemId: string;
  system: BodySystem;
}
