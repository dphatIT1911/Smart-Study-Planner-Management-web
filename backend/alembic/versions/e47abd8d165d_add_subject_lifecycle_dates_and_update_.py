"""Add subject lifecycle dates and update constraints

Revision ID: e47abd8d165d
Revises: ed68e4ef9a54
Create Date: 2026-04-11 10:37:57.759590

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e47abd8d165d'
down_revision: Union[str, Sequence[str], None] = 'ed68e4ef9a54'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Add columns as nullable first
    op.add_column('subjects', sa.Column('start_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('subjects', sa.Column('end_date', sa.DateTime(timezone=True), nullable=True))
    
    # 2. Set default values for existing rows to avoid NOT NULL violation
    # Using current timestamp for start_date and +100 days for end_date as sensible defaults
    op.execute("UPDATE subjects SET start_date = CURRENT_TIMESTAMP WHERE start_date IS NULL")
    op.execute("UPDATE subjects SET end_date = CURRENT_TIMESTAMP + INTERVAL '100 days' WHERE end_date IS NULL")
    
    # 3. Now set columns to NOT NULL
    op.alter_column('subjects', 'start_date', nullable=False, existing_type=sa.DateTime(timezone=True))
    op.alter_column('subjects', 'end_date', nullable=False, existing_type=sa.DateTime(timezone=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('subjects', 'end_date')
    op.drop_column('subjects', 'start_date')
