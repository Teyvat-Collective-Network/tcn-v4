export default function AdminMetricsClient({ metrics }: { metrics: { key: string; averageDuration: number; count: number; errorRate: number }[] }) {
    return (
        <pre>
            <code>{JSON.stringify(metrics, null, 4)}</code>
        </pre>
    );
}
