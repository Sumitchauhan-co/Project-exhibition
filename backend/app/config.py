import os
from dotenv import load_dotenv

load_dotenv()

# Active environment: "dev" or "prod"
APP_ENV = os.getenv("APP_ENV", "dev").lower()
APP_URL = os.getenv("APP_URL", "http://localhost:5173")


### Local Dev Settings (Ollama + FAISS / Chroma)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# 2 LLMs (Dev)
DEV_LLM_MODEL_1 = os.getenv("DEV_LLM_MODEL_1", "gemma4:31b-cloud")
DEV_LLM_MODEL_2 = os.getenv("DEV_LLM_MODEL_2", "")

# 2 Embedding Models (Dev)
DEV_EMBED_MODEL_1 = os.getenv("DEV_EMBED_MODEL_1", "qwen3-embedding:latest")
DEV_EMBED_MODEL_2 = os.getenv("DEV_EMBED_MODEL_2", "")

# Vector DB (Dev)
DEV_VECTOR_DB = os.getenv(
    "DEV_VECTOR_DB", "chroma"
)  # Options: faiss, chroma, qdrant, etc.


### Production Settings (OpenAI + Pinecone / Chroma)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# 2 LLMs (Prod)
PROD_LLM_MODEL_1 = os.getenv("PROD_LLM_MODEL_1", "gpt-4o-mini")
PROD_LLM_MODEL_2 = os.getenv("PROD_LLM_MODEL_2", "gpt-4o")

# 2 Embedding Models (Prod)
PROD_EMBED_MODEL_1 = os.getenv("PROD_EMBED_MODEL_1", "text-embedding-3-small")
PROD_EMBED_MODEL_2 = os.getenv("PROD_EMBED_MODEL_2", "text-embedding-3-large")

# Vector DB (Prod)
PROD_VECTOR_DB = os.getenv(
    "PROD_VECTOR_DB", "pinecone"
)  # Options: pinecone, chroma, pgvector, qdrant

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "rag-production-index")
