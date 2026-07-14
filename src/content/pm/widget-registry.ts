import type React from "react";
import { IntegratorDemo } from "../../widgets/IntegratorDemo";
import { MatrixTransform2D } from "../../widgets/MatrixTransform2D";
import { NoiseExplorer } from "../../widgets/NoiseExplorer";
import { ShaderEditor } from "../../widgets/ShaderEditor";
import { SplineEditor } from "../../widgets/SplineEditor";
import { TerrainField } from "../../widgets/TerrainField";
import { TransformPipeline3D } from "../../widgets/TransformPipeline3D";
import { TriangleDemo } from "../../widgets/TriangleDemo";
import { VectorPlayground } from "../../widgets/VectorPlayground";

/**
 * The only surviving coupling between cloud content and app code: interactive
 * widgets live here, keyed by a stable `ref`. Lesson JSON carries `{ ref }`
 * (widgets currently take no props) and the `widget` node renders WIDGETS[ref].
 */
export const WIDGETS: Record<string, React.FC<Record<string, unknown>>> = {
    "integrator-demo": IntegratorDemo,
    "matrix-transform-2d": MatrixTransform2D,
    "noise-explorer": NoiseExplorer,
    "shader-editor": ShaderEditor,
    "spline-editor": SplineEditor,
    "terrain-field": TerrainField,
    "transform-pipeline-3d": TransformPipeline3D,
    "triangle-demo": TriangleDemo,
    "vector-playground": VectorPlayground,
};

/** Maps a legacy widget component name to its registry ref (used by the P3 extractor). */
export const WIDGET_NAME_TO_REF: Record<string, string> = {
    IntegratorDemo: "integrator-demo",
    MatrixTransform2D: "matrix-transform-2d",
    NoiseExplorer: "noise-explorer",
    ShaderEditor: "shader-editor",
    SplineEditor: "spline-editor",
    TerrainField: "terrain-field",
    TransformPipeline3D: "transform-pipeline-3d",
    TriangleDemo: "triangle-demo",
    VectorPlayground: "vector-playground",
};

export function getWidget(ref: string): React.FC<Record<string, unknown>> | undefined {
    return WIDGETS[ref];
}
