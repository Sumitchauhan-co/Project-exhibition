import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { HomeHeader } from '../components/home/HomeHeader';
import { Dropzone } from '../components/home/Dropzone';
import { ChunkingStrategySelector } from '../components/home/ChunkingStrategySelector';
import { Button } from '../components/ui/button';
import { SelectedFileCard } from '../components/home/SelectedFileCard';
import { useEvaluatePdf } from '../hooks/useEvaluatePdf';
import { useProcessingStore } from '../store/processing-store';

export default function Home() {
	const [file, setFile] = useState<File | null>(null);

	// Model and Strategy Selections
	const [selectedStrategies, setSelectedStrategies] = useState<string[]>([
		'token',
	]);
	const [selectedLlms, setSelectedLlms] = useState<string[]>([
		'gemma4:31b-cloud',
	]);
	const [selectedEmbeddings, setSelectedEmbeddings] = useState<string[]>([
		'qwen3-embedding:latest',
	]);

	const { isProcessing, setProcessing, clearProcessing } = useProcessingStore();
	const { mutateAsync: evaluatePdf, isPending: isEvaluating } = useEvaluatePdf();
	const [error, setError] = useState<string | null>(null);

	const navigate = useNavigate();

	const handleFileSelect = (selectedFile: File | null) => {
		if (!selectedFile) return;

		if (selectedFile.type !== 'application/pdf') {
			setError('Only PDF files are supported.');
			setFile(null);
			return;
		}

		setError(null);
		setFile(selectedFile);
	};

	const handleStartChunking = async () => {
		if (!file || isProcessing) return;

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

		setProcessing({
			isProcessing: true,
			fileName: file.name,
			fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
			totalRuns,
			startedAt: Date.now(),
		});
		setError(null);

		try {
			const matrixResults = await evaluatePdf({
				file,
				selectedStrategies,
				selectedLlms,
				selectedEmbeddings,
			});

			clearProcessing();
			navigate('/dashboard', {
				state: {
					results: matrixResults,
					fileName: file.name,
					fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
				},
			});
		} catch (err: unknown) {
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

	const totalRuns =
		selectedStrategies.length * selectedLlms.length * selectedEmbeddings.length;

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

			<Dropzone onFileSelect={handleFileSelect} />

			{error && <p className="text-sm font-medium text-destructive">{error}</p>}

			{file && (
				<SelectedFileCard
					file={file}
					onRemove={() => setFile(null)}
				/>
			)}

			{/* Modular Strategy & Model Selector */}
			<ChunkingStrategySelector
				selectedStrategies={selectedStrategies}
				onChangeStrategies={setSelectedStrategies}
				selectedLlms={selectedLlms}
				onChangeLlms={setSelectedLlms}
				selectedEmbeddings={selectedEmbeddings}
				onChangeEmbeddings={setSelectedEmbeddings}
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
