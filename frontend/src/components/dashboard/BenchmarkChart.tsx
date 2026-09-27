import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
	CheckCircle2,
	Cpu,
	Database,
	FileText,
	Loader2,
	Sparkles,
} from 'lucide-react';
import { type PipelineResult } from '../../types/evaluation';
import { useTheme } from '../theme-context';

interface BenchmarkChartProps {
	data: PipelineResult[] | PipelineResult;
	loading?: boolean;
}

const EVALUATION_STEPS = [
	{ icon: FileText, label: 'Reading document and extracting text chunks' },
	{ icon: Database, label: 'Generating vector embeddings across models' },
	{ icon: Cpu, label: 'Executing vector similarity searches' },
	{ icon: Sparkles, label: 'Calculating RAGAS metrics & scoring matrix' },
];

export const BenchmarkChart: React.FC<BenchmarkChartProps> = ({
	data,
	loading = false,
}) => {
	const { theme } = useTheme();

	const [activeStep, setActiveStep] = useState(0);
	const [secondsElapsed, setSecondsElapsed] = useState(0);

	// Ensure data is always a valid array
	const safeData: PipelineResult[] = Array.isArray(data)
		? data
		: data
			? [data]
			: [];

	useEffect(() => {
		if (!loading && safeData.length > 0) {
			setActiveStep(0);
			setSecondsElapsed(0);
			return;
		}

		const timer = setInterval(() => {
			setSecondsElapsed((prev) => prev + 1);
		}, 1000);

		const stepTimer = setInterval(() => {
			setActiveStep((prev) =>
				prev < EVALUATION_STEPS.length - 1 ? prev + 1 : prev,
			);
		}, 4000);

		return () => {
			clearInterval(timer);
			clearInterval(stepTimer);
		};
	}, [loading, safeData.length]);

	const isLoadingState = loading || safeData.length === 0;

	if (isLoadingState) {
		return (
			<div className="flex h-[450px] w-full flex-col items-center justify-center rounded-xl border border-border bg-card p-8 shadow-sm">
				<div className="mx-auto max-w-md text-center">
					<div className="relative mb-6 inline-flex items-center justify-center">
						<div className="absolute -inset-2 rounded-full bg-primary/20 blur-lg animate-pulse" />
						<div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					</div>

					<h3 className="text-xl font-bold tracking-tight text-foreground">
						Evaluating RAG Pipeline
					</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Please wait while we evaluate chunking, embeddings, and vector DBs.
					</p>

					<div className="mt-6 flex items-center justify-center gap-2">
						<span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary border border-primary/20">
							Elapsed: {secondsElapsed}s
						</span>
					</div>

					{/* Step Progress Display */}
					<div className="mt-8 space-y-3 text-left">
						{EVALUATION_STEPS.map((step, idx) => {
							const Icon = step.icon;
							const isDone = idx < activeStep;
							const isCurrent = idx === activeStep;

							return (
								<div
									key={step.label}
									className={`flex items-center gap-3 rounded-lg border p-3 transition-all duration-300 ${
										isCurrent
											? 'border-primary/50 bg-primary/5 text-foreground shadow-xs'
											: isDone
												? 'border-emerald-500/30 bg-emerald-500/5 text-muted-foreground'
												: 'border-border/50 bg-muted/30 text-muted-foreground/50'
									}`}
								>
									{isDone ? (
										<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
									) : isCurrent ? (
										<Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
									) : (
										<Icon className="h-4 w-4 shrink-0 opacity-40" />
									)}
									<span className="text-xs font-medium">{step.label}</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		);
	}

	const isDark =
		theme === 'dark' ||
		(theme === 'system' &&
			window.matchMedia('(prefers-color-scheme: dark)').matches);

	const textColor = isDark ? '#a1a1aa' : '#52525b';
	const gridColor = isDark ? '#3f3f46' : '#e4e4e7';

	const chartData = {
		labels: safeData.map(
			(item) =>
				`${item?.chunking_strategy ?? ''} (${
					item?.embedding_model || item?.environment || 'dev'
				})`,
		),
		datasets: [
			{
				label: 'Context Recall',
				data: safeData.map((item) => item?.metrics?.context_recall ?? 0),
				backgroundColor: 'rgba(59, 130, 246, 0.85)',
			},
			{
				label: 'Faithfulness',
				data: safeData.map((item) => item?.metrics?.faithfulness ?? 0),
				backgroundColor: 'rgba(16, 185, 129, 0.85)',
			},
			{
				label: 'Context Precision',
				data: safeData.map((item) => item?.metrics?.context_precision ?? 0),
				backgroundColor: 'rgba(245, 158, 11, 0.85)',
			},
			{
				label: 'Answer Relevancy',
				data: safeData.map((item) => item?.metrics?.answer_relevancy ?? 0),
				backgroundColor: 'rgba(168, 85, 247, 0.85)',
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'top' as const,
				labels: {
					color: textColor,
					font: { family: 'Geist Variable, sans-serif', size: 12 },
				},
			},
			tooltip: {
				backgroundColor: isDark ? '#27272a' : '#ffffff',
				borderColor: gridColor,
				borderWidth: 1,
			},
		},
		scales: {
			y: {
				min: 0,
				max: 1,
				ticks: { color: textColor },
				grid: { color: gridColor },
			},
			x: {
				ticks: { color: textColor },
				grid: { color: gridColor },
			},
		},
	};

	return (
		<div className="h-[450px] rounded-xl border border-border bg-card p-6">
			<Bar
				data={chartData}
				options={chartOptions}
			/>
		</div>
	);
};
