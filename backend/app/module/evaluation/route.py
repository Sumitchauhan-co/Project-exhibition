import asyncio
import json
import logging
import time
import traceback
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlmodel import Session, select

from app.common.db.database import get_session
from app.common.utils.config import (
    APP_ENV,
    DEV_EMBED_MODEL_1,
    DEV_EMBED_MODEL_2,
    DEV_LLM_MODEL_1,
    DEV_LLM_MODEL_2,
    DEV_VECTOR_DB,
    PROD_EMBED_MODEL_1,
    PROD_EMBED_MODEL_2,
    PROD_LLM_MODEL_1,
    PROD_LLM_MODEL_2,
    PROD_VECTOR_DB,
)
from app.common.utils.exceptions import (
    EmptyFileException,
    EvaluationProcessingException,
    InvalidFileException,
    InvalidStrategyException,
    MalformedJSONException,
)
from app.module.auth.deps import get_current_user
from app.module.auth.model import User
from app.module.billing.service import BillingService
from app.module.evaluation.model import EvaluationResultItem, EvaluationRun
from app.module.evaluation.service import RAGBenchmarkEngine

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])

logger = logging.getLogger(__name__)

LATEST_EVALUATION_RESULTS: dict[int, dict] = {}

VALID_STRATEGIES = {"recursive", "fixed", "token", "semantic", "agentic"}

EVALUATION_MODE_PRESETS = {
    "fast": {
        "metric_mode": "fast",
        "answer_mode": "extractive",
        "retriever_mode": "fast",
    },
    "vector": {
        "metric_mode": "fast",
        "answer_mode": "extractive",
        "retriever_mode": "vector",
    },
    "full": {
        "metric_mode": "ragas",
        "answer_mode": "llm",
        "retriever_mode": "vector",
    },
}


def elapsed_ms(start_time: float) -> float:
    return round((time.perf_counter() - start_time) * 1000, 2)


def emit_eval_log(event: str, **values) -> None:
    details = " ".join(f"{key}={value}" for key, value in values.items())
    message = f"evaluation.{event} {details}".strip()
    logger.info(message)
    print(message, flush=True)


def store_latest_evaluation_results(user_id: int, payload: dict) -> dict:
    """Persist the most recent successful evaluation payload in memory."""
    LATEST_EVALUATION_RESULTS[user_id] = payload
    return payload


def clean_string_item(item: str) -> str:
    """Removes spaces, quotes, and array brackets from string tokens."""
    return item.strip(" \"'[]\t\r\n")


def parse_string_list(raw_input: Optional[str]) -> List[str]:
    """Parses raw form inputs into a unique list of strings from either JSON arrays or CSVs."""
    if not raw_input:
        return []

    parsed_items: List[str] = []
    try:
        parsed = json.loads(raw_input)
        if isinstance(parsed, str):
            parsed_items = [
                clean_string_item(s) for s in parsed.split(",") if clean_string_item(s)
            ]
        elif isinstance(parsed, list):
            parsed_items = [
                clean_string_item(str(s)) for s in parsed if clean_string_item(str(s))
            ]
        else:
            raise MalformedJSONException(
                message="Expected field to be a JSON array or a string."
            )
    except (json.JSONDecodeError, TypeError):
        parsed_items = [
            clean_string_item(s) for s in raw_input.split(",") if clean_string_item(s)
        ]

    return list(dict.fromkeys(parsed_items))


def resolve_evaluation_modes(evaluation_mode: Optional[str]) -> dict:
    selected_mode = (evaluation_mode or "fast").strip().lower()
    if selected_mode not in EVALUATION_MODE_PRESETS:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid evaluation mode.",
                "allowed": list(EVALUATION_MODE_PRESETS.keys()),
            },
        )
    return {"evaluation_mode": selected_mode, **EVALUATION_MODE_PRESETS[selected_mode]}


