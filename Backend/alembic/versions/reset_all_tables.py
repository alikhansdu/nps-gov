# alembic/versions/reset_all_tables.py
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from app.core.security import hash_password

revision = '20260325_reset_all'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # --- DROP TABLES ---
    op.execute("DROP TABLE IF EXISTS responses CASCADE;")
    op.execute("DROP TABLE IF EXISTS options CASCADE;")
    op.execute("DROP TABLE IF EXISTS questions CASCADE;")
    op.execute("DROP TABLE IF EXISTS surveys CASCADE;")
    op.execute("DROP TABLE IF EXISTS users CASCADE;")
    op.execute("DROP TABLE IF EXISTS regions CASCADE;")

    # --- DROP ENUM TYPES ---
    op.execute("DROP TYPE IF EXISTS question_type;")
    op.execute("DROP TYPE IF EXISTS survey_status;")
    op.execute("DROP TYPE IF EXISTS user_role;")

    # --- CREATE ENUM TYPES ---
    # Postgres doesn't support CREATE TYPE IF NOT EXISTS, so we use a DO-block.
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                CREATE TYPE user_role AS ENUM ('citizen', 'government');
            END IF;
        END$$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'survey_status') THEN
                CREATE TYPE survey_status AS ENUM ('draft', 'active', 'completed');
            END IF;
        END$$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
                CREATE TYPE question_type AS ENUM ('single', 'multiple', 'text');
            END IF;
        END$$;
        """
    )

    userrole = postgresql.ENUM('citizen', 'government', name='user_role', create_type=False)
    survey_status = postgresql.ENUM('draft', 'active', 'completed', name='survey_status', create_type=False)
    question_type = postgresql.ENUM('single', 'multiple', 'text', name='question_type', create_type=False)

    # --- CREATE TABLES ---
    op.create_table(
        'regions',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(255), nullable=False, unique=True),
        sa.Column('code', sa.String(32), nullable=False, unique=True),
    )
    op.create_index("ix_regions_code", "regions", ["code"], unique=True)

    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('iin', sa.String(12), nullable=False, unique=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=True, unique=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', userrole, nullable=False, server_default='citizen'),
        sa.Column('region_id', sa.Integer, sa.ForeignKey('regions.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column('is_active', sa.Boolean, server_default=sa.text("true"), nullable=False),
    )
    op.create_index("ix_users_iin", "users", ["iin"], unique=True)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        'surveys',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('created_by', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('status', survey_status, nullable=False, server_default='draft'),
        sa.Column('region_id', sa.Integer, sa.ForeignKey('regions.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column('end_date', sa.Date, nullable=True),
    )
    op.create_index("ix_surveys_created_at", "surveys", ["created_at"], unique=False)

    op.create_table(
        'questions',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('survey_id', sa.Integer, sa.ForeignKey('surveys.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question_text', sa.Text, nullable=False),
        sa.Column('question_type', question_type, nullable=False),
        sa.Column('order_index', sa.Integer, nullable=False, server_default='0'),
    )

    op.create_table(
        'options',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('question_id', sa.Integer, sa.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('option_text', sa.Text, nullable=False),
        sa.Column('order_index', sa.Integer, nullable=False, server_default='0'),
    )

    op.create_table(
        'responses',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('survey_id', sa.Integer, sa.ForeignKey('surveys.id'), nullable=False),
        sa.Column('question_id', sa.Integer, sa.ForeignKey('questions.id'), nullable=False),
        sa.Column('option_id', sa.Integer, sa.ForeignKey('options.id'), nullable=True),
        sa.Column('text_answer', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint('user_id', 'survey_id', 'question_id', name='uq_response_user_survey_question'),
    )

    # --- SEED (MOCK) DATA ---
    conn = op.get_bind()

    regions_t = sa.table(
        "regions",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
        sa.column("code", sa.String),
    )
    users_t = sa.table(
        "users",
        sa.column("id", sa.Integer),
        sa.column("iin", sa.String),
        sa.column("name", sa.String),
        sa.column("email", sa.String),
        sa.column("hashed_password", sa.String),
        sa.column("role", userrole),
        sa.column("region_id", sa.Integer),
        sa.column("is_active", sa.Boolean),
    )
    surveys_t = sa.table(
        "surveys",
        sa.column("id", sa.Integer),
        sa.column("title", sa.String),
        sa.column("description", sa.Text),
        sa.column("created_by", sa.Integer),
        sa.column("status", survey_status),
        sa.column("region_id", sa.Integer),
        sa.column("end_date", sa.Date),
    )
    questions_t = sa.table(
        "questions",
        sa.column("id", sa.Integer),
        sa.column("survey_id", sa.Integer),
        sa.column("question_text", sa.Text),
        sa.column("question_type", question_type),
        sa.column("order_index", sa.Integer),
    )
    options_t = sa.table(
        "options",
        sa.column("id", sa.Integer),
        sa.column("question_id", sa.Integer),
        sa.column("option_text", sa.Text),
        sa.column("order_index", sa.Integer),
    )
    responses_t = sa.table(
        "responses",
        sa.column("id", sa.Integer),
        sa.column("user_id", sa.Integer),
        sa.column("survey_id", sa.Integer),
        sa.column("question_id", sa.Integer),
        sa.column("option_id", sa.Integer),
        sa.column("text_answer", sa.Text),
    )

    demo_pwd = hash_password("demo123")
    admin_pwd = hash_password("admin123")

    op.bulk_insert(
        regions_t,
        [
            {"id": 1, "name": "Almaty", "code": "ALM"},
            {"id": 2, "name": "Astana", "code": "AST"},
            {"id": 3, "name": "Shymkent", "code": "SHY"},
        ],
    )

    op.bulk_insert(
        users_t,
        [
            {
                "id": 1,
                "iin": "000000000001",
                "name": "Demo Government",
                "email": "gov@example.com",
                "hashed_password": admin_pwd,
                "role": "government",
                "region_id": 2,
                "is_active": True,
            },
            {
                "id": 2,
                "iin": "000000000002",
                "name": "Demo Citizen",
                "email": "citizen@example.com",
                "hashed_password": demo_pwd,
                "role": "citizen",
                "region_id": 1,
                "is_active": True,
            },
            {
                "id": 3,
                "iin": "000000000003",
                "name": "Demo Admin Gov",
                "email": "admin@example.com",
                "hashed_password": admin_pwd,
                "role": "government",
                "region_id": 2,
                "is_active": True,
            },
        ],
    )

    op.bulk_insert(
        surveys_t,
        [
            {
                "id": 1,
                "title": "Public Service Satisfaction (Demo)",
                "description": "Demo survey seeded by migration.",
                "created_by": 1,
                "status": "active",
                "region_id": 2,
                "end_date": None,
            },
            {
                "id": 2,
                "title": "City Services Feedback (Demo)",
                "description": "Second demo survey for analytics.",
                "created_by": 1,
                "status": "completed",
                "region_id": 1,
                "end_date": None,
            },
        ],
    )

    op.bulk_insert(
        questions_t,
        [
            {
                "id": 1,
                "survey_id": 1,
                "question_text": "How satisfied are you overall?",
                "question_type": "single",
                "order_index": 0,
            },
            {
                "id": 2,
                "survey_id": 1,
                "question_text": "Any comments?",
                "question_type": "text",
                "order_index": 1,
            },
            {
                "id": 3,
                "survey_id": 2,
                "question_text": "Would you recommend this service?",
                "question_type": "single",
                "order_index": 0,
            },
        ],
    )

    op.bulk_insert(
        options_t,
        [
            {"id": 1, "question_id": 1, "option_text": "Very satisfied", "order_index": 0},
            {"id": 2, "question_id": 1, "option_text": "Satisfied", "order_index": 1},
            {"id": 3, "question_id": 1, "option_text": "Neutral", "order_index": 2},
            {"id": 4, "question_id": 1, "option_text": "Dissatisfied", "order_index": 3},
            {"id": 5, "question_id": 1, "option_text": "Very dissatisfied", "order_index": 4},
            {"id": 6, "question_id": 3, "option_text": "Yes", "order_index": 0},
            {"id": 7, "question_id": 3, "option_text": "No", "order_index": 1},
        ],
    )

    # Minimal responses for analytics/pages to have something to show.
    op.bulk_insert(
        responses_t,
        [
            {"id": 1, "user_id": 2, "survey_id": 1, "question_id": 1, "option_id": 2, "text_answer": None},
            {"id": 2, "user_id": 2, "survey_id": 1, "question_id": 2, "option_id": None, "text_answer": "Everything was ok."},
            {"id": 3, "user_id": 2, "survey_id": 2, "question_id": 3, "option_id": 6, "text_answer": None},
        ],
    )

    # Ensure sequences continue after fixed ids
    conn.execute(sa.text("SELECT setval('regions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM regions));"))
    conn.execute(sa.text("SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));"))
    conn.execute(sa.text("SELECT setval('surveys_id_seq', (SELECT COALESCE(MAX(id), 1) FROM surveys));"))
    conn.execute(sa.text("SELECT setval('questions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM questions));"))
    conn.execute(sa.text("SELECT setval('options_id_seq', (SELECT COALESCE(MAX(id), 1) FROM options));"))
    conn.execute(sa.text("SELECT setval('responses_id_seq', (SELECT COALESCE(MAX(id), 1) FROM responses));"))

def downgrade():
    op.drop_table('responses')
    op.drop_table('options')
    op.drop_table('questions')
    op.drop_table('surveys')
    op.drop_table('users')
    op.drop_index("ix_regions_code", table_name="regions")
    op.drop_table('regions')

    op.execute("DROP TYPE IF EXISTS question_type;")
    op.execute("DROP TYPE IF EXISTS survey_status;")
    op.execute("DROP TYPE IF EXISTS user_role;")