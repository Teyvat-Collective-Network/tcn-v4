import { z } from "zod";
import { proc } from "../trpc.js";
import trpcify from "../lib/trpcify.js";

export default proc.output(z.number().int().min(0)).query(
    trpcify(async () => {
        return 0;
    }),
);
