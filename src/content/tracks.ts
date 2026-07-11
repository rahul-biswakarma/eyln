import type { Track, TrackId } from "./types";

export const tracks: Track[] = [
  {
    id: "engine",
    title: "3D Game Engine",
    blurb: "Build a renderer by hand in Odin + Metal — from a triangle to procedural terrain.",
    icon: "🔺",
    accent: "#FFB000",
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    blurb: "Complexity, the core data structures, and the algorithmic patterns behind them.",
    icon: "🧩",
    accent: "#FF8A00",
  },
  {
    id: "math",
    title: "Mathematics",
    blurb: "Functions, limits, calculus, and the geometry of curves — the language underneath it all.",
    icon: "∫",
    accent: "#8FBF6B",
  },
];

export const DEFAULT_TRACK: TrackId = "engine";

export function getTrack(id: TrackId): Track | undefined {
  return tracks.find((t) => t.id === id);
}
