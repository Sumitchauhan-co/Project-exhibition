import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface DropzoneProps {
	onFileSelect: (file: File | null) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect }) => {
	const [isDragging, setIsDragging] = useState(false);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			onFileSelect(e.dataTransfer.files[0]);
		}
	};

	return (
		<div
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className={`border-2 border-dashed rounded-xl p-8 transition flex flex-col items-center justify-center cursor-pointer ${
				isDragging
					? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
					: 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-400 dark:hover:border-slate-700'
			}`}
		>
			<input
				type="file"
				accept="application/pdf"
				id="pdf-upload"
				className="hidden"
				onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
			/>

			<label
				htmlFor="pdf-upload"
				className="cursor-pointer w-full flex flex-col items-center"
			>
				<Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-3" />
				<p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
					Click to upload{' '}
					<span className="font-normal text-slate-500">or drag and drop</span>
				</p>
				<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
					PDF files up to 50MB
				</p>
			</label>
		</div>
	);
};
