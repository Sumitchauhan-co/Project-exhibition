import os
from typing import Generator
from dotenv import load_dotenv
from sqlmodel import SQLModel, Session, create_engine

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/project_exhibition"
)

# Optimized engine setup for Neon / Serverless PostgreSQL:
# 1. Disabled echo logging (echo=False) to reduce RAM overhead.
# 2. pool_pre_ping & pool_recycle handle Neon compute autosuspend/stale sockets.
# 3. sslmode=require and prepare_threshold=0 prevent PgBouncer SSL drop errors.
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=5,
    connect_args={
        "sslmode": "require" if "neon.tech" in DATABASE_URL else "prefer",
        "options": "-c prepare_threshold=0",
    },
)


def init_db() -> None:
    """Creates all defined SQLModel tables in PostgreSQL."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """FastAPI Dependency yielding a db session per request with automatic closure."""
    with Session(engine) as session:
        yield session
