import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { HomeHeader } from '../components/home/HomeHeader';
import { SelectedFileCard } from '../components/home/SelectedFileCard';
import { Dropzone } from '../components/home/Dropzone';
import { Button } from '../components/ui/button';

export default function Home() {
	const [file, setFile] = useState<File | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
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

		setIsProcessing(true);
		setError(null);
		console.info('[Home] Starting PDF evaluation:', file.name);

		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await api.post('/api/v1/evaluate-pdf', formData);

			// Extract array safely regardless of response shape
			const rawPayload = response.data;
			const matrixResults = Array.isArray(rawPayload)
				? rawPayload
				: (rawPayload.results ?? rawPayload);

			console.info('[Home] PDF evaluation completed:', response.status);

			// Navigate directly to dashboard
			navigate('/dashboard', {
				state: {
					results: matrixResults,
					fileName: file.name,
					fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
				},
			});
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				console.error('[Home] PDF evaluation failed:', {
					status: err.response?.status,
					detail: err.response?.data?.detail,
					message: err.message,
				});
			} else {
				console.error('[Home] Unexpected submission error:', err);
			}

			setError(
				(axios.isAxiosError(err) && err.response?.data?.detail) ||
					'Failed to evaluate PDF. Please try again.',
			);

			// Reset loading state only on failure
			setIsProcessing(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto my-8 space-y-6 text-center">
			<HomeHeader />

			<Dropzone onFileSelect={handleFileSelect} />

			{error && <p className="text-sm text-destructive font-medium">{error}</p>}

			{file && (
				<SelectedFileCard
					file={file}
					onRemove={() => setFile(null)}
				/>
			)}

			<Button
				onClick={handleStartChunking}
				disabled={!file || isProcessing}
				className="w-full py-6 text-base font-semibold"
				size="lg"
			>
				{isProcessing ? (
					<>
						<Loader2 className="w-5 h-5 mr-2 animate-spin" />
						Evaluating RAG Matrix...
					</>
				) : (
					<>
						<CheckCircle2 className="w-5 h-5 mr-2" />
						Run Benchmark Analysis
					</>
				)}
			</Button>
		</div>
	);
}
