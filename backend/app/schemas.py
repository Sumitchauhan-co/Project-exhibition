from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class MetricScores(BaseModel):
    faithfulness: float = Field(..., ge=0.0, le=1.0)
    answer_relevance: float = Field(..., ge=0.0, le=1.0)
    context_precision: float = Field(..., ge=0.0, le=1.0)
    context_recall: float = Field(..., ge=0.0, le=1.0)


class PipelineResult(BaseModel):
    config_id: str
    chunking_strategy: str
    embedding_model: str
    vector_db: str
    latency_ms: float
    metrics: MetricScores


class BenchmarkSummary(BaseModel):
    total_configurations: int
    winning_configuration: str
    highest_recall_score: float
    results: List[PipelineResult]


class RunBenchmarkRequest(BaseModel):
    pdf_name: Optional[str] = Field(
        default="sample_handbook.pdf", description="PDF filename stored in data/"
    )
    selected_chunkers: Optional[List[str]] = Field(
        default=["fixed", "recursive", "semantic"]
    )
