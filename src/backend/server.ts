import "dotenv/config";
import root from "./routes/root.js";
import user from "./routes/user.js";
import { router } from "./trpc.js";

export const appRouter = router({
    ...root,
    ...user,
});

export type AppRouter = typeof appRouter;
