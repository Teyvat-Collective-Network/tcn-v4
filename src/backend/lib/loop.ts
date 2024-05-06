export function loop(fn: () => unknown, delay: number) {
    async function inner() {
        try {
            await fn();
        } finally {
            setTimeout(inner, delay);
        }
    }

    inner();
}