def _run_matrix_evaluations(
    pdf_bytes: bytes,
    filename: str,
    selected_strategies: List[str],
    selected_embeddings: List[str],
    selected_llms: List[str],
    active_vector_db: str,
    evaluation_modes: dict,
    user_credit_balance: Optional[int] = None,
    estimated_credits: Optional[int] = None,
) -> List[dict]:
    """Blocking worker function executed in background thread."""
    matrix_start = time.perf_counter()
    engine = RAGBenchmarkEngine(
        pdf_bytes=pdf_bytes,
        filename=filename,
        metric_mode=evaluation_modes["metric_mode"],
        answer_mode=evaluation_modes["answer_mode"],
        retriever_mode=evaluation_modes["retriever_mode"],
    )
    matrix_results = []

    for strat in selected_strategies:
        for embed_model in selected_embeddings:
            try:
                if strat == "agentic":
                    primary_llm = selected_llms[0] if selected_llms else None
                    retriever, embed_fn = engine.get_retriever_for_config(
                        strat,
                        embed_model,
                        llm_model=primary_llm,
                        user_credit_balance=user_credit_balance,
                        estimated_credits=estimated_credits,
                    )
                else:
                    retriever, embed_fn = engine.get_retriever_for_config(
                        strat,
                        embed_model,
                        user_credit_balance=user_credit_balance,
                        estimated_credits=estimated_credits,
                    )
            except Exception as embed_err:
                for llm in selected_llms:
                    matrix_results.append(
                        {
                            "environment": APP_ENV,
                            "vector_db": active_vector_db,
                            "chunking_strategy": strat,
                            "embedding_model": embed_model,
                            "llm_model": llm,
                            "error": f"Vector indexing/chunking failed: {str(embed_err)}",
                            "metrics": {},
                        }
                    )
                continue

            for llm in selected_llms:
                try:
                    result = engine.evaluate_retriever_with_llm(
                        retriever=retriever,
                        embed_fn=embed_fn,
                        chunk_strat=strat,
                        embed_model=embed_model,
                        llm_model=llm,
                        vector_db=active_vector_db,
                        test_dataset=None,
                    )
                    result["evaluation_mode"] = evaluation_modes["evaluation_mode"]
                    matrix_results.append(result)
                except Exception as eval_err:
                    matrix_results.append(
                        {
                            "environment": APP_ENV,
                            "vector_db": active_vector_db,
                            "chunking_strategy": strat,
                            "embedding_model": embed_model,
                            "llm_model": llm,
                            "error": f"Evaluation error: {str(eval_err)}",
                            "metrics": {},
                        }
                    )

    emit_eval_log(
        "matrix_complete",
        filename=filename,
        evaluation_mode=evaluation_modes["evaluation_mode"],
        strategies=len(selected_strategies),
        embeddings=len(selected_embeddings),
        llms=len(selected_llms),
        runs=len(matrix_results),
        duration_ms=elapsed_ms(matrix_start),
    )
    return matrix_results


