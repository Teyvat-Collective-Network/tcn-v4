"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { ComboSelector } from "../../../components/ui/combo-selector";
import { Prose } from "../../../components/ui/prose";
import { submitQuiz } from "./actions";

export default function ReportQuiz() {
    const [answer1, setAnswer1] = useState<string | null>(null);
    const [answer2, setAnswer2] = useState<string | null>(null);
    const [answer3, setAnswer3] = useState<string | null>(null);

    return (
        <Prose>
            <h1>Report Quiz</h1>
            <p>You must pass this quiz before you can submit a report.</p>
            <p>
                Refer to the{" "}
                <a href="/docs/network-user-reports" className="link" target="_blank">
                    network user reports documentation page
                </a>
                . You are not expected to do this quiz closed-book &mdash; this is to ensure you have paid attention and understand the approximate policy,
                purpose, and definitions, not as an obstacle.
            </p>
            <p>
                Please{" "}
                <a href="/contact" className="link" target="_blank">
                    contact us
                </a>{" "}
                if you have any technical issues or troubles with the content for this quiz.
            </p>
            <hr className="my-8" />
            <h2>What is the main purpose of network user reports?</h2>
            <ol>
                <li>Punish wrongdoers</li>
                <li>Ensure safety of TCN servers</li>
            </ol>
            <ComboSelector
                values={[
                    { label: "1", value: "A" },
                    { label: "2", value: "B" },
                ]}
                value={answer1}
                setValue={setAnswer1}
            />
            <h2>What warrants a banshare?</h2>
            <ol>
                <li>Severe offenses where second chances are no longer suitable</li>
                <li>Any rule violations that resulted in a ban</li>
                <li>Any bad behavior that is repeated across servers</li>
            </ol>
            <ComboSelector
                values={[
                    { label: "1", value: "A" },
                    { label: "2", value: "B" },
                    { label: "3", value: "C" },
                ]}
                value={answer2}
                setValue={setAnswer2}
            />
            <h2>Which of the following is not a good report reason?</h2>
            <ol>
                <li>Spamming NSFW</li>
                <li>Troll behavior</li>
                <li>Steam scammer</li>
            </ol>
            <ComboSelector
                values={[
                    { label: "1", value: "A" },
                    { label: "2", value: "B" },
                    { label: "3", value: "C" },
                ]}
                value={answer3}
                setValue={setAnswer3}
            />
            <hr className="my-8" />
            <Button
                disabled={answer1 === null || answer2 === null || answer3 === null}
                onClick={async () => {
                    const error = await submitQuiz([answer1!, answer2!, answer3!]);
                    if (error) alert(error);
                    else location.reload();
                }}
            >
                Submit
            </Button>
        </Prose>
    );
}
