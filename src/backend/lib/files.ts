import { TextChannel } from "discord.js";
import { eq } from "drizzle-orm";
import bot, { channels } from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";

export async function addFile(url: string) {
    try {
        const { id } = await channels.fileDump.send({ files: [{ attachment: url }] });

        while (true) {
            const uuid = crypto.randomUUID();
            if (!!(await db.query.files.findFirst({ where: eq(tables.files.uuid, uuid) }))) continue;

            await db.insert(tables.files).values({ uuid, channel: channels.fileDump.id, message: id });
            return `${process.env.DOMAIN}/file/${uuid}`;
        }
    } catch (error) {
        console.error(error);
        return url;
    }
}

export async function mapFiles(files: { name: string; url: string }[]) {
    return await Promise.all(files.map(async ({ name, url }) => ({ name, url: await addFile(url) })));
}

export async function getFile(uuid: string) {
    const entry = await db.query.files.findFirst({ where: eq(tables.files.uuid, uuid) });
    if (!entry) return null;

    try {
        const ch = entry.channel === channels.fileDump?.id ? channels.fileDump : (channels.fileDump = (await bot.channels.fetch(entry.channel)) as TextChannel);
        const message = await ch.messages.fetch({ message: entry.message, force: true });
        return message.attachments.first()!.url;
    } catch (error) {
        console.error(error);
    }

    return null;
}
