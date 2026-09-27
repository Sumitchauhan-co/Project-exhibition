import { create } from 'zustand';

interface StartProcessingParams {
	jobId: string;
	fileName: string;
	fileSize: string;
	totalRuns?: number;
	estimatedSeconds?: number;
	statusSteps?: string[];
}

interface ProcessingState {
	jobId: string | null;
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
	jobId: null,
	isProcessing: false,
	fileName: null,
	fileSize: null,
	totalRuns: 5,
	startedAt: null,
	estimatedSeconds: 35,
	statusSteps: DEFAULT_STEPS,

	startProcessing: ({
		jobId,
		fileName,
		fileSize,
		totalRuns = 5,
		estimatedSeconds = 35,
		statusSteps = DEFAULT_STEPS,
	}) =>
		set({
			jobId,
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
			jobId: null,
			isProcessing: false,
			fileName: null,
			fileSize: null,
			startedAt: null,
		}),
}));
