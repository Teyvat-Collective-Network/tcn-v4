import { Guild } from "discord.js";
import { api } from "./api.js";

export async function isTCN(guild: Guild | string, allowHQ: boolean = false, allowHub: boolean = false) {
    const id = typeof guild === "string" ? guild : guild.id;

    if (id === process.env.HQ) return allowHQ;
    if (id === process.env.HUB) return allowHub;

    const name = await api.getGuildName.query(id);
    return name !== null;
}
