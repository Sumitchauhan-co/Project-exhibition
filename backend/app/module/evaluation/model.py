import enum
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column, JSON, Relationship


class JobStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class EvaluationRunBase(SQLModel):
    filename: str
    vector_db: str
    evaluation_mode: str = Field(default="fast")
    estimated_credits: float = Field(default=0.0)
    total_runs: int = Field(default=0)
    status: JobStatus = Field(default=JobStatus.PENDING)
    error_message: Optional[str] = Field(default=None)


class EvaluationRun(EvaluationRunBase, table=True):
    __tablename__ = "evaluation_runs"

    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(index=True, unique=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    results: List["EvaluationResultItem"] = Relationship(
        back_populates="evaluation_run",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class EvaluationResultItem(SQLModel, table=True):
    __tablename__ = "evaluation_result_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    evaluation_run_id: int = Field(foreign_key="evaluation_runs.id", index=True)

    chunking_strategy: str
    embedding_model: str
    llm_model: str
    environment: str
    vector_db: str
    evaluation_mode: str
    latency_ms: Optional[float] = Field(default=None)
    error: Optional[str] = Field(default=None)
    metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

    evaluation_run: Optional[EvaluationRun] = Relationship(back_populates="results")
