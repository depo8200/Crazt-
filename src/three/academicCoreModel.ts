import * as THREE from 'three';
import { BranchInfo } from '../types/academic';
import { createBranchPlateTexture } from './sceneUtils';

export type CoreMaterialFinish = 'obsidian' | 'titanium' | 'cobalt';

export interface ExplodablePart {
  object: THREE.Object3D;
  basePos: THREE.Vector3;
  explodeOffset: THREE.Vector3;
}

export interface AcademicCoreAssembly {
  root: THREE.Group;
  outerRing: THREE.Object3D;
  midRing: THREE.Object3D;
  innerCore: THREE.Object3D;
  explodableParts: ExplodablePart[];
  materials: {
    primaryMetal: THREE.MeshPhysicalMaterial;
    matteHousing: THREE.MeshStandardMaterial;
    accentEmissive: THREE.MeshStandardMaterial;
    opticalGlass: THREE.MeshPhysicalMaterial;
  };
}

function createHexShape(radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

/**
 * Composite 10-part procedural hero model: "CRAZY! Academic Knowledge Core"
 * Pivoted at bottom-center (y = 0) so it rests cleanly on any deck or studio floor.
 */
export function buildAcademicCoreAssembly(
  isSoftwareGl: boolean,
  shadowTexture?: THREE.CanvasTexture
): AcademicCoreAssembly {
  const root = new THREE.Group();
  const explodableParts: ExplodablePart[] = [];

  // Varied PBR materials (roughness contrast >= 0.25 between adjacent components)
  const primaryMetal = new THREE.MeshPhysicalMaterial({
    color: 0x0f1a2e,
    metalness: 0.92,
    roughness: 0.22,
    clearcoat: 0.75,
    clearcoatRoughness: 0.18,
  });

  const matteHousing = new THREE.MeshStandardMaterial({
    color: 0x162033,
    metalness: 0.3,
    roughness: 0.72,
  });

  const accentEmissive = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x2563eb,
    emissiveIntensity: 1.55,
    metalness: 0.4,
    roughness: 0.2,
  });

  const opticalGlass = new THREE.MeshPhysicalMaterial({
    color: 0x60a5fa,
    metalness: 0.08,
    roughness: 0.08,
    clearcoat: 1.0,
    ior: 1.55,
    thickness: 1.2,
    transmission: isSoftwareGl ? 0 : 0.85,
    transparent: true,
    opacity: isSoftwareGl ? 0.36 : 0.92,
    depthWrite: false,
  });

  const registerExplodable = (
    object: THREE.Object3D,
    explodeOffset: THREE.Vector3
  ) => {
    explodableParts.push({
      object,
      basePos: object.position.clone(),
      explodeOffset,
    });
  };

  // Optional grounded radial contact shadow
  if (shadowTexture) {
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 4.4),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.015;
    root.add(shadowPlane);
  }

  // Part 1: Lathe-turned chamfered base plinth (y = 0 flush)
  const plinthPoints = [
    new THREE.Vector2(0.01, 0),
    new THREE.Vector2(1.48, 0),
    new THREE.Vector2(1.42, 0.16),
    new THREE.Vector2(1.18, 0.28),
    new THREE.Vector2(1.06, 0.42),
    new THREE.Vector2(0.01, 0.42),
  ];
  const plinthGeo = new THREE.LatheGeometry(plinthPoints, 32);
  const plinthMesh = new THREE.Mesh(plinthGeo, matteHousing);
  plinthMesh.castShadow = !isSoftwareGl;
  plinthMesh.receiveShadow = !isSoftwareGl;
  root.add(plinthMesh);
  registerExplodable(plinthMesh, new THREE.Vector3(0, -0.55, 0));

  // Part 2: Glowing base trim ring
  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.24, 0.035, 12, 48),
    accentEmissive
  );
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.24;
  root.add(baseRing);
  registerExplodable(baseRing, new THREE.Vector3(0, -0.35, 0));

  // Part 3: Primary beveled hexagonal monolith hull (ExtrudeGeometry)
  const hexGeo = new THREE.ExtrudeGeometry(createHexShape(0.86), {
    depth: 1.45,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.09,
    bevelSegments: 3,
  });
  hexGeo.center();
  hexGeo.rotateX(Math.PI / 2);
  const monolithHull = new THREE.Mesh(hexGeo, primaryMetal);
  monolithHull.position.y = 1.65;
  monolithHull.castShadow = !isSoftwareGl;
  monolithHull.receiveShadow = !isSoftwareGl;
  root.add(monolithHull);
  registerExplodable(monolithHull, new THREE.Vector3(0, 0.15, 0));

  // Part 4: Upper crown cap (LatheGeometry)
  const crownPoints = [
    new THREE.Vector2(0.01, 0),
    new THREE.Vector2(0.95, 0),
    new THREE.Vector2(0.82, 0.24),
    new THREE.Vector2(0.42, 0.42),
    new THREE.Vector2(0.01, 0.46),
  ];
  const crownMesh = new THREE.Mesh(
    new THREE.LatheGeometry(crownPoints, 24),
    matteHousing
  );
  crownMesh.position.y = 2.52;
  crownMesh.castShadow = !isSoftwareGl;
  root.add(crownMesh);
  registerExplodable(crownMesh, new THREE.Vector3(0, 1.2, 0));

  // Part 5: Luminous central energy crystal (inner core)
  const innerCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.46, 0),
    accentEmissive
  );
  innerCore.position.y = 1.65;
  root.add(innerCore);
  registerExplodable(innerCore, new THREE.Vector3(0, 0.65, 0));

  // Part 6 & 7: Twin helical TubeGeometry optical conduits spiraling around core
  for (let side = 0; side < 2; side++) {
    const phase = side * Math.PI;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const angle = phase + t * Math.PI * 2.4;
      const r = 1.06 + Math.sin(t * Math.PI) * 0.16;
      pts.push(new THREE.Vector3(Math.cos(angle) * r, 0.6 + t * 2.1, Math.sin(angle) * r));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.032, 8, false);
    const conduit = new THREE.Mesh(tubeGeo, accentEmissive);
    root.add(conduit);
    registerExplodable(
      conduit,
      new THREE.Vector3(Math.cos(phase) * 0.75, 0.35, Math.sin(phase) * 0.75)
    );
  }

  // Part 8: 4 cantilevered beveled optical glass prism fins
  const finShape = new THREE.Shape();
  finShape.moveTo(0, -0.75);
  finShape.lineTo(0.46, -0.35);
  finShape.lineTo(0.36, 0.68);
  finShape.lineTo(0, 0.85);
  finShape.closePath();

  const finGeo = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  finGeo.center();

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const fin = new THREE.Mesh(finGeo, opticalGlass);
    fin.position.set(Math.cos(angle) * 1.18, 1.65, Math.sin(angle) * 1.18);
    fin.rotation.y = -angle;
    fin.renderOrder = 5;
    root.add(fin);
    registerExplodable(
      fin,
      new THREE.Vector3(Math.cos(angle) * 0.95, 0.25, Math.sin(angle) * 0.95)
    );
  }

  // Part 9: Precision mid-level gyroscopic gimbal ring
  const midRing = new THREE.Group();
  midRing.position.y = 1.65;
  const midTorus = new THREE.Mesh(
    new THREE.TorusGeometry(1.75, 0.055, 16, 64),
    primaryMetal
  );
  midRing.add(midTorus);

  // Add 4 calibration nodes onto the mid ring
  const nodeGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const node = new THREE.Mesh(nodeGeo, accentEmissive);
    node.position.set(Math.cos(a) * 1.75, Math.sin(a) * 1.75, 0);
    midRing.add(node);
  }
  root.add(midRing);
  registerExplodable(midRing, new THREE.Vector3(0, 0.85, 0));

  // Part 10: Outer orbital accelerator ring
  const outerRing = new THREE.Group();
  outerRing.position.y = 1.65;
  const outerTorus = new THREE.Mesh(
    new THREE.TorusGeometry(2.38, 0.04, 14, 80),
    matteHousing
  );
  outerTorus.rotation.x = Math.PI / 2.25;
  outerRing.add(outerTorus);

  const outerAccent = new THREE.Mesh(
    new THREE.TorusGeometry(2.43, 0.015, 8, 80),
    accentEmissive
  );
  outerAccent.rotation.x = Math.PI / 2.25;
  outerRing.add(outerAccent);
  root.add(outerRing);
  registerExplodable(outerRing, new THREE.Vector3(0, 1.35, 0));

  return {
    root,
    outerRing,
    midRing,
    innerCore,
    explodableParts,
    materials: {
      primaryMetal,
      matteHousing,
      accentEmissive,
      opticalGlass,
    },
  };
}

