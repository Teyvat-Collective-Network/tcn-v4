import "dotenv/config";
import addGuild from "./actions/add-guild.js";
import getCharacters from "./actions/get-characters.js";
import getGuild from "./actions/get-guild.js";
import getGuildsForBanshare from "./actions/get-guilds-for-banshare.js";
import getInvite from "./actions/get-invite.js";
import getObserverList from "./actions/get-observer-list.js";
import getPartialGuildFromThread from "./actions/get-partial-guild-from-thread.js";
import getPartnerList from "./actions/get-partner-list.js";
import getServerCount from "./actions/get-server-count.js";
import getServerListForAdmin from "./actions/get-server-list-for-admin.js";
import getTag from "./actions/get-tag.js";
import getUser from "./actions/get-user.js";
import setAdvisor from "./actions/set-advisor.js";
import setDelegated from "./actions/set-delegated.js";
import setInvite from "./actions/set-invite.js";
import setMascot from "./actions/set-mascot.js";
import setName from "./actions/set-name.js";
import setOwner from "./actions/set-owner.js";
import submitApplication from "./actions/submit-application.js";
import submitBanshare from "./actions/submit-banshare.js";
import swapRepresentatives from "./actions/swap-representatives.js";
import validateInvite from "./actions/validate-invite.js";
import { router } from "./trpc.js";

export const appRouter = router({
    addGuild,
    getCharacters,
    getGuild,
    getGuildsForBanshare,
    getInvite,
    getObserverList,
    getPartialGuildFromThread,
    getPartnerList,
    getServerCount,
    getServerListForAdmin,
    getTag,
    getUser,
    setAdvisor,
    setDelegated,
    setInvite,
    setMascot,
    setName,
    setOwner,
    submitApplication,
    submitBanshare,
    swapRepresentatives,
    validateInvite,
});

export type AppRouter = typeof appRouter;
