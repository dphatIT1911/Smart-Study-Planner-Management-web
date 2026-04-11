"""Merge heads: add streak and subject fields

Revision ID: 9f8793f86be8
Revises: b3a89341e4d0, 7a8b9c1d2e3f
Create Date: 2026-04-11 23:07:28.810165

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9f8793f86be8'
down_revision: Union[str, Sequence[str], None] = ('b3a89341e4d0', '7a8b9c1d2e3f')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
