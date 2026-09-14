import React from 'react';
import { FileText, X } from 'lucide-react';

interface SelectedFileCardProps {
	file: File;
	onRemove: () => void;
	disabled?: boolean;
}

export const SelectedFileCard: React.FC<SelectedFileCardProps> = ({
	file,
	onRemove,
	disabled = false,
}) => (
	<div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left dark:border-slate-800 dark:bg-slate-900 sm:p-4">
		<div className="flex min-w-0 items-center gap-3">
			<FileText className="h-8 w-8 shrink-0 text-blue-600 dark:text-blue-400" />
			<div className="min-w-0">
				<p className="truncate text-sm font-semibold text-slate-900 dark:text-white sm:max-w-70">
					{file.name}
				</p>
				<p className="text-xs text-slate-500 dark:text-slate-400">
					{(file.size / (1024 * 1024)).toFixed(2)} MB
				</p>
			</div>
		</div>
		{!disabled && (
			<button
				onClick={onRemove}
				className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
				aria-label="Remove file"
			>
				<X className="h-4 w-4" />
			</button>
		)}
	</div>
);
