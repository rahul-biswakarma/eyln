import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, type Simulation, } from "d3-force";
import type { KnowledgeGraph } from "./graph";
export interface LaidOutNode {
    id: string;
    x: number;
    y: number;
}
interface SimNode {
    id: string;
    radius: number;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}
interface SimLink {
    source: string;
    target: string;
}
export interface ForceLayout {
    nodes: SimNode[];
    simulation: Simulation<SimNode, SimLink>;
    stop: () => void;
}
export function nodeRadius(degree: number): number {
    return 6 + Math.min(14, Math.sqrt(degree) * 3);
}
export function createForceLayout(graph: KnowledgeGraph, width: number, height: number, onTick: () => void): ForceLayout {
    const nodes: SimNode[] = graph.nodes.map((n) => ({ id: n.id, radius: nodeRadius(n.degree) }));
    const links: SimLink[] = graph.edges.map((e) => ({ source: e.source, target: e.target }));
    const simulation = forceSimulation<SimNode, SimLink>(nodes)
        .force("link", forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(70).strength(0.4))
        .force("charge", forceManyBody().strength(-160))
        .force("center", forceCenter(width / 2, height / 2))
        .force("collide", forceCollide<SimNode>().radius((d) => d.radius + 4))
        .on("tick", onTick);
    return {
        nodes,
        simulation,
        stop: () => simulation.stop(),
    };
}
