import { Channel, Client, Events, ForumChannel, Guild, IntentsBitField, TextChannel, VoiceChannel } from "discord.js";
import "dotenv/config";

const Intents = IntentsBitField.Flags;

const client = new Client({
    intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent | Intents.GuildMembers,
    allowedMentions: { parse: [] },
    sweepers: { messages: { interval: 3600000, lifetime: 60000 } },
});

const promise = new Promise<Client<true>>((r) => client.on(Events.ClientReady, r));
await client.login(process.env.TOKEN);

const bot = await promise;
export default bot;

console.log(`Logged in as ${bot.user.tag}.`);

export const HQ = await bot.guilds.fetch(process.env.HQ!);
export const HUB = await bot.guilds.fetch(process.env.HUB!);

async function get<T extends Channel>(key: string) {
    try {
        return (await bot.channels.fetch(process.env[`CH_${key}`]!)) as T;
    } catch {
        throw `Failed to get channel: ${key}`;
    }
}

export const channels = {
    applicants: await get<ForumChannel>("APPLICANTS"),
    officialBusiness: await get<TextChannel>("OFFICIAL_BUSINESS"),
    reports: await get<TextChannel>("REPORTS"),
    observerManagement: await get<TextChannel>("OBSERVER_MANAGEMENT"),
    logs: await get<TextChannel>("BOT_LOGS"),
    hubReports: await get<TextChannel>("HUB_REPORTS"),
    reportsDashboard: await get<TextChannel>("REPORTS_DASHBOARD"),
    voteHere: await get<TextChannel>("VOTE_HERE"),
    elections: await get<ForumChannel>("ELECTIONS"),
    hqPartnerList: await get<TextChannel>("HQ_PARTNER_LIST"),
    hubPartnerList: await get<TextChannel>("HUB_PARTNER_LIST"),
    fileDump: await get<TextChannel>("FILE_DUMP"),
    globalModLogs: await get<TextChannel>("HUB_GLOBAL_MOD_LOGS"),
    statsMembers: await get<VoiceChannel>("STATS_MEMBERS"),
    statsServers: await get<VoiceChannel>("STATS_SERVERS"),
    statsQuorum60: await get<VoiceChannel>("STATS_QUORUM_60"),
    statsQuorum75: await get<VoiceChannel>("STATS_QUORUM_75"),
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
