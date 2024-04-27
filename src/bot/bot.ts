import { Channel, Client, ForumChannel, IntentsBitField, TextChannel } from "discord.js";
import "dotenv/config";

const Intents = IntentsBitField.Flags;

const bot = new Client({ intents: 0 });

await bot.login(process.env.TOKEN);

console.log(`Logged in as ${bot.user?.tag}.`);

export default bot;

export const HQ = await bot.guilds.fetch(process.env.HQ!);
export const HUB = await bot.guilds.fetch(process.env.HUB!);

async function get<T extends Channel>(key: string) {
    return (await bot.channels.fetch(process.env[key]!)) as T;
}

export const channels = {
    applicants: await get<ForumChannel>("CH_APPLICANTS"),
    officialBusiness: await get<TextChannel>("CH_OFFICIAL_BUSINESS"),
};
