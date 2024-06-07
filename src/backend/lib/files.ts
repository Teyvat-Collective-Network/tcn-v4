import crypto from "crypto";
import { TextChannel } from "discord.js";
import { eq } from "drizzle-orm";
import bot, { channels } from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { trackMetrics } from "./metrics.js";

export async function addFile(url: string, content: string) {
    return await trackMetrics("fn:add-file", async () => {
        try {
            const { id } = await channels.fileDump.send({ content, files: [{ attachment: url }] });

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
    });
}

export async function getFile(uuid: string) {
    return await trackMetrics("fn:get-file", async () => {
        const entry = await db.query.files.findFirst({ where: eq(tables.files.uuid, uuid) });
        if (!entry) return null;

        try {
            const ch =
                entry.channel === channels.fileDump?.id ? channels.fileDump : (channels.fileDump = (await bot.channels.fetch(entry.channel)) as TextChannel);
            const message = await ch.messages.fetch({ message: entry.message, force: true });
            return message.attachments.first()!.url;
        } catch (error) {
            console.error(error);
        }

        return null;
    });
}
