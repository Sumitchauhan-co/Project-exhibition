import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';

import api from '@/api/axios';
import { useProcessingStore } from '@/store/processing-store';
import type { EvaluationPreset } from '@/types/evaluation';

interface EvaluatePdfParams {
	file: File;
	selectedStrategies: string[];
	selectedLlms: string[];
	selectedEmbeddings: string[];
	evaluationMode: EvaluationPreset;
	totalRuns?: number;
	estimatedSeconds?: number;
}

interface JobEnqueueResponse {
	message: string;
	job_id: string;
	status: 'pending' | 'processing' | 'completed' | 'failed';
}

export function useEvaluatePdf() {
	const abortControllerRef = useRef<AbortController | null>(null);
	const startProcessing = useProcessingStore((state) => state.startProcessing);

	const cancel = () => {
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;
	};

	const mutation = useMutation({
		mutationFn: async ({
			file,
			selectedStrategies,
			selectedLlms,
			selectedEmbeddings,
			evaluationMode,
		}: EvaluatePdfParams) => {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('strategies', JSON.stringify(selectedStrategies));
			formData.append('llm_models', JSON.stringify(selectedLlms));
			formData.append('embedding_models', JSON.stringify(selectedEmbeddings));
			formData.append('evaluation_mode', evaluationMode);

			const controller = new AbortController();
			abortControllerRef.current = controller;

			const response = await api.post<JobEnqueueResponse>(
				'/evaluation/evaluate-pdf',
				formData,
				{
					signal: controller.signal,
				},
			);

			return response.data;
		},
		onSuccess: (data, variables) => {
			abortControllerRef.current = null;

			// Automatically populate store with job_id and parameters
			const fileSizeInMb = (variables.file.size / (1024 * 1024)).toFixed(2);
			startProcessing({
				jobId: data.job_id,
				fileName: variables.file.name,
				fileSize: `${fileSizeInMb} MB`,
				totalRuns: variables.totalRuns,
				estimatedSeconds: variables.estimatedSeconds,
			});
		},
		onError: () => {
			abortControllerRef.current = null;
		},
		onSettled: () => {
			abortControllerRef.current = null;
		},
	});

	return { ...mutation, cancel };
}
