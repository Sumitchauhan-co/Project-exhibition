import os
from typing import Generator
from sqlmodel import create_engine, Session, SQLModel
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/project_exhibition"
)

# echo=True prints raw SQL queries in your console for debugging during development
engine = create_engine(DATABASE_URL, echo=True)


def init_db() -> None:
    """Creates all defined SQLModel tables in PostgreSQL."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """FastAPI Dependency yielding a db session per request with automatic closure."""
    with Session(engine) as session:
        yield session
