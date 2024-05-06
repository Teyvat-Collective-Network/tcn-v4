import "dotenv/config";
import getInvite from "./actions/get-invite.js";
import getObserverList from "./actions/get-observer-list.js";
import getPartnerList from "./actions/get-partner-list.js";
import getServerCount from "./actions/get-server-count.js";
import getTag from "./actions/get-tag.js";
import getUser from "./actions/get-user.js";
import submitApplication from "./actions/submit-application.js";
import { router } from "./trpc.js";

export const appRouter = router({
    getInvite,
    getObserverList,
    getPartnerList,
    getServerCount,
    getTag,
    getUser,
    submitApplication,
});

export type AppRouter = typeof appRouter;
