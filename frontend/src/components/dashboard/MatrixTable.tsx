import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { type PipelineResult } from '../../types/evaluation';

interface MatrixTableProps {
	data: PipelineResult[];
	loading?: boolean;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({
	data,
	loading = false,
}) => {
	const [elapsedTime, setElapsedTime] = useState(0);

	useEffect(() => {
		if (!loading) {
			setElapsedTime(0);
			return;
		}

		const timer = setInterval(() => {
			setElapsedTime((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [loading]);

	const safeData = Array.isArray(data) ? data : [];

	if (loading || safeData.length === 0) {
		return (
			<div className="flex h-64 flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-xs">
				<div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
					<Loader2 className="h-6 w-6 animate-spin" />
				</div>
				<h4 className="text-base font-semibold text-foreground">
					{loading
						? 'Evaluating Matrix Configurations...'
						: 'Awaiting Matrix Results'}
				</h4>
				<p className="mt-1 text-xs text-muted-foreground">
					{loading
						? `Running benchmark test suites across chunkers and embedding models (${elapsedTime}s elapsed)...`
						: 'No evaluation records available yet.'}
				</p>
				{loading && (
					<div className="mt-4 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
						<Sparkles className="h-3.5 w-3.5 animate-pulse" /> Processing
						benchmark responses
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm text-muted-foreground">
					<thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
						<tr>
							<th className="px-6 py-3">Chunker</th>
							<th className="px-6 py-3">Vector DB</th>
							<th className="px-6 py-3">Embedding</th>
							<th className="px-6 py-3">LLM</th>
							<th className="px-6 py-3">Latency</th>
							<th className="px-6 py-3">Recall</th>
							<th className="px-6 py-3">Faithfulness</th>
							<th className="px-6 py-3">Precision</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{safeData.map((row, index) => {
							const recall =
								row?.metrics?.context_recall !== undefined
									? row.metrics.context_recall.toFixed(3)
									: '0.000';

							const faithfulness =
								row?.metrics?.faithfulness !== undefined
									? row.metrics.faithfulness.toFixed(3)
									: '0.000';

							const precision =
								row?.metrics?.context_precision !== undefined
									? row.metrics.context_precision.toFixed(3)
									: '0.000';

							const latency =
								row?.latency_ms !== undefined ? row.latency_ms : 0;

							return (
								<tr
									key={row?.config_id || `row-${index}`}
									className="transition hover:bg-muted/50"
								>
									<td className="px-6 py-4 font-medium text-foreground">
										{row?.chunking_strategy ?? 'N/A'}
									</td>
									<td className="px-6 py-4 font-medium text-foreground">
										{row?.vector_db ?? 'N/A'}
									</td>
									<td className="px-6 py-4">{row?.embedding_model ?? 'N/A'}</td>
									<td className="px-6 py-4 font-medium text-foreground">
										{row?.llm_model ?? 'N/A'}
									</td>
									<td className="px-6 py-4 font-mono">{latency} ms</td>
									<td className="px-6 py-4 font-mono font-semibold text-chart-1">
										{recall}
									</td>
									<td className="px-6 py-4 font-mono font-semibold text-chart-2">
										{faithfulness}
									</td>
									<td className="px-6 py-4 font-mono font-semibold text-chart-3">
										{precision}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
};
