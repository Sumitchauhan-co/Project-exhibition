import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
	label?: string;
	className?: string;
}

export function LoadingSpinner({
	label = 'Loading...',
	className = '',
}: LoadingSpinnerProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center gap-4 p-6 transition-all duration-300 ease-in-out ${className}`}
		>
			<div className="relative flex items-center justify-center">
				{/* Soft background glow pulse */}
				<div className="absolute h-12 w-12 rounded-full bg-zinc-200/50 dark:bg-slate-800/60 animate-ping opacity-75" />

				{/* Subtle static track ring */}
				<div className="h-10 w-10 rounded-full border-2 border-zinc-200 dark:border-slate-800" />

				{/* Smooth spinning indicator */}
				<Loader2 className="absolute h-10 w-10 animate-spin text-zinc-900 dark:text-zinc-100" />
			</div>

			{label && (
				<p className="text-sm font-medium tracking-wide text-zinc-600 dark:text-zinc-400 animate-pulse">
					{label}
				</p>
			)}
		</div>
	);
}
