import React, { useEffect, useState } from 'react';
import { Layers, Cpu, Database, ShieldAlert, Loader2 } from 'lucide-react';
import type { OptionItem, SystemOptionsConfig } from '@/types/configApi';
import { fetchSystemOptions } from '@/services/configApi';

interface ChunkingStrategySelectorProps {
	selectedStrategies: string[];
	onChangeStrategies: (strategies: string[]) => void;
	selectedLlms: string[];
	onChangeLlms: (llms: string[]) => void;
	selectedEmbeddings: string[];
	onChangeEmbeddings: (embeddings: string[]) => void;
}

export const ChunkingStrategySelector: React.FC<
	ChunkingStrategySelectorProps
> = ({
	selectedStrategies,
	onChangeStrategies,
	selectedLlms,
	onChangeLlms,
	selectedEmbeddings,
	onChangeEmbeddings,
}) => {
	const [config, setConfig] = useState<SystemOptionsConfig | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);

		fetchSystemOptions()
			.then((data) => {
				if (isMounted) {
					setConfig(data);
					setError(null);
				}
			})
			.catch((err) => {
				if (isMounted) {
					setError(err.message || 'Error fetching options');
				}
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, []);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8 text-muted-foreground space-x-2">
				<Loader2 className="w-5 h-5 animate-spin" />
				<span className="text-sm font-medium">Loading options...</span>
			</div>
		);
	}

	if (error || !config) {
		return (
			<div className="p-4 border border-destructive/30 bg-destructive/10 rounded-xl text-destructive text-sm flex items-center space-x-2">
				<ShieldAlert className="w-5 h-5 flex-shrink-0" />
				<span>Failed to load configuration options from server. {error}</span>
			</div>
		);
	}

	const toggleItem = (
		id: string,
		selectedList: string[],
		onChange: (items: string[]) => void,
	) => {
		if (selectedList.includes(id)) {
			onChange(selectedList.filter((item) => item !== id));
		} else {
			onChange([...selectedList, id]);
		}
	};

	const toggleSelectAll = (
		allItems: OptionItem[],
		selectedList: string[],
		onChange: (items: string[]) => void,
	) => {
		if (selectedList.length === allItems.length) {
			onChange([]);
		} else {
			onChange(allItems.map((item) => item.id));
		}
	};

	const totalRuns =
		selectedStrategies.length * selectedLlms.length * selectedEmbeddings.length;

	return (
		<div className="space-y-4 text-left">
			{/* 1. Chunking Strategies */}
			<OptionGroup
				icon={<Layers className="w-5 h-5 text-primary" />}
				title="Chunking Strategies"
				options={config.strategies}
				selectedIds={selectedStrategies}
				onToggleItem={(id) =>
					toggleItem(id, selectedStrategies, onChangeStrategies)
				}
				onToggleSelectAll={() =>
					toggleSelectAll(
						config.strategies,
						selectedStrategies,
						onChangeStrategies,
					)
				}
			/>

			{/* 2. LLMs */}
			<OptionGroup
				icon={<Cpu className="w-5 h-5 text-primary" />}
				title="LLM Models"
				options={config.llms}
				selectedIds={selectedLlms}
				onToggleItem={(id) => toggleItem(id, selectedLlms, onChangeLlms)}
				onToggleSelectAll={() =>
					toggleSelectAll(config.llms, selectedLlms, onChangeLlms)
				}
			/>

			{/* 3. Embedding Models */}
			<OptionGroup
				icon={<Database className="w-5 h-5 text-primary" />}
				title="Embedding Models"
				options={config.embeddings}
				selectedIds={selectedEmbeddings}
				onToggleItem={(id) =>
					toggleItem(id, selectedEmbeddings, onChangeEmbeddings)
				}
				onToggleSelectAll={() =>
					toggleSelectAll(
						config.embeddings,
						selectedEmbeddings,
						onChangeEmbeddings,
					)
				}
			/>

			{/* Validation Warning */}
			{(selectedStrategies.length === 0 ||
				selectedLlms.length === 0 ||
				selectedEmbeddings.length === 0) && (
				<div className="flex items-center space-x-2 text-xs text-destructive font-medium pt-1">
					<ShieldAlert className="w-4 h-4" />
					<span>
						Please select at least 1 strategy, 1 LLM, and 1 embedding model.
					</span>
				</div>
			)}

			{/* Dynamic Matrix Summary */}
			{totalRuns > 0 && (
				<div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs font-medium text-primary text-center">
					Matrix Run Total: {selectedStrategies.length} strategy ×{' '}
					{selectedLlms.length} LLM × {selectedEmbeddings.length} Embedding ={' '}
					<strong>{totalRuns} total evaluation runs</strong>
				</div>
			)}
		</div>
	);
};

/* --- Reusable Section Sub-Component --- */

interface OptionGroupProps {
	icon: React.ReactNode;
	title: string;
	options: OptionItem[];
	selectedIds: string[];
	onToggleItem: (id: string) => void;
	onToggleSelectAll: () => void;
}

const OptionGroup: React.FC<OptionGroupProps> = ({
	icon,
	title,
	options,
	selectedIds,
	onToggleItem,
	onToggleSelectAll,
}) => {
	const isAllSelected =
		options.length > 0 && selectedIds.length === options.length;

	return (
		<div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center space-x-2">
					{icon}
					<h3 className="text-sm font-semibold text-foreground sm:text-base">
						{title} ({selectedIds.length}/{options.length})
					</h3>
				</div>
				<button
					type="button"
					onClick={onToggleSelectAll}
					className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					{isAllSelected ? 'Deselect All' : 'Select All'}
				</button>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				{options.map((opt) => {
					const isSelected = selectedIds.includes(opt.id);
					return (
						<div
							key={opt.id}
							onClick={() => onToggleItem(opt.id)}
							className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
								isSelected
									? 'border-primary bg-primary/5 shadow-xs'
									: 'border-border bg-background hover:border-muted-foreground/30'
							}`}
						>
							<input
								type="checkbox"
								checked={isSelected}
								onClick={(e) => e.stopPropagation()}
								onChange={() => onToggleItem(opt.id)}
								className="mt-0.5 w-4 h-4 rounded border-border accent-primary cursor-pointer"
							/>
							<div>
								<p className="text-sm font-medium text-foreground leading-none">
									{opt.label}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									{opt.description}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
