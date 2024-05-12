import { ModalSubmitInteraction } from "discord.js";
import { and, eq, not } from "drizzle-orm";
import { HUB, channels } from "../../../bot.js";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { audit } from "../../../lib/audit.js";
import { renderBanshareControls } from "../../../lib/banshares.js";
import { ensureObserver, template } from "../../../lib/bot-lib.js";
import { banshareRescindQueue } from "../../../queue.js";

export default async function (interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ ephemeral: true });
    await ensureObserver(interaction);

    const banshare = await db.query.banshares.findFirst({ columns: { id: true }, where: eq(tables.banshares.message, interaction.message!.id) });
    if (!banshare) throw "Could not fetch this banshare.";

    const [{ affectedRows }] = await db
        .update(tables.banshares)
        .set({ status: "rescinded" })
        .where(and(eq(tables.banshares.id, banshare.id), eq(tables.banshares.status, "published")));

    if (affectedRows === 0) throw "This banshare has already been rescinded.";

    const explanation = interaction.fields.getTextInputValue("explanation");

    await interaction.editReply(template.ok("This banshare is being rescinded. You may dismiss this message."));
    channels.logs.send(`${interaction.message?.url} was rescinded by ${interaction.user}.`);

    try {
        await interaction.message!.reply(`This banshare is being rescinded by an observer. The following explanation was given:\n\n>>> ${explanation}`);
        await interaction.message!.edit({ components: await renderBanshareControls(banshare.id) });
    } catch {}

    try {
        const entry = await db.query.banshareHubPosts.findFirst({
            columns: { channel: true, message: true },
            where: eq(tables.banshareHubPosts.ref, banshare.id),
        });

        if (!entry) throw "Hub banshare crosspost could not be fetched.";

        if (entry.channel !== channels.hubBanshares.id)
            await channels.hubBanshares.send(
                `https://discord.com/channels/${HUB.id}/${entry.channel}/${entry.message} is being rescinded by an observer. The following explanation was given:\n\n>>> ${explanation}`,
            );
        else {
            const message = await channels.hubBanshares.messages.fetch(entry.message);
            await message.reply(`This banshare is being rescinded by an observer. The following explanation was given:\n\n>>> ${explanation}`);
        }
    } catch (error) {
        channels.logs.send(`<@&${process.env.ROLE_TECH_TEAM}> Failed to send rescind notice to the TCN Hub: ${error}`);
        console.error(error);
    }

    const posts = await db.query.banshareCrossposts.findMany({
        columns: { guild: true, channel: true, message: true },
        where: and(eq(tables.banshareCrossposts.ref, banshare.id), not(eq(tables.banshareCrossposts.guild, HUB.id))),
    });

    await banshareRescindQueue.addBulk(
        posts.map((post) => ({ name: "", data: { id: banshare.id, guild: post.guild, channel: post.channel, message: post.message, explanation } })),
    );

    await audit(interaction.user.id, "banshares/rescind", null, { banshare: banshare.id, explanation }, [interaction.message!.id]);
}
