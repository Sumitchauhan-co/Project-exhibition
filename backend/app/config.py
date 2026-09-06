import os
from dotenv import load_dotenv

load_dotenv()

# Active environment: "dev" or "prod"
APP_ENV = os.getenv("APP_ENV", "dev").lower()
APP_URL = os.getenv("APP_URL", "http://localhost:5173")

# Local Dev Settings (Ollama + Chroma)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# 2 LLMs
DEV_LLM_MODEL_1 = os.getenv("DEV_LLM_MODEL_1", "gemma4:31b-cloud")
DEV_LLM_MODEL_2 = os.getenv("DEV_LLM_MODEL_2", "gemma4:31b-cloud")

# 2 Embedding Models
DEV_EMBED_MODEL_1 = os.getenv("DEV_EMBED_MODEL_1", "qwen3-embedding:latest")
DEV_EMBED_MODEL_2 = os.getenv("DEV_EMBED_MODEL_2", "qwen3-embedding:latest")

# Production Settings (OpenAI + Pinecone)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# 2 LLMs
PROD_LLM_MODEL_1 = os.getenv("PROD_LLM_MODEL_1", "gpt-4o-mini")
PROD_LLM_MODEL_2 = os.getenv("PROD_LLM_MODEL_2", "gpt-4o")

# 2 Embedding Models
PROD_EMBED_MODEL_1 = os.getenv("PROD_EMBED_MODEL_1", "text-embedding-3-small")
PROD_EMBED_MODEL_2 = os.getenv("PROD_EMBED_MODEL_2", "text-embedding-3-large")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "rag-production-index")