@router.get("/matrix-results")
async def get_matrix_results(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Return the latest successful evaluation matrix for the current user from database."""
    statement = (
        select(EvaluationRun)
        .where(EvaluationRun.user_id == current_user.id)
        .order_by(EvaluationRun.created_at.desc())
    )
    latest_run = session.exec(statement).first()

    if latest_run:
        result_items = [
            {
                "environment": item.environment,
                "vector_db": item.vector_db,
                "chunking_strategy": item.chunking_strategy,
                "embedding_model": item.embedding_model,
                "llm_model": item.llm_model,
                "evaluation_mode": item.evaluation_mode,
                "latency_ms": item.latency_ms,
                "error": item.error,
                "metrics": item.metrics,
            }
            for item in latest_run.results
        ]
        return {
            "user_id": current_user.id,
            "filename": latest_run.filename,
            "estimated_credits": latest_run.estimated_credits,
            "total_runs": latest_run.total_runs,
            "results": result_items,
        }

    cached = LATEST_EVALUATION_RESULTS.get(
        current_user.id, {"results": [], "total_runs": 0}
    )
    return {
        "user_id": current_user.id,
        "filename": cached.get("filename"),
        "estimated_credits": cached.get("estimated_credits", 0),
        "total_runs": cached.get("total_runs", len(cached.get("results", []))),
        "results": cached.get("results", []),
    }


@router.post("/evaluate-pdf")
async def evaluate_uploaded_pdf(
    file: UploadFile = File(...),
    strategies: Optional[str] = Form(None),
    llm_models: Optional[str] = Form(None),
    embedding_models: Optional[str] = Form(None),
    evaluation_mode: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    request_start = time.perf_counter()
    estimated_cost = 0
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise InvalidFileException()

    parsed_strategies = parse_string_list(strategies)
    if parsed_strategies:
        invalid_strats = [s for s in parsed_strategies if s not in VALID_STRATEGIES]
        if invalid_strats:
            raise InvalidStrategyException(
                invalid_strategies=invalid_strats,
                allowed=list(VALID_STRATEGIES),
            )
        selected_strategies = parsed_strategies
    else:
        selected_strategies = ["recursive"]

    parsed_llms = parse_string_list(llm_models)
    if parsed_llms:
        selected_llms = parsed_llms
    else:
        if APP_ENV == "prod":
            selected_llms = [
                item for item in [PROD_LLM_MODEL_1, PROD_LLM_MODEL_2] if item
            ]
        else:
            selected_llms = [
                item for item in [DEV_LLM_MODEL_1, DEV_LLM_MODEL_2] if item
            ]

    parsed_embeddings = parse_string_list(embedding_models)
    if parsed_embeddings:
        selected_embeddings = parsed_embeddings
    else:
        if APP_ENV == "prod":
            selected_embeddings = [
                item for item in [PROD_EMBED_MODEL_1, PROD_EMBED_MODEL_2] if item
            ]
        else:
            selected_embeddings = [
                item for item in [DEV_EMBED_MODEL_1, DEV_EMBED_MODEL_2] if item
            ]

    active_vector_db = PROD_VECTOR_DB if APP_ENV == "prod" else DEV_VECTOR_DB
    evaluation_modes = resolve_evaluation_modes(evaluation_mode)
    user_id = current_user.id
    user_credit_balance = getattr(current_user, "credit_balance", None)

    try:
        read_start = time.perf_counter()
        contents = await file.read()
        if not contents:
            raise EmptyFileException()
        emit_eval_log(
            "request_file_read",
            filename=file.filename,
            bytes=len(contents),
            duration_ms=elapsed_ms(read_start),
        )

        estimated_cost = BillingService.estimate_evaluation_cost(
            file_size_bytes=len(contents),
            selected_strategies=selected_strategies,
            selected_llms=selected_llms,
            selected_embeddings=selected_embeddings,
        )

        try:
            billing_start = time.perf_counter()
            BillingService.reserve_credits_for_evaluation(
                session=session,
                user_id=user_id,
                required_credits=estimated_cost,
                context=f"{file.filename} ({len(selected_strategies)} strategies, {len(selected_llms)} LLMs, {len(selected_embeddings)} embeddings)",
            )
            emit_eval_log(
                "billing_reserved",
                user_id=user_id,
                credits=estimated_cost,
                duration_ms=elapsed_ms(billing_start),
            )
        except HTTPException:
            raise
        except Exception:
            raise EvaluationProcessingException(
                details="Unable to reserve credits for this run."
            )

        matrix_start = time.perf_counter()
        matrix_results = await asyncio.to_thread(
            _run_matrix_evaluations,
            contents,
            file.filename,
            selected_strategies,
            selected_embeddings,
            selected_llms,
            active_vector_db,
            evaluation_modes,
            user_credit_balance,
            estimated_cost,
        )
        matrix_ms = elapsed_ms(matrix_start)

        eval_run = EvaluationRun(
            user_id=user_id,
            filename=file.filename,
            vector_db=active_vector_db,
            evaluation_mode=evaluation_modes["evaluation_mode"],
            estimated_credits=estimated_cost,
            total_runs=len(matrix_results),
        )
        session.add(eval_run)
        session.flush()

        for res in matrix_results:
            result_item = EvaluationResultItem(
                evaluation_run_id=eval_run.id,
                chunking_strategy=res.get("chunking_strategy", ""),
                embedding_model=res.get("embedding_model", ""),
                llm_model=res.get("llm_model", ""),
                environment=res.get("environment", APP_ENV),
                vector_db=res.get("vector_db", active_vector_db),
                evaluation_mode=res.get(
                    "evaluation_mode", evaluation_modes["evaluation_mode"]
                ),
                latency_ms=res.get("latency_ms"),
                error=res.get("error"),
                metrics=res.get("metrics", {}),
            )
            session.add(result_item)

        session.commit()

        payload = {
            "user_id": user_id,
            "filename": file.filename,
            "vector_db": active_vector_db,
            "evaluation_mode": evaluation_modes["evaluation_mode"],
            "estimated_credits": estimated_cost,
            "total_runs": len(matrix_results),
            "results": matrix_results,
        }
        emit_eval_log(
            "request_complete",
            user_id=user_id,
            filename=file.filename,
            evaluation_mode=evaluation_modes["evaluation_mode"],
            runs=len(matrix_results),
            matrix_ms=matrix_ms,
            total_ms=elapsed_ms(request_start),
        )
        return store_latest_evaluation_results(user_id, payload)

    except (
        InvalidFileException,
        EmptyFileException,
        InvalidStrategyException,
        MalformedJSONException,
    ):
        raise
    except Exception as e:
        session.rollback()
        BillingService.refund_credits_for_evaluation(
            session=session,
            user_id=user_id,
            required_credits=estimated_cost,
            context=f"{file.filename} (Fatal system failure: {str(e)})",
        )
        traceback.print_exc()
        raise EvaluationProcessingException(details=str(e))
