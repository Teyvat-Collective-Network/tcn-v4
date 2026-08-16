"use client";

import { Prose } from "../../../components/ui/prose";

export default function BotPrivacyPolicy() {
	return (
		<Prose>
			<h1>TCN Bot Privacy Policy</h1>
			<p>
				TCN runs some bots, which help administrate the network and provide functionality to member servers. Note that the use ob these bots in member servers is
				optional, so the information here about information collected about users may not apply to you.
			</p>
			<p>
				We strive to collect the minimum amount of information necessary for the functionality implemented. We&apos;re a group of server owners and staff who are
				here for the love of our communities, and we have no interest in selling or sharing your data.
			</p>
			<p>
				TCN operates two bots: a TCN bot that helps with network administration and server convenience, and a global chat bot that operates the global chat channels
				on participating servers and propagates messages.
			</p>
			<h2>What information is collected?</h2>
			<p>
				The TCN bot stores which users are considered staff members according to the server owner. Users can be considered staff by being manually added as staff by
				the server owner or by having a role set by the server owner as a staff role that should synchronize with the server&apos;s staff list. Only that the user
				is staff and whether they were added manually or through role sync is stored; other information (including what roles caused the user to be considered staff
				or any other role information) is not recorded.
			</p>
			<p>
				The TCN bot also stores additional information necessary for functioning of the council. This applies only to council members; additional information is
				available in the council server.
			</p>
			<p>
				The global chat bot stores metadata about each message posted in a global chat channel so that messages can be propagated to the equivalent channels in
				other servers. Some information is also recorded for moderation purposes. That said, the message content itself is not stored.
			</p>
			<h2>Can I request my information be removed/deleted?</h2>
			<p>
				For the TCN bot, work with server owners to ensure you&apos;re not marked as a staff member in any server. Only that you are a staff member is recorded, and
				that information is deleted when you are no longer marked as staff.
			</p>
			<p>
				For the global chat bot, you can delete all messages you&apos;ve sent in a global chat channel. If you need or would like help ensuring data associated with
				global chat messages from your Discord account has been purged, send us a modmail in the <a href="/contact" className="link">TCN Hub</a>.
			</p>
		</Prose>
	);
}
