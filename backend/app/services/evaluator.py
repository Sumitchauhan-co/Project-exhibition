import math
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Tuple

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ..config import (
    APP_ENV,
    DEV_EMBED_MODEL_1,
    DEV_LLM_MODEL_1,
    OLLAMA_BASE_URL,
    OPENAI_API_KEY,
    PINECONE_API_KEY,
    PINECONE_INDEX_NAME,
    PROD_EMBED_MODEL_1,
    PROD_LLM_MODEL_1,
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

    def get_llm(self, model_name: str):
        """Factory for LLMs: ChatOllama (Dev) vs ChatOpenAI (Prod)"""
        if APP_ENV == "prod":
            from langchain_openai import ChatOpenAI

            return ChatOpenAI(model=model_name, api_key=OPENAI_API_KEY)
        else:
            from langchain_ollama import ChatOllama

            return ChatOllama(model=model_name, base_url=OLLAMA_BASE_URL)

    def get_embedding_model(self, model_name: str):
        """Factory for Embeddings: Ollama Embeddings (Dev) vs OpenAI Embeddings (Prod)"""
        if APP_ENV == "prod":
            from langchain_openai import OpenAIEmbeddings

            return OpenAIEmbeddings(model=model_name, api_key=OPENAI_API_KEY)
        else:
            from langchain_ollama import OllamaEmbeddings

            return OllamaEmbeddings(model=model_name, base_url=OLLAMA_BASE_URL)

    def build_vector_store(self, chunks: List, embedding_fn, namespace_id: str):
        """Factory for Vector Database: In-memory ChromaDB (Dev) vs Pinecone (Prod)"""
        if APP_ENV == "prod":
            from langchain_pinecone import PineconeVectorStore
            from pinecone import Pinecone

            pc = Pinecone(api_key=PINECONE_API_KEY)
            index = pc.Index(PINECONE_INDEX_NAME)

            return PineconeVectorStore.from_documents(
                documents=chunks,
                embedding=embedding_fn,
                index_name=PINECONE_INDEX_NAME,
                namespace=namespace_id,
            )
        else:
            from langchain_community.vectorstores import Chroma

            return Chroma.from_documents(chunks, embedding_fn)

    def get_retriever_for_config(
        self, chunk_strat: str, embed_model: str
    ) -> Tuple[Any, Any]:
        """Builds and indexes the vector store ONCE per (chunker, embed_model) pair."""
        chunks = self.get_chunker(chunk_strat).split_documents(self.raw_docs)
        embed_fn = self.get_embedding_model(embed_model)

        namespace = f"{chunk_strat}-{embed_model.replace(':', '-')}"
        vector_store = self.build_vector_store(chunks, embed_fn, namespace)
        return vector_store.as_retriever(search_kwargs={"k": 3}), embed_fn

    def evaluate_retriever_with_llm(
        self,
        retriever: Any,
        embed_fn: Any,
        chunk_strat: str,
        embed_model: str,
        llm_model: str,
        test_dataset: List[Dict] | None = None,
    ) -> Dict[str, Any]:
        """Reuses an existing retriever to run LLM context retrieval and RAGAS evaluation."""
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

        for q in questions:
            retrieved_docs = retriever.invoke(q)
            if retrieved_docs:
                contexts.append([doc.page_content for doc in retrieved_docs])
                answers.append(retrieved_docs[0].page_content[:200])
            else:
                contexts.append(["No context found"])
                answers.append("No context found")

        latency = round((time.time() - start_time) * 1000, 2)

        dataset = Dataset.from_dict(
            {
                "question": questions,
                "answer": answers,
                "contexts": contexts,
                "ground_truth": ground_truth_single,
                "ground_truths": ground_truths_list,
            }
        )

        evaluator_llm = LangchainLLMWrapper(self.get_llm(llm_model))
        evaluator_embeddings = LangchainEmbeddingsWrapper(embed_fn)

        ragas_result = evaluate(
            dataset=dataset,
            metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
            llm=evaluator_llm,
            embeddings=evaluator_embeddings,
        )

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
            "chunking_strategy": chunk_strat,
            "embedding_model": embed_model,
            "llm_model": llm_model,
            "latency_ms": latency,
            "metrics": cleaned_metrics,
        }

    def run_single_config(
        self,
        chunk_strat: str,
        embed_model: str,
        llm_model: str,
        test_dataset: List[Dict] | None = None,
    ) -> Dict[str, Any]:
        """Backwards-compatible helper for single runs."""
        retriever, embed_fn = self.get_retriever_for_config(chunk_strat, embed_model)
        return self.evaluate_retriever_with_llm(
            retriever=retriever,
            embed_fn=embed_fn,
            chunk_strat=chunk_strat,
            embed_model=embed_model,
            llm_model=llm_model,
            test_dataset=test_dataset,
        )


def evaluate_pdf_with_ragas(
    pdf_path: str,
    chunk_strat: str = "recursive",
    embed_model: str | None = None,
    llm_model: str | None = None,
    test_dataset: List[Dict] | None = None,
) -> Dict[str, Any]:
    if embed_model is None:
        embed_model = PROD_EMBED_MODEL_1 if APP_ENV == "prod" else DEV_EMBED_MODEL_1

    if llm_model is None:
        llm_model = PROD_LLM_MODEL_1 if APP_ENV == "prod" else DEV_LLM_MODEL_1

    engine = RAGBenchmarkEngine(pdf_path)
    return engine.run_single_config(chunk_strat, embed_model, llm_model, test_dataset)