export function applyCoreFinish(
  materials: AcademicCoreAssembly['materials'],
  finish: CoreMaterialFinish
) {
  if (finish === 'obsidian') {
    materials.primaryMetal.color.setHex(0x0f1a2e);
    materials.primaryMetal.metalness = 0.92;
    materials.primaryMetal.roughness = 0.22;
    materials.matteHousing.color.setHex(0x162033);
    materials.accentEmissive.color.setHex(0x3b82f6);
    materials.accentEmissive.emissive.setHex(0x2563eb);
  } else if (finish === 'titanium') {
    materials.primaryMetal.color.setHex(0x94a3b8);
    materials.primaryMetal.metalness = 0.95;
    materials.primaryMetal.roughness = 0.18;
    materials.matteHousing.color.setHex(0x1e293b);
    materials.accentEmissive.color.setHex(0x60a5fa);
    materials.accentEmissive.emissive.setHex(0x3b82f6);
  } else {
    materials.primaryMetal.color.setHex(0x1d4ed8);
    materials.primaryMetal.metalness = 0.85;
    materials.primaryMetal.roughness = 0.14;
    materials.matteHousing.color.setHex(0x0b152b);
    materials.accentEmissive.color.setHex(0x93c5fd);
    materials.accentEmissive.emissive.setHex(0x60a5fa);
  }
}

