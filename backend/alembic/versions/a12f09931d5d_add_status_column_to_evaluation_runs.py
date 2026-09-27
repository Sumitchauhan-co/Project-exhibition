"""add status column to evaluation_runs

Revision ID: a12f09931d5d
Revises:
Create Date: 2026-09-27 09:34:55.178354

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "a12f09931d5d"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = [col["name"] for col in inspector.get_columns("evaluation_runs")]

    # 1. Create the Enum type in PostgreSQL if it doesn't exist yet
    job_status_enum = sa.Enum(
        "PENDING", "PROCESSING", "COMPLETED", "FAILED", name="jobstatus"
    )
    job_status_enum.create(bind, checkfirst=True)

    # 2. Add 'status' column if missing
    if "status" not in existing_columns:
        op.add_column(
            "evaluation_runs",
            sa.Column(
                "status", job_status_enum, nullable=False, server_default="PENDING"
            ),
        )

    # 3. Add 'error_message' column if missing
    if "error_message" not in existing_columns:
        op.add_column(
            "evaluation_runs",
            sa.Column("error_message", sa.String(), nullable=True),
        )

    # 4. Add 'job_id' column and index if missing
    if "job_id" not in existing_columns:
        op.add_column(
            "evaluation_runs",
            sa.Column("job_id", sa.String(), nullable=True),
        )
        op.create_index(
            op.f("ix_evaluation_runs_job_id"),
            "evaluation_runs",
            ["job_id"],
            unique=True,
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = [col["name"] for col in inspector.get_columns("evaluation_runs")]

    if "job_id" in existing_columns:
        op.drop_index(op.f("ix_evaluation_runs_job_id"), table_name="evaluation_runs")
        op.drop_column("evaluation_runs", "job_id")

    if "error_message" in existing_columns:
        op.drop_column("evaluation_runs", "error_message")

    if "status" in existing_columns:
        op.drop_column("evaluation_runs", "status")

    # Optionally drop the enum type if needed
    job_status_enum = sa.Enum(
        "PENDING", "PROCESSING", "COMPLETED", "FAILED", name="jobstatus"
    )
    job_status_enum.drop(bind, checkfirst=True)
