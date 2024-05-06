import { ButtonInteraction } from "discord.js";
import { template } from "../../../lib/bot-lib.js";
import { majorTypes, unrestrictedTypes } from "../../../lib/polls.js";

export default async function (interaction: ButtonInteraction, type: string) {
    const info: string[] = [];

    if (unrestrictedTypes.includes(type))
        info.push(`This is an unrestricted poll. All council members (including <@&${process.env.ROLE_COUNCIL_ADVISORS}>s) can vote.`);
    else info.push(`This is a restricted poll. Only designated <@&${process.env.ROLE_VOTERS}>s can vote.`);

    if (majorTypes.includes(type)) info.push("This is a major poll, requiring 75% turnout for the result to be considered valid.");
    else info.push("This is a minor poll, requiring 60% turnout for the result to be considered valid.");

    if (type === "decline-observation")
        info.push(
            "Vote **Decline Observation** if you wish to reject this applicant without observing them.",
            "Vote **Proceed With Observation** if you wish to observe this applicant. This does not necessarily mean you believe they are suitable, just that you want the observation process to be conducted.",
        );

    if (["decline-observation"].includes(type))
        info.push("The result will be decided using standard tiebreaker fashion between the two options (60%+ majority required).");

    await interaction.reply(template.info(info.map((line) => `- ${line}`).join("\n")));
}
