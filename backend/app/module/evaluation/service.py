import math
import re
import time
from typing import Any, Dict, List, Tuple

from ragas.run_config import RunConfig

from app.common.utils.config import (
    APP_ENV,
    DATABASE_URL,
    DEV_EMBED_MODEL_1,
    DEV_EMBED_MODEL_2,
    DEV_LLM_MODEL_1,
    DEV_LLM_MODEL_2,
    DEV_VECTOR_DB,
    OLLAMA_BASE_URL,
    OPENAI_API_KEY,
    PROD_EMBED_MODEL_1,
    PROD_EMBED_MODEL_2,
    PROD_LLM_MODEL_1,
    PROD_LLM_MODEL_2,
    PROD_VECTOR_DB,
)

DEFAULT_TEST_DATASET = [
    {
        "question": "What machine learning models are combined in this approach for peak detection?",
        "ground_truth": "A Convolutional Neural Network (CNN) combined with Particle Swarm Optimization (PSO).",
    },
    {
        "question": "What evaluation accuracy was reported for ECG peak detection?",
        "ground_truth": "The reported experimental accuracy was 99.57%.",
    },
    {
        "question": "Which database was used to evaluate the peak detection method?",
        "ground_truth": "The MIT-BIH Arrhythmia Database was used.",
    },
]


def sanitize_namespace(name: str) -> str:
    """Sanitizes model and strategy strings into safe collection identifiers for vector stores."""
    return re.sub(r"[^a-zA-Z0-9_-]", "-", name)


