import os
from dotenv import load_dotenv

load_dotenv()

# Active environment: "dev" or "prod"
APP_ENV = os.getenv("APP_ENV", "dev").lower()
APP_URL = os.getenv("APP_URL", "http://localhost:5173")


def _split_env_list(raw_value: str | None) -> list[str]:
    if not raw_value:
        return []
    return [item.strip() for item in raw_value.split(",") if item.strip()]


APP_URLS = _split_env_list(os.getenv("CORS_ORIGINS")) or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    str(APP_URL).strip(),
]

APP_URLS = list(dict.fromkeys(APP_URLS))


### JWT Authentication Settings
JWT_ACCESS_SECRET_TOKEN = os.getenv("JWT_ACCESS_SECRET_TOKEN")
JWT_REFRESH_SECRET_TOKEN = os.getenv("JWT_REFRESH_SECRET_TOKEN")

JWT_ACCESS_TOKEN_EXPIRY = os.getenv("JWT_ACCESS_TOKEN_EXPIRY")
JWT_REFRESH_TOKEN_EXPIRY = os.getenv("JWT_REFRESH_TOKEN_EXPIRY")

# Default signing algorithm
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")


### Razorpay Payment Gateway Settings
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")


### Local Dev Settings (Ollama + FAISS / Chroma)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# 2 LLMs (Dev)
DEV_LLM_MODEL_1 = os.getenv("DEV_LLM_MODEL_1", "gemma4:31b-cloud")
DEV_LLM_MODEL_2 = os.getenv("DEV_LLM_MODEL_2", "")

# 2 Embedding Models (Dev)
DEV_EMBED_MODEL_1 = os.getenv("DEV_EMBED_MODEL_1", "qwen3-embedding:latest")
DEV_EMBED_MODEL_2 = os.getenv("DEV_EMBED_MODEL_2", "")

# Vector DB (Dev)
DEV_VECTOR_DB = os.getenv("DEV_VECTOR_DB", "chroma")


### Production Settings (OpenAI + Pinecone / Chroma)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# 2 LLMs (Prod)
PROD_LLM_MODEL_1 = os.getenv("PROD_LLM_MODEL_1", "gpt-4o-mini")
PROD_LLM_MODEL_2 = os.getenv("PROD_LLM_MODEL_2", "gpt-4o")

# 2 Embedding Models (Prod)
PROD_EMBED_MODEL_1 = os.getenv("PROD_EMBED_MODEL_1", "text-embedding-3-small")
PROD_EMBED_MODEL_2 = os.getenv("PROD_EMBED_MODEL_2", "text-embedding-3-large")

# Vector DB (Prod)
PROD_VECTOR_DB = os.getenv("PROD_VECTOR_DB", "pg-vector")

DATABASE_URL = os.getenv("DATABASE_URL")

GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID")
