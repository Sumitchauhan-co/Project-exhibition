import { create } from 'zustand';

interface StartProcessingParams {
	fileName: string;
	fileSize: string;
	totalRuns?: number;
	estimatedSeconds?: number;
	statusSteps?: string[];
}

interface ProcessingState {
	isProcessing: boolean;
	fileName: string | null;
	fileSize: string | null;
	totalRuns: number;
	startedAt: number | null;
	estimatedSeconds: number;
	statusSteps: string[];
	startProcessing: (params: StartProcessingParams) => void;
	finishProcessing: () => void;
	cancelCurrentEvaluation: () => void;
}

const DEFAULT_STEPS = [
	'Preparing document and validation',
	'Chunking and indexing the document',
	'Building retrievers and running benchmark checks',
	'Finalizing the results summary',
];

export const useProcessingStore = create<ProcessingState>((set) => ({
	isProcessing: false,
	fileName: null,
	fileSize: null,
	totalRuns: 5,
	startedAt: null,
	estimatedSeconds: 35,
	statusSteps: DEFAULT_STEPS,

	startProcessing: ({
		fileName,
		fileSize,
		totalRuns = 5,
		estimatedSeconds = 35,
		statusSteps = DEFAULT_STEPS,
	}) =>
		set({
			isProcessing: true,
			fileName,
			fileSize,
			totalRuns,
			startedAt: Date.now(),
			estimatedSeconds,
			statusSteps,
		}),

	finishProcessing: () =>
		set({
			isProcessing: false,
		}),

	cancelCurrentEvaluation: () =>
		set({
			isProcessing: false,
			fileName: null,
			fileSize: null,
			startedAt: null,
		}),
}));