class RAGBenchmarkEngine:
    def __init__(self, pdf_path: str):
        from langchain_community.document_loaders import PyPDFLoader

        self.pdf_path = pdf_path
        self.loader = PyPDFLoader(pdf_path)
        self.raw_docs = self.loader.load()

        if not self.raw_docs:
            raise ValueError(
                f"PDF at path '{pdf_path}' contains no extractable text pages."
            )

    def get_chunker(self, strategy: str):
        from langchain_text_splitters import (
            CharacterTextSplitter,
            RecursiveCharacterTextSplitter,
            TokenTextSplitter,
        )

        if strategy == "fixed":
            return CharacterTextSplitter(
                chunk_size=500, chunk_overlap=50, separator=" "
            )
        elif strategy == "recursive":
            return RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        elif strategy == "token":
            return TokenTextSplitter(chunk_size=500, chunk_overlap=50)
        elif strategy == "semantic":
            return RecursiveCharacterTextSplitter(
                chunk_size=300, chunk_overlap=20, separators=["\n\n", ". ", " "]
            )
        raise ValueError(f"Unknown strategy: {strategy}")

    def get_llm(self, model_name: str | None = None):
        """Factory for LLMs: ChatOllama (Dev) vs ChatOpenAI (Prod)"""
        if APP_ENV == "prod":
            from langchain_openai import ChatOpenAI

            target_model = model_name or PROD_LLM_MODEL_1
            return ChatOpenAI(
                model=target_model,
                api_key=OPENAI_API_KEY,
                temperature=0.0,
            )
        else:
            from langchain_ollama import ChatOllama

            target_model = model_name or DEV_LLM_MODEL_1
            return ChatOllama(
                model=target_model,
                base_url=OLLAMA_BASE_URL,
                temperature=0.0,
            )

    def get_embedding_model(self, model_name: str | None = None):
        """Factory for Embeddings: Ollama Embeddings (Dev) vs OpenAI Embeddings (Prod)"""
        if APP_ENV == "prod":
            from langchain_openai import OpenAIEmbeddings

            target_model = model_name or PROD_EMBED_MODEL_1
            return OpenAIEmbeddings(model=target_model, api_key=OPENAI_API_KEY)
        else:
            from langchain_ollama import OllamaEmbeddings

            target_model = model_name or DEV_EMBED_MODEL_1
            return OllamaEmbeddings(model=target_model, base_url=OLLAMA_BASE_URL)

    def build_vector_store(self, chunks: List, embedding_fn, collection_name: str):
        """Factory for Vector Database: In-memory Chroma (Dev) vs PGVector (Prod)"""
        if APP_ENV == "prod":
            if PROD_VECTOR_DB == "pg-vector":
                from langchain_postgres.vectorstores import PGVector

                if not DATABASE_URL:
                    raise ValueError(
                        "DATABASE_URL must be configured for PGVector in production."
                    )

                return PGVector.from_documents(
                    embedding=embedding_fn,
                    documents=chunks,
                    collection_name=collection_name,
                    connection=DATABASE_URL,
                )
            else:
                from langchain_community.vectorstores import Chroma

                return Chroma.from_documents(chunks, embedding_fn)
        else:
            from langchain_community.vectorstores import Chroma

            return Chroma.from_documents(chunks, embedding_fn)

    def get_retriever_for_config(
        self, chunk_strat: str, embed_model: str
    ) -> Tuple[Any, Any]:
        """Builds and indexes the vector store ONCE per (chunker, embed_model) pair."""
        chunks = self.get_chunker(chunk_strat).split_documents(self.raw_docs)
        embed_fn = self.get_embedding_model(embed_model)

        safe_strat = sanitize_namespace(chunk_strat)
        safe_embed = sanitize_namespace(embed_model)
        collection_id = f"{safe_strat}-{safe_embed}"

        vector_store = self.build_vector_store(chunks, embed_fn, collection_id)
        return vector_store.as_retriever(search_kwargs={"k": 3}), embed_fn

    def evaluate_retriever_with_llm(
        self,
        retriever: Any,
        embed_fn: Any,
        chunk_strat: str,
        embed_model: str,
        llm_model: str,
        vector_db: str | None = None,
        test_dataset: List[Dict] | None = None,
    ) -> Dict[str, Any]:
        """Reuses an existing retriever to run LLM answer generation and RAGAS evaluation."""
        from datasets import Dataset
        from ragas import evaluate
        from ragas.embeddings import LangchainEmbeddingsWrapper
        from ragas.llms import LangchainLLMWrapper
        from ragas.metrics import (
            answer_relevancy,
            context_precision,
            context_recall,
            faithfulness,
        )

        if vector_db is None:
            vector_db = PROD_VECTOR_DB if APP_ENV == "prod" else DEV_VECTOR_DB

        if test_dataset is None:
            test_dataset = DEFAULT_TEST_DATASET

        start_time = time.time()

        questions = [item["question"] for item in test_dataset]
        raw_ground_truths = [item["ground_truth"] for item in test_dataset]

        ground_truths_list = [
            gt if isinstance(gt, list) else [gt] for gt in raw_ground_truths
        ]
        ground_truth_single = [
            gt[0] if isinstance(gt, list) and len(gt) > 0 else str(gt)
            for gt in raw_ground_truths
        ]

        answers, contexts = [], []
        llm_instance = self.get_llm(llm_model)

        # 1. Retrieve Contexts and Generate Answers via Selected LLM
        for q in questions:
            retrieved_docs = retriever.invoke(q)
            if retrieved_docs:
                retrieved_texts = [doc.page_content for doc in retrieved_docs]
                contexts.append(retrieved_texts)

                context_str = "\n\n".join(retrieved_texts)
                prompt = (
                    f"Context:\n{context_str}\n\n"
                    f"Question: {q}\n\n"
                    "Answer the question concisely based strictly on the context above."
                )

                try:
                    response = llm_instance.invoke(prompt)
                    gen_text = (
                        response.content
                        if hasattr(response, "content")
                        else str(response)
                    )
                    answers.append(gen_text)
                except Exception as gen_err:
                    answers.append(f"Generation error: {str(gen_err)}")
            else:
                contexts.append(["No context found"])
                answers.append("No context found")

        latency = round((time.time() - start_time) * 1000, 2)

        # 2. Build Dataset for RAGAS Evaluation
        dataset = Dataset.from_dict(
            {
                "question": questions,
                "answer": answers,
                "contexts": contexts,
                "ground_truth": ground_truth_single,
                "ground_truths": ground_truths_list,
            }
        )

        evaluator_llm = LangchainLLMWrapper(llm_instance)
        evaluator_embeddings = LangchainEmbeddingsWrapper(embed_fn)

        run_config = RunConfig(
            max_workers=1 if APP_ENV == "dev" else 4,
            timeout=300,
            max_retries=5,
            max_wait=60,
        )

        # 3. Compute Metrics
        ragas_result = evaluate(
            dataset=dataset,
            metrics=[
                faithfulness,
                answer_relevancy,
                context_precision,
                context_recall,
            ],
            llm=evaluator_llm,
            embeddings=evaluator_embeddings,
            run_config=run_config,
        )

        # 4. Safely Extract Metric Means
        raw_scores: Dict[str, float] = {}

        if hasattr(ragas_result, "to_pandas"):
            df = ragas_result.to_pandas()
            raw_scores = df.mean(numeric_only=True).to_dict()
        elif hasattr(ragas_result, "scores"):
            scores_obj = ragas_result.scores
            if isinstance(scores_obj, list):
                metric_sums: Dict[str, float] = {}
                metric_counts: Dict[str, int] = {}
                for item in scores_obj:
                    if isinstance(item, dict):
                        for k, v in item.items():
                            try:
                                float_val = float(v)
                                if not math.isnan(float_val):
                                    metric_sums[k] = metric_sums.get(k, 0.0) + float_val
                                    metric_counts[k] = metric_counts.get(k, 0) + 1
                            except (ValueError, TypeError):
                                pass
                raw_scores = {
                    k: metric_sums[k] / metric_counts[k]
                    for k in metric_sums
                    if metric_counts[k] > 0
                }
            elif isinstance(scores_obj, dict):
                raw_scores = scores_obj
        elif isinstance(ragas_result, dict):
            raw_scores = ragas_result

        cleaned_metrics = {}
        for k, v in raw_scores.items():
            try:
                val = float(v)
                cleaned_metrics[k] = 0.0 if math.isnan(val) else round(val, 4)
            except (ValueError, TypeError):
                cleaned_metrics[k] = 0.0

        return {
            "environment": APP_ENV,
            "vector_db": vector_db,
            "chunking_strategy": chunk_strat,
            "embedding_model": embed_model,
            "llm_model": llm_model,
            "latency_ms": latency,
            "metrics": cleaned_metrics,
        }
