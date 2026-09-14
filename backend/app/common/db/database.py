import os
from typing import Generator
from sqlmodel import create_engine, Session, SQLModel
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/project_exhibition"
)

# Added pool settings to prevent SSL connection drops on cloud databases like Render
engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,  # Checks connection validity before executing queries
    pool_recycle=300,  # Recycles connections every 5 minutes (300s)
    pool_size=10,  # Maintained pool connections
    max_overflow=20,  # Extra burst connections allowed
)


def init_db() -> None:
    """Creates all defined SQLModel tables in PostgreSQL."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """FastAPI Dependency yielding a db session per request with automatic closure."""
    with Session(engine) as session:
        yield session
