import React from 'react';
import { type PipelineResult } from '../../types/benchmark';

interface MatrixTableProps {
	data: PipelineResult[];
}

export const MatrixTable: React.FC<MatrixTableProps> = ({ data }) => (
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
					{data.map((row) => (
						<tr
							key={row.config_id}
							className="transition hover:bg-muted/50"
						>
							<td className="px-6 py-4 font-medium text-foreground">
								{row.chunking_strategy}
							</td>
							<td className="px-6 py-4 font-medium text-foreground">
								{row.vector_db}
							</td>
							<td className="px-6 py-4">{row.embedding_model}</td>
							<td className="px-6 py-4 font-medium text-foreground">
								{row.llm_model}
							</td>
							<td className="px-6 py-4 font-mono">{row.latency_ms} ms</td>
							<td className="px-6 py-4 font-mono font-semibold text-chart-1">
								{row.metrics.context_recall.toFixed(3)}
							</td>
							<td className="px-6 py-4 font-mono font-semibold text-chart-2">
								{row.metrics.faithfulness.toFixed(3)}
							</td>
							<td className="px-6 py-4 font-mono font-semibold text-chart-3">
								{row.metrics.context_precision.toFixed(3)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	</div>
);
