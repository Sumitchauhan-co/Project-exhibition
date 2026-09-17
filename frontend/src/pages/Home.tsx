import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { HomeHeader } from '../components/home/HomeHeader';
import { Dropzone } from '../components/home/Dropzone';
import { ChunkingStrategySelector } from '../components/home/ChunkingStrategySelector';
import { EvaluationModeSelector } from '../components/home/EvaluationModeSelector';
import { Button } from '../components/ui/button';
import { SelectedFileCard } from '../components/home/SelectedFileCard';
import { useEvaluatePdf } from '../hooks/useEvaluatePdf';
import { useProcessingStore } from '../store/processing-store';
import { toast } from '../components/ui/toast';
import type { EvaluationPreset } from '@/types/evaluation';

const DEFAULT_EVALUATION_STEPS = [
	'Preparing document',
	'Chunking and indexing',
	'Building retrievers',
	'Running benchmark checks',
	'Finalizing results',
];

export default function Home() {
	const [file, setFile] = useState<File | null>(null);
	const [evaluationMode, setEvaluationMode] =
		useState<EvaluationPreset>('fast');

	const isProd = import.meta.env.VITE_APP_ENV === 'prod';

	// Model and Strategy Selections
	const [selectedStrategies, setSelectedStrategies] = useState<string[]>([
		'agentic',
	]);

	const [selectedLlms, setSelectedLlms] = useState<string[]>([
		isProd ? 'gpt-4o-mini' : 'gemma4:31b-cloud',
	]);

	const [selectedEmbeddings, setSelectedEmbeddings] = useState<string[]>([
		isProd ? 'text-embedding-3-small' : 'qwen3-embedding:latest',
	]);

	const { isProcessing, setProcessing, clearProcessing } = useProcessingStore();
	const {
		mutateAsync: evaluatePdf,
		isPending: isEvaluating,
		cancel,
	} = useEvaluatePdf();
	const [error, setError] = useState<string | null>(null);

	const navigate = useNavigate();
	const totalRuns =
		selectedStrategies.length * selectedLlms.length * selectedEmbeddings.length;

	const estimatedSeconds = useMemo(() => {
		const modeMultiplier =
			evaluationMode === 'fast' ? 1 : evaluationMode === 'vector' ? 2.5 : 5;

		const baseSeconds = 18;
		const perRunSeconds = 8 * modeMultiplier;
		const modelPenalty = Math.max(0, selectedLlms.length - 1) * 6;
		const embeddingPenalty = Math.max(0, selectedEmbeddings.length - 1) * 6;
		const strategyPenalty = Math.max(0, selectedStrategies.length - 1) * 10;

		return Math.min(
			600,
			Math.max(
				20,
				Math.round(
					baseSeconds +
						totalRuns * perRunSeconds +
						modelPenalty +
						embeddingPenalty +
						strategyPenalty,
				),
			),
		);
	}, [
		selectedEmbeddings.length,
		selectedLlms.length,
		selectedStrategies.length,
		totalRuns,
		evaluationMode,
	]);

	const handleFileSelect = (selectedFile: File | null) => {
		if (isProcessing || isEvaluating || !selectedFile) return;

		if (selectedFile.type !== 'application/pdf') {
			setError('Only PDF files are supported.');
			setFile(null);
			return;
		}

		setError(null);
		setFile(selectedFile);
	};

	const handleStartChunking = async () => {
		if (!file || isProcessing || isEvaluating) return;

		if (
			selectedStrategies.length === 0 ||
			selectedLlms.length === 0 ||
			selectedEmbeddings.length === 0
		) {
			setError(
				'Please select at least one strategy, one LLM, and one embedding model.',
			);
			return;
		}

		const fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
		setProcessing({
			isProcessing: true,
			fileName: file.name,
			fileSize,
			totalRuns,
			startedAt: Date.now(),
			estimatedSeconds: estimatedSeconds,
			statusSteps: DEFAULT_EVALUATION_STEPS,
			cancelHandler: cancel,
		});
		setError(null);

		toast.add({
			title: `Benchmark Analysis Started (${evaluationMode.toUpperCase()} Mode)`,
			description: (
				<div className="flex flex-col gap-2">
					<p>
						Processing {totalRuns} run(s) for {file.name}...
					</p>
					<Button
						variant="default"
						size="sm"
						className="w-fit bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
						onClick={() => navigate('/dashboard')}
					>
						Go to Dashboard
					</Button>
				</div>
			),
		});

		try {
			const matrixResults = await evaluatePdf({
				file,
				selectedStrategies,
				selectedLlms,
				selectedEmbeddings,
				evaluationMode,
			});

			clearProcessing();
			navigate('/dashboard', {
				replace: true,
				state: {
					results: matrixResults,
					fileName: file.name,
					fileSize,
				},
			});
		} catch (err: unknown) {
			const isCancelled =
				axios.isAxiosError(err) &&
				(err.code === 'ERR_CANCELED' || err.message === 'canceled');
			if (isCancelled) {
				clearProcessing();
				navigate('/', { replace: true });
				return;
			}

			const detail = axios.isAxiosError(err)
				? err.response?.data?.detail
				: null;
			const message =
				typeof detail === 'string'
					? detail
					: detail && typeof detail === 'object' && 'message' in detail
						? String(detail.message)
						: 'Failed to evaluate PDF. Please try again.';

			if (
				detail &&
				typeof detail === 'object' &&
				'redirect_to' in detail &&
				typeof detail.redirect_to === 'string'
			) {
				clearProcessing();
				navigate(String(detail.redirect_to), {
					state: { creditGuard: detail },
				});
				return;
			}

			clearProcessing();
			setError(message);
		}
	};

	const isFormInvalid =
		!file ||
		isProcessing ||
		isEvaluating ||
		selectedStrategies.length === 0 ||
		selectedLlms.length === 0 ||
		selectedEmbeddings.length === 0;

	return (
		<div className="mx-auto my-6 w-full max-w-4xl space-y-6 px-4 text-center sm:my-8 sm:px-6">
			<HomeHeader />

			<Dropzone
				onFileSelect={handleFileSelect}
				disabled={isProcessing || isEvaluating}
			/>

			{error && <p className="text-sm font-medium text-destructive">{error}</p>}

			{file && (
				<SelectedFileCard
					file={file}
					onRemove={() => {
						if (!isProcessing && !isEvaluating) setFile(null);
					}}
					disabled={isProcessing || isEvaluating}
				/>
			)}

			{/* Modular Evaluation Mode Selector */}
			<EvaluationModeSelector
				value={evaluationMode}
				onChange={setEvaluationMode}
				disabled={isProcessing || isEvaluating}
			/>

			{/* Modular Strategy & Model Selector */}
			<ChunkingStrategySelector
				selectedStrategies={selectedStrategies}
				onChangeStrategies={setSelectedStrategies}
				selectedLlms={selectedLlms}
				onChangeLlms={setSelectedLlms}
				selectedEmbeddings={selectedEmbeddings}
				onChangeEmbeddings={setSelectedEmbeddings}
				disabled={isProcessing || isEvaluating}
			/>

			<Button
				onClick={handleStartChunking}
				disabled={isFormInvalid}
				className="w-full py-4 text-sm font-semibold sm:py-6 sm:text-base"
				size="lg"
			>
				{isProcessing || isEvaluating ? (
					<>
						<Loader2 className="w-5 h-5 mr-2 animate-spin" />
						Evaluating RAG Matrix ({totalRuns} combinations)...
					</>
				) : (
					<>
						<CheckCircle2 className="w-5 h-5 mr-2" />
						Run Benchmark Analysis ({totalRuns} total runs)
					</>
				)}
			</Button>
		</div>
	);
}
