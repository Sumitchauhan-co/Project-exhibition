import type { PipelineResult } from '@/types/evaluation';

/**
 * Calculates the top-performing configuration based on metric scores:
 * 1. Average of context_recall, faithfulness, and context_precision.
 * 2. Tiebreaker 1: Faithfulness score.
 * 3. Tiebreaker 2: Lowest latency (latency_ms).
 */
export const getTopConfig = (data: PipelineResult[]): PipelineResult | null => {
	if (!data || data.length === 0) return null;

	return [...data].sort((a, b) => {
		const scoreA =
			((a.metrics?.context_recall ?? 0) +
				(a.metrics?.faithfulness ?? 0) +
				(a.metrics?.context_precision ?? 0)) /
			3;

		const scoreB =
			((b.metrics?.context_recall ?? 0) +
				(b.metrics?.faithfulness ?? 0) +
				(b.metrics?.context_precision ?? 0)) /
			3;

		if (scoreB !== scoreA) {
			return scoreB - scoreA;
		}

		const faithA = a.metrics?.faithfulness ?? 0;
		const faithB = b.metrics?.faithfulness ?? 0;

		if (faithB !== faithA) {
			return faithB - faithA;
		}

		// Default missing latency to Infinity so valid latencies take priority
		const latencyA = a.latency_ms ?? Infinity;
		const latencyB = b.latency_ms ?? Infinity;

		return latencyA - latencyB;
	})[0];
};
