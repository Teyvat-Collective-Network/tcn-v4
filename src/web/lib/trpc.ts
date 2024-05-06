"use server";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import "dotenv/config";
import type { AppRouter as BackendRouter } from "../../backend/server.js";

export const api = createTRPCClient<BackendRouter>({ links: [httpBatchLink({ url: `http://localhost:${process.env.API_PORT}` })] });
