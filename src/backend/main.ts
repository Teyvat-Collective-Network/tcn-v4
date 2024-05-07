import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { channels } from "./bot.js";
import "./modules/applications";
import "./modules/commands";
import "./modules/components";
import "./modules/polls";
import "./modules/rolesync";
import { appRouter } from "./server.js";

process.on("uncaughtException", (error) => {
    channels.logs.send(`Uncaught Exception: \`\`\`\n${error}\n\`\`\``);
    console.error(error);
});

createHTTPServer({ router: appRouter }).listen(process.env.API_PORT);
console.log(`Listening on localhost:${process.env.API_PORT}`);
