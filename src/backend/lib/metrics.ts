import { channels } from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";

export async function trackMetrics<T>(key: string, fn: () => Promise<T>, area?: string): Promise<T> {
    const start = Date.now();
    let errored = false;

    try {
        return await fn();
    } catch (error) {
        errored = true;
        throw error;
    } finally {
        const end = Date.now();

        db.insert(tables.speedMetrics)
            .values({ key, area: area ?? key, time: start, duration: end - start, errored })
            .catch((error) => channels.logs.send(`Failed to insert speed metric for \`${area ?? key}\` => \`${key}\`: ${error}.`));
    }
}
