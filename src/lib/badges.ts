export interface Badge {
    id: string;
    name: string;
    desc: string;
    icon: string;
    need: number;
}
export const BADGES: Badge[] = [
    { id: "spark", name: "First Spark", desc: "Complete your first lesson", icon: "Sparkle", need: 1 },
    { id: "apprentice", name: "Apprentice", desc: "Complete 5 lessons", icon: "Wrench", need: 5 },
    { id: "engineer", name: "Engineer", desc: "Complete 15 lessons", icon: "Gear", need: 15 },
    { id: "architect", name: "Architect", desc: "Complete 30 lessons", icon: "Blueprint", need: 30 },
    { id: "master", name: "Master Builder", desc: "Complete 50 lessons", icon: "Medal", need: 50 },
    { id: "legend", name: "Eyln Legend", desc: "Complete 90 lessons", icon: "Crown", need: 90 },
];
export function badgeState(lessonsDone: number) {
    return BADGES.map((b) => ({
        ...b,
        earned: lessonsDone >= b.need,
        progress: Math.min(1, lessonsDone / b.need),
    }));
}
export function levelFor(lessonsDone: number): number {
    return 1 + Math.floor(lessonsDone / 3);
}
