import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./server.js";

process.on("uncaughtException", console.error);

createHTTPServer({ router: appRouter }).listen(process.env.API_PORT);
console.log(`Listening on localhost:${process.env.API_PORT}`);
