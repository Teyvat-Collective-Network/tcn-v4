import { ButtonInteraction } from "discord.js";
import { and, eq, isNotNull } from "drizzle-orm";
import { channels } from "../../../bot.js";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { renderBanshare, renderBanshareControls, updateBanshareDashboard } from "../../../lib/banshares.js";
import { ensureObserver, promptConfirm, template } from "../../../lib/bot-lib.js";
import { bansharePublishQueue } from "../../../queue.js";

export default async function (interaction: ButtonInteraction) {
    await ensureObserver(interaction);

    const banshare = await db.query.banshares.findFirst({ columns: { id: true }, where: eq(tables.banshares.message, interaction.message.id) });
    if (!banshare) throw "Could not fetch this banshare.";

    const res = await promptConfirm(interaction, "Publish this banshare?");
    await res.update(template.info("Puublishing banshare..."));

    const [{ affectedRows }] = await db
        .update(tables.banshares)
        .set({ status: "published" })
        .where(and(eq(tables.banshares.id, banshare.id), eq(tables.banshares.status, "pending")));

    if (affectedRows === 0) return void res.editReply(template.error("This banshare is no longer pending."));

    await interaction.message.edit({ components: await renderBanshareControls(banshare.id) });

    await channels.logs.send(`${interaction.message.url} was published by ${interaction.user}.`);

    await res.editReply(
        template.ok(
            "This banshare is being published. You may dismiss this message. You may rescind the banshare to cancel unfinished publication / autoban tasks.",
        ),
    );

    try {
        const message = await channels.hubBanshares.send({ embeds: await renderBanshare(banshare.id) });
        await db.insert(tables.banshareHubPosts).values({ ref: banshare.id, channel: channels.hubBanshares.id, message: message.id });
    } catch (error) {
        channels.logs.send(`Failed to publish banshare to the TCN Hub: ${error}`);
        console.error(error);
    }

    const settings = await db.query.banshareSettings.findMany({ columns: { guild: true }, where: isNotNull(tables.banshareSettings.channel) });
    await bansharePublishQueue.addBulk(settings.map((setting) => ({ name: "", data: { id: banshare.id, guild: setting.guild } })));

    updateBanshareDashboard();
}
