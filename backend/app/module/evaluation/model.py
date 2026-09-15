from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from sqlmodel import Column, Field, JSON, Relationship, SQLModel


class EvaluationRunBase(SQLModel):
    filename: str
    vector_db: str
    evaluation_mode: str = Field(default="fast")
    estimated_credits: float = Field(default=0.0)
    total_runs: int = Field(default=0)


class EvaluationRun(EvaluationRunBase, table=True):
    __tablename__ = "evaluation_runs"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    results: List["EvaluationResultItem"] = Relationship(
        back_populates="evaluation_run",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class EvaluationResultItemBase(SQLModel):
    chunking_strategy: str
    embedding_model: str
    llm_model: str
    environment: str
    vector_db: str
    evaluation_mode: str
    latency_ms: Optional[float] = None
    error: Optional[str] = None

    # Fix: Explicitly declare sa_column using Column(JSON)
    metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))


class EvaluationResultItem(EvaluationResultItemBase, table=True):
    __tablename__ = "evaluation_result_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    evaluation_run_id: int = Field(foreign_key="evaluation_runs.id", index=True)

    # Relationship back to parent run
    evaluation_run: Optional[EvaluationRun] = Relationship(back_populates="results")
