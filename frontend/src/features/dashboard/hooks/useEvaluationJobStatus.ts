import { useQuery, useQueryClient } from '@tanstack/react-query';

import api from '@/api/axios';
import type { PipelineResult } from '@/types/evaluation';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface JobStatusResponse {
	job_id: string;
	status: JobStatus;
	filename?: string;
	estimated_credits?: number;
	total_runs?: number;
	results: PipelineResult[];
	error?: string | null;
}

interface UseEvaluationJobStatusOptions {
	jobId: string | null;
	onSuccess?: (data: JobStatusResponse) => void;
	onError?: (error: Error) => void;
}

export function useEvaluationJobStatus({
	jobId,
	onSuccess,
	onError,
}: UseEvaluationJobStatusOptions) {
	const queryClient = useQueryClient();

	return useQuery<JobStatusResponse>({
		queryKey: ['evaluation', 'job-status', jobId],
		queryFn: async () => {
			if (!jobId) throw new Error('Job ID is required');

			const response = await api.get<JobStatusResponse>(
				`/evaluation/job-status/${jobId}`,
			);
			const data = response.data;

			if (data.status === 'completed') {
				void queryClient.invalidateQueries({ queryKey: ['evaluation'] });
				onSuccess?.(data);
			} else if (data.status === 'failed') {
				onError?.(new Error(data.error || 'Evaluation job failed.'));
			}

			return data;
		},
		enabled: Boolean(jobId),
		refetchInterval: (query) => {
			const data = query.state.data;
			if (data?.status === 'completed' || data?.status === 'failed') {
				return false;
			}
			return 3000; // Poll every 2 seconds while pending/processing
		},
		refetchOnWindowFocus: false,
	});
}
