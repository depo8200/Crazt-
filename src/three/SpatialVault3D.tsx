import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ArrowUpRight, ChevronDown, ChevronUp, Compass, Layers, RotateCcw } from 'lucide-react';
import { DEMO_BRANCHES } from '../data/demoPapers';
import { resourceService } from '../services/resourceService';
import { BranchId, BranchInfo } from '../types/academic';
import {
  AcademicCoreAssembly,
  applyCoreFinish,
  BranchBeaconNode,
  buildAcademicCoreAssembly,
  buildBranchBeacon,
  buildKnowledgeShardsInstanced,
  CoreMaterialFinish,
} from './academicCoreModel';
import {
  applyStudioEnvironment,
  createOrbitalDeckTexture,
  createRadialShadowTexture,
  createStudioRenderer,
  createThreePointStudioLights,
  detectSoftwareWebGL,
  disposeObject3D,
  scheduleAfterDraw,
} from './sceneUtils';

interface SpatialVault3DProps {
  onSelectBranchPapers: (branchId: BranchId) => void;
  reducedMotion: boolean;
  compactPreview?: boolean;
  onOpenFullVault?: () => void;
}

type CameraPresetKey = 'overview' | 'core' | 'orbital';

const CAMERA_PRESETS: Record<
  CameraPresetKey,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  overview: { pos: [0, 6.2, 11.4], target: [0, 1.3, 0] },
  core: { pos: [3.2, 2.4, 4.4], target: [0, 1.65, 0] },
  orbital: { pos: [0.1, 13.5, 4.5], target: [0, 0.8, 0] },
};

const _dummy = new THREE.Object3D();
const _rayMouse = new THREE.Vector2();
const _targetExplodePos = new THREE.Vector3();

