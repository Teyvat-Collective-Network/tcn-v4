import "dotenv/config";
import apply from "./routes/apply.js";
import banshareSettings from "./routes/banshare-settings.js";
import banshares from "./routes/banshares.js";
import global from "./routes/global.js";
import guilds from "./routes/guilds.js";
import root from "./routes/root.js";
import user from "./routes/user.js";
import { router } from "./trpc.js";

export const appRouter = router({
    ...apply,
    ...banshareSettings,
    ...banshares,
    ...global,
    ...guilds,
    ...root,
    ...user,
});

export type AppRouter = typeof appRouter;
