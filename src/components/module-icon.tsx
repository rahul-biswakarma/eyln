import { Triangle, Gear, Plant, Target, Cpu, Mountains, Lightbulb, Image, Lightning, ChartLineUp, ListNumbers, Vault, LinkSimple, TreeStructure, Graph, ArrowsDownUp, Brain, ChartBar, ArrowRight, ChartLineDown, MathOperations, Waveform, Compass, Cube, PuzzlePiece, Function as FunctionIcon, Cube as Fallback, type Icon, } from "@phosphor-icons/react";
const MODULE_ICONS: Record<string, Icon> = {
    "linear-algebra": Triangle,
    odin: Gear,
    "procedural-math": Plant,
    physics: Target,
    metal: Cpu,
    rendering: Mountains,
    lighting: Lightbulb,
    textures: Image,
    optimization: Lightning,
    "dsa-complexity": ChartLineUp,
    "dsa-arrays": ListNumbers,
    "dsa-hashing": Vault,
    "dsa-linear": LinkSimple,
    "dsa-trees": TreeStructure,
    "dsa-graphs": Graph,
    "dsa-sorting": ArrowsDownUp,
    "dsa-recursion": Brain,
    "math-functions": ChartBar,
    "math-limits": ArrowRight,
    "math-derivatives": ChartLineDown,
    "math-integrals": MathOperations,
    "math-curves": Waveform,
    "math-vector-calc": Compass,
};
const TRACK_ICONS: Record<string, Icon> = {
    engine: Cube,
    dsa: PuzzlePiece,
    math: FunctionIcon,
};
export function ModuleIcon({ id, size = 22, weight = "duotone", }: {
    id: string;
    size?: number;
    weight?: "duotone" | "fill" | "regular" | "bold";
}) {
    const Ic = MODULE_ICONS[id] ?? Fallback;
    return <Ic size={size} weight={weight}/>;
}
export function TrackIcon({ id, size = 22, weight = "duotone", }: {
    id: string;
    size?: number;
    weight?: "duotone" | "fill" | "regular" | "bold";
}) {
    const Ic = TRACK_ICONS[id] ?? Fallback;
    return <Ic size={size} weight={weight}/>;
}
