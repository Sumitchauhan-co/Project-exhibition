import { useQuery } from '@tanstack/react-query';

import api from '@/api/axios';
import type { PipelineResult } from '@/types/evaluation';

interface DashboardResultsOptions {
	enabled: boolean;
	fallbackData?: PipelineResult[];
}

export function useDashboardResults({
	enabled,
	fallbackData = [],
}: DashboardResultsOptions) {
	return useQuery({
		queryKey: ['evaluation', 'matrix-results'],
		queryFn: async () => {
			const response = await api.get<
				PipelineResult[] | { results: PipelineResult[] }
			>('/evaluation/matrix-results');

			const rawData = response.data;
			return Array.isArray(rawData)
				? rawData
				: rawData && 'results' in rawData && Array.isArray(rawData.results)
					? rawData.results
					: [];
		},
		enabled,
		initialData: fallbackData,
		staleTime: 15_000,
		refetchOnWindowFocus: false,
	});
}
