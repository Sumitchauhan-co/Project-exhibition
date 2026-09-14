import { create } from 'zustand';

interface ProcessingJob {
	isProcessing: boolean;
	fileName?: string;
	fileSize?: string;
	totalRuns?: number;
	startedAt?: number;
	estimatedSeconds?: number;
	statusSteps?: string[];
	cancelHandler?: () => void;
}

interface ProcessingStore extends ProcessingJob {
	setProcessing: (
		job: Omit<ProcessingJob, 'isProcessing'> & { isProcessing?: boolean },
	) => void;
	clearProcessing: () => void;
	cancelCurrentEvaluation: () => void;
}

const STORAGE_KEY = 'rag-matrix-processing-state';

const readStoredValue = (): Partial<ProcessingJob> | null => {
	if (typeof window === 'undefined') return null;

	const raw = window.sessionStorage.getItem(STORAGE_KEY);
	if (!raw) return null;

	try {
		return JSON.parse(raw) as Partial<ProcessingJob>;
	} catch {
		return null;
	}
};

const writeStoredValue = (nextState: Partial<ProcessingJob>) => {
	if (typeof window === 'undefined') return;
	window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
};

const clearStoredValue = () => {
	if (typeof window === 'undefined') return;
	window.sessionStorage.removeItem(STORAGE_KEY);
};

const storedState = readStoredValue();

export const useProcessingStore = create<ProcessingStore>((set) => ({
	isProcessing: Boolean(storedState?.isProcessing),
	fileName: storedState?.fileName,
	fileSize: storedState?.fileSize,
	totalRuns: storedState?.totalRuns,
	startedAt: storedState?.startedAt,
	setProcessing: (job) => {
		const nextState = {
			isProcessing: job.isProcessing ?? true,
			fileName: job.fileName,
			fileSize: job.fileSize,
			totalRuns: job.totalRuns,
			startedAt: job.startedAt ?? Date.now(),
			estimatedSeconds: job.estimatedSeconds,
			statusSteps: job.statusSteps,
			cancelHandler: job.cancelHandler,
		};

		set(nextState);
		writeStoredValue({
			...nextState,
			cancelHandler: undefined,
		});
	},
	clearProcessing: () => {
		set({
			isProcessing: false,
			fileName: undefined,
			fileSize: undefined,
			totalRuns: undefined,
			startedAt: undefined,
			estimatedSeconds: undefined,
			statusSteps: undefined,
			cancelHandler: undefined,
		});
		clearStoredValue();
	},
	cancelCurrentEvaluation: () => {
		const currentState = useProcessingStore.getState();
		currentState.cancelHandler?.();
		currentState.clearProcessing();
	},
}));
