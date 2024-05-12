"use server";

import { Button } from "../../../components/ui/button";
import { Prose } from "../../../components/ui/prose";
import UserMention from "../../../components/ui/user-mention";
import { api } from "../../../lib/trpc";

export default async function Contact() {
    const users = await api.getObserverList.query();

    return (
        <Prose>
            <h1>Contact Us</h1>
            <h2>TCN Hub</h2>
            <p>Join the TCN Hub to contact observers and other server staff and ask questions or give feedback on the TCN!</p>
            <p>
                <a href={process.env.HUB_INVITE}>
                    <Button>Join the Hub</Button>
                </a>
            </p>
            <h2>Observers</h2>
            <p>The following are all of the TCN observers (admins).</p>
            <ul>
                {users.map(({ id }) => (
                    <li key={id}>
                        <UserMention id={id} /> &mdash; <code>{id}</code>
                    </li>
                ))}
            </ul>
        </Prose>
    );
}
