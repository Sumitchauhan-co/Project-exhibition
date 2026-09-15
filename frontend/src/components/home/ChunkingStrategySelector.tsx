import React, { useEffect, useState } from 'react';
import { Layers, Cpu, Database, ShieldAlert, Loader2 } from 'lucide-react';
import type { OptionItem, SystemOptionsConfig } from '@/types/configApi';
import { fetchSystemOptions } from '@/services/configApi';
import { OptionGroup } from './OptionGroup';

interface ChunkingStrategySelectorProps {
	selectedStrategies: string[];
	onChangeStrategies: (strategies: string[]) => void;
	selectedLlms: string[];
	onChangeLlms: (llms: string[]) => void;
	selectedEmbeddings: string[];
	onChangeEmbeddings: (embeddings: string[]) => void;
	disabled?: boolean;
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
	disabled = false,
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

					if (selectedStrategies.length === 0 && data.strategies.length > 0) {
						onChangeStrategies([data.strategies[0].id]);
					}
					if (selectedLlms.length === 0 && data.llms.length > 0) {
						onChangeLlms([data.llms[0].id]);
					}
					if (selectedEmbeddings.length === 0 && data.embeddings.length > 0) {
						onChangeEmbeddings([data.embeddings[0].id]);
					}
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
				<ShieldAlert className="w-5 h-5 shrink-0" />
				<span>Failed to load configuration options from server. {error}</span>
			</div>
		);
	}

	const toggleItem = (
		id: string,
		selectedList: string[],
		onChange: (items: string[]) => void,
	) => {
		if (disabled) return;
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
		if (disabled) return;
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
				disabled={disabled}
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
				disabled={disabled}
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
				disabled={disabled}
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
