import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { triggerBanshareReminder } from "./banshares.js";
import bot from "./bot.js";
import install from "./modules/install.js";
import { appRouter } from "./server.js";

process.on("uncaughtException", console.error);

createHTTPServer({ router: appRouter }).listen(process.env.BOT_PORT);
console.log(`Listening on localhost:${process.env.BOT_PORT}`);

setTimeout(() => {
    triggerBanshareReminder();
    setInterval(triggerBanshareReminder, 60000);
}, 60000 - (Date.now() % 60000));

install(bot);
