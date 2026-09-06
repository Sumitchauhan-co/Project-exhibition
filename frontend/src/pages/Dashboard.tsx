import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle, FileText } from 'lucide-react';
import axios from 'axios';
import { type PipelineResult } from '../types/benchmark';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MetricCards } from '../components/dashboard/MetricCards';
import { ViewSwitcher } from '../components/dashboard/ViewSwitcher';
import { BenchmarkChart } from '../components/dashboard/BenchmarkChart';
import { MatrixTable } from '../components/dashboard/MatrixTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../api/axios';

type DashboardState = {
	results?: PipelineResult[] | PipelineResult;
	fileName?: string;
	fileSize?: string;
};

export default function Dashboard() {
	const location = useLocation();
	const fileState = (location.state as DashboardState | null) ?? null;

	// Safely normalize initial state into an array regardless of passed data structure
	const [data, setData] = useState<PipelineResult[]>(() => {
		if (!fileState?.results) return [];
		return Array.isArray(fileState.results)
			? fileState.results
			: [fileState.results];
	});

	const [loading, setLoading] = useState(!fileState?.results);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');

	const fetchBenchmarkData = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await api.get<
				PipelineResult[] | { results: PipelineResult[] }
			>('/api/v1/matrix-results');

			const rawData = response.data;
			const normalizedData = Array.isArray(rawData)
				? rawData
				: rawData && 'results' in rawData && Array.isArray(rawData.results)
					? rawData.results
					: [];

			setData(normalizedData);
		} catch (err: unknown) {
			setError(
				(axios.isAxiosError(err) && err.response?.data?.detail) ||
					'Benchmark results were not available.',
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!fileState?.results) {
			void fetchBenchmarkData();
		}
	}, [fileState?.results, fetchBenchmarkData]);

	const safeData = Array.isArray(data) ? data : [];

	const topConfig =
		safeData.length > 0
			? [...safeData].sort((a, b) => {
					// 1. Calculate composite average metrics score for each row
					const scoreA =
						((a.metrics?.context_recall ?? 0) +
							(a.metrics?.faithfulness ?? 0) +
							(a.metrics?.context_precision ?? 0)) /
						3;

					const scoreB =
						((b.metrics?.context_recall ?? 0) +
							(b.metrics?.faithfulness ?? 0) +
							(b.metrics?.context_precision ?? 0)) /
						3;

					// Primary sort: Composite score
					if (scoreB !== scoreA) {
						return scoreB - scoreA;
					}

					// Secondary tie-breaker: Faithfulness
					if (
						(b.metrics?.faithfulness ?? 0) !== (a.metrics?.faithfulness ?? 0)
					) {
						return (
							(b.metrics?.faithfulness ?? 0) - (a.metrics?.faithfulness ?? 0)
						);
					}

					// Tertiary tie-breaker: Lower latency wins
					return (a.latency_ms ?? 0) - (b.latency_ms ?? 0);
				})[0]
			: null;

	return (
		<div className="mx-auto max-w-7xl space-y-8">
			<DashboardHeader />

			{fileState?.fileName && (
				<div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-primary">
					<FileText className="h-4 w-4 shrink-0" />
					<span>
						Active Document: <strong>{fileState.fileName}</strong> (
						{fileState.fileSize})
					</span>
				</div>
			)}

			<MetricCards
				data={safeData}
				loading={loading}
				topConfig={topConfig}
			/>

			<div className="space-y-4">
				<ViewSwitcher
					activeTab={activeTab}
					onChangeTab={setActiveTab}
				/>

				{loading ? (
					<LoadingSpinner label="Evaluating RAG Benchmark Matrix..." />
				) : error ? (
					<div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-destructive">
						<AlertCircle className="h-5 w-5 shrink-0" />
						<p className="text-sm">{error}</p>
					</div>
				) : activeTab === 'chart' ? (
					<BenchmarkChart data={safeData} />
				) : (
					<MatrixTable data={safeData} />
				)}
			</div>
		</div>
	);
}
