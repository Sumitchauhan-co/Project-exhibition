import type { EvaluationPreset } from '@/types/evaluation';
import { Zap, Database, Cpu } from 'lucide-react';

interface EvaluationModeSelectorProps {
	value: EvaluationPreset;
	onChange: (mode: EvaluationPreset) => void;
	disabled?: boolean;
}

export function EvaluationModeSelector({
	value,
	onChange,
	disabled = false,
}: EvaluationModeSelectorProps) {
	return (
		<div className="space-y-2 text-left">
			<label className="text-sm font-semibold text-foreground">
				Evaluation Mode
			</label>
			<div className="grid grid-cols-3 gap-3 rounded-xl bg-muted/50 p-1.5 border border-border">
				<button
					type="button"
					onClick={() => onChange('fast')}
					disabled={disabled}
					className={`flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs sm:text-sm font-medium transition-all ${
						disabled ? 'opacity-50 cursor-not-allowed' : ''
					} ${
						value === 'fast'
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					}`}
				>
					<Zap className="w-4 h-4 text-amber-500" />
					<div className="text-left">
						<div className="font-semibold leading-none">Fast</div>
						<div className="text-[10px] text-muted-foreground">
							~44s Lexical
						</div>
					</div>
				</button>

				<button
					type="button"
					onClick={() => onChange('vector')}
					disabled={disabled}
					className={`flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs sm:text-sm font-medium transition-all ${
						disabled ? 'opacity-50 cursor-not-allowed' : ''
					} ${
						value === 'vector'
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					}`}
				>
					<Database className="w-4 h-4 text-blue-500" />
					<div className="text-left">
						<div className="font-semibold leading-none">Vector</div>
						<div className="text-[10px] text-muted-foreground">
							Chroma Embeddings
						</div>
					</div>
				</button>

				<button
					type="button"
					onClick={() => onChange('full')}
					disabled={disabled}
					className={`flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs sm:text-sm font-medium transition-all ${
						disabled ? 'opacity-50 cursor-not-allowed' : ''
					} ${
						value === 'full'
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					}`}
				>
					<Cpu className="w-4 h-4 text-purple-500" />
					<div className="text-left">
						<div className="font-semibold leading-none">Full RAGAS</div>
						<div className="text-[10px] text-muted-foreground">
							12 LLM Judge Calls
						</div>
					</div>
				</button>
			</div>
		</div>
	);
}
