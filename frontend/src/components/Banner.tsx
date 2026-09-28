import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ServerResourceWarningBannerProps {
	onDismiss?: () => void;
}

export function Banner({ onDismiss }: ServerResourceWarningBannerProps) {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;

	const handleClose = () => {
		setIsVisible(false);
		if (onDismiss) onDismiss();
	};

	return (
		<div className="relative w-full rounded-md border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-amber-900 shadow-sm transition-all dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-200">
			<div className="flex items-center justify-between gap-3 text-left">
				<div className="flex items-center gap-2.5">
					<AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
					<p className="text-xs font-medium leading-normal sm:text-sm">
						<span className="font-semibold">Resource Notice:</span> Due to
						memory limitations on the free server tier, evaluations may
						encounter unexpected failures or timeouts.
					</p>
				</div>

				<button
					type="button"
					onClick={handleClose}
					className="inline-flex shrink-0 rounded-md p-1 text-amber-700 hover:bg-amber-500/20 hover:text-amber-950 focus:outline-none dark:text-amber-400 dark:hover:bg-amber-500/20 dark:hover:text-amber-100"
					aria-label="Dismiss warning"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	);
}