export function SpatialVault3D({
  onSelectBranchPapers,
  reducedMotion,
  compactPreview = false,
  onOpenFullVault,
}: SpatialVault3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [dockOpen, setDockOpen] = useState(true);
  const [explodeAmount, setExplodeAmount] = useState(0);
  const [finish, setFinish] = useState<CoreMaterialFinish>('obsidian');
  const [activePreset, setActivePreset] = useState<CameraPresetKey>('overview');
  const [selectedBranch, setSelectedBranch] = useState<BranchInfo | null>(null);
  const [hoveredBranchName, setHoveredBranchName] = useState<string | null>(null);

  // Refs synced to Three.js loop without tearing down WebGL context
  const explodeRef = useRef(explodeAmount);
  const finishRef = useRef<CoreMaterialFinish>(finish);
  const reducedMotionRef = useRef(reducedMotion);
  const coreRef = useRef<AcademicCoreAssembly | null>(null);
  const camTransitionRef = useRef<{
    active: boolean;
    pos: THREE.Vector3;
    target: THREE.Vector3;
  }>({
    active: false,
    pos: new THREE.Vector3(...CAMERA_PRESETS.overview.pos),
    target: new THREE.Vector3(...CAMERA_PRESETS.overview.target),
  });

  explodeRef.current = explodeAmount;
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    finishRef.current = finish;
    if (coreRef.current) {
      applyCoreFinish(coreRef.current.materials, finish);
    }
  }, [finish]);

  // Keyboard shortcut 'H' to toggle HUD dock in full vault mode
  useEffect(() => {
    if (compactPreview) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'h' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        setDockOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [compactPreview]);

  const applyCameraPreset = (presetKey: CameraPresetKey) => {
    setActivePreset(presetKey);
    const preset = CAMERA_PRESETS[presetKey];
    camTransitionRef.current = {
      active: true,
      pos: new THREE.Vector3(...preset.pos),
      target: new THREE.Vector3(...preset.target),
    };
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      const isSoftwareGl = detectSoftwareWebGL();
      renderer = createStudioRenderer(isSoftwareGl);
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 520;
      renderer.setSize(width, height);
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x05070d);
      scene.fog = new THREE.FogExp2(0x05070d, 0.032);

      const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 120);
      if (compactPreview) {
        camera.position.set(0, 4.6, 8.6);
      } else {
        const [cx, cy, cz] = CAMERA_PRESETS.overview.pos;
        camera.position.set(cx, cy, cz);
      }

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.06;
      controls.minDistance = 3.2;
      controls.maxDistance = 20;
      controls.maxPolarAngle = Math.PI / 2 - 0.05;
      controls.enablePan = false;
      controls.target.set(0, 1.3, 0);
      controls.autoRotate = !isSoftwareGl && compactPreview;
      controls.autoRotateSpeed = 0.75;

      // Cancel scripted camera transition when user interacts manually
      const onControlStart = () => {
        camTransitionRef.current.active = false;
      };
      controls.addEventListener('start', onControlStart);

      const envTexture = applyStudioEnvironment(scene, renderer);
      createThreePointStudioLights(scene, isSoftwareGl);

      const shadowTex = createRadialShadowTexture();
      const deckTex = createOrbitalDeckTexture(renderer);

      // Grounded procedural orbital platform (y = 0)
      const deckMat = new THREE.MeshStandardMaterial({
        map: deckTex,
        roughness: 0.74,
        metalness: 0.22,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      const deckMesh = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.6, 0.18, 64), deckMat);
      deckMesh.position.y = -0.09;
      deckMesh.receiveShadow = !isSoftwareGl;
      scene.add(deckMesh);

      // Center composite 10-part Academic Core
      const core = buildAcademicCoreAssembly(isSoftwareGl, shadowTex);
      applyCoreFinish(core.materials, finishRef.current);
      coreRef.current = core;
      scene.add(core.root);

      // 7 composite Branch Beacons arranged radially around the core
      const orbitRadius = 4.65;
      const beacons: BranchBeaconNode[] = DEMO_BRANCHES.map((branch, idx) => {
        const angle = (idx / DEMO_BRANCHES.length) * Math.PI * 2 - Math.PI / 2;
        const beacon = buildBranchBeacon(
          branch,
          renderer!,
          shadowTex,
          isSoftwareGl,
          angle,
          orbitRadius
        );
        scene.add(beacon.group);
        return beacon;
      });

      const hitProxies = beacons.map((b) => b.hitProxy);
      const shards = buildKnowledgeShardsInstanced(110);
      scene.add(shards.mesh);

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      // Layer-1 throttled raycasting for branch beacons
      const raycaster = new THREE.Raycaster();
      raycaster.layers.set(1);
      let lastHoverCheck = 0;
      let hoveredId: BranchId | null = null;
      let pointerDownPos = { x: 0, y: 0 };

      const updateMouseCoords = (event: PointerEvent) => {
        const rect = renderer!.domElement.getBoundingClientRect();
        _rayMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _rayMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      };

      const onPointerMove = (event: PointerEvent) => {
        const now = performance.now();
        if (now - lastHoverCheck < 45) return;
        lastHoverCheck = now;
        updateMouseCoords(event);
        raycaster.setFromCamera(_rayMouse, camera);
        const hits = raycaster.intersectObjects(hitProxies, false);
        const hitBranchId = (hits[0]?.object.userData.branchId as BranchId | undefined) ?? null;

        if (hitBranchId !== hoveredId) {
          hoveredId = hitBranchId;
          renderer!.domElement.style.cursor = hoveredId ? 'pointer' : 'grab';
          const matched = beacons.find((b) => b.branch.id === hoveredId) ?? null;
          setHoveredBranchName(matched ? matched.branch.name : null);
        }
      };

      const onPointerDown = (event: PointerEvent) => {
        pointerDownPos = { x: event.clientX, y: event.clientY };
      };

      const onPointerUp = (event: PointerEvent) => {
        const dist = Math.hypot(
          event.clientX - pointerDownPos.x,
          event.clientY - pointerDownPos.y
        );
        if (dist > 6) return; // Ignore orbit drags

        updateMouseCoords(event);
        raycaster.setFromCamera(_rayMouse, camera);
        const hits = raycaster.intersectObjects(hitProxies, false);
        const hitBranchId = hits[0]?.object.userData.branchId as BranchId | undefined;
        if (hitBranchId) {
          const found = beacons.find((b) => b.branch.id === hitBranchId);
          if (found) {
            setSelectedBranch(found.branch);
            // Smoothly focus camera toward clicked beacon
            const bx = found.group.position.x;
            const bz = found.group.position.z;
            camTransitionRef.current = {
              active: true,
              pos: new THREE.Vector3(bx * 1.85, 3.6, bz * 1.85),
              target: new THREE.Vector3(bx * 0.65, 1.0, bz * 0.65),
            };
          }
        }
      };

      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointerup', onPointerUp);

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        setWebglFailed(true);
      };
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

      const resizeObserver = new ResizeObserver(() => {
        if (!container || !renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w <= 0 || h <= 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      resizeObserver.observe(container);

      let frameId = 0;
      let timerId = 0;
      let disposed = false;
      let lastTime = performance.now();
      let elapsed = 0;
      let currentExplode = 0;

      const tick = () => {
        if (disposed || !renderer) return;
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.08);
        lastTime = now;
        const motionScale = reducedMotionRef.current ? 0.1 : 1.0;
        elapsed += dt * motionScale;

        // Smooth camera preset damping
        if (camTransitionRef.current.active) {
          const lerpAlpha = 1 - Math.exp(-5.0 * dt);
          camera.position.lerp(camTransitionRef.current.pos, lerpAlpha);
          controls.target.lerp(camTransitionRef.current.target, lerpAlpha);
          if (
            camera.position.distanceTo(camTransitionRef.current.pos) < 0.06 &&
            controls.target.distanceTo(camTransitionRef.current.target) < 0.06
          ) {
            camTransitionRef.current.active = false;
          }
        }

        // Smooth exploded-view interpolation via THREE.MathUtils.damp
        currentExplode = THREE.MathUtils.damp(currentExplode, explodeRef.current, 6, dt);
        for (let i = 0; i < core.explodableParts.length; i++) {
          const part = core.explodableParts[i];
          _targetExplodePos
            .copy(part.basePos)
            .addScaledVector(part.explodeOffset, currentExplode);
          part.object.position.copy(_targetExplodePos);
        }

        // Core kinetic rotation
        core.midRing.rotation.x += dt * 0.48 * motionScale;
        core.midRing.rotation.y += dt * 0.34 * motionScale;
        core.outerRing.rotation.z -= dt * 0.28 * motionScale;
        core.innerCore.rotation.y += dt * 0.9 * motionScale;

        // Branch beacons hover highlight & gentle levitation
        for (let i = 0; i < beacons.length; i++) {
          const b = beacons[i];
          const isHovered = hoveredId === b.branch.id;
          b.spire.rotation.y += dt * (isHovered ? 2.2 : 0.7) * motionScale;
          b.spire.position.y =
            b.baseY + Math.sin(elapsed * 1.9 + i * 0.9) * 0.08 + (isHovered ? 0.16 : 0);
          b.accentMaterial.emissiveIntensity = THREE.MathUtils.damp(
            b.accentMaterial.emissiveIntensity,
            isHovered ? 2.5 : 1.1,
            8,
            dt
          );
        }

        // Subtle orbital shards drift
        for (let i = 0; i < shards.basePositions.length; i++) {
          const bp = shards.basePositions[i];
          const sp = shards.speeds[i];
          const sc = shards.scales[i];
          const a = elapsed * sp * 0.14;
          const c = Math.cos(a);
          const s = Math.sin(a);
          _dummy.position.set(
            bp.x * c - bp.z * s,
            bp.y + Math.sin(elapsed * sp + i) * 0.15,
            bp.x * s + bp.z * c
          );
          _dummy.rotation.set(elapsed * sp * 0.5, elapsed * sp * 0.4, 0);
          _dummy.scale.setScalar(sc);
          _dummy.updateMatrix();
          shards.mesh.setMatrixAt(i, _dummy.matrix);
        }
        shards.mesh.instanceMatrix.needsUpdate = true;

        controls.update();
        renderer.render(scene, camera);

        if (isSoftwareGl) {
          scheduleAfterDraw(renderer, tick, (id) => {
            timerId = id;
          });
        } else {
          frameId = requestAnimationFrame(tick);
        }
      };

      tick();

      return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        clearTimeout(timerId);
        resizeObserver.disconnect();
        controls.removeEventListener('start', onControlStart);
        controls.dispose();
        renderer?.domElement.removeEventListener('pointermove', onPointerMove);
        renderer?.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer?.domElement.removeEventListener('pointerup', onPointerUp);
        renderer?.domElement.removeEventListener('webglcontextlost', handleContextLost);
        disposeObject3D(scene);
        envTexture.dispose();
        shadowTex.dispose();
        deckTex.dispose();
        renderer?.dispose();
        coreRef.current = null;
        if (container) container.innerHTML = '';
      };
    } catch {
      setWebglFailed(true);
      renderer?.dispose();
    }
  }, [compactPreview]);

  if (webglFailed) {
    return (
      <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border border-[#3B82F6]/20 bg-[#090F1C] p-8 text-center">
        <Compass className="mb-3 h-10 w-10 text-[#60A5FA]" />
        <h3 className="font-display text-lg font-semibold text-white">
          3D Viewport Unavailable
        </h3>
        <p className="mt-1 max-w-md text-sm text-[#94A3B8]">
          WebGL could not initialize in this browser context. You can still browse all 7 engineering branches and question papers directly.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#05070D] ${
        compactPreview
          ? 'h-[320px] rounded-2xl border border-[#3B82F6]/20'
          : 'h-[calc(100vh-8.5rem)] min-h-[540px] rounded-2xl border border-[#3B82F6]/20'
      }`}
    >
      {/* Dedicated isolated WebGL mount container */}
      <div ref={mountRef} className="h-full w-full" />

      {/* Minimal Top-Left Title / Hover Readout (no backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-1.5">
        <div className="webgl-hud-surface pointer-events-auto inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2">
          <span className="font-display text-xs font-bold tracking-wide text-[#F8FAFC]">
            3D Knowledge Vault
          </span>
          <span className="text-xs text-[#64748B]" aria-hidden="true">
            ·
          </span>
          <span className="text-xs text-[#94A3B8]">
            {hoveredBranchName
              ? `Click to inspect ${hoveredBranchName}`
              : 'Drag to orbit · Click any branch beacon'}
          </span>
        </div>

        {selectedBranch && !compactPreview && (
          <div className="webgl-hud-surface pointer-events-auto max-w-sm rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-[#60A5FA]">
                  {selectedBranch.shortCode} · Demo Mapping
                </p>
                <h4 className="mt-0.5 font-display text-base font-bold text-[#F8FAFC]">
                  {selectedBranch.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBranch(null)}
                className="rounded-lg px-2 py-1 text-xs text-[#94A3B8] transition-colors hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
              {selectedBranch.description}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#3B82F6]/15 pt-3">
              <span className="font-mono text-xs tabular-nums text-[#CBD5E1]">
                {resourceService.getPaperCountByBranch(selectedBranch.id)} Sample Papers
              </span>
              <button
                type="button"
                onClick={() => onSelectBranchPapers(selectedBranch.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#3B82F6] whitespace-nowrap"
              >
                Open Papers
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Compact preview portal action */}
      {compactPreview && onOpenFullVault && (
        <div className="absolute bottom-4 right-4 z-10">
          <button
            type="button"
            onClick={onOpenFullVault}
            className="webgl-hud-surface inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-[#F8FAFC] transition-colors hover:border-[#3B82F6]/60 hover:bg-[#0D1525] whitespace-nowrap"
          >
            Launch Full 3D Vault
            <ArrowUpRight className="h-3.5 w-3.5 text-[#60A5FA]" />
          </button>
        </div>
      )}

      {/* Full-mode Unified Collapsible Bottom Control Dock (zero center occlusion) */}
      {!compactPreview && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex flex-col items-center px-3">
          <button
            type="button"
            onClick={() => setDockOpen((prev) => !prev)}
            className="webgl-hud-surface pointer-events-auto mb-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#CBD5E1] transition-colors hover:text-white whitespace-nowrap"
          >
            {dockOpen ? (
              <>
                <ChevronDown className="h-3.5 w-3.5" /> Hide Controls (H)
              </>
            ) : (
              <>
                <ChevronUp className="h-3.5 w-3.5" /> Show Controls (H)
              </>
            )}
          </button>

          {dockOpen && (
            <div className="webgl-hud-surface pointer-events-auto flex w-full max-w-[900px] flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-3">
              {/* Exploded View Slider */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="vault-explode-slider"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#CBD5E1] whitespace-nowrap"
                >
                  <Layers className="h-3.5 w-3.5 text-[#60A5FA]" />
                  Explode Core
                </label>
                <input
                  id="vault-explode-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={explodeAmount}
                  onChange={(e) => setExplodeAmount(parseFloat(e.target.value))}
                  className="h-1.5 w-28 cursor-pointer accent-[#3B82F6]"
                />
                <span className="w-8 font-mono text-xs tabular-nums text-[#94A3B8]">
                  {Math.round(explodeAmount * 100)}%
                </span>
              </div>

              {/* Material Finish Switcher */}
              <div className="flex items-center gap-1 rounded-lg bg-[#05070D] p-1">
                {(
                  [
                    { id: 'obsidian', label: 'Obsidian' },
                    { id: 'titanium', label: 'Titanium' },
                    { id: 'cobalt', label: 'Cobalt' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFinish(item.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      finish === item.id
                        ? 'bg-[#2563EB] text-white'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Camera Presets */}
              <div className="flex items-center gap-1 rounded-lg bg-[#05070D] p-1">
                {(
                  [
                    { id: 'overview', label: 'Overview' },
                    { id: 'core', label: 'Core Focus' },
                    { id: 'orbital', label: 'Top Orbital' },
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyCameraPreset(preset.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      activePreset === preset.id
                        ? 'bg-[#1E293B] text-[#60A5FA]'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setExplodeAmount(0);
                    setSelectedBranch(null);
                    applyCameraPreset('overview');
                  }}
                  title="Reset view"
                  aria-label="Reset 3D view"
                  className="rounded-md p-1.5 text-[#94A3B8] transition-colors hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
