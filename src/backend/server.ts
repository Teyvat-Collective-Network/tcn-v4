import "dotenv/config";

import addCharacter from "./actions/add-character.js";
import addGuild from "./actions/add-guild.js";
import changeCharacterId from "./actions/change-character-id.js";
import deleteCharacter from "./actions/delete-character.js";
import exchangeDataForElection from "./actions/exchange-data-for-election.js";
import getAuditLogs from "./actions/get-audit-logs.js";
import getCharacters from "./actions/get-characters.js";
import getElectionHistory from "./actions/get-election-history.js";
import getGuild from "./actions/get-guild.js";
import getGuildsForBanshare from "./actions/get-guilds-for-banshare.js";
import getGuildsForDropdown from "./actions/get-guilds-for-dropdown.js";
import getInvite from "./actions/get-invite.js";
import getMonitor from "./actions/get-monitor.js";
import getObserverList from "./actions/get-observer-list.js";
import getPartialGuildFromThread from "./actions/get-partial-guild-from-thread.js";
import getPartnerList from "./actions/get-partner-list.js";
import getServerCount from "./actions/get-server-count.js";
import getServerListForAdmin from "./actions/get-server-list-for-admin.js";
import getTag from "./actions/get-tag.js";
import getUserForAdmin from "./actions/get-user-for-admin.js";
import getUser from "./actions/get-user.js";
import getVoteTracker from "./actions/get-vote-tracker.js";
import refreshTerm from "./actions/refresh-term.js";
import removeGuild from "./actions/remove-guild.js";
import setAdvisor from "./actions/set-advisor.js";
import setCharacterElement from "./actions/set-character-element.js";
import setCharacterFullName from "./actions/set-character-full-name.js";
import setCharacterShortName from "./actions/set-character-short-name.js";
import setDelegated from "./actions/set-delegated.js";
import setGlobalNickname from "./actions/set-global-nickname.js";
import setInvite from "./actions/set-invite.js";
import setMascot from "./actions/set-mascot.js";
import setName from "./actions/set-name.js";
import setObserver from "./actions/set-observer.js";
import setOwner from "./actions/set-owner.js";
import submitApplication from "./actions/submit-application.js";
import submitBanshare from "./actions/submit-banshare.js";
import submitElectionVote from "./actions/submit-election-vote.js";
import swapRepresentatives from "./actions/swap-representatives.js";
import validateInvite from "./actions/validate-invite.js";
import { router } from "./trpc.js";

export const appRouter = router({
    addCharacter,
    addGuild,
    changeCharacterId,
    deleteCharacter,
    exchangeDataForElection,
    getAuditLogs,
    getCharacters,
    getElectionHistory,
    getGuild,
    getGuildsForBanshare,
    getGuildsForDropdown,
    getInvite,
    getMonitor,
    getObserverList,
    getPartialGuildFromThread,
    getPartnerList,
    getServerCount,
    getServerListForAdmin,
    getTag,
    getUserForAdmin,
    getUser,
    getVoteTracker,
    refreshTerm,
    removeGuild,
    setAdvisor,
    setCharacterElement,
    setCharacterFullName,
    setCharacterShortName,
    setDelegated,
    setGlobalNickname,
    setInvite,
    setMascot,
    setName,
    setObserver,
    setOwner,
    submitApplication,
    submitBanshare,
    submitElectionVote,
    swapRepresentatives,
    validateInvite,
});

export type AppRouter = typeof appRouter;
