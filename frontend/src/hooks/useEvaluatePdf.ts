import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/api/axios';

export function useEvaluatePdf() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			file,
			selectedStrategies,
			selectedLlms,
			selectedEmbeddings,
		}: {
			file: File;
			selectedStrategies: string[];
			selectedLlms: string[];
			selectedEmbeddings: string[];
		}) => {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('strategies', JSON.stringify(selectedStrategies));
			formData.append('llm_models', JSON.stringify(selectedLlms));
			formData.append('embedding_models', JSON.stringify(selectedEmbeddings));

			const response = await api.post('/evaluation/evaluate-pdf', formData);
			const rawPayload = response.data;
			return Array.isArray(rawPayload)
				? rawPayload
				: (rawPayload.results ?? rawPayload);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['evaluation'] });
		},
	});
}
