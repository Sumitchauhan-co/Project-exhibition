import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, FileText, Loader2, UploadCloud } from 'lucide-react';
import { type PipelineResult } from '../types/benchmark';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MetricCards } from '../components/dashboard/MetricCards';
import { ViewSwitcher } from '../components/dashboard/ViewSwitcher';
import { BenchmarkChart } from '../components/dashboard/BenchmarkChart';
import { MatrixTable } from '../components/dashboard/MatrixTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getTopConfig } from '@/components/utils/dashboard';
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
	} = useProcessingStore();

	// Safely normalize initial state into an array regardless of passed data structure
	const [data, setData] = useState<PipelineResult[]>(() => {
		if (!fileState?.results) return [];
		return Array.isArray(fileState.results)
			? fileState.results
			: [fileState.results];
	});

	const persistedLoading = isProcessing && !fileState?.results;
	const [loading, setLoading] = useState(
		persistedLoading || !fileState?.results,
	);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');

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
		const nextLoading = persistedLoading || !fileState?.results;
		setLoading(nextLoading || isLoading);
	}, [persistedLoading, fileState?.results, isLoading]);

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

	return (
		<div className="min-h-[calc(100vh-4rem)] w-full bg-zinc-50/50 dark:bg-zinc-950/50">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
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
					<div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs sm:text-sm text-amber-700 dark:text-amber-300 shadow-sm transition-all">
						<Loader2 className="h-4 w-4 animate-spin shrink-0" />
						<span>
							Evaluation still running in the background across pages.{' '}
							{activeRuns > 0
								? `Processing ${activeRuns} total runs.`
								: 'Please wait while the benchmark completes.'}
						</span>
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
								className="mt-2 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors cursor-pointer"
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
