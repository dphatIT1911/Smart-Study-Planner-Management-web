"""add_is_done_to_subject

Revision ID: b3a89341e4d0
Revises: ed68e4ef9a54
Create Date: 2026-04-11 11:35:53.771923

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3a89341e4d0'
down_revision: Union[str, Sequence[str], None] = 'ed68e4ef9a54'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add column as nullable first
    op.add_column('subjects', sa.Column('is_done', sa.Boolean(), nullable=True))
    
    # Set default value for existing rows
    op.execute("UPDATE subjects SET is_done = FALSE")
    
    # Make column non-nullable
    op.alter_column('subjects', 'is_done', nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('subjects', 'is_done')
