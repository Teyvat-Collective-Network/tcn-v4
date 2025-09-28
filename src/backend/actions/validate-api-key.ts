import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.string())
    .output(z.string().nullable())
    .query(
        trpcify("api:validate-api-key", async (token) => {
            try {
                const payload = jwt.verify(token, process.env.JWT_SECRET!);
                if (!payload) return null;
                const { user } = payload as { user: string };
                if (!user) return null;
                const entry = await db.query.apiKeys.findFirst({ where: eq(tables.apiKeys.user, user) });
                if (entry && entry.token === token) return user;
            } catch {}

            return null;
        }),
    );
