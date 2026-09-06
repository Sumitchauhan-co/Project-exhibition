import React from 'react';
import { RefreshCw, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { ModeToggle } from '../mode-toggle';

interface DashboardHeaderProps {
	loading?: boolean;
	onRefresh?: () => void;
	onUploadNew?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
	loading = false,
	onRefresh,
	onUploadNew,
}) => (
	<header className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-center">
		<div>
			<div className="flex items-center gap-3">
				<h1 className="text-2xl font-bold tracking-tight text-foreground">
					RAG Benchmarking Dashboard
				</h1>
				<span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
					3x1x1 Matrix
				</span>
			</div>
			<p className="mt-1 text-sm text-muted-foreground">
				Empirical accuracy and latency evaluation on technical handbooks
			</p>
		</div>

		<div className="flex items-center gap-3">
			<ModeToggle />

			{onUploadNew && (
				<Button
					variant="outline"
					size="sm"
					onClick={onUploadNew}
				>
					<Upload className="w-4 h-4 mr-2" />
					Upload New PDF
				</Button>
			)}

			{onRefresh && (
				<Button
					variant="default"
					size="sm"
					onClick={onRefresh}
					disabled={loading}
				>
					<RefreshCw
						className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
					/>
					{loading ? 'Evaluating...' : 'Re-run Matrix'}
				</Button>
			)}
		</div>
	</header>
);
