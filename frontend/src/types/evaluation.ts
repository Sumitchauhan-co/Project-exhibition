export interface MetricScores {
	faithfulness: number;
	answer_relevancy: number;
	context_precision: number;
	context_recall: number;
}

export type EvaluationMode = 'fast' | 'vector' | 'full';

export interface PipelineResult {
	config_id?: string;
	chunking_strategy: string;
	embedding_model?: string;
	llm_model: string;
	vector_db: string;
	environment: string;
	latency_ms: number;
	metric_mode?: 'fast' | 'ragas' | string;
	answer_mode?: 'extractive' | 'llm' | string;
	retriever_mode?: 'fast' | 'vector' | string;
	timings_ms?: {
		answer_generation?: number;
		metric_evaluation?: number;
		total?: number;
	};
	metrics: MetricScores;
}

export type EvaluationPreset = 'fast' | 'vector' | 'full';
