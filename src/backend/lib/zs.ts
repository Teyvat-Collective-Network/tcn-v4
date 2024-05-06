import { z } from "zod";

const invalidDiscordID = "Discord IDs should be 17-20 digit long numbers.";
const snowflake = z.string().min(17, invalidDiscordID).max(20, invalidDiscordID).regex(/^\d+$/, invalidDiscordID);

const invalidTcnID = "TCN IDs should be 1-32 character strings of lowercase letters and dashes.";

const id = z
    .string()
    .min(1, invalidTcnID)
    .max(32, invalidTcnID)
    .regex(/^[a-z-]+$/, invalidTcnID);

export default {
    snowflake,
    snowflakes: snowflake.array(),
    id,
    ids: id.array(),
};
