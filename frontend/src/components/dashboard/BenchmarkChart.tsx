import React from 'react';
import { Bar } from 'react-chartjs-2';
import { type PipelineResult } from '../../types/evaluation';
import { useTheme } from '../theme-context';

interface BenchmarkChartProps {
	data: PipelineResult[] | PipelineResult;
}

export const BenchmarkChart: React.FC<BenchmarkChartProps> = ({ data }) => {
	const { theme } = useTheme();

	console.log('DATA : ', data);

	// Ensure data is always a valid array
	const safeData: PipelineResult[] = Array.isArray(data)
		? data
		: data
			? [data]
			: [];

	const isDark =
		theme === 'dark' ||
		(theme === 'system' &&
			window.matchMedia('(prefers-color-scheme: dark)').matches);

	const textColor = isDark ? '#a1a1aa' : '#52525b';
	const gridColor = isDark ? '#3f3f46' : '#e4e4e7';

	const chartData = {
		labels: safeData.map(
			(item) =>
				`${item.chunking_strategy} (${
					item.embedding_model || item.environment || 'dev'
				})`,
		),
		datasets: [
			{
				label: 'Context Recall',
				data: safeData.map((item) => item.metrics?.context_recall ?? 0),
				backgroundColor: 'rgba(59, 130, 246, 0.85)',
			},
			{
				label: 'Faithfulness',
				data: safeData.map((item) => item.metrics?.faithfulness ?? 0),
				backgroundColor: 'rgba(16, 185, 129, 0.85)',
			},
			{
				label: 'Context Precision',
				data: safeData.map((item) => item.metrics?.context_precision ?? 0),
				backgroundColor: 'rgba(245, 158, 11, 0.85)',
			},
			{
				label: 'Answer Relevancy',
				data: safeData.map((item) => item.metrics?.answer_relevancy ?? 0),
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

	if (safeData.length === 0) {
		return (
			<div className="flex h-[450px] items-center justify-center rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
				No benchmark metrics available to display.
			</div>
		);
	}

	return (
		<div className="h-[450px] rounded-xl border border-border bg-card p-6">
			<Bar
				data={chartData}
				options={chartOptions}
			/>
		</div>
	);
};
