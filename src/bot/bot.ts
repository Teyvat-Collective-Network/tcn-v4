import { Client } from "discord.js";
import "dotenv/config";

const bot = new Client({ intents: 0 });

await bot.login(process.env.TOKEN);

console.log(`Logged in as ${bot.user?.tag}.`);

export default bot;
