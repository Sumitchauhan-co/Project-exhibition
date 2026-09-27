import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, FileText, RefreshCw, UploadCloud } from 'lucide-react';
import { type PipelineResult } from '../types/evaluation';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { EvaluationProgress } from '../components/dashboard/EvaluationProgress';
import { MetricCards } from '../components/dashboard/MetricCards';
import { ViewSwitcher } from '../components/dashboard/ViewSwitcher';
import { BenchmarkChart } from '../components/dashboard/BenchmarkChart';
import { MatrixTable } from '../components/dashboard/MatrixTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getTopConfig } from '@/utils/dashboard';
import { useProcessingStore } from '../store/processing-store';
import { useDashboardResults } from '@/hooks/useDashboardResults';
import useAuthStore from '@/store/store';

type DashboardState = {
	results?: PipelineResult[] | PipelineResult;
	fileName?: string;
	fileSize?: string;
};

export default function Dashboard() {
	const location = useLocation();
	const navigate = useNavigate();
	const fileState = (location.state as DashboardState | null) ?? null;
	const fileResults = fileState?.results;

	const {
		isProcessing,
		fileName: processingFileName,
		fileSize: processingFileSize,
		totalRuns: processingTotalRuns,
		startedAt,
		estimatedSeconds,
		statusSteps,
		cancelCurrentEvaluation,
		finishProcessing,
	} = useProcessingStore();

	const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');
	const [elapsedSeconds, setElapsedSeconds] = useState(0);

	// Normalize router state results
	const routerResults = useMemo(() => {
		if (!fileResults) return null;
		return Array.isArray(fileResults) ? fileResults : [fileResults];
	}, [fileResults]);

	// Timer effect for background progress tracking
	useEffect(() => {
		if (!isProcessing || !startedAt) {
			return;
		}

		const updateElapsed = () => {
			const nextSeconds = Math.max(
				0,
				Math.floor((Date.now() - startedAt) / 1000),
			);
			setElapsedSeconds((prev) => (prev !== nextSeconds ? nextSeconds : prev));
		};

		updateElapsed();
		const interval = window.setInterval(updateElapsed, 1000);
		return () => window.clearInterval(interval);
	}, [isProcessing, startedAt]);

	// Fetch dashboard results regardless of processing state to allow background syncing
	const {
		data: dashboardData,
		isLoading,
		isError,
		error: queryError,
		refetch,
	} = useDashboardResults({
		enabled: !fileResults,
		fallbackData: routerResults ?? [],
	});

	// Derive current dataset
	const safeData = useMemo(() => {
		if (routerResults) return routerResults;
		if (Array.isArray(dashboardData)) return dashboardData;
		return [];
	}, [routerResults, dashboardData]);
	const fetchBalance = useAuthStore((state) => state.fetchBalance);

	// Auto-poll and stop processing status once data arrives
	useEffect(() => {
		if (!isProcessing) return;

		const pollInterval = window.setInterval(async () => {
			const { data } = await refetch();
			if (data && Array.isArray(data) && data.length > 0) {
				finishProcessing();
				void fetchBalance(); // Refresh credits in Navbar instantly!
			}
		}, 3000);

		return () => window.clearInterval(pollInterval);
	}, [isProcessing, refetch, finishProcessing, fetchBalance]);

	// Also complete processing & update credits if data populates via router state or initial query
	useEffect(() => {
		if (isProcessing && safeData.length > 0) {
			finishProcessing();
			void fetchBalance();
		}
	}, [isProcessing, safeData.length, finishProcessing, fetchBalance]);
	const loading = isLoading && safeData.length === 0;

	const error = useMemo(() => {
		if (isError && queryError) {
			return queryError instanceof Error
				? queryError.message
				: 'No benchmark results available yet.';
		}
		if (!isError && !fileResults && safeData.length === 0) {
			return 'No benchmark results available yet.';
		}
		return null;
	}, [isError, queryError, fileResults, safeData.length]);

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
				<DashboardHeader
					loading={loading || isProcessing}
					onRefresh={() => refetch()}
					onUploadNew={() => navigate('/')}
				/>

				{activeFileName && (
					<div className="flex items-center gap-3 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 shadow-sm transition-all">
						<FileText className="h-4 w-4 shrink-0" />
						<span>
							Active Document: <strong>{activeFileName}</strong> (
							{activeFileSize})
						</span>
					</div>
				)}

				{/* Mount evaluation progress card during active processing */}
				{isProcessing && (
					<EvaluationProgress
						isProcessing={isProcessing}
						activeRuns={activeRuns}
						activeStepLabel={activeStepLabel}
						elapsedSeconds={elapsedSeconds}
						estimatedTimeLeft={estimatedTimeLeft}
						progressPercent={progressPercent}
						statusSteps={statusSteps}
						onCancel={handleCancelEvaluation}
						formatDuration={formatDuration}
					/>
				)}

				<MetricCards
					data={safeData}
					loading={loading && safeData.length === 0}
					topConfig={topConfig}
				/>

				<div className="space-y-6 pt-2">
					<ViewSwitcher
						activeTab={activeTab}
						onChangeTab={setActiveTab}
					/>

					{loading ? (
						<div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3 text-center">
							<LoadingSpinner label="Fetching benchmark matrix evaluation..." />
							<p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
								We are generating evaluation scores for your vector embeddings
								and chunking strategies.
							</p>
						</div>
					) : isProcessing && safeData.length === 0 ? (
						<div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-amber-300 dark:border-amber-800/50 shadow-sm space-y-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
								<RefreshCw className="h-6 w-6 animate-spin" />
							</div>
							<div className="space-y-1 max-w-md">
								<h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
									Evaluation Job In Progress
								</h3>
								<p className="text-sm text-zinc-500 dark:text-zinc-400">
									Your document is currently being evaluated across vector
									configurations. The metrics chart and matrix table will
									populate automatically once completed.
								</p>
							</div>
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
					) : error && !isProcessing ? (
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
