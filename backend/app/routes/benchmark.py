import os
import tempfile
import traceback

from fastapi import APIRouter, File, HTTPException, UploadFile

from ..config import (
    APP_ENV,
    DEV_EMBED_MODEL_1,
    DEV_EMBED_MODEL_2,
    DEV_LLM_MODEL_1,
    DEV_LLM_MODEL_2,
    PROD_EMBED_MODEL_1,
    PROD_EMBED_MODEL_2,
    PROD_LLM_MODEL_1,
    PROD_LLM_MODEL_2,
)
from ..services.evaluator import RAGBenchmarkEngine

router = APIRouter(prefix="/api/v1", tags=["Benchmark"])


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RAG Benchmark API"}


@router.post("/evaluate-pdf")
async def evaluate_uploaded_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only PDF files are supported."
        )

    tmp_path = None
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(
                status_code=400, detail="The uploaded PDF file is empty (0 bytes)."
            )

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        strategies = ["recursive", "fixed", "token", "semantic"]

        if APP_ENV == "prod":
            embed_models = [PROD_EMBED_MODEL_1, PROD_EMBED_MODEL_2]
            llms = [PROD_LLM_MODEL_1, PROD_LLM_MODEL_2]
        else:
            embed_models = [DEV_EMBED_MODEL_1, DEV_EMBED_MODEL_2]
            llms = [DEV_LLM_MODEL_1, DEV_LLM_MODEL_2]

        matrix_results = []
        engine = RAGBenchmarkEngine(tmp_path)

        # 4 Chunkers x 2 Embeddings = 8 vector database index creations
        for strat in strategies:
            for embed_model in embed_models:
                retriever, embed_fn = engine.get_retriever_for_config(
                    strat, embed_model
                )

                # Evaluates 2 LLMs per vector store (16 total evaluations)
                for llm in llms:
                    result = engine.evaluate_retriever_with_llm(
                        retriever=retriever,
                        embed_fn=embed_fn,
                        chunk_strat=strat,
                        embed_model=embed_model,
                        llm_model=llm,
                        test_dataset=None,  # Uses default test questions if None
                    )
                    matrix_results.append(result)

        return {
            "filename": file.filename,
            "total_runs": len(matrix_results),
            "results": matrix_results,
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
