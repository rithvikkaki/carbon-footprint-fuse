"""intelligence_and_provenance

Revision ID: 0340dff12223
Revises: 0340dff12222
Create Date: 2026-10-11 17:46:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0340dff12223'
down_revision: Union[str, Sequence[str], None] = '0340dff12222'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. user_reduction_targets
    op.create_table(
        'user_reduction_targets',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=False),
        sa.Column('target_name', sa.String(length=150), nullable=False),
        sa.Column('target_type', sa.String(length=50), nullable=True, server_default='reduction_percentage'),
        sa.Column('target_value', sa.Float(), nullable=False),
        sa.Column('baseline_annual_kg', sa.Float(), nullable=False),
        sa.Column('target_annual_kg', sa.Float(), nullable=False),
        sa.Column('target_year', sa.Integer(), nullable=True, server_default='2026'),
        sa.Column('status', sa.String(length=50), nullable=True, server_default='active'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_reduction_targets_user_id'), 'user_reduction_targets', ['user_id'], unique=False)

    # 2. reduction_recommendations
    op.create_table(
        'reduction_recommendations',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('estimated_annual_saving_kg', sa.Float(), nullable=False),
        sa.Column('difficulty', sa.String(length=50), nullable=True, server_default='moderate'),
        sa.Column('assumptions', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True, server_default='suggested'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reduction_recommendations_user_id'), 'reduction_recommendations', ['user_id'], unique=False)

    # 3. corporate_facilities
    op.create_table(
        'corporate_facilities',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=False),
        sa.Column('organization_name', sa.String(length=150), nullable=False),
        sa.Column('facility_name', sa.String(length=150), nullable=False),
        sa.Column('department', sa.String(length=100), nullable=True, server_default='Operations'),
        sa.Column('country', sa.String(length=100), nullable=True, server_default='United States'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_corporate_facilities_user_id'), 'corporate_facilities', ['user_id'], unique=False)

    # 4. corporate_emission_records
    op.create_table(
        'corporate_emission_records',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('facility_id', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=False),
        sa.Column('reporting_period', sa.String(length=50), nullable=False),
        sa.Column('scope', sa.String(length=50), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('emissions_kg', sa.Float(), nullable=False),
        sa.Column('activity_metric', sa.Float(), nullable=False),
        sa.Column('metric_unit', sa.String(length=50), nullable=False),
        sa.Column('emission_factor_source', sa.String(length=150), nullable=True, server_default='EPA 2024 GHG Hub / IEA'),
        sa.Column('audit_status', sa.String(length=50), nullable=True, server_default='internal_review'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['facility_id'], ['corporate_facilities.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_corporate_emission_records_facility_id'), 'corporate_emission_records', ['facility_id'], unique=False)
    op.create_index(op.f('ix_corporate_emission_records_user_id'), 'corporate_emission_records', ['user_id'], unique=False)

    # 5. credit_batches
    op.create_table(
        'credit_batches',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('batch_number', sa.String(length=100), nullable=False),
        sa.Column('owner_id', sa.String(length=50), nullable=False),
        sa.Column('creator_id', sa.String(length=50), nullable=False),
        sa.Column('project_name', sa.String(length=255), nullable=False),
        sa.Column('project_type', sa.String(length=100), nullable=False),
        sa.Column('project_location', sa.String(length=150), nullable=False),
        sa.Column('methodology', sa.String(length=150), nullable=False),
        sa.Column('registry_name', sa.String(length=150), nullable=False),
        sa.Column('registry_id', sa.String(length=100), nullable=True),
        sa.Column('vintage_year', sa.Integer(), nullable=False),
        sa.Column('initial_quantity', sa.Float(), nullable=False),
        sa.Column('available_quantity', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(length=50), nullable=True, server_default='tCO2e'),
        sa.Column('verification_org', sa.String(length=150), nullable=True),
        sa.Column('verification_status', sa.String(length=50), nullable=True, server_default='draft'),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('reviewer_id', sa.String(length=50), nullable=True),
        sa.Column('verified_at', sa.DateTime(), nullable=True),
        sa.Column('evidence_doc_name', sa.String(length=255), nullable=True),
        sa.Column('evidence_doc_url', sa.String(length=500), nullable=True),
        sa.Column('evidence_hash', sa.String(length=100), nullable=True),
        sa.Column('is_retired', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id']),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_credit_batches_batch_number'), 'credit_batches', ['batch_number'], unique=True)
    op.create_index(op.f('ix_credit_batches_owner_id'), 'credit_batches', ['owner_id'], unique=False)

    # 6. credit_verification_logs
    op.create_table(
        'credit_verification_logs',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('batch_id', sa.String(length=50), nullable=False),
        sa.Column('actor_id', sa.String(length=50), nullable=False),
        sa.Column('from_status', sa.String(length=50), nullable=False),
        sa.Column('to_status', sa.String(length=50), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id']),
        sa.ForeignKeyConstraint(['batch_id'], ['credit_batches.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_credit_verification_logs_batch_id'), 'credit_verification_logs', ['batch_id'], unique=False)

    # 7. credit_retirements
    op.create_table(
        'credit_retirements',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('batch_id', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('beneficiary', sa.String(length=255), nullable=False),
        sa.Column('retirement_reason', sa.String(length=255), nullable=False),
        sa.Column('certificate_code', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['batch_id'], ['credit_batches.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_credit_retirements_batch_id'), 'credit_retirements', ['batch_id'], unique=False)
    op.create_index(op.f('ix_credit_retirements_certificate_code'), 'credit_retirements', ['certificate_code'], unique=True)
    op.create_index(op.f('ix_credit_retirements_user_id'), 'credit_retirements', ['user_id'], unique=False)

    # 8. Add batch_id to market_listings
    op.add_column('market_listings', sa.Column('batch_id', sa.String(length=50), nullable=True))
    op.create_foreign_key('fk_market_listings_batch_id', 'market_listings', 'credit_batches', ['batch_id'], ['id'])
    op.create_index(op.f('ix_market_listings_batch_id'), 'market_listings', ['batch_id'], unique=False)


def downgrade() -> None:
    op.drop_constraint('fk_market_listings_batch_id', 'market_listings', type_='foreignkey')
    op.drop_index(op.f('ix_market_listings_batch_id'), table_name='market_listings')
    op.drop_column('market_listings', 'batch_id')

    op.drop_table('credit_retirements')
    op.drop_table('credit_verification_logs')
    op.drop_table('credit_batches')
    op.drop_table('corporate_emission_records')
    op.drop_table('corporate_facilities')
    op.drop_table('reduction_recommendations')
    op.drop_table('user_reduction_targets')
