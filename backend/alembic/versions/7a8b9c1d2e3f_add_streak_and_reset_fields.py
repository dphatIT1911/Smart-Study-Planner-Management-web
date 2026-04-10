"""Add streak and reset fields to users

Revision ID: 7a8b9c1d2e3f
Revises: ed68e4ef9a54
Create Date: 2026-04-10 23:21:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a8b9c1d2e3f'
down_revision: Union[str, Sequence[str], None] = 'ed68e4ef9a54'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add reset password fields
    op.add_column('users', sa.Column('reset_token', sa.String(), nullable=True))
    op.add_column('users', sa.Column('reset_token_expires', sa.DateTime(timezone=True), nullable=True))
    
    # Add streak fields
    op.add_column('users', sa.Column('streak_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('last_activity_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('streak_lost_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'streak_lost_at')
    op.drop_column('users', 'last_activity_date')
    op.drop_column('users', 'streak_count')
    op.drop_column('users', 'reset_token_expires')
    op.drop_column('users', 'reset_token')
