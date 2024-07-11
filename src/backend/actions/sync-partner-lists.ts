import trpcify from "../lib/trpcify.js";
import { syncPartnerLists } from "../modules/autosync/index.js";
import { proc } from "../trpc.js";

export default proc.mutation(
    trpcify("api:sync-partner-lists", async () => {
        await syncPartnerLists();
    }),
);
