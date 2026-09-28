import { useQuery } from '@tanstack/react-query';

import api from '@/api/axios';
import type { PipelineResult } from '@/types/evaluation';

interface DashboardResultsOptions {
	enabled?: boolean;
	fallbackData?: PipelineResult[];
}

interface MatrixResultsResponse {
	job_id?: string;
	user_id?: number;
	filename?: string;
	estimated_credits?: number;
	total_runs?: number;
	results: PipelineResult[];
}

export function useDashboardResults({
	enabled = true,
	fallbackData = [],
}: DashboardResultsOptions) {
	return useQuery({
		queryKey: ['evaluation', 'matrix-results'],

		queryFn: async () => {
			const response = await api.get<PipelineResult[] | MatrixResultsResponse>(
				'/evaluation/matrix-results',
			);

			const rawData = response.data;

			if (Array.isArray(rawData)) {
				return rawData;
			}

			if (rawData && 'results' in rawData && Array.isArray(rawData.results)) {
				return rawData.results;
			}

			return [];
		},

		enabled,

		// Used immediately while the first API request is loading.
		initialData: fallbackData,

		staleTime: 15_000,

		refetchOnWindowFocus: false,
	});
}
