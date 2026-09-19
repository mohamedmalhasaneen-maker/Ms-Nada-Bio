import * as THREE from 'three';
import { BodySystem } from '../../types';

export interface ClickablePart {
  mesh: THREE.Object3D;
  itemId: string;
  system: 'skeletal' | 'muscular' | 'nervous';
  originalColor?: number;
  highlightColor?: number;
}

export interface PulseParticleSystem {
  points: THREE.Points;
  update: (delta: number) => void;
}

export class SceneBuilder {
  private clickableParts: ClickablePart[] = [];
  private pulseSystems: PulseParticleSystem[] = [];

  // Reusable materials
  private boneMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5efe3,
    roughness: 0.35,
    metalness: 0.05,
    bumpScale: 0.02,
  });

  private muscleMaterial = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.24,
    metalness: 0.10,
  });

  private tendonMaterial = new THREE.MeshStandardMaterial({
    color: 0xeee8dc,
    roughness: 0.25,
    metalness: 0.1,
  });

  private nerveMaterial = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.2,
  });

  private brainMaterial = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x0891b2,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.1,
  });

  public buildScene(system: BodySystem): {
    group: THREE.Group;
    clickableParts: ClickablePart[];
    pulseSystems: PulseParticleSystem[];
  } {
    this.clickableParts = [];
    this.pulseSystems = [];
    const rootGroup = new THREE.Group();
    rootGroup.name = 'AnatomyRoot';

    if (system === 'skeletal' || system === 'all') {
      const skeletalGroup = this.createSkeletalSystem(system === 'all' ? 0.75 : 1.0);
      rootGroup.add(skeletalGroup);
    }

    if (system === 'muscular' || system === 'all') {
      const muscularGroup = this.createMuscularSystem(system === 'all' ? 0.75 : 1.0);
      rootGroup.add(muscularGroup);
    }

    if (system === 'nervous' || system === 'all') {
      const nervousGroup = this.createNervousSystem();
      rootGroup.add(nervousGroup);
    }

    // Add subtle floor reflection disc to anchor the model in space
    const floorGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.04, 32);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.4,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -5.0;
    rootGroup.add(floor);

    // Subtle coordinate ring
    const ringGeo = new THREE.RingGeometry(3.2, 3.25, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -4.98;
    rootGroup.add(ring);

    return {
      group: rootGroup,
      clickableParts: this.clickableParts,
      pulseSystems: this.pulseSystems,
    };
  }

  // =========================================================================
  // 1. SKELETAL SYSTEM BUILDER
  // =========================================================================
  private createSkeletalSystem(opacity = 1.0): THREE.Group {
    const group = new THREE.Group();
    group.name = 'SkeletalSystem';

    const mat = this.boneMaterial.clone();
    if (opacity < 1.0) {
      mat.transparent = true;
      mat.opacity = opacity;
    }

    // A. Skull & Cranium
    const skullGroup = new THREE.Group();
    skullGroup.position.set(0, 5.8, 0);

    // Cranial vault
    const craniumGeo = new THREE.SphereGeometry(0.72, 32, 28);
    craniumGeo.scale(0.9, 1.1, 1.15);
    const cranium = new THREE.Mesh(craniumGeo, mat);
    cranium.castShadow = true;
    cranium.receiveShadow = true;
    skullGroup.add(cranium);

    // Face / maxilla structure
    const faceGeo = new THREE.BoxGeometry(0.7, 0.65, 0.65);
    const face = new THREE.Mesh(faceGeo, mat);
    face.position.set(0, -0.4, 0.4);
    skullGroup.add(face);

    // Eye sockets (subtle indentations)
    const eyeSocketGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.15, 16);
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const leftEye = new THREE.Mesh(eyeSocketGeo, darkMat);
    leftEye.rotation.x = Math.PI / 2;
    leftEye.position.set(0.24, -0.22, 0.72);
    skullGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeSocketGeo, darkMat);
    rightEye.rotation.x = Math.PI / 2;
    rightEye.position.set(-0.24, -0.22, 0.72);
    skullGroup.add(rightEye);

    this.registerClickable(cranium, 'skull', 'skeletal');
    group.add(skullGroup);

    // B. Mandible (Jaw)
    const mandibleGroup = new THREE.Group();
    mandibleGroup.position.set(0, 5.2, 0.2);
    const jawGeo = new THREE.TorusGeometry(0.38, 0.12, 12, 24, Math.PI);
    jawGeo.rotateX(Math.PI / 2);
    jawGeo.scale(0.85, 1, 1.1);
    const jaw = new THREE.Mesh(jawGeo, mat);
    jaw.position.set(0, 0, 0.15);
    mandibleGroup.add(jaw);

    // Chin point
    const chinGeo = new THREE.SphereGeometry(0.16, 16, 12);
    const chin = new THREE.Mesh(chinGeo, mat);
    chin.position.set(0, -0.05, 0.5);
    mandibleGroup.add(chin);

    this.registerClickable(jaw, 'mandible', 'skeletal');
    this.registerClickable(chin, 'mandible', 'skeletal');
    group.add(mandibleGroup);

    // C. Cervical Spine
    const cervGroup = new THREE.Group();
    cervGroup.position.set(0, 4.65, -0.05);
    for (let i = 0; i < 7; i++) {
      const vertGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.08, 16);
      const vert = new THREE.Mesh(vertGeo, mat);
      vert.position.set(0, (3 - i) * 0.1, 0);
      // Spinous process
      const procGeo = new THREE.ConeGeometry(0.06, 0.16, 8);
      const proc = new THREE.Mesh(procGeo, mat);
      proc.rotation.x = -Math.PI / 2.5;
      proc.position.set(0, (3 - i) * 0.1, -0.2);
      cervGroup.add(vert);
      cervGroup.add(proc);
      this.registerClickable(vert, 'spine_cervical', 'skeletal');
    }
    group.add(cervGroup);

    // D. Thoracic & Lumbar Spine
    const spineGroup = new THREE.Group();
    spineGroup.position.set(0, 2.7, -0.15);
    for (let i = 0; i < 17; i++) {
      const scale = 0.26 + i * 0.015;
      const vertGeo = new THREE.CylinderGeometry(scale, scale * 1.05, 0.12, 16);
      const vert = new THREE.Mesh(vertGeo, mat);
      const curveZ = Math.sin((i / 17) * Math.PI) * 0.15;
      vert.position.set(0, 1.4 - i * 0.17, curveZ);

      // Posterior process
      const spineProcGeo = new THREE.BoxGeometry(0.08, 0.1, 0.3);
      const spineProc = new THREE.Mesh(spineProcGeo, mat);
      spineProc.position.set(0, 1.4 - i * 0.17, curveZ - 0.22);
      spineGroup.add(vert);
      spineGroup.add(spineProc);
      this.registerClickable(vert, 'spine_thoracic_lumbar', 'skeletal');
    }
    group.add(spineGroup);

    // E. Rib Cage & Sternum
    const ribGroup = new THREE.Group();
    ribGroup.position.set(0, 3.4, 0);

    // Sternum
    const sternumGeo = new THREE.BoxGeometry(0.28, 1.4, 0.1);
    const sternum = new THREE.Mesh(sternumGeo, mat);
    sternum.position.set(0, 0, 0.85);
    ribGroup.add(sternum);
    this.registerClickable(sternum, 'ribcage_sternum', 'skeletal');

    // 12 pairs of ribs
    for (let i = 0; i < 10; i++) {
      const y = 0.6 - i * 0.13;
      const radiusX = 0.75 + Math.sin((i / 9) * Math.PI) * 0.45;
      const radiusZ = 0.65 + Math.sin((i / 9) * Math.PI) * 0.28;

      // Right Rib
      const rightRibCurve = new THREE.EllipseCurve(0, 0, radiusX, radiusZ, -Math.PI * 0.1, Math.PI * 0.6, false, 0);
      const rightPts = rightRibCurve.getPoints(24);
      const rightGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rightPts.map(p => new THREE.Vector3(p.x, y, p.y))), 24, 0.045, 8, false);
      const rightRib = new THREE.Mesh(rightGeo, mat);
      ribGroup.add(rightRib);
      this.registerClickable(rightRib, 'ribcage_sternum', 'skeletal');

      // Left Rib
      const leftRibCurve = new THREE.EllipseCurve(0, 0, radiusX, radiusZ, Math.PI * 0.4, Math.PI * 1.1, false, 0);
      const leftPts = leftRibCurve.getPoints(24);
      const leftGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(leftPts.map(p => new THREE.Vector3(p.x, y, p.y))), 24, 0.045, 8, false);
      const leftRib = new THREE.Mesh(leftGeo, mat);
      ribGroup.add(leftRib);
      this.registerClickable(leftRib, 'ribcage_sternum', 'skeletal');
    }
    group.add(ribGroup);

    // F. Clavicles & Scapulae
    const girdleGroup = new THREE.Group();
    girdleGroup.position.set(0, 4.0, 0);

    // Left clavicle
    const clavicleGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 12);
    clavicleGeo.rotateZ(Math.PI / 2.3);
    const leftClavicle = new THREE.Mesh(clavicleGeo, mat);
    leftClavicle.position.set(0.7, 0.15, 0.65);
    girdleGroup.add(leftClavicle);
    this.registerClickable(leftClavicle, 'clavicle_scapula', 'skeletal');

    // Right clavicle
    const rightClavicle = leftClavicle.clone();
    rightClavicle.scale.set(-1, 1, 1);
    rightClavicle.position.set(-0.7, 0.15, 0.65);
    girdleGroup.add(rightClavicle);
    this.registerClickable(rightClavicle, 'clavicle_scapula', 'skeletal');

    // Scapulae (Shoulder blades)
    const scapulaShape = new THREE.Shape();
    scapulaShape.moveTo(0, 0);
    scapulaShape.lineTo(0.6, 0.8);
    scapulaShape.lineTo(-0.2, 0.9);
    scapulaShape.closePath();
    const scapulaGeo = new THREE.ExtrudeGeometry(scapulaShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02 });

    const leftScapula = new THREE.Mesh(scapulaGeo, mat);
    leftScapula.position.set(0.75, -0.4, -0.65);
    leftScapula.rotation.set(0.2, 0.3, 0);
    girdleGroup.add(leftScapula);
    this.registerClickable(leftScapula, 'clavicle_scapula', 'skeletal');

    const rightScapula = leftScapula.clone();
    rightScapula.scale.set(-1, 1, 1);
    rightScapula.position.set(-0.75, -0.4, -0.65);
    rightScapula.rotation.set(0.2, -0.3, 0);
    girdleGroup.add(rightScapula);
    this.registerClickable(rightScapula, 'clavicle_scapula', 'skeletal');

    group.add(girdleGroup);

    // G. Upper Limbs (Humerus, Radius, Ulna, Hands)
    const buildArm = (side: 1 | -1) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 1.55, 3.8, 0);

      // Humerus
      const humerusGroup = new THREE.Group();
      const humerusHeadGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const humHead = new THREE.Mesh(humerusHeadGeo, mat);
      const humShaftGeo = new THREE.CylinderGeometry(0.12, 0.14, 1.4, 16);
      const humShaft = new THREE.Mesh(humShaftGeo, mat);
      humShaft.position.y = -0.7;
      const humCondyleGeo = new THREE.SphereGeometry(0.18, 16, 16);
      humCondyleGeo.scale(1.2, 0.8, 1);
      const humCondyle = new THREE.Mesh(humCondyleGeo, mat);
      humCondyle.position.y = -1.4;

      humerusGroup.add(humHead, humShaft, humCondyle);
      humerusGroup.position.set(0, 0, 0);
      armGroup.add(humerusGroup);
      this.registerClickable(humShaft, 'humerus', 'skeletal');

      // Radius & Ulna
      const forearmGroup = new THREE.Group();
      forearmGroup.position.set(0, -1.5, 0);

      const radiusGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.35, 12);
      const radius = new THREE.Mesh(radiusGeo, mat);
      radius.position.set(side * 0.12, -0.65, 0);

      const ulnaGeo = new THREE.CylinderGeometry(0.1, 0.07, 1.35, 12);
      const ulna = new THREE.Mesh(ulnaGeo, mat);
      ulna.position.set(side * -0.12, -0.65, 0);

      forearmGroup.add(radius, ulna);
      armGroup.add(forearmGroup);
      this.registerClickable(radius, 'forearm_bones', 'skeletal');
      this.registerClickable(ulna, 'forearm_bones', 'skeletal');

      // Hand & Carpals
      const handGroup = new THREE.Group();
      handGroup.position.set(0, -3.0, 0);
      const palmGeo = new THREE.BoxGeometry(0.32, 0.45, 0.12);
      const palm = new THREE.Mesh(palmGeo, mat);
      palm.position.y = -0.2;
      handGroup.add(palm);

      for (let f = 0; f < 5; f++) {
        const fingerLen = f === 0 ? 0.3 : 0.45;
        const fingerGeo = new THREE.CylinderGeometry(0.035, 0.04, fingerLen, 8);
        const finger = new THREE.Mesh(fingerGeo, mat);
        const fx = (f - 2) * 0.08;
        finger.position.set(fx, -0.45 - fingerLen / 2, 0);
        handGroup.add(finger);
      }
      armGroup.add(handGroup);
      this.registerClickable(palm, 'hand_bones', 'skeletal');

      return armGroup;
    };

    group.add(buildArm(1));
    group.add(buildArm(-1));

    // H. Pelvis (Hip Girdle)
    const pelvisGroup = new THREE.Group();
    pelvisGroup.position.set(0, 1.3, 0);

    // Ilium wings
    const iliumGeo = new THREE.TorusGeometry(0.8, 0.28, 16, 32, Math.PI * 0.85);
    iliumGeo.rotateX(Math.PI / 2);
    iliumGeo.scale(1.15, 0.65, 1);
    const ilium = new THREE.Mesh(iliumGeo, mat);
    ilium.position.set(0, 0.35, 0);
    pelvisGroup.add(ilium);

    // Sacrum
    const sacrumGeo = new THREE.ConeGeometry(0.35, 0.75, 16);
    sacrumGeo.rotateX(Math.PI);
    const sacrum = new THREE.Mesh(sacrumGeo, mat);
    sacrum.position.set(0, 0.2, -0.35);
    pelvisGroup.add(sacrum);

    // Pubic bones
    const pubicGeo = new THREE.TorusGeometry(0.4, 0.15, 12, 24, Math.PI);
    pubicGeo.rotateX(-Math.PI / 3);
    const pubis = new THREE.Mesh(pubicGeo, mat);
    pubis.position.set(0, -0.2, 0.2);
    pelvisGroup.add(pubis);

    this.registerClickable(ilium, 'pelvis', 'skeletal');
    this.registerClickable(sacrum, 'pelvis', 'skeletal');
    group.add(pelvisGroup);

    // I. Lower Limbs (Femur, Patella, Tibia/Fibula, Foot)
    const buildLeg = (side: 1 | -1) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.75, 1.0, 0);

      // Femur
      const femurGroup = new THREE.Group();
      const femHeadGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const femHead = new THREE.Mesh(femHeadGeo, mat);
      femHead.position.set(side * -0.15, 0, 0);

      const femShaftGeo = new THREE.CylinderGeometry(0.16, 0.18, 2.2, 16);
      const femShaft = new THREE.Mesh(femShaftGeo, mat);
      femShaft.rotation.z = side * -0.05;
      femShaft.position.set(0, -1.1, 0);

      const femCondyleGeo = new THREE.SphereGeometry(0.26, 16, 16);
      femCondyleGeo.scale(1.2, 0.8, 1);
      const femCondyle = new THREE.Mesh(femCondyleGeo, mat);
      femCondyle.position.set(0, -2.2, 0);

      femurGroup.add(femHead, femShaft, femCondyle);
      legGroup.add(femurGroup);
      this.registerClickable(femShaft, 'femur', 'skeletal');

      // Patella
      const patellaGeo = new THREE.SphereGeometry(0.14, 16, 12);
      patellaGeo.scale(1.1, 1.2, 0.5);
      const patella = new THREE.Mesh(patellaGeo, mat);
      patella.position.set(0, -2.2, 0.28);
      legGroup.add(patella);
      this.registerClickable(patella, 'patella', 'skeletal');

      // Lower leg: Tibia & Fibula
      const shinGroup = new THREE.Group();
      shinGroup.position.set(0, -2.4, 0);

      const tibiaGeo = new THREE.CylinderGeometry(0.18, 0.14, 2.1, 16);
      const tibia = new THREE.Mesh(tibiaGeo, mat);
      tibia.position.set(side * -0.05, -1.05, 0);

      const fibulaGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.0, 12);
      const fibula = new THREE.Mesh(fibulaGeo, mat);
      fibula.position.set(side * 0.22, -1.05, 0);

      shinGroup.add(tibia, fibula);
      legGroup.add(shinGroup);
      this.registerClickable(tibia, 'tibia_fibula', 'skeletal');
      this.registerClickable(fibula, 'tibia_fibula', 'skeletal');

      // Foot & Ankle
      const footGroup = new THREE.Group();
      footGroup.position.set(0, -4.55, 0);

      // Calcaneus & Tarsals
      const calcGeo = new THREE.BoxGeometry(0.35, 0.25, 0.65);
      const calc = new THREE.Mesh(calcGeo, mat);
      calc.position.set(0, -0.1, 0.1);
      footGroup.add(calc);

      // Metatarsals & Toes
      const toesGeo = new THREE.BoxGeometry(0.42, 0.16, 0.55);
      const toes = new THREE.Mesh(toesGeo, mat);
      toes.position.set(0, -0.14, 0.65);
      footGroup.add(toes);

      legGroup.add(footGroup);
      this.registerClickable(calc, 'foot_bones', 'skeletal');
      this.registerClickable(toes, 'foot_bones', 'skeletal');

      return legGroup;
    };

    group.add(buildLeg(1));
    group.add(buildLeg(-1));

    return group;
  }

  // =========================================================================
  // 2. MUSCULAR SYSTEM BUILDER
  // =========================================================================
  private createMuscularSystem(opacity = 1.0): THREE.Group {
    const group = new THREE.Group();
    group.name = 'MuscularSystem';

    const mat = this.muscleMaterial.clone();
    if (opacity < 1.0) {
      mat.transparent = true;
      mat.opacity = opacity;
    }

    // A. Trapezius & Neck Muscles
    const trapGeo = new THREE.ConeGeometry(0.9, 1.4, 16);
    trapGeo.scale(1.2, 1, 0.45);
    const trapezius = new THREE.Mesh(trapGeo, mat);
    trapezius.position.set(0, 4.35, -0.32);
    trapezius.rotation.x = Math.PI;
    group.add(trapezius);
    this.registerClickable(trapezius, 'trapezius', 'muscular');

    // B. Pectoralis Major (Chest)
    const buildPec = (side: 1 | -1) => {
      const pecGeo = new THREE.SphereGeometry(0.58, 20, 16);
      pecGeo.scale(1.1, 0.68, 0.55);
      const pec = new THREE.Mesh(pecGeo, mat);
      pec.position.set(side * 0.55, 3.5, 0.6);
      pec.rotation.set(0.1, side * -0.2, side * -0.25);
      return pec;
    };
    const leftPec = buildPec(1);
    const rightPec = buildPec(-1);
    group.add(leftPec, rightPec);
    this.registerClickable(leftPec, 'pectoralis_major', 'muscular');
    this.registerClickable(rightPec, 'pectoralis_major', 'muscular');

    // C. Deltoid (Shoulders)
    const buildDeltoid = (side: 1 | -1) => {
      const deltGeo = new THREE.SphereGeometry(0.52, 20, 16);
      deltGeo.scale(0.85, 1.3, 0.95);
      const delt = new THREE.Mesh(deltGeo, mat);
      delt.position.set(side * 1.62, 3.8, 0.05);
      delt.rotation.z = side * -0.15;
      return delt;
    };
    const leftDelt = buildDeltoid(1);
    const rightDelt = buildDeltoid(-1);
    group.add(leftDelt, rightDelt);
    this.registerClickable(leftDelt, 'deltoid', 'muscular');
    this.registerClickable(rightDelt, 'deltoid', 'muscular');

    // D. Biceps Brachii & Triceps Brachii
    const buildArmMuscles = (side: 1 | -1) => {
      const armMGroup = new THREE.Group();
      armMGroup.position.set(side * 1.55, 3.0, 0);

      // Biceps (Anterior)
      const bicepGeo = new THREE.CylinderGeometry(0.24, 0.22, 1.1, 16);
      bicepGeo.scale(0.9, 1, 1.15);
      const bicep = new THREE.Mesh(bicepGeo, mat);
      bicep.position.set(0, 0, 0.22);
      armMGroup.add(bicep);
      this.registerClickable(bicep, 'biceps', 'muscular');

      // Triceps (Posterior)
      const tricepGeo = new THREE.CylinderGeometry(0.26, 0.23, 1.25, 16);
      tricepGeo.scale(1.1, 1, 1.05);
      const tricep = new THREE.Mesh(tricepGeo, mat);
      tricep.position.set(0, 0, -0.22);
      armMGroup.add(tricep);
      this.registerClickable(tricep, 'triceps', 'muscular');

      // Forearm muscles (Flexors & Extensors)
      const forearmMGeo = new THREE.ConeGeometry(0.28, 1.3, 16);
      forearmMGeo.scale(1, 1, 0.85);
      const forearmM = new THREE.Mesh(forearmMGeo, mat);
      forearmM.position.set(0, -1.4, 0.05);
      forearmM.rotation.x = Math.PI;
      armMGroup.add(forearmM);

      return armMGroup;
    };
    group.add(buildArmMuscles(1));
    group.add(buildArmMuscles(-1));

    // E. Rectus Abdominis (Abs 6-pack)
    const absGroup = new THREE.Group();
    absGroup.position.set(0, 2.35, 0.6);
    for (let row = 0; row < 4; row++) {
      for (let col of [-1, 1]) {
        const abPackGeo = new THREE.BoxGeometry(0.32, 0.26, 0.16);
        const abPack = new THREE.Mesh(abPackGeo, mat);
        abPack.position.set(col * 0.22, (1.5 - row) * 0.32, 0);
        absGroup.add(abPack);
        this.registerClickable(abPack, 'rectus_abdominis', 'muscular');
      }
    }
    group.add(absGroup);

    // F. External Obliques
    const buildObliques = (side: 1 | -1) => {
      const oblGeo = new THREE.CylinderGeometry(0.3, 0.36, 1.2, 16);
      oblGeo.scale(0.8, 1, 1.1);
      const obl = new THREE.Mesh(oblGeo, mat);
      obl.position.set(side * 0.85, 2.3, 0.25);
      obl.rotation.z = side * -0.2;
      return obl;
    };
    const leftObl = buildObliques(1);
    const rightObl = buildObliques(-1);
    group.add(leftObl, rightObl);
    this.registerClickable(leftObl, 'obliques', 'muscular');
    this.registerClickable(rightObl, 'obliques', 'muscular');

    // G. Latissimus Dorsi (Back V-Taper)
    const buildLats = (side: 1 | -1) => {
      const latGeo = new THREE.CylinderGeometry(0.35, 0.7, 1.6, 16);
      latGeo.scale(0.7, 1, 0.5);
      const lat = new THREE.Mesh(latGeo, mat);
      lat.position.set(side * 0.8, 2.7, -0.45);
      lat.rotation.set(-0.2, 0, side * 0.3);
      return lat;
    };
    const leftLat = buildLats(1);
    const rightLat = buildLats(-1);
    group.add(leftLat, rightLat);
    this.registerClickable(leftLat, 'latissimus_dorsi', 'muscular');
    this.registerClickable(rightLat, 'latissimus_dorsi', 'muscular');

    // H. Gluteus Maximus
    const buildGlute = (side: 1 | -1) => {
      const gluteGeo = new THREE.SphereGeometry(0.55, 20, 16);
      gluteGeo.scale(0.95, 1.1, 0.85);
      const glute = new THREE.Mesh(gluteGeo, mat);
      glute.position.set(side * 0.55, 0.9, -0.65);
      glute.rotation.set(-0.2, side * -0.2, 0);
      return glute;
    };
    const leftGlute = buildGlute(1);
    const rightGlute = buildGlute(-1);
    group.add(leftGlute, rightGlute);
    this.registerClickable(leftGlute, 'gluteus_maximus', 'muscular');
    this.registerClickable(rightGlute, 'gluteus_maximus', 'muscular');

    // I. Quadriceps (Thigh Anterior) & Hamstrings (Thigh Posterior)
    const buildThighMuscles = (side: 1 | -1) => {
      const thighMGroup = new THREE.Group();
      thighMGroup.position.set(side * 0.75, 0, 0);

      // Quadriceps (Rectus femoris & Vastus muscles)
      const quadGeo = new THREE.CylinderGeometry(0.42, 0.32, 2.0, 16);
      quadGeo.scale(1.15, 1, 1.2);
      const quad = new THREE.Mesh(quadGeo, mat);
      quad.position.set(0, -0.1, 0.28);
      thighMGroup.add(quad);
      this.registerClickable(quad, 'quadriceps', 'muscular');

      // Hamstrings (Posterior)
      const hamGeo = new THREE.CylinderGeometry(0.38, 0.28, 1.9, 16);
      hamGeo.scale(1.1, 1, 1.1);
      const ham = new THREE.Mesh(hamGeo, mat);
      ham.position.set(0, -0.1, -0.32);
      thighMGroup.add(ham);
      this.registerClickable(ham, 'hamstrings', 'muscular');

      return thighMGroup;
    };
    group.add(buildThighMuscles(1));
    group.add(buildThighMuscles(-1));

    // J. Gastrocnemius & Soleus (Calf muscles)
    const buildCalf = (side: 1 | -1) => {
      const calfGroup = new THREE.Group();
      calfGroup.position.set(side * 0.75, -3.1, 0);

      // Gastrocnemius (Two muscle bellies)
      const medGeo = new THREE.SphereGeometry(0.32, 16, 16);
      medGeo.scale(0.85, 1.6, 0.9);
      const medBelly = new THREE.Mesh(medGeo, mat);
      medBelly.position.set(side * -0.12, 0.35, -0.28);

      const latGeo = new THREE.SphereGeometry(0.3, 16, 16);
      latGeo.scale(0.85, 1.5, 0.85);
      const latBelly = new THREE.Mesh(latGeo, mat);
      latBelly.position.set(side * 0.14, 0.45, -0.28);

      // Achilles Tendon tapering
      const achillesGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.0, 12);
      const achilles = new THREE.Mesh(achillesGeo, this.tendonMaterial);
      achilles.position.set(0, -0.65, -0.2);

      calfGroup.add(medBelly, latBelly, achilles);
      this.registerClickable(medBelly, 'gastrocnemius', 'muscular');
      this.registerClickable(latBelly, 'gastrocnemius', 'muscular');

      return calfGroup;
    };
    group.add(buildCalf(1));
    group.add(buildCalf(-1));

    return group;
  }

  // =========================================================================
  // 3. NERVOUS SYSTEM BUILDER (Central & Peripheral with Pulse Animation)
  // =========================================================================
  private createNervousSystem(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'NervousSystem';

    // A. Cerebrum (Brain)
    const brainGroup = new THREE.Group();
    brainGroup.position.set(0, 5.85, 0);

    // Left hemisphere
    const leftHemiGeo = new THREE.SphereGeometry(0.55, 32, 24);
    leftHemiGeo.scale(0.8, 1.0, 1.15);
    const leftHemi = new THREE.Mesh(leftHemiGeo, this.brainMaterial);
    leftHemi.position.set(0.24, 0, 0);

    // Right hemisphere
    const rightHemiGeo = new THREE.SphereGeometry(0.55, 32, 24);
    rightHemiGeo.scale(0.8, 1.0, 1.15);
    const rightHemi = new THREE.Mesh(rightHemiGeo, this.brainMaterial);
    rightHemi.position.set(-0.24, 0, 0);

    brainGroup.add(leftHemi, rightHemi);
    this.registerClickable(leftHemi, 'cerebrum', 'nervous');
    this.registerClickable(rightHemi, 'cerebrum', 'nervous');
    group.add(brainGroup);

    // B. Cerebellum
    const cerebellumGroup = new THREE.Group();
    cerebellumGroup.position.set(0, 5.25, -0.4);
    const cerLeftGeo = new THREE.SphereGeometry(0.3, 20, 16);
    cerLeftGeo.scale(1.0, 0.7, 0.85);
    const cerLeft = new THREE.Mesh(cerLeftGeo, this.brainMaterial);
    cerLeft.position.set(0.18, 0, 0);

    const cerRight = cerLeft.clone();
    cerRight.position.set(-0.18, 0, 0);

    cerebellumGroup.add(cerLeft, cerRight);
    this.registerClickable(cerLeft, 'cerebellum', 'nervous');
    this.registerClickable(cerRight, 'cerebellum', 'nervous');
    group.add(cerebellumGroup);

    // C. Brainstem
    const brainstemGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.65, 16);
    const brainstem = new THREE.Mesh(brainstemGeo, this.brainMaterial);
    brainstem.position.set(0, 4.95, -0.05);
    group.add(brainstem);
    this.registerClickable(brainstem, 'brainstem', 'nervous');

    // D. Spinal Cord
    const spineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 4.7, -0.05),
      new THREE.Vector3(0, 4.0, -0.08),
      new THREE.Vector3(0, 3.2, -0.15),
      new THREE.Vector3(0, 2.4, -0.12),
      new THREE.Vector3(0, 1.6, -0.08),
    ]);
    const spineCordGeo = new THREE.TubeGeometry(spineCurve, 32, 0.12, 12, false);
    const spinalCord = new THREE.Mesh(spineCordGeo, this.nerveMaterial);
    group.add(spinalCord);
    this.registerClickable(spinalCord, 'spinal_cord', 'nervous');

    // Intercostal and sympathetic nerve branches
    for (let i = 0; i < 9; i++) {
      const y = 4.2 - i * 0.28;
      for (let side of [-1, 1]) {
        const branchCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, y, -0.12),
          new THREE.Vector3(side * 0.35, y - 0.05, -0.08),
          new THREE.Vector3(side * 0.75, y - 0.12, 0.2),
          new THREE.Vector3(side * 0.85, y - 0.2, 0.45),
        ]);
        const branchGeo = new THREE.TubeGeometry(branchCurve, 16, 0.03, 8, false);
        const branch = new THREE.Mesh(branchGeo, this.nerveMaterial);
        group.add(branch);
      }
    }

    // E. Brachial Plexus & Upper Limb Nerves
    const buildArmNerves = (side: 1 | -1) => {
      const armNGroup = new THREE.Group();

      // Brachial Plexus root
      const plexusCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.1, 4.4, -0.05),
        new THREE.Vector3(side * 0.6, 4.2, 0.1),
        new THREE.Vector3(side * 1.35, 3.9, 0.0),
      ]);
      const plexusGeo = new THREE.TubeGeometry(plexusCurve, 16, 0.07, 8, false);
      const plexus = new THREE.Mesh(plexusGeo, this.nerveMaterial);
      armNGroup.add(plexus);
      this.registerClickable(plexus, 'brachial_plexus', 'nervous');

      // Radial, Median, Ulnar nerve strands down arm
      const radCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 1.35, 3.9, 0.0),
        new THREE.Vector3(side * 1.5, 3.2, -0.1),
        new THREE.Vector3(side * 1.6, 2.5, 0.1),
        new THREE.Vector3(side * 1.55, 1.8, 0.05),
        new THREE.Vector3(side * 1.5, 1.0, 0.0),
      ]);
      const radGeo = new THREE.TubeGeometry(radCurve, 24, 0.045, 8, false);
      const radNerve = new THREE.Mesh(radGeo, this.nerveMaterial);
      armNGroup.add(radNerve);
      this.registerClickable(radNerve, 'radial_median_nerves', 'nervous');

      // Hand terminal digital nerves
      for (let f = 0; f < 4; f++) {
        const handNCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 1.5, 1.0, 0.0),
          new THREE.Vector3(side * (1.4 + f * 0.08), 0.55, 0.0),
        ]);
        const handNGeo = new THREE.TubeGeometry(handNCurve, 8, 0.02, 6, false);
        const handN = new THREE.Mesh(handNGeo, this.nerveMaterial);
        armNGroup.add(handN);
      }

      return armNGroup;
    };
    group.add(buildArmNerves(1));
    group.add(buildArmNerves(-1));

    // F. Sciatic Nerve & Lower Limb Nerves
    const buildLegNerves = (side: 1 | -1) => {
      const legNGroup = new THREE.Group();

      // Sciatic nerve main trunk (Posterior)
      const sciaticCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.25, 1.6, -0.1),
        new THREE.Vector3(side * 0.55, 1.0, -0.35),
        new THREE.Vector3(side * 0.75, 0.2, -0.38),
        new THREE.Vector3(side * 0.75, -0.8, -0.35),
        new THREE.Vector3(side * 0.75, -1.8, -0.28),
      ]);
      const sciaticGeo = new THREE.TubeGeometry(sciaticCurve, 24, 0.085, 10, false);
      const sciatic = new THREE.Mesh(sciaticGeo, this.nerveMaterial);
      legNGroup.add(sciatic);
      this.registerClickable(sciatic, 'sciatic_nerve', 'nervous');

      // Tibial & Peroneal branches down shin to foot
      const legDistalCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.75, -1.8, -0.28),
        new THREE.Vector3(side * 0.78, -2.8, -0.15),
        new THREE.Vector3(side * 0.72, -3.8, 0.05),
        new THREE.Vector3(side * 0.7, -4.6, 0.4),
      ]);
      const distalGeo = new THREE.TubeGeometry(legDistalCurve, 24, 0.05, 8, false);
      const distal = new THREE.Mesh(distalGeo, this.nerveMaterial);
      legNGroup.add(distal);
      this.registerClickable(distal, 'peroneal_tibial_nerves', 'nervous');

      return legNGroup;
    };
    group.add(buildLegNerves(1));
    group.add(buildLegNerves(-1));

    // G. Synaptic Action-Potential Impulse Particle Systems
    const pulseSys = this.createNerveImpulseParticles();
    group.add(pulseSys.points);
    this.pulseSystems.push(pulseSys);

    return group;
  }

  // Electrical nerve action potentials (flowing glowing pulses)
  private createNerveImpulseParticles(): PulseParticleSystem {
    const particleCount = 280;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const progress = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const pathIndices = new Uint8Array(particleCount);

    // Define 6 key neural pathways:
    // 0: Brain to Left Hand
    // 1: Brain to Right Hand
    // 2: Brain to Left Foot (Sciatic)
    // 3: Brain to Right Foot (Sciatic)
    // 4: Central spinal oscillations
    // 5: Cranial to vagus
    const pathways: THREE.Vector3[][] = [
      // Left Arm
      [
        new THREE.Vector3(0, 5.8, 0),
        new THREE.Vector3(0, 4.8, 0),
        new THREE.Vector3(0.5, 4.3, 0.1),
        new THREE.Vector3(1.3, 3.8, 0.0),
        new THREE.Vector3(1.5, 2.5, 0.1),
        new THREE.Vector3(1.5, 1.0, 0.0),
      ],
      // Right Arm
      [
        new THREE.Vector3(0, 5.8, 0),
        new THREE.Vector3(0, 4.8, 0),
        new THREE.Vector3(-0.5, 4.3, 0.1),
        new THREE.Vector3(-1.3, 3.8, 0.0),
        new THREE.Vector3(-1.5, 2.5, 0.1),
        new THREE.Vector3(-1.5, 1.0, 0.0),
      ],
      // Left Leg Sciatic
      [
        new THREE.Vector3(0, 5.8, 0),
        new THREE.Vector3(0, 3.0, -0.1),
        new THREE.Vector3(0.5, 1.2, -0.3),
        new THREE.Vector3(0.75, -0.5, -0.35),
        new THREE.Vector3(0.75, -2.5, -0.2),
        new THREE.Vector3(0.7, -4.5, 0.3),
      ],
      // Right Leg Sciatic
      [
        new THREE.Vector3(0, 5.8, 0),
        new THREE.Vector3(0, 3.0, -0.1),
        new THREE.Vector3(-0.5, 1.2, -0.3),
        new THREE.Vector3(-0.75, -0.5, -0.35),
        new THREE.Vector3(-0.75, -2.5, -0.2),
        new THREE.Vector3(-0.7, -4.5, 0.3),
      ],
      // Spine
      [
        new THREE.Vector3(0, 5.8, 0),
        new THREE.Vector3(0, 4.5, -0.05),
        new THREE.Vector3(0, 3.5, -0.12),
        new THREE.Vector3(0, 2.5, -0.1),
        new THREE.Vector3(0, 1.5, -0.08),
      ],
    ];

    const curves = pathways.map(pts => new THREE.CatmullRomCurve3(pts));

    for (let i = 0; i < particleCount; i++) {
      progress[i] = Math.random();
      speeds[i] = 0.25 + Math.random() * 0.45;
      pathIndices[i] = i % curves.length;

      // Color: Electric cyan to bright gold
      const isGold = Math.random() > 0.7;
      if (isGold) {
        colors[i * 3] = 0.98;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 0.2;
      } else {
        colors[i * 3] = 0.22;
        colors[i * 3 + 1] = 0.74;
        colors[i * 3 + 2] = 0.97;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom glowing particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(56,189,248,0.9)');
    grad.addColorStop(0.7, 'rgba(2,132,199,0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);

    const partMat = new THREE.PointsMaterial({
      size: 0.22,
      map: tex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    const points = new THREE.Points(geo, partMat);

    const update = (delta: number) => {
      const posArr = geo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        progress[i] += speeds[i] * delta;
        if (progress[i] > 1.0) {
          progress[i] = 0;
        }

        const curve = curves[pathIndices[i]];
        const pt = curve.getPoint(progress[i]);

        // Jitter subtly
        posArr[i * 3] = pt.x + (Math.sin(progress[i] * 20 + i) * 0.02);
        posArr[i * 3 + 1] = pt.y;
        posArr[i * 3 + 2] = pt.z + (Math.cos(progress[i] * 20 + i) * 0.02);
      }
      geo.attributes.position.needsUpdate = true;
    };

    return { points, update };
  }

  private registerClickable(mesh: THREE.Object3D, itemId: string, system: 'skeletal' | 'muscular' | 'nervous') {
    (mesh as any).userData = { itemId, system };
    this.clickableParts.push({
      mesh,
      itemId,
      system,
    });
  }
}
