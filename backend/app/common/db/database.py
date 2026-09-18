import os
from typing import Generator
from dotenv import load_dotenv
from sqlmodel import SQLModel, Session, create_engine

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/project_exhibition"
)

# Optimized engine setup:
# 1. Disabled echo logging (echo=False) to stop string formatting overhead in RAM.
# 2. Reduced pool_size and max_overflow to keep connection memory footprint lightweight.
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to False to prevent high RAM consumption from query logging
    pool_pre_ping=True,  # Checks connection validity before executing queries
    pool_recycle=300,  # Recycles connections every 5 minutes (300s)
    pool_size=5,  # Reduced active pool size for free tier hosting memory management
    max_overflow=5,  # Reduced max overflow burst connections
)


def init_db() -> None:
    """Creates all defined SQLModel tables in PostgreSQL."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """FastAPI Dependency yielding a db session per request with automatic closure."""
    with Session(engine) as session:
        yield session
