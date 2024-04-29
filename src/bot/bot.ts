import { Channel, Client, Events, ForumChannel, IntentsBitField, TextChannel } from "discord.js";
import "dotenv/config";

const Intents = IntentsBitField.Flags;

const client = new Client({ intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent, allowedMentions: { parse: [] } });

const promise = new Promise<Client<true>>((r) => client.on(Events.ClientReady, r));
await client.login(process.env.TOKEN);

const bot = await promise;
export default bot;

console.log(`Logged in as ${bot.user.tag}.`);

export const HQ = await bot.guilds.fetch(process.env.HQ!);
export const HUB = await bot.guilds.fetch(process.env.HUB!);

async function get<T extends Channel>(key: string) {
    return (await bot.channels.fetch(process.env[key]!)) as T;
}

export const channels = {
    applicants: await get<ForumChannel>("CH_APPLICANTS"),
    officialBusiness: await get<TextChannel>("CH_OFFICIAL_BUSINESS"),
    banshareLogs: await get<TextChannel>("CH_BANSHARE_LOGS"),
    execManagement: await get<TextChannel>("CH_EXEC_MANAGEMENT"),
    logs: await get<TextChannel>("CH_BOT_LOGS"),
    hubBanshares: await get<TextChannel>("CH_HUB_BANSHARES"),
    banshareDashboard: await get<TextChannel>("CH_BANSHARE_DASHBOARD"),
};
