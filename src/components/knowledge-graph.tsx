import { useEffect, useRef, useState, useCallback } from "react";
import type { KnowledgeGraph, GraphNode, GraphNodeType } from "../lib/graph";
import { createForceLayout, nodeRadius, type LaidOutNode } from "../lib/force-layout";
const WIDTH = 900;
const HEIGHT = 640;
const TYPE_COLOR: Record<GraphNodeType, string> = {
    module: "#6366f1",
    lesson: "#0ea5e9",
    concept: "#a855f7",
    note: "#64748b",
    book: "#f59e0b",
};
function masteryColor(m: number): string {
    const hue = Math.round(m * 120);
    return `hsl(${hue}, 62%, 48%)`;
}
function nodeFill(n: GraphNode): string {
    if ((n.type === "module" || n.type === "lesson") && typeof n.mastery === "number") {
        return masteryColor(n.mastery);
    }
    return TYPE_COLOR[n.type];
}
export function KnowledgeGraphView({ graph, selectedId, onSelect, }: {
    graph: KnowledgeGraph;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}) {
    const svgRef = useRef<SVGSVGElement>(null);
    const posRef = useRef<Map<string, LaidOutNode>>(new Map());
    const [, forceRender] = useState(0);
    const [view, setView] = useState({ x: 0, y: 0, w: WIDTH, h: HEIGHT });
    const dragRef = useRef<{
        id: string | null;
        startX: number;
        startY: number;
    } | null>(null);
    const panRef = useRef<{
        x: number;
        y: number;
        vx: number;
        vy: number;
    } | null>(null);
    useEffect(() => {
        const layout = createForceLayout(graph, WIDTH, HEIGHT, () => {
            const map = new Map<string, LaidOutNode>();
            for (const n of layout.nodes)
                map.set(n.id, { id: n.id, x: n.x ?? 0, y: n.y ?? 0 });
            posRef.current = map;
            forceRender((v) => v + 1);
        });
        return () => layout.stop();
    }, [graph]);
    const clientToSvg = useCallback((clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg)
            return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        return {
            x: view.x + ((clientX - rect.left) / rect.width) * view.w,
            y: view.y + ((clientY - rect.top) / rect.height) * view.h,
        };
    }, [view]);
    const onWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 1.1 : 1 / 1.1;
        const p = clientToSvg(e.clientX, e.clientY);
        setView((v) => {
            const w = Math.max(200, Math.min(3000, v.w * factor));
            const h = w * (HEIGHT / WIDTH);
            return { x: p.x - (p.x - v.x) * (w / v.w), y: p.y - (p.y - v.y) * (h / v.h), w, h };
        });
    };
    const onPointerDown = (e: React.PointerEvent, id: string | null) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        const p = clientToSvg(e.clientX, e.clientY);
        if (id)
            dragRef.current = { id, startX: p.x, startY: p.y };
        else
            panRef.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (dragRef.current?.id) {
            const p = clientToSvg(e.clientX, e.clientY);
            const node = posRef.current.get(dragRef.current.id);
            if (node) {
                node.x = p.x;
                node.y = p.y;
                forceRender((v) => v + 1);
            }
        }
        else if (panRef.current) {
            const svg = svgRef.current;
            if (!svg)
                return;
            const rect = svg.getBoundingClientRect();
            const dx = ((e.clientX - panRef.current.x) / rect.width) * view.w;
            const dy = ((e.clientY - panRef.current.y) / rect.height) * view.h;
            setView((v) => ({ ...v, x: panRef.current!.vx - dx, y: panRef.current!.vy - dy }));
        }
    };
    const onPointerUp = () => {
        dragRef.current = null;
        panRef.current = null;
    };
    const pos = posRef.current;
    const neighborIds = new Set<string>();
    if (selectedId) {
        for (const e of graph.edges) {
            if (e.source === selectedId)
                neighborIds.add(e.target);
            if (e.target === selectedId)
                neighborIds.add(e.source);
        }
    }
    return (<svg ref={svgRef} className="kg-svg" viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} onWheel={onWheel} onPointerDown={(e) => onPointerDown(e, null)} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onClick={(e) => { if (e.target === svgRef.current)
        onSelect(null); }}>
      <g className="kg-edges">
        {graph.edges.map((e, i) => {
            const a = pos.get(e.source);
            const b = pos.get(e.target);
            if (!a || !b)
                return null;
            const active = selectedId && (e.source === selectedId || e.target === selectedId);
            return (<line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`kg-edge kg-edge-${e.type} ${active ? "active" : ""} ${selectedId && !active ? "dim" : ""}`}/>);
        })}
      </g>
      <g className="kg-nodes">
        {graph.nodes.map((n) => {
            const p = pos.get(n.id);
            if (!p)
                return null;
            const r = nodeRadius(n.degree);
            const selected = n.id === selectedId;
            const dim = selectedId && !selected && !neighborIds.has(n.id);
            return (<g key={n.id} transform={`translate(${p.x},${p.y})`} className={`kg-node kg-node-${n.type} ${selected ? "selected" : ""} ${dim ? "dim" : ""} ${n.weak ? "weak" : ""}`} onPointerDown={(e) => { e.stopPropagation(); onPointerDown(e, n.id); }} onClick={(e) => { e.stopPropagation(); onSelect(n.id); }}>
              <circle r={r} fill={nodeFill(n)}/>
              {(selected || r >= 11) && (<text className="kg-label" y={-r - 5}>{n.label}</text>)}
              <title>{`${n.type}: ${n.label}${typeof n.mastery === "number" ? ` · ${Math.round(n.mastery * 100)}% mastery` : ""}`}</title>
            </g>);
        })}
      </g>
    </svg>);
}
