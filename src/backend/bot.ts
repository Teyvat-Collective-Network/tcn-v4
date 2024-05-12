import { Channel, Client, Events, ForumChannel, Guild, IntentsBitField, TextChannel } from "discord.js";
import "dotenv/config";

const Intents = IntentsBitField.Flags;

const client = new Client({ intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent | Intents.GuildMembers, allowedMentions: { parse: [] } });

const promise = new Promise<Client<true>>((r) => client.on(Events.ClientReady, r));
await client.login(process.env.TOKEN);

const bot = await promise;
export default bot;

console.log(`Logged in as ${bot.user.tag}.`);

export const HQ = await bot.guilds.fetch(process.env.HQ!);
export const HUB = await bot.guilds.fetch(process.env.HUB!);

async function get<T extends Channel>(key: string) {
    return (await bot.channels.fetch(process.env[`CH_${key}`]!)) as T;
}

export const channels = {
    applicants: await get<ForumChannel>("APPLICANTS"),
    officialBusiness: await get<TextChannel>("OFFICIAL_BUSINESS"),
    banshareLogs: await get<TextChannel>("BANSHARE_LOGS"),
    execManagement: await get<TextChannel>("EXEC_MANAGEMENT"),
    logs: await get<TextChannel>("BOT_LOGS"),
    hubBanshares: await get<TextChannel>("HUB_BANSHARES"),
    banshareDashboard: await get<TextChannel>("BANSHARE_DASHBOARD"),
    voteHere: await get<TextChannel>("VOTE_HERE"),
    elections: await get<ForumChannel>("ELECTIONS"),
};

async function getRole(guild: Guild, key: string) {
    return (await guild.roles.fetch(process.env[`ROLE_${key}`]!))!;
}

export const roles = {
    hqVoters: await getRole(HQ, "VOTERS"),
    hqOwners: await getRole(HQ, "SERVER_OWNERS"),
    hqAdvisors: await getRole(HQ, "COUNCIL_ADVISORS"),
    hubOwners: await getRole(HUB, "HUB_OWNERS"),
    hubAdvisors: await getRole(HUB, "HUB_ADVISORS"),
    hqMainsAnchor: await getRole(HQ, "HQ_MAINS_ANCHOR"),
    hqMainsEnd: await getRole(HQ, "HQ_MAINS_END"),
    hubMainsAnchor: await getRole(HUB, "HUB_MAINS_ANCHOR"),
    hubMainsEnd: await getRole(HUB, "HUB_MAINS_END"),
};
