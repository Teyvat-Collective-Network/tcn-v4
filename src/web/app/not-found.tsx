"use client";

import { Nav } from "../components/nav";
import { Prose } from "../components/ui/prose";

export default function NotFound() {
    return (
        <Nav root="/">
            <Prose>
                <h1>404 &mdash; Not Found</h1>
                <p>
                    <span className="font-semibold">The page you are attempting to visit could not be found.</span> If you reached this page from a link on this
                    website or an official TCN source, please{" "}
                    <a href="/contact" className="link">
                        report this issue
                    </a>
                    . Otherwise, check the spelling of your URL, including capitalization.
                </p>
            </Prose>
        </Nav>
    );
}
