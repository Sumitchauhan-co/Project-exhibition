import os
from typing import Generator
from dotenv import load_dotenv
from sqlmodel import SQLModel, Session, create_engine

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/project_exhibition"
)

# Determine SSL mode based on Neon/remote deployment
ssl_mode = "require" if "neon.tech" in DATABASE_URL else "prefer"

# Optimized engine setup for Neon / Serverless / Local PostgreSQL:
# 1. Disabled echo logging (echo=False) to reduce RAM overhead.
# 2. pool_pre_ping & pool_recycle handle Neon compute autosuspend/stale sockets.
# 3. connect_args passes valid libpq connection parameters for psycopg2/psycopg.
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=5,
    connect_args={
        "sslmode": ssl_mode,
    },
)


def init_db() -> None:
    """Creates all defined SQLModel tables in PostgreSQL."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """FastAPI Dependency yielding a db session per request with automatic closure."""
    with Session(engine) as session:
        yield session
