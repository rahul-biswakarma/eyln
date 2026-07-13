import { TriangleIcon, GearIcon, PlantIcon, TargetIcon, CpuIcon, MountainsIcon, LightbulbIcon, ImageIcon, LightningIcon, ChartLineUpIcon, ListNumbersIcon, VaultIcon, LinkSimpleIcon, TreeStructureIcon, GraphIcon, ArrowsDownUpIcon, BrainIcon, ChartBarIcon, ArrowRightIcon, ChartLineDownIcon, MathOperationsIcon, WaveformIcon, CompassIcon, CubeIcon, PuzzlePieceIcon, FunctionIcon, CubeIcon as Fallback, type Icon } from "@phosphor-icons/react";
const MODULE_ICONS: Record<string, Icon> = {
    "linear-algebra": TriangleIcon,
    odin: GearIcon,
    "procedural-math": PlantIcon,
    physics: TargetIcon,
    metal: CpuIcon,
    rendering: MountainsIcon,
    lighting: LightbulbIcon,
    textures: ImageIcon,
    optimization: LightningIcon,
    "dsa-complexity": ChartLineUpIcon,
    "dsa-arrays": ListNumbersIcon,
    "dsa-hashing": VaultIcon,
    "dsa-linear": LinkSimpleIcon,
    "dsa-trees": TreeStructureIcon,
    "dsa-graphs": GraphIcon,
    "dsa-sorting": ArrowsDownUpIcon,
    "dsa-recursion": BrainIcon,
    "math-functions": ChartBarIcon,
    "math-limits": ArrowRightIcon,
    "math-derivatives": ChartLineDownIcon,
    "math-integrals": MathOperationsIcon,
    "math-curves": WaveformIcon,
    "math-vector-calc": CompassIcon,
};
const TRACK_ICONS: Record<string, Icon> = {
    engine: CubeIcon,
    dsa: PuzzlePieceIcon,
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
