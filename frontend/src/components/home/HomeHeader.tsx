import React from 'react';
import { ModeToggle } from '../mode-toggle';

export const HomeHeader: React.FC = () => (
	<header className="flex items-center justify-between border-b border-border pb-6">
		<div className="text-left">
			<h1 className="text-2xl font-bold tracking-tight text-foreground">
				RAG Pipeline Benchmark
			</h1>
			<p className="mt-1 text-sm text-muted-foreground">
				Upload a technical handbook to evaluate chunking strategies and
				retrieval accuracy.
			</p>
		</div>
		<ModeToggle />
	</header>
);
