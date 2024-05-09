import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { channels } from "./bot.js";
import "./modules/applications";
import "./modules/banshares";
import "./modules/commands";
import "./modules/components";
import "./modules/polls";
import "./modules/rolesync";
import { appRouter } from "./server.js";

process.on("uncaughtException", (error) => {
    channels.logs.send({
        content: `<@&${process.env.ROLE_TECH_TEAM}> Uncaught Exception: \`\`\`\n${`${error}`.slice(0, 1960)}\n\`\`\``,
        allowedMentions: { roles: [process.env.ROLE_TECH_TEAM!] },
    });

    console.error(error);
});

createHTTPServer({ router: appRouter }).listen(process.env.API_PORT);
console.log(`Listening on localhost:${process.env.API_PORT}`);
