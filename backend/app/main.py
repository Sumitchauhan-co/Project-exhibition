from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.benchmark import router as benchmark_router
from app.config import APP_ENV, APP_URL


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown tasks."""
    print(f"🚀 Application starting in [{APP_ENV.upper()}] mode...")
    yield
    print("🛑 Application shutting down...")


app = FastAPI(
    title="RAG Pipeline Evaluation API",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow credentials only when using specific origin URLs (not wildcards)
allow_creds = True if APP_URL != "*" else False

target_url = APP_URL or "http://localhost:5173"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[target_url],
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(benchmark_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RAG Benchmark API"}
