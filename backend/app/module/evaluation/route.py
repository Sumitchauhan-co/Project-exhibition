import json
import os
import tempfile
import traceback
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlmodel import Session

from app.common.db.database import get_session
from app.module.auth.deps import get_current_user
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
from app.module.auth.model import User
from app.module.billing.service import BillingService
from app.module.evaluation.service import RAGBenchmarkEngine

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])

LATEST_EVALUATION_RESULTS: dict[int, dict] = {}
VALID_STRATEGIES = {"recursive", "fixed", "token", "semantic"}


def store_latest_evaluation_results(user_id: int, payload: dict) -> dict:
    """Persist the most recent successful evaluation payload for the user."""
    LATEST_EVALUATION_RESULTS[user_id] = payload
    return payload


def get_latest_evaluation_results(user_id: int) -> dict:
    """Return the most recent successful evaluation payload for the user if present."""
    return LATEST_EVALUATION_RESULTS.get(user_id, {"results": [], "total_runs": 0})


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

    # Retain order while eliminating duplicates
    return list(dict.fromkeys(parsed_items))


@router.get("/matrix-results")
async def get_matrix_results(
    current_user: User = Depends(get_current_user),
):
    """Return the latest successful evaluation matrix for the current user."""
    payload = get_latest_evaluation_results(current_user.id)
    return {
        "user_id": current_user.id,
        "filename": payload.get("filename"),
        "estimated_credits": payload.get("estimated_credits", 0),
        "total_runs": payload.get("total_runs", len(payload.get("results", []))),
        "results": payload.get("results", []),
    }


@router.post("/evaluate-pdf")
async def evaluate_uploaded_pdf(
    file: UploadFile = File(...),
    strategies: Optional[str] = Form(None),
    llm_models: Optional[str] = Form(None),
    embedding_models: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    print("--- DEBUG RECEIVED FORM INPUTS ---")
    print(f"USER: {current_user.email} (ID: {current_user.id})")
    print(f"RAW STRATEGIES: {repr(strategies)}")
    print(f"RAW LLM MODELS: {repr(llm_models)}")
    print(f"RAW EMBEDDING MODELS: {repr(embedding_models)}")
    print("---------------------------------")

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise InvalidFileException()

    # 1. Resolve strategies
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
        selected_strategies = ["recursive", "fixed", "token", "semantic"]

    # 2. Resolve LLMs (Fall back to env config if not supplied in form)
    parsed_llms = parse_string_list(llm_models)
    if parsed_llms:
        selected_llms = parsed_llms
    else:
        if APP_ENV == "prod":
            selected_llms = list(dict.fromkeys([PROD_LLM_MODEL_1, PROD_LLM_MODEL_2]))
        else:
            selected_llms = list(dict.fromkeys([DEV_LLM_MODEL_1, DEV_LLM_MODEL_2]))

    # 3. Resolve Embedding Models (Fall back to env config if not supplied in form)
    parsed_embeddings = parse_string_list(embedding_models)
    if parsed_embeddings:
        selected_embeddings = parsed_embeddings
    else:
        if APP_ENV == "prod":
            selected_embeddings = list(
                dict.fromkeys([PROD_EMBED_MODEL_1, PROD_EMBED_MODEL_2])
            )
        else:
            selected_embeddings = list(
                dict.fromkeys([DEV_EMBED_MODEL_1, DEV_EMBED_MODEL_2])
            )

    active_vector_db = PROD_VECTOR_DB if APP_ENV == "prod" else DEV_VECTOR_DB
    user_id = current_user.id

    tmp_path = None
    try:
        contents = await file.read()
        if not contents:
            raise EmptyFileException()

        estimated_cost = BillingService.estimate_evaluation_cost(
            file_size_bytes=len(contents),
            selected_strategies=selected_strategies,
            selected_llms=selected_llms,
            selected_embeddings=selected_embeddings,
        )

        # Reserve credits before starting expensive LLM work.
        try:
            BillingService.reserve_credits_for_evaluation(
                session=session,
                user_id=user_id,
                required_credits=estimated_cost,
                context=f"{file.filename} ({len(selected_strategies)} strategies, {len(selected_llms)} LLMs, {len(selected_embeddings)} embeddings)",
            )
        except HTTPException:
            raise
        except Exception:
            raise EvaluationProcessingException(
                details="Unable to reserve credits for this run."
            )

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        matrix_results = []
        engine = RAGBenchmarkEngine(tmp_path)

        try:
            for strat in selected_strategies:
                for embed_model in selected_embeddings:
                    retriever, embed_fn = engine.get_retriever_for_config(
                        strat, embed_model
                    )

                    for llm in selected_llms:
                        result = engine.evaluate_retriever_with_llm(
                            retriever=retriever,
                            embed_fn=embed_fn,
                            chunk_strat=strat,
                            embed_model=embed_model,
                            llm_model=llm,
                            vector_db=active_vector_db,
                            test_dataset=None,
                        )
                        matrix_results.append(result)
        except Exception:
            BillingService.refund_credits_for_evaluation(
                session=session,
                user_id=user_id,
                required_credits=estimated_cost,
                context=f"{file.filename} ({len(selected_strategies)} strategies, {len(selected_llms)} LLMs, {len(selected_embeddings)} embeddings)",
            )
            raise

        payload = {
            "user_id": user_id,
            "filename": file.filename,
            "vector_db": active_vector_db,
            "estimated_credits": estimated_cost,
            "total_runs": len(matrix_results),
            "results": matrix_results,
        }
        return store_latest_evaluation_results(user_id, payload)

    except (
        InvalidFileException,
        EmptyFileException,
        InvalidStrategyException,
        MalformedJSONException,
    ):
        raise
    except Exception as e:
        traceback.print_exc()
        raise EvaluationProcessingException(details=str(e))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
