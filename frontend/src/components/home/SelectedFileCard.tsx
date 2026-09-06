import React from 'react';
import { FileText, X } from 'lucide-react';

interface SelectedFileCardProps {
	file: File;
	onRemove: () => void;
}

export const SelectedFileCard: React.FC<SelectedFileCardProps> = ({
	file,
	onRemove,
}) => (
	<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center justify-between text-left">
		<div className="flex items-center gap-3">
			<FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0" />
			<div>
				<p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[280px]">
					{file.name}
				</p>
				<p className="text-xs text-slate-500 dark:text-slate-400">
					{(file.size / (1024 * 1024)).toFixed(2)} MB
				</p>
			</div>
		</div>
		<button
			onClick={onRemove}
			className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded cursor-pointer"
			aria-label="Remove file"
		>
			<X className="w-4 h-4" />
		</button>
	</div>
);
