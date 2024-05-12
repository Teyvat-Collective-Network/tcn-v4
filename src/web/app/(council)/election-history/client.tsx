"use client";

export default function ElectionHistoryClient({ entries }: { entries: {}[] }) {
    return (
        <pre>
            <code>{JSON.stringify(entries, null, 4)}</code>
        </pre>
    );
}
