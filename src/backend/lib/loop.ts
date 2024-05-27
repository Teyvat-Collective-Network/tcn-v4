import { trackMetrics } from "./metrics.js";

export function loop(name: string, fn: () => unknown, delay: number) {
    async function inner() {
        try {
            await trackMetrics(`loop:${name}`, async () => await fn());
        } finally {
            setTimeout(inner, delay);
        }
    }

    inner();
}
