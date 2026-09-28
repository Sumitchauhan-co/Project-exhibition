import React from 'react';
import type { OptionItem } from '@/types/configApi';

interface OptionGroupProps {
	icon: React.ReactNode;
	title: string;
	options: OptionItem[];
	selectedIds: string[];
	onToggleItem: (id: string) => void;
	onToggleSelectAll: () => void;
	disabled?: boolean;
}

export const OptionGroup: React.FC<OptionGroupProps> = ({
	icon,
	title,
	options,
	selectedIds,
	onToggleItem,
	onToggleSelectAll,
	disabled = false,
}) => {
	const isAllSelected =
		options.length > 0 && selectedIds.length === options.length;

	return (
		<div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
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
					disabled={disabled}
					className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
							onClick={() => !disabled && onToggleItem(opt.id)}
							className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
								disabled
									? 'cursor-not-allowed opacity-60 border-border bg-background'
									: 'cursor-pointer ' +
										(isSelected
											? 'border-primary bg-primary/5 shadow-xs'
											: 'border-border bg-background hover:border-muted-foreground/30')
							}`}
						>
							<input
								type="checkbox"
								checked={isSelected}
								disabled={disabled}
								onClick={(e) => e.stopPropagation()}
								onChange={() => onToggleItem(opt.id)}
								className="mt-0.5 w-4 h-4 shrink-0 rounded border-border accent-primary cursor-pointer disabled:cursor-not-allowed"
							/>
							<div className="min-w-0 flex-1">
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
