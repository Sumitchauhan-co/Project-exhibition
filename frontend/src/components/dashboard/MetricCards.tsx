import React from 'react';
import { Activity, Award, Cpu, Database } from 'lucide-react';
import { type PipelineResult } from '../../types/benchmark';
import { MetricSkeleton } from '../Skeleton';

interface MetricCardsProps {
	data: PipelineResult[];
	loading: boolean;
	topConfig: PipelineResult | null;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
	data,
	loading,
	topConfig,
}) => {
	if (loading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<MetricSkeleton />
				<MetricSkeleton />
				<MetricSkeleton />
				<MetricSkeleton />
			</div>
		);
	}

	const avgLatency =
		data.length > 0
			? (
					data.reduce((acc, curr) => acc + curr.latency_ms, 0) / data.length
				).toFixed(1)
			: 0;

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
				<Database className="h-8 w-8 shrink-0 text-primary" />
				<div>
					<p className="text-xs font-semibold uppercase text-muted-foreground">
						Evaluated Pipelines
					</p>
					<p className="text-2xl font-bold text-foreground">
						{data.length} Configs
					</p>
				</div>
			</div>

			<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
				<Award className="h-8 w-8 shrink-0 text-emerald-500" />
				<div>
					<p className="text-xs font-semibold uppercase text-muted-foreground">
						Top Performer
					</p>
					<p className="max-w-37.5 truncate text-lg font-bold text-emerald-500">
						{topConfig ? topConfig.chunking_strategy : 'N/A'}
					</p>
				</div>
			</div>

			<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
				<Activity className="h-8 w-8 shrink-0 text-amber-500" />
				<div>
					<p className="text-xs font-semibold uppercase text-muted-foreground">
						Peak Recall
					</p>
					<p className="text-2xl font-bold text-foreground">
						{topConfig ? topConfig.metrics.context_recall.toFixed(3) : '0.000'}
					</p>
				</div>
			</div>

			<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
				<Cpu className="h-8 w-8 shrink-0 text-chart-4" />
				<div>
					<p className="text-xs font-semibold uppercase text-muted-foreground">
						Avg Latency
					</p>
					<p className="text-2xl font-bold text-foreground">
						{avgLatency}{' '}
						<span className="text-xs font-normal text-slate-500 dark:text-slate-400">
							ms
						</span>
					</p>
				</div>
			</div>
		</div>
	);
};
