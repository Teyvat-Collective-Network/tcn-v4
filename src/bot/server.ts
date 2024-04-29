import "dotenv/config";
import fetch from "./routes/fetch.js";
import submit from "./routes/submit.js";
import { router } from "./trpc.js";

export const appRouter = router({
    ...fetch,
    ...submit,
});

export type AppRouter = typeof appRouter;
