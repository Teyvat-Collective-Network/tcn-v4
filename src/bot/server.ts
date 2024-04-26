import "dotenv/config";
import z from "zod";
import bot from "./bot.js";
import { proc, router } from "./trpc.js";

export const appRouter = router({
    userGet: proc
        .input(z.string())
        .output(z.object({ id: z.string(), name: z.string(), image: z.string() }).nullable())
        .query(async ({ input: id }) => {
            const user = await bot.users.fetch(id).catch(() => null);
            if (!user) return null;
            return { id: user.id, name: user.displayName, image: user.displayAvatarURL({ forceStatic: true, size: 128 }) };
        }),
});

export type AppRouter = typeof appRouter;
