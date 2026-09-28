import React, { useEffect, useMemo, useState } from 'react';

import { Bar } from 'react-chartjs-2';

import {
	CheckCircle2,
	CircleDot,
	Cpu,
	Database,
	FileText,
	Loader2,
	Sparkles,
} from 'lucide-react';

import { type PipelineResult } from '../../../types/evaluation';

import { useTheme } from '@/components/theme-context';

interface BenchmarkChartProps {
	data: PipelineResult[] | PipelineResult;
	loading?: boolean;
}

const EVALUATION_STEPS = [
	{
		icon: FileText,
		label: 'Reading document and extracting text chunks',
		description: 'Preparing your document for evaluation',
	},
	{
		icon: Database,
		label: 'Generating vector embeddings',
		description: 'Processing embeddings across the selected models',
	},
	{
		icon: Cpu,
		label: 'Running similarity searches',
		description: 'Testing retrieval quality across configurations',
	},
	{
		icon: Sparkles,
		label: 'Calculating evaluation metrics',
		description: 'Computing scores and preparing the benchmark matrix',
	},
];

const WAITING_MESSAGES = [
	'Preparing your document for evaluation...',
	'Processing your RAG configurations...',
	'Running retrieval and evaluation checks...',
	'Calculating benchmark metrics...',
	'Almost there — preparing your results...',
];

