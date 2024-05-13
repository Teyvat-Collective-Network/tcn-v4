import { and, eq, or } from "drizzle-orm";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { majorTypes, unrestrictedTypes } from "./polls.js";

export async function getVoters(unrestricted: boolean) {
    const guilds = await db.query.guilds.findMany({ columns: { owner: true, advisor: true, delegated: true } });

    if (unrestricted) return [...new Set(guilds.flatMap((guild) => [guild.owner, guild.advisor || []].flat()))];
    else return [...new Set(guilds.map((guild) => (guild.delegated ? guild.advisor! : guild.owner)).filter((id) => id))];
}

export async function getTurnoutAndQuorum(id: number, type: string): Promise<[number, boolean]> {
    const voters = new Set(await getVoters(unrestrictedTypes.includes(type)));
    const entries = await db.query.voteTracker.findMany({ columns: { user: true }, where: eq(tables.voteTracker.poll, id) });

    const count = entries.filter((entry) => voters.has(entry.user)).length;
    return [count / voters.size, count * 100 >= voters.size * (majorTypes.includes(type) ? 75 : 60)];
}

export async function getTurnout(id: number, type: string) {
    return (await getTurnoutAndQuorum(id, type))[0];
}

export async function getQuorum(id: number, type: string) {
    return (await getTurnoutAndQuorum(id, type))[1];
}

export async function isObserver(user: string) {
    return !!(await db.query.users.findFirst({ where: and(eq(tables.users.id, user), eq(tables.users.observer, true)) }));
}

export async function isCouncil(user: string) {
    return !!(await db.query.guilds.findFirst({ columns: { id: true }, where: or(eq(tables.guilds.advisor, user), eq(tables.guilds.owner, user)) }));
}
