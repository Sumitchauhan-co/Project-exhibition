import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin, ModelView

if __package__ in {None, ""}:
    project_root = Path(__file__).resolve().parent.parent
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))

from app.common.db.database import engine, init_db
from app.common.utils import APP_ENV, APP_URL, APP_URLS
from app.common.utils.api_router import api_v1_router

# Import SQLModel entities for Admin visual inspection
from app.module.auth.model import User

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")


# Define Admin views for SQLModel tables
class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.email, User.full_name, User.is_active, User.created_at]
    column_searchable_list = [User.email, User.full_name]
    column_sortable_list = [User.id, User.created_at]
    icon = "fa-solid font-bold fa-user"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown tasks."""
    print(f"🚀 Application starting in [{APP_ENV.upper()}] mode...")
    init_db()  # Initializes SQLModel database tables on application startup
    yield
    print("🛑 Application shutting down...")


app = FastAPI(
    title="RAG Pipeline Evaluation API",
    version="1.0.0",
    lifespan=lifespan,
)

# Initialize SQLAdmin dashboard attached to PostgreSQL engine
admin = Admin(app, engine, title="RAG Benchmark Studio")
admin.add_view(UserAdmin)

allow_creds = APP_URL != "*"
allowed_origins = [origin for origin in APP_URLS if origin and origin != "*"]

if not allowed_origins:
    allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\\.ngrok(-free)?\\.dev|https://.*\\.ngrok\\.io|http://localhost:\\d+|http://127.0.0.1:\\d+",
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RAG Benchmark API"}


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
