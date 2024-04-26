import { createTRPCClient, httpBatchLink } from "@trpc/client";
import "dotenv/config";
import type { AppRouter as BackendRouter } from "../../backend/server.js";
import type { AppRouter as BotRouter } from "../../bot/server.js";

export const trpc = createTRPCClient<BackendRouter>({ links: [httpBatchLink({ url: `http://localhost:${process.env.API_PORT}` })] });
export const bot = createTRPCClient<BotRouter>({ links: [httpBatchLink({ url: `http://localhost:${process.env.BOT_PORT}` })] });
