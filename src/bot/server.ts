import "dotenv/config";
import apply from "./routes/apply.js";
import fetch from "./routes/fetch.js";
import { router } from "./trpc.js";

export const appRouter = router({
    ...apply,
    ...fetch,
});

export type AppRouter = typeof appRouter;
