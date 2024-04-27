import "dotenv/config";
import apply from "../bot/routes/apply.js";
import root from "./routes/root.js";
import user from "./routes/user.js";
import { router } from "./trpc.js";

export const appRouter = router({
    ...apply,
    ...root,
    ...user,
});

export type AppRouter = typeof appRouter;
