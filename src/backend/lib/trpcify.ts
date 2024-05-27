import { trackMetrics } from "./metrics.js";

export default function <T, U>(name: string, fn: (data: T) => Promise<U>): (_: { input: T }) => Promise<U> {
    return async ({ input }: { input: T }) => await trackMetrics(name, () => fn(input));
}
