import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import api from '@/api/axios';
import type { EvaluationPreset } from '@/types/evaluation';

interface EvaluatePdfParams {
	file: File;
	selectedStrategies: string[];
	selectedLlms: string[];
	selectedEmbeddings: string[];
	evaluationMode: EvaluationPreset;
}

export function useEvaluatePdf() {
	const queryClient = useQueryClient();
	const abortControllerRef = useRef<AbortController | null>(null);

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

			const response = await api.post('/evaluation/evaluate-pdf', formData, {
				signal: controller.signal,
			});

			const rawPayload = response.data;
			return Array.isArray(rawPayload)
				? rawPayload
				: (rawPayload.results ?? rawPayload);
		},
		onSuccess: () => {
			abortControllerRef.current = null;
			void queryClient.invalidateQueries({ queryKey: ['evaluation'] });
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
