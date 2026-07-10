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
        <div className="pg-item"><ShaderEditor /></div>
        <div className="pg-item"><TransformPipeline3D /></div>
        <div className="pg-item"><NoiseExplorer /></div>
        <div className="pg-item"><TerrainField /></div>
        <div className="pg-item"><SplineEditor /></div>
        <div className="pg-item"><VectorPlayground /></div>
      </div>
    </div>
  );
}
