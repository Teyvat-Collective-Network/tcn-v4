import { createTRPCClient, httpBatchLink } from "@trpc/client";
import "dotenv/config";
import { AppRouter } from "../backend/server.js";

export const api = createTRPCClient<AppRouter>({ links: [httpBatchLink({ url: `http://localhost:${process.env.API_PORT}` })] });
