import { z } from "zod";
import { getFile } from "../lib/files.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.string())
    .output(z.string().nullable())
    .query(
        trpcify("api:get-file", async (uuid) => {
            return await getFile(uuid);
        }),
    );
