import { ButtonInteraction } from "discord.js";
import jwt from "jsonwebtoken";
import { ensureCouncil, template } from "../../../../lib/bot-lib.js";
import { verifyTypeAndFetchPollID } from "../../../../lib/polls.js";

export default async function (interaction: ButtonInteraction) {
    await interaction.deferReply({ ephemeral: true });
    await ensureCouncil(interaction);

    const id = await verifyTypeAndFetchPollID(interaction.message.id, "election");

    const token = jwt.sign({ type: "election-open", id, user: interaction.user.id, time: Date.now() }, process.env.JWT_SECRET!);

    await interaction.editReply(
        template.info(
            `Please visit [this webpage](${process.env.DOMAIN}/election/${id}?token=${token}) to vote. You have one minute to open this webpage. Do **not** share this link with anyone, as it is specific to you.`,
        ),
    );
}
