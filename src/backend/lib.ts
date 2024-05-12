export function timestamp(date: number | Date, format?: "t" | "T" | "d" | "D" | "f" | "F" | "R"): string {
    return `<t:${Math.floor((typeof date === "number" ? date : date.getTime()) / 1000)}${format ? `:${format}` : ""}>`;
}

export function timeinfo(date: number | Date | undefined | null) {
    if (!date) return "(unknown time)";
    return `${timestamp(date)} (${timestamp(date, "R")})`;
}

export function englishList(x: any[]) {
    return x.length === 0 ? "[none]" : x.length === 1 ? `${x[0]}` : x.length === 2 ? `${x[0]} and ${x[1]}` : `${x.slice(0, -1).join(", ")}, and ${x.at(-1)}`;
}

export function shuffle<T>(items: T[]) {
    const output: T[] = [];

    while (items.length) {
        const index = Math.floor(Math.random() * items.length);
        output.push(items.splice(index, 1)[0]);
    }

    return output;
}
