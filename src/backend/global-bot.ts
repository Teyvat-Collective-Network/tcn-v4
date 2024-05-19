import { Client, Events, IntentsBitField, Partials } from "discord.js";
import "dotenv/config";

const Intents = IntentsBitField.Flags;

const client = new Client({
    intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent | Intents.GuildMembers,
    partials: [Partials.Message],
    allowedMentions: { parse: [] },
    sweepers: { messages: { interval: 3600000, lifetime: 3600000 } },
});

const promise = new Promise<Client<true>>((r) => client.on(Events.ClientReady, r));
await client.login(process.env.GLOBAL_TOKEN);

const globalBot = await promise;
export default globalBot;

console.log(`Logged in as ${globalBot.user.tag} (global chat).`);
