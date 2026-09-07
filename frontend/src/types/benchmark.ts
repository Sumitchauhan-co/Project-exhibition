export interface MetricScores {
	faithfulness: number;
	answer_relevancy: number;
	context_precision: number;
	context_recall: number;
}

export interface PipelineResult {
	config_id?: string;
	chunking_strategy: string;
	embedding_model?: string;
	llm_model: string;
	vector_db: string;
	environment: string;
	latency_ms: number;
	metrics: MetricScores;
}
