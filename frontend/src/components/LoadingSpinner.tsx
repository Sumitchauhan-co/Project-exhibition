import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
	label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	label = 'Fetching benchmark data...',
}) => (
	<div className="flex h-105 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card">
		<Loader2 className="h-10 w-10 animate-spin text-primary" />
		<p className="text-sm font-medium text-muted-foreground">{label}</p>
	</div>
);