export const BenchmarkChart: React.FC<BenchmarkChartProps> = ({
	data,
	loading = false,
}) => {
	const { theme } = useTheme();

	const [activeStep, setActiveStep] = useState(0);
	const [secondsElapsed, setSecondsElapsed] = useState(0);
	const [messageIndex, setMessageIndex] = useState(0);

	// Ensure data is always a valid array.
	const safeData: PipelineResult[] = useMemo(() => {
		if (Array.isArray(data)) {
			return data;
		}

		if (data) {
			return [data];
		}

		return [];
	}, [data]);

	/*
	 * Evaluation waiting UX.
	 *
	 * We intentionally do not require a separate "processing"
	 * prop. The parent only needs to tell this component that
	 * data is loading.
	 */
	useEffect(() => {
		if (!loading) {
			setActiveStep(0);
			setSecondsElapsed(0);
			setMessageIndex(0);
			return;
		}

		setSecondsElapsed(0);
		setActiveStep(0);
		setMessageIndex(0);

		const timer = window.setInterval(() => {
			setSecondsElapsed((prev) => prev + 1);
		}, 1000);

		/*
		 * Move through the stages slowly. These are UX stages,
		 * not claims about the exact backend operation currently
		 * running.
		 */
		const stepTimer = window.setInterval(() => {
			setActiveStep((prev) =>
				prev < EVALUATION_STEPS.length - 1 ? prev + 1 : prev,
			);
		}, 7_000);

		const messageTimer = window.setInterval(() => {
			setMessageIndex((prev) => (prev + 1) % WAITING_MESSAGES.length);
		}, 4_500);

		return () => {
			window.clearInterval(timer);
			window.clearInterval(stepTimer);
			window.clearInterval(messageTimer);
		};
	}, [loading]);

	/*
	 * Loading state.
	 *
	 * This is intentionally a rich waiting experience instead
	 * of simply showing a spinner.
	 */
	if (loading) {
		const progress = ((activeStep + 0.35) / EVALUATION_STEPS.length) * 100;

		const formatElapsedTime = (totalSeconds: number) => {
			const minutes = Math.floor(totalSeconds / 60);

			const seconds = totalSeconds % 60;

			if (minutes === 0) {
				return `${seconds}s`;
			}

			return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
		};

		return (
			<div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
				{/* Ambient background animation */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

					<div className="absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
				</div>

				<div className="relative flex min-h-[500px] flex-col items-center justify-center p-6 sm:p-10">
					<div className="w-full max-w-2xl">
						{/* Main status */}
						<div className="text-center">
							<div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
								<div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />

								<div className="absolute -inset-2 rounded-3xl border border-primary/10" />

								<div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
									<Loader2 className="h-8 w-8 animate-spin" />
								</div>
							</div>

							<h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
								Evaluating Your RAG Pipeline
							</h3>

							<p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
								{WAITING_MESSAGES[messageIndex]}
							</p>

							<div className="mt-5 flex flex-wrap items-center justify-center gap-2">
								<span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
									<Loader2 className="h-3 w-3 animate-spin" />
									Evaluation in progress
								</span>

								<span className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
									Elapsed {formatElapsedTime(secondsElapsed)}
								</span>
							</div>
						</div>

						{/* Progress bar */}
						<div className="mt-8">
							<div className="mb-2 flex items-center justify-between text-xs">
								<span className="font-medium text-muted-foreground">
									Evaluation progress
								</span>

								<span className="font-semibold text-foreground">
									{Math.round(Math.min(progress, 95))}%
								</span>
							</div>

							<div className="h-2 overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
									style={{
										width: `${Math.min(progress, 95)}%`,
									}}
								>
									<div className="h-full w-full animate-pulse bg-primary/30" />
								</div>
							</div>
						</div>

						{/* Evaluation stages */}
						<div className="mt-8 space-y-2.5">
							{EVALUATION_STEPS.map((step, idx) => {
								const Icon = step.icon;

								const isDone = idx < activeStep;

								const isCurrent = idx === activeStep;

								const isUpcoming = idx > activeStep;

								return (
									<div
										key={step.label}
										className={[
											'flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-500',
											isCurrent
												? 'border-primary/40 bg-primary/5 shadow-sm'
												: isDone
													? 'border-emerald-500/20 bg-emerald-500/5'
													: 'border-border/60 bg-muted/20',
										].join(' ')}
									>
										<div
											className={[
												'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-500',
												isCurrent
													? 'border-primary/20 bg-primary/10 text-primary'
													: isDone
														? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
														: 'border-border bg-muted text-muted-foreground/40',
											].join(' ')}
										>
											{isDone ? (
												<CheckCircle2 className="h-4 w-4" />
											) : isCurrent ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Icon className="h-4 w-4" />
											)}
										</div>

										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<p
													className={[
														'text-xs font-semibold transition-colors',
														isCurrent
															? 'text-foreground'
															: isDone
																? 'text-muted-foreground'
																: 'text-muted-foreground/50',
													].join(' ')}
												>
													{step.label}
												</p>

												{isCurrent && (
													<span className="hidden shrink-0 text-[10px] font-medium text-primary sm:inline">
														In progress
													</span>
												)}
											</div>

											<p
												className={[
													'mt-0.5 text-[11px] transition-colors',
													isUpcoming
														? 'text-muted-foreground/40'
														: 'text-muted-foreground',
												].join(' ')}
											>
												{step.description}
											</p>
										</div>

										<div className="shrink-0">
											{isDone ? (
												<span className="text-[10px] font-medium text-emerald-500">
													Done
												</span>
											) : isCurrent ? (
												<CircleDot className="h-4 w-4 animate-pulse text-primary" />
											) : null}
										</div>
									</div>
								);
							})}
						</div>

						{/* Reassurance message */}
						<div className="mt-6 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-center">
							<p className="text-xs leading-relaxed text-muted-foreground">
								You can stay on this page. Your results will appear
								automatically as soon as the evaluation finishes.
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	/*
	 * No loading + no results.
	 *
	 * This is different from "evaluation in progress".
	 * It means the API returned no benchmark data.
	 */
	if (safeData.length === 0) {
		return (
			<div className="flex min-h-[450px] w-full flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm">
				<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
					<FileText className="h-7 w-7" />
				</div>

				<h3 className="text-lg font-semibold text-foreground">
					No Benchmark Results Yet
				</h3>

				<p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
					Once an evaluation is completed, your RAG benchmark metrics will
					appear here.
				</p>
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
					item?.embedding_model || item?.environment || 'Unknown'
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
					font: {
						family: 'Geist Variable, sans-serif',
						size: 12,
					},
				},
			},

			tooltip: {
				backgroundColor: isDark ? '#27272a' : '#ffffff',

				borderColor: gridColor,
				borderWidth: 1,

				titleColor: isDark ? '#f4f4f5' : '#18181b',

				bodyColor: isDark ? '#d4d4d8' : '#52525b',
			},
		},

		scales: {
			y: {
				min: 0,
				max: 1,

				ticks: {
					color: textColor,
				},

				grid: {
					color: gridColor,
				},
			},

			x: {
				ticks: {
					color: textColor,
				},

				grid: {
					color: gridColor,
				},
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
