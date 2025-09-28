import "dotenv/config";

import addCharacter from "./actions/add-character.js";
import addGuild from "./actions/add-guild.js";
import addTermToFilter from "./actions/add-term-to-filter.js";
import changeCharacterId from "./actions/change-character-id.js";
import checkStaff from "./actions/check-staff.js";
import createFilter from "./actions/create-filter.js";
import createGlobalChannel from "./actions/create-global-channel.js";
import deleteCharacter from "./actions/delete-character.js";
import deleteFilterTerm from "./actions/delete-filter-term.js";
import deleteFilter from "./actions/delete-filter.js";
import deleteGlobalChannel from "./actions/delete-global-channel.js";
import editFilterTermRegex from "./actions/edit-filter-term-regex.js";
import editFilterTermTerm from "./actions/edit-filter-term-term.js";
import editGlobalChannelName from "./actions/edit-global-channel-name.js";
import editGlobalChannelPassword from "./actions/edit-global-channel-password.js";
import editGlobalChannelVisibility from "./actions/edit-global-channel-visibility.js";
import exchangeDataForElection from "./actions/exchange-data-for-election.js";
import getAuditLogs from "./actions/get-audit-logs.js";
import getCharacters from "./actions/get-characters.js";
import getElectionHistory from "./actions/get-election-history.js";
import getFile from "./actions/get-file.js";
import getFilter from "./actions/get-filter.js";
import getFilters from "./actions/get-filters.js";
import getGlobalChannel from "./actions/get-global-channel.js";
import getGlobalChannels from "./actions/get-global-channels.js";
import getGlobalConnectionDetails from "./actions/get-global-connection-details.js";
import getGuild from "./actions/get-guild.js";
import getGuildsForDropdown from "./actions/get-guilds-for-dropdown.js";
import getGuildsForReports from "./actions/get-guilds-for-reports.js";
import getInvite from "./actions/get-invite.js";
import getMetricsChart from "./actions/get-metrics-chart.js";
import getMetrics from "./actions/get-metrics.js";
import getMonitor from "./actions/get-monitor.js";
import getObserverList from "./actions/get-observer-list.js";
import getPartialGuildFromThread from "./actions/get-partial-guild-from-thread.js";
import getPartnerList from "./actions/get-partner-list.js";
import getPastReports from "./actions/get-past-reports.js";
import getServerCount from "./actions/get-server-count.js";
import getServerListForAdmin from "./actions/get-server-list-for-admin.js";
import getTag from "./actions/get-tag.js";
import getTxt from "./actions/get-txt.js";
import getUserForAdmin from "./actions/get-user-for-admin.js";
import getUser from "./actions/get-user.js";
import getVoteTracker from "./actions/get-vote-tracker.js";
import hasPassedReportQuiz from "./actions/has-passed-report-quiz.js";
import refreshTerm from "./actions/refresh-term.js";
import removeGuild from "./actions/remove-guild.js";
import renameFilter from "./actions/rename-filter.js";
import setAdvisor from "./actions/set-advisor.js";
import setCharacterElement from "./actions/set-character-element.js";
import setCharacterFullName from "./actions/set-character-full-name.js";
import setCharacterShortName from "./actions/set-character-short-name.js";
import setDelegated from "./actions/set-delegated.js";
import setFilters from "./actions/set-filters.js";
import setGlobalNickname from "./actions/set-global-nickname.js";
import setInvite from "./actions/set-invite.js";
import setMascot from "./actions/set-mascot.js";
import setName from "./actions/set-name.js";
import setObserver from "./actions/set-observer.js";
import setOwner from "./actions/set-owner.js";
import setPriority from "./actions/set-priority.js";
import submitApplication from "./actions/submit-application.js";
import submitElectionVote from "./actions/submit-election-vote.js";
import submitQuiz from "./actions/submit-quiz.js";
import submitReport from "./actions/submit-report.js";
import swapRepresentatives from "./actions/swap-representatives.js";
import syncPartnerLists from "./actions/sync-partner-lists.js";
import validateApiKey from "./actions/validate-api-key.js";
import validateInvite from "./actions/validate-invite.js";
import { router } from "./trpc.js";

export const appRouter = router({
    addCharacter,
    addGuild,
    addTermToFilter,
    changeCharacterId,
    checkStaff,
    createFilter,
    createGlobalChannel,
    deleteCharacter,
    deleteFilter,
    deleteFilterTerm,
    deleteGlobalChannel,
    editFilterTermRegex,
    editFilterTermTerm,
    editGlobalChannelName,
    editGlobalChannelPassword,
    editGlobalChannelVisibility,
    exchangeDataForElection,
    getAuditLogs,
    getCharacters,
    getElectionHistory,
    getFile,
    getFilter,
    getFilters,
    getGlobalChannel,
    getGlobalChannels,
    getGlobalConnectionDetails,
    getGuild,
    getGuildsForDropdown,
    getGuildsForReports,
    getInvite,
    getMetrics,
    getMetricsChart,
    getMonitor,
    getObserverList,
    getPartialGuildFromThread,
    getPartnerList,
    getPastReports,
    getServerCount,
    getServerListForAdmin,
    getTag,
    getTxt,
    getUser,
    getUserForAdmin,
    getVoteTracker,
    hasPassedReportQuiz,
    refreshTerm,
    removeGuild,
    renameFilter,
    setAdvisor,
    setCharacterElement,
    setCharacterFullName,
    setCharacterShortName,
    setDelegated,
    setFilters,
    setGlobalNickname,
    setInvite,
    setMascot,
    setName,
    setObserver,
    setOwner,
    setPriority,
    submitApplication,
    submitElectionVote,
    submitQuiz,
    submitReport,
    swapRepresentatives,
    syncPartnerLists,
    validateApiKey,
    validateInvite,
});

export type AppRouter = typeof appRouter;
