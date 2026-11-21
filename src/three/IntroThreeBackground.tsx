import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  buildAcademicCoreAssembly,
  buildKnowledgeShardsInstanced,
} from './academicCoreModel';
import {
  applyStudioEnvironment,
  createRadialShadowTexture,
  createStudioRenderer,
  createThreePointStudioLights,
  detectSoftwareWebGL,
  disposeObject3D,
  scheduleAfterDraw,
} from './sceneUtils';

interface IntroThreeBackgroundProps {
  stage: 1 | 2 | 3;
  reducedMotion: boolean;
}

const _dummy = new THREE.Object3D();
const _targetCamPos = new THREE.Vector3();

export function IntroThreeBackground({
  stage,
  reducedMotion,
}: IntroThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<1 | 2 | 3>(stage);
  const reducedMotionRef = useRef<boolean>(reducedMotion);
  const [webglFailed, setWebglFailed] = useState(false);

  stageRef.current = stage;
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      const isSoftwareGl = detectSoftwareWebGL();
      renderer = createStudioRenderer(isSoftwareGl);
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x05070d);
      scene.fog = new THREE.FogExp2(0x05070d, 0.062);

      const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
      camera.position.set(0, 2.2, 8.6);

      const envTexture = applyStudioEnvironment(scene, renderer);
      createThreePointStudioLights(scene, isSoftwareGl);

      const shadowTex = createRadialShadowTexture();
      const core = buildAcademicCoreAssembly(isSoftwareGl, shadowTex);
      core.root.position.set(0, -1.65, 0);
      scene.add(core.root);

      const shards = buildKnowledgeShardsInstanced(120);
      scene.add(shards.mesh);

      // Subtle architectural radial horizon rings
      const horizonGroup = new THREE.Group();
      const ringMat = new THREE.LineBasicMaterial({
        color: 0x2563eb,
        transparent: true,
        opacity: 0.24,
      });
      [4.2, 6.4, 8.8].forEach((r) => {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 72; i++) {
          const a = (i / 72) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * r, -1.62, Math.sin(a) * r));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        horizonGroup.add(new THREE.LineLoop(geo, ringMat));
      });
      scene.add(horizonGroup);

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        setWebglFailed(true);
      };
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

      const onResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      let frameId = 0;
      let timerId = 0;
      let disposed = false;
      let lastTime = performance.now();
      let elapsed = 0;

      const tick = () => {
        if (disposed || !renderer) return;
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.08);
        lastTime = now;
        const motionScale = reducedMotionRef.current ? 0.12 : 1.0;
        elapsed += dt * motionScale;

        const currentStage = stageRef.current;

        // Smooth stage-reactive camera choreography
        if (currentStage === 1) {
          _targetCamPos.set(
            Math.sin(elapsed * 0.45) * 1.4,
            1.6 + Math.cos(elapsed * 0.35) * 0.3,
            7.4
          );
        } else if (currentStage === 2) {
          _targetCamPos.set(0, 2.8, 10.6);
        } else {
          _targetCamPos.set(
            Math.sin(elapsed * 1.15) * 3.1,
            2.1 + Math.sin(elapsed * 0.7) * 0.65,
            6.5
          );
        }

        const dampFactor = 1 - Math.exp(-3.2 * dt);
        camera.position.lerp(_targetCamPos, dampFactor);
        camera.lookAt(0, 0.1, 0);

        // Animate composite core rings & crystal
        const speedBoost = currentStage === 3 ? 2.1 : currentStage === 2 ? 0.55 : 1.0;
        core.root.rotation.y += dt * 0.24 * speedBoost * motionScale;
        core.midRing.rotation.x += dt * 0.65 * speedBoost * motionScale;
        core.midRing.rotation.y += dt * 0.42 * speedBoost * motionScale;
        core.outerRing.rotation.z -= dt * 0.38 * speedBoost * motionScale;
        core.innerCore.rotation.y -= dt * 1.2 * speedBoost * motionScale;
        core.innerCore.position.y = 1.65 + Math.sin(elapsed * 2.2) * 0.12;

        // Animate instanced shards with zero per-frame allocations
        const count = shards.basePositions.length;
        for (let i = 0; i < count; i++) {
          const bp = shards.basePositions[i];
          const sp = shards.speeds[i];
          const sc = shards.scales[i];
          const orbitAngle = elapsed * sp * 0.22 * speedBoost;
          const cosA = Math.cos(orbitAngle);
          const sinA = Math.sin(orbitAngle);
          _dummy.position.set(
            bp.x * cosA - bp.z * sinA,
            bp.y + Math.sin(elapsed * sp + i) * 0.22,
            bp.x * sinA + bp.z * cosA
          );
          _dummy.rotation.set(elapsed * sp, elapsed * sp * 0.7, 0);
          _dummy.scale.setScalar(sc);
          _dummy.updateMatrix();
          shards.mesh.setMatrixAt(i, _dummy.matrix);
        }
        shards.mesh.instanceMatrix.needsUpdate = true;

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
        window.removeEventListener('resize', onResize);
        renderer?.domElement.removeEventListener('webglcontextlost', handleContextLost);
        disposeObject3D(scene);
        envTexture.dispose();
        shadowTex.dispose();
        renderer?.dispose();
        if (container) container.innerHTML = '';
      };
    } catch {
      setWebglFailed(true);
      renderer?.dispose();
    }
  }, []);

  if (webglFailed) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[#05070D]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 42%, rgba(37, 99, 235, 0.24), transparent 56%)',
        }}
      />
    );
  }

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 h-full w-full overflow-hidden"
    />
  );
}
