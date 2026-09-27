import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';

interface EvaluationProgressProps {
	isProcessing: boolean;
	activeRuns: number;
	activeStepLabel: string;
	elapsedSeconds: number;
	estimatedTimeLeft: number | null;
	progressPercent: number;
	statusSteps?: string[];
	onCancel: () => void;
	formatDuration: (seconds: number) => string;
}

export const EvaluationProgress: React.FC<EvaluationProgressProps> = ({
	isProcessing,
	activeRuns,
	activeStepLabel,
	elapsedSeconds,
	estimatedTimeLeft,
	progressPercent,
	statusSteps,
	onCancel,
	formatDuration,
}) => {
	if (!isProcessing) return null;

	return (
		<div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-xs sm:text-sm text-amber-700 dark:text-amber-300 shadow-sm transition-all">
			<div className="flex items-center gap-3">
				<Loader2 className="h-4 w-4 animate-spin shrink-0 text-amber-600 dark:text-amber-400" />
				<span className="font-semibold">
					Evaluation running in background.{' '}
					{activeRuns > 0
						? `Processing ${activeRuns} matrix configurations.`
						: 'Please wait while matrix calculations complete.'}
				</span>
			</div>
			<div className="space-y-2">
				<div className="flex items-center justify-between gap-3 text-[11px] font-medium tracking-wide">
					<span>{activeStepLabel}</span>
					<span>
						{estimatedTimeLeft !== null
							? `${formatDuration(elapsedSeconds)} elapsed • ${estimatedTimeLeft}s remaining`
							: 'Finalizing evaluation runs...'}
					</span>
				</div>
				<div className="h-2 w-full overflow-hidden rounded-full bg-amber-200/80 dark:bg-amber-950/70">
					<div
						className="h-full rounded-full bg-amber-500 transition-all duration-500"
						style={{
							width: `${statusSteps && statusSteps.length > 0 ? progressPercent : 10}%`,
						}}
					/>
				</div>
				<div className="flex items-center justify-between gap-3 pt-1">
					<p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
						Results will automatically update when processing finishes.
					</p>
					<button
						type="button"
						onClick={onCancel}
						className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-white/70 px-3 py-1 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-600 hover:text-white dark:bg-zinc-900/60 dark:text-amber-200 dark:hover:bg-amber-500 dark:hover:text-zinc-950"
					>
						<Trash2 className="h-3.5 w-3.5" />
						Cancel job
					</button>
				</div>
			</div>
		</div>
	);
};
