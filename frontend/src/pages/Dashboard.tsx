import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	AlertCircle,
	FileText,
	Loader2,
	Trash2,
	UploadCloud,
} from 'lucide-react';
import { type PipelineResult } from '../types/evaluation';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MetricCards } from '../components/dashboard/MetricCards';
import { ViewSwitcher } from '../components/dashboard/ViewSwitcher';
import { BenchmarkChart } from '../components/dashboard/BenchmarkChart';
import { MatrixTable } from '../components/dashboard/MatrixTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getTopConfig } from '@/utils/dashboard';
import { useProcessingStore } from '../store/processing-store';
import { useDashboardResults } from '@/hooks/useDashboardResults';

type DashboardState = {
	results?: PipelineResult[] | PipelineResult;
	fileName?: string;
	fileSize?: string;
};

export default function Dashboard() {
	const location = useLocation();
	const navigate = useNavigate();
	const fileState = (location.state as DashboardState | null) ?? null;
	const {
		isProcessing,
		fileName: processingFileName,
		fileSize: processingFileSize,
		totalRuns: processingTotalRuns,
		startedAt,
		estimatedSeconds,
		statusSteps,
		cancelCurrentEvaluation,
	} = useProcessingStore();

	// Safely normalize initial state into an array regardless of passed data structure
	const [data, setData] = useState<PipelineResult[]>(() => {
		if (!fileState?.results) return [];
		return Array.isArray(fileState.results)
			? fileState.results
			: [fileState.results];
	});

	const persistedLoading = isProcessing && !fileState?.results;
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!isProcessing || !startedAt) {
			setElapsedSeconds(0);
			return;
		}

		const updateElapsed = () => {
			setElapsedSeconds(
				Math.max(0, Math.floor((Date.now() - startedAt) / 1000)),
			);
		};

		updateElapsed();
		const interval = window.setInterval(updateElapsed, 1000);
		return () => window.clearInterval(interval);
	}, [isProcessing, startedAt]);

	const {
		data: dashboardData,
		isLoading,
		isError,
		error: queryError,
	} = useDashboardResults({
		enabled: !fileState?.results && !isProcessing,
		fallbackData: data,
	});

	useEffect(() => {
		if (!dashboardData) return;
		setData(dashboardData);
	}, [dashboardData]);

	useEffect(() => {
		setLoading(Boolean(persistedLoading || isLoading));
	}, [persistedLoading, isLoading]);

	useEffect(() => {
		if (isError && queryError) {
			setError(
				queryError instanceof Error
					? queryError.message
					: 'No benchmark results available yet.',
			);
		} else if (!isError && !fileState?.results && dashboardData?.length === 0) {
			setError('No benchmark results available yet.');
		} else {
			setError(null);
		}
	}, [isError, queryError, fileState?.results, dashboardData]);

	const safeData = Array.isArray(data) ? data : [];
	const topConfig = getTopConfig(safeData);
	const activeFileName = fileState?.fileName ?? processingFileName;
	const activeFileSize = fileState?.fileSize ?? processingFileSize;
	const activeRuns = processingTotalRuns ?? 0;
	const stepCount = statusSteps?.length ?? 0;
	const estimatedDuration = Math.max(estimatedSeconds ?? 20, 20);
	const progressPercent = useMemo(() => {
		if (!statusSteps || statusSteps.length === 0) return 10;
		if (elapsedSeconds <= 0) return 8;
		const ratio = Math.min(1, elapsedSeconds / Math.max(estimatedDuration, 1));
		return Math.min(100, Math.max(8, ratio * 100));
	}, [elapsedSeconds, estimatedDuration, statusSteps]);
	const activeStepLabel = useMemo(() => {
		if (!statusSteps || statusSteps.length === 0) return 'Preparing evaluation';
		if (elapsedSeconds <= 0) return 'Starting evaluation';
		if (elapsedSeconds < estimatedDuration * 0.25)
			return statusSteps[0] ?? 'Preparing document and validation';
		if (elapsedSeconds < estimatedDuration * 0.55)
			return statusSteps[1] ?? 'Chunking and indexing the document';
		if (elapsedSeconds < estimatedDuration * 0.8)
			return (
				statusSteps[2] ?? 'Building retrievers and running benchmark checks'
			);
		return (
			statusSteps[Math.min(stepCount - 1, 3)] ??
			'Finalizing the results summary'
		);
	}, [elapsedSeconds, estimatedDuration, statusSteps, stepCount]);
	const estimatedTimeLeft = useMemo(() => {
		if (!estimatedSeconds) return null;
		if (elapsedSeconds >= estimatedSeconds) return null;
		return Math.max(0, estimatedSeconds - elapsedSeconds);
	}, [elapsedSeconds, estimatedSeconds]);
	const formatDuration = (seconds: number) => {
		const safeSeconds = Math.max(0, seconds);
		const minutes = Math.floor(safeSeconds / 60);
		const secs = safeSeconds % 60;
		return `${minutes}:${secs.toString().padStart(2, '0')}`;
	};

	const handleCancelEvaluation = () => {
		cancelCurrentEvaluation();
		navigate('/', { replace: true });
	};

	return (
		<div className="min-h-[calc(100vh-4rem)] w-full bg-zinc-50/50 dark:bg-zinc-950/50">
			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
				<DashboardHeader />

				{activeFileName && (
					<div className="flex items-center gap-3 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 shadow-sm transition-all">
						<FileText className="h-4 w-4 shrink-0" />
						<span>
							Active Document: <strong>{activeFileName}</strong> (
							{activeFileSize})
						</span>
					</div>
				)}

				{isProcessing && !fileState?.results && (
					<div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-xs sm:text-sm text-amber-700 dark:text-amber-300 shadow-sm transition-all">
						<div className="flex items-center gap-3">
							<Loader2 className="h-4 w-4 animate-spin shrink-0" />
							<span>
								Evaluation still running in the background.{' '}
								{activeRuns > 0
									? `Processing ${activeRuns} total runs.`
									: 'Please wait while the benchmark completes.'}
							</span>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between gap-3 text-[11px] font-medium tracking-wide">
								<span>Current step</span>
								<span>
									{estimatedTimeLeft !== null
										? `${formatDuration(elapsedSeconds)} elapsed • ${estimatedTimeLeft}s left`
										: 'Still processing — finishing the last checks…'}
								</span>
							</div>
							<div className="h-2 w-full overflow-hidden rounded-full bg-amber-200/80 dark:bg-amber-950/70">
								<div
									className="h-full rounded-full bg-amber-500 transition-all duration-500"
									style={{
										width: `${statusSteps && statusSteps.length > 0 ? progressPercent : 10}%`,
									}}
								/>
							</div>
							<div className="flex items-center justify-between gap-3">
								<p className="font-medium text-amber-800 dark:text-amber-200">
									{activeStepLabel}
								</p>
								<button
									type="button"
									onClick={handleCancelEvaluation}
									className="inline-flex items-center gap-2 rounded-md border border-amber-500/40 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-600 hover:text-white dark:bg-zinc-900/60 dark:text-amber-200 dark:hover:bg-amber-500 dark:hover:text-zinc-950"
								>
									<Trash2 className="h-3.5 w-3.5" />
									Cancel evaluation
								</button>
							</div>
						</div>
					</div>
				)}

				<MetricCards
					data={safeData}
					loading={loading}
					topConfig={topConfig}
				/>

				<div className="space-y-6 pt-2">
					<ViewSwitcher
						activeTab={activeTab}
						onChangeTab={setActiveTab}
					/>

					{loading ? (
						<div className="flex items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
							<LoadingSpinner label="Evaluating RAG Benchmark Matrix..." />
						</div>
					) : safeData.length === 0 ? (
						<div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 shadow-sm space-y-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
								<UploadCloud className="h-6 w-6" />
							</div>
							<div className="space-y-1 max-w-md">
								<h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
									No Benchmark Data Available
								</h3>
								<p className="text-sm text-zinc-500 dark:text-zinc-400">
									{error ||
										'Upload a document on the home page to run your first evaluation and generate matrix benchmark analytics.'}
								</p>
							</div>
							<button
								onClick={() => navigate('/')}
								className="mt-2 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors cursor-pointer"
							>
								<UploadCloud className="h-4 w-4" />
								Upload Document to Get Started
							</button>
						</div>
					) : error ? (
						<div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-6 text-red-600 dark:text-red-400 shadow-sm">
							<AlertCircle className="h-5 w-5 shrink-0" />
							<p className="text-sm font-medium">{error}</p>
						</div>
					) : activeTab === 'chart' ? (
						<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-sm">
							<BenchmarkChart data={safeData} />
						</div>
					) : (
						<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
							<MatrixTable data={safeData} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
