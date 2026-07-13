export function groupByTimeline<T>(items: T[], getTime: (item: T) => number, now: number): [
    string,
    T[]
][] {
    const startOfDay = (ms: number) => {
        const d = new Date(ms);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    };
    const today = startOfDay(now);
    const yesterday = today - 86400000;
    const weekAgo = today - 7 * 86400000;
    const buckets: Record<string, T[]> = { Today: [], Yesterday: [], "Last Week": [], Earlier: [] };
    for (const item of items) {
        const t = startOfDay(getTime(item));
        if (t === today)
            buckets.Today.push(item);
        else if (t === yesterday)
            buckets.Yesterday.push(item);
        else if (t >= weekAgo)
            buckets["Last Week"].push(item);
        else
            buckets.Earlier.push(item);
    }
    return Object.entries(buckets).filter(([, list]) => list.length > 0);
}
