import { ShaderEditor } from "../widgets/ShaderEditor";
import { NoiseExplorer } from "../widgets/NoiseExplorer";
import { SplineEditor } from "../widgets/SplineEditor";
import { TransformPipeline3D } from "../widgets/TransformPipeline3D";
import { VectorPlayground } from "../widgets/VectorPlayground";
import { TerrainField } from "../widgets/TerrainField";

export function Playground() {
  return (
    <div className="dash">
      <div className="dash-head pg-head">
        <div>
          <div className="eyebrow">Live Systems</div>
          <h1>Playground</h1>
          <div className="sub">
            Every live demo from the course, in one place. Edit a shader, tune noise, drag a spline —
            all running on your GPU right now.
          </div>
        </div>
      </div>

      <div className="chip-row">
        <span className="chip active">All demos</span>
        <span className="chip ghost">WebGPU + Canvas</span>
      </div>

      <div className="pg-grid">
        <div>
          <h3 style={{ marginTop: 0 }}>🔩 Live shader</h3>
          <ShaderEditor />
        </div>
        <div>
          <h3 style={{ marginTop: 0 }}>🧊 Model · View · Projection</h3>
          <TransformPipeline3D />
        </div>
        <div>
          <h3 style={{ marginTop: 0 }}>🌱 Noise → terrain</h3>
          <NoiseExplorer />
        </div>
        <div>
          <h3 style={{ marginTop: 0 }}>🏔️ Heightfield terrain</h3>
          <TerrainField />
        </div>
        <div>
          <h3 style={{ marginTop: 0 }}>🧱 Spline → wall</h3>
          <SplineEditor />
        </div>
        <div>
          <h3 style={{ marginTop: 0 }}>📐 Vectors</h3>
          <VectorPlayground />
        </div>
      </div>
    </div>
  );
}
