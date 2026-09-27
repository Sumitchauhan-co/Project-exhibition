import React, { useEffect, useState } from 'react';
import { Activity, Award, Cpu, Database, Loader2 } from 'lucide-react';
import { type PipelineResult } from '../../types/evaluation';

interface MetricCardsProps {
	data: PipelineResult[];
	loading: boolean;
	topConfig: PipelineResult | null;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
	data = [],
	loading,
	topConfig,
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

	if (loading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
					<Loader2 className="h-8 w-8 shrink-0 animate-spin text-primary" />
					<div>
						<p className="text-xs font-semibold uppercase text-muted-foreground">
							Evaluated Pipelines
						</p>
						<p className="text-2xl font-bold text-foreground">Analyzing...</p>
					</div>
				</div>

				<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
					<Loader2 className="h-8 w-8 shrink-0 animate-spin text-emerald-500" />
					<div>
						<p className="text-xs font-semibold uppercase text-muted-foreground">
							Top Performer
						</p>
						<p className="text-2xl font-bold text-emerald-500">Computing...</p>
					</div>
				</div>

				<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
					<Loader2 className="h-8 w-8 shrink-0 animate-spin text-amber-500" />
					<div>
						<p className="text-xs font-semibold uppercase text-muted-foreground">
							Peak Recall
						</p>
						<p className="text-2xl font-bold text-foreground">Measuring...</p>
					</div>
				</div>

				<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
					<Loader2 className="h-8 w-8 shrink-0 animate-spin text-chart-4" />
					<div>
						<p className="text-xs font-semibold uppercase text-muted-foreground">
							Elapsed Time
						</p>
						<p className="text-2xl font-bold text-foreground">{elapsedTime}s</p>
					</div>
				</div>
			</div>
		);
	}

	const safeData = Array.isArray(data) ? data : [];

	const avgLatency =
		safeData.length > 0
			? (
					safeData.reduce((acc, curr) => acc + (curr?.latency_ms ?? 0), 0) /
					safeData.length
				).toFixed(1)
			: '0.0';

	const peakRecall =
		topConfig?.metrics?.context_recall !== undefined
			? topConfig.metrics.context_recall.toFixed(3)
			: '0.000';

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
				<Database className="h-8 w-8 shrink-0 text-primary" />
				<div>
					<p className="text-xs font-semibold uppercase text-muted-foreground">
						Evaluated Pipelines
					</p>
					<p className="text-2xl font-bold text-foreground">
						{safeData.length} Configs
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
						{topConfig?.chunking_strategy ?? 'N/A'}
					</p>
				</div>
			</div>

			<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
				<Activity className="h-8 w-8 shrink-0 text-amber-500" />
				<div>
					<p className="text-xs font-semibold uppercase text-muted-foreground">
						Peak Recall
					</p>
					<p className="text-2xl font-bold text-foreground">{peakRecall}</p>
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