export interface BranchBeaconNode {
  branch: BranchInfo;
  group: THREE.Group;
  hitProxy: THREE.Mesh;
  spire: THREE.Mesh;
  accentRing: THREE.Mesh;
  baseY: number;
  orbitAngle: number;
  accentMaterial: THREE.MeshStandardMaterial;
}

/**
 * Composite 6-part procedural Branch Beacon (bottom-center pivoted at y = 0)
 */
export function buildBranchBeacon(
  branch: BranchInfo,
  renderer: THREE.WebGLRenderer,
  shadowTexture: THREE.CanvasTexture,
  isSoftwareGl: boolean,
  orbitAngle: number,
  orbitRadius: number
): BranchBeaconNode {
  const group = new THREE.Group();
  const x = Math.cos(orbitAngle) * orbitRadius;
  const z = Math.sin(orbitAngle) * orbitRadius;
  group.position.set(x, 0, z);
  group.lookAt(0, 0, 0);

  // Part 1: Ground contact shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.75, 1.75),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.015;
  group.add(shadow);

  // Part 2: Chamfered hexagonal matte pedestal base
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x111a2e,
    roughness: 0.68,
    metalness: 0.35,
  });
  const basePedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.56, 0.68, 0.22, 6),
    baseMat
  );
  basePedestal.position.y = 0.11;
  basePedestal.castShadow = !isSoftwareGl;
  basePedestal.receiveShadow = !isSoftwareGl;
  group.add(basePedestal);

  // Part 3: Brushed metallic collar (LatheGeometry)
  const collarMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.24,
    metalness: 0.88,
  });
  const collarPts = [
    new THREE.Vector2(0.28, 0),
    new THREE.Vector2(0.48, 0),
    new THREE.Vector2(0.42, 0.14),
    new THREE.Vector2(0.28, 0.16),
  ];
  const collar = new THREE.Mesh(new THREE.LatheGeometry(collarPts, 20), collarMat);
  collar.position.y = 0.22;
  group.add(collar);

  // Part 4: Emissive electric-blue accent ring
  const accentColor = new THREE.Color(branch.accentHex);
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 1.1,
    roughness: 0.25,
    metalness: 0.5,
  });
  const accentRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.028, 10, 32),
    accentMaterial
  );
  accentRing.rotation.x = Math.PI / 2;
  accentRing.position.y = 0.36;
  group.add(accentRing);

  // Part 5: Faceted hovering crystal spire
  const spireMat = new THREE.MeshPhysicalMaterial({
    color: accentColor,
    roughness: 0.15,
    metalness: 0.25,
    clearcoat: 0.9,
    emissive: accentColor,
    emissiveIntensity: 0.35,
  });
  const spire = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), spireMat);
  spire.scale.set(0.85, 1.45, 0.85);
  spire.position.y = 1.02;
  spire.castShadow = !isSoftwareGl;
  group.add(spire);

  // Part 6: Procedural CanvasTexture emblem medallion facing camera/outward
  const plateTex = createBranchPlateTexture(renderer, branch.shortCode, branch.accentHex);
  const emblem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.04, 24),
    [
      collarMat,
      new THREE.MeshStandardMaterial({
        map: plateTex,
        roughness: 0.35,
        metalness: 0.2,
      }),
      collarMat,
    ]
  );
  emblem.rotation.x = Math.PI / 2;
  emblem.position.set(0, 0.54, 0.42);
  group.add(emblem);

  // Invisible simplified collision box on raycast layer 1
  const hitProxy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.75, 1.75, 12),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitProxy.position.y = 0.88;
  hitProxy.layers.set(1);
  hitProxy.userData.branchId = branch.id;
  group.add(hitProxy);

  return {
    branch,
    group,
    hitProxy,
    spire,
    accentRing,
    baseY: 1.02,
    orbitAngle,
    accentMaterial,
  };
}

/**
 * InstancedMesh of floating geometric knowledge shards with per-instance scale & tint variation
 */
export function buildKnowledgeShardsInstanced(count = 140) {
  const geo = new THREE.OctahedronGeometry(0.085, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.7,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.45,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;

  const dummy = new THREE.Object3D();
  const basePositions: THREE.Vector3[] = [];
  const speeds: number[] = [];
  const scales: number[] = [];
  const palette = [
    new THREE.Color('#2563EB'),
    new THREE.Color('#3B82F6'),
    new THREE.Color('#60A5FA'),
    new THREE.Color('#93C5FD'),
  ];

  for (let i = 0; i < count; i++) {
    const radius = 3.2 + Math.random() * 9.5;
    const angle = Math.random() * Math.PI * 2;
    const y = 0.5 + (Math.random() - 0.15) * 6.5;
    const pos = new THREE.Vector3(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );
    basePositions.push(pos);
    speeds.push(0.18 + Math.random() * 0.45);
    const scale = 0.7 + Math.random() * 0.85;
    scales.push(scale);

    dummy.position.copy(pos);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, palette[i % palette.length]);
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();

  return { mesh, basePositions, speeds, scales };
}
