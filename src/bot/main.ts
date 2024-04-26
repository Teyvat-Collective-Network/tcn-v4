import { createHTTPServer } from "@trpc/server/adapters/standalone";
import "./bot.js";
import { appRouter } from "./server.js";

createHTTPServer({ router: appRouter }).listen(process.env.BOT_PORT);
console.log(`Listening on localhost:${process.env.BOT_PORT}`);
