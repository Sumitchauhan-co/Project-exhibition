import React from 'react';
import { Layers, Cpu, Database, ShieldAlert } from 'lucide-react';

export interface OptionItem {
	id: string;
	label: string;
	description: string;
}

export const BACKEND_SUPPORTED_STRATEGIES: OptionItem[] = [
	{ id: 'fixed', label: 'Fixed Size', description: '500 chars / 50 overlap' },
	{
		id: 'recursive',
		label: 'Recursive Character',
		description: 'Splits on natural boundaries (\\n\\n, \\n, space)',
	},
	{
		id: 'token',
		label: 'Token Splitter',
		description: 'Splits strictly by token count',
	},
	{
		id: 'semantic',
		label: 'Semantic Boundary',
		description: 'Embedding-based similarity breaks',
	},
];

export const AVAILABLE_LLMS: OptionItem[] = [
	{
		id: 'gemma4:31b-cloud',
		label: 'Gemma 4 (31B Cloud)',
		description: 'Primary high-accuracy evaluation LLM',
	},
	{
		id: 'llama3:8b',
		label: 'Llama 3 (8B)',
		description: 'Fast lightweight open-weights model',
	},
];

export const AVAILABLE_EMBEDDINGS: OptionItem[] = [
	{
		id: 'qwen3-embedding:latest',
		label: 'Qwen3 Embedding',
		description: 'Primary dense retrieval model',
	},
	{
		id: 'nomic-embed-text:latest',
		label: 'Nomic Embed Text',
		description: 'High-dimensional text embedding model',
	},
];

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

	const toggleSelectAllStrategies = () => {
		if (selectedStrategies.length === BACKEND_SUPPORTED_STRATEGIES.length) {
			onChangeStrategies([]);
		} else {
			onChangeStrategies(BACKEND_SUPPORTED_STRATEGIES.map((s) => s.id));
		}
	};

	const totalRuns =
		selectedStrategies.length * selectedLlms.length * selectedEmbeddings.length;

	return (
		<div className="space-y-4">
			{/* 1. Chunking Strategies Section */}
			<div className="p-5 border border-border rounded-xl bg-card text-left space-y-4 shadow-sm">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Layers className="w-5 h-5 text-primary" />
						<h3 className="font-semibold text-base text-foreground">
							Chunking Strategies ({selectedStrategies.length}/
							{BACKEND_SUPPORTED_STRATEGIES.length})
						</h3>
					</div>
					<button
						type="button"
						onClick={toggleSelectAllStrategies}
						className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
					>
						{selectedStrategies.length === BACKEND_SUPPORTED_STRATEGIES.length
							? 'Deselect All'
							: 'Select All'}
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{BACKEND_SUPPORTED_STRATEGIES.map((strat) => {
						const isSelected = selectedStrategies.includes(strat.id);
						return (
							<div
								key={strat.id}
								onClick={() =>
									toggleItem(strat.id, selectedStrategies, onChangeStrategies)
								}
								className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
									isSelected
										? 'border-primary bg-primary/5 shadow-xs'
										: 'border-border bg-background hover:border-muted-foreground/30'
								}`}
							>
								<input
									type="checkbox"
									checked={isSelected}
									onChange={() => {}}
									className="mt-0.5 w-4 h-4 rounded border-border accent-primary cursor-pointer"
								/>
								<div>
									<p className="text-sm font-medium text-foreground leading-none">
										{strat.label}
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										{strat.description}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* 2. LLMs Section */}
			<div className="p-5 border border-border rounded-xl bg-card text-left space-y-4 shadow-sm">
				<div className="flex items-center space-x-2">
					<Cpu className="w-5 h-5 text-primary" />
					<h3 className="font-semibold text-base text-foreground">
						LLM Models ({selectedLlms.length}/{AVAILABLE_LLMS.length})
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{AVAILABLE_LLMS.map((llm) => {
						const isSelected = selectedLlms.includes(llm.id);
						return (
							<div
								key={llm.id}
								onClick={() => toggleItem(llm.id, selectedLlms, onChangeLlms)}
								className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
									isSelected
										? 'border-primary bg-primary/5 shadow-xs'
										: 'border-border bg-background hover:border-muted-foreground/30'
								}`}
							>
								<input
									type="checkbox"
									checked={isSelected}
									onChange={() => {}}
									className="mt-0.5 w-4 h-4 rounded border-border accent-primary cursor-pointer"
								/>
								<div>
									<p className="text-sm font-medium text-foreground leading-none">
										{llm.label}
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										{llm.description}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* 3. Embedding Models Section */}
			<div className="p-5 border border-border rounded-xl bg-card text-left space-y-4 shadow-sm">
				<div className="flex items-center space-x-2">
					<Database className="w-5 h-5 text-primary" />
					<h3 className="font-semibold text-base text-foreground">
						Embedding Models ({selectedEmbeddings.length}/
						{AVAILABLE_EMBEDDINGS.length})
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{AVAILABLE_EMBEDDINGS.map((emb) => {
						const isSelected = selectedEmbeddings.includes(emb.id);
						return (
							<div
								key={emb.id}
								onClick={() =>
									toggleItem(emb.id, selectedEmbeddings, onChangeEmbeddings)
								}
								className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
									isSelected
										? 'border-primary bg-primary/5 shadow-xs'
										: 'border-border bg-background hover:border-muted-foreground/30'
								}`}
							>
								<input
									type="checkbox"
									checked={isSelected}
									onChange={() => {}}
									className="mt-0.5 w-4 h-4 rounded border-border accent-primary cursor-pointer"
								/>
								<div>
									<p className="text-sm font-medium text-foreground leading-none">
										{emb.label}
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										{emb.description}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>

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
