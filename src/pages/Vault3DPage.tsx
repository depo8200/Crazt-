import { SpatialVault3D } from '../three/SpatialVault3D';
import { BranchId } from '../types/academic';

interface Vault3DPageProps {
  reducedMotion: boolean;
  onSelectBranchPapers: (branchId: BranchId) => void;
}

export function Vault3DPage({
  reducedMotion,
  onSelectBranchPapers,
}: Vault3DPageProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-[#60A5FA]">
            Interactive Spatial Explorer · Three.js WebGL
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
            3D Academic Knowledge Vault
          </h1>
        </div>
        <p className="text-xs text-[#94A3B8]">
          Click any orbiting branch beacon to inspect its demo catalog, or explode the central core layers.
        </p>
      </div>

      <SpatialVault3D
        reducedMotion={reducedMotion}
        onSelectBranchPapers={onSelectBranchPapers}
      />
    </div>
  );
}
