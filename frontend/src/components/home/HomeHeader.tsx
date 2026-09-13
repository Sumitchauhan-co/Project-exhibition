import React from 'react';

export const HomeHeader: React.FC = () => (
	<header className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
		<div className="text-left">
			<h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
				RAG Pipeline Benchmark
			</h1>
			<p className="mt-1 text-sm text-muted-foreground sm:text-base">
				Upload a technical handbook to evaluate chunking strategies and
				retrieval accuracy.
			</p>
		</div>
	</header>
);
