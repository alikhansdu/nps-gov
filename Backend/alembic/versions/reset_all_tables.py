from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from app.core.security import hash_password

revision = '20260325_reset_all'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    # --- CREATE ENUM TYPES ---
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                CREATE TYPE user_role AS ENUM ('citizen', 'government');
            END IF;
        END$$;
    """)
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'survey_status') THEN
                CREATE TYPE survey_status AS ENUM ('draft', 'active', 'completed');
            END IF;
        END$$;
    """)
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
                CREATE TYPE question_type AS ENUM ('single', 'multiple', 'text');
            END IF;
        END$$;
    """)

    # --- CREATE TABLES IF NOT EXISTS ---
    op.execute("""
        CREATE TABLE IF NOT EXISTS regions (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            code VARCHAR(32) NOT NULL UNIQUE
        );
    """)
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_regions_code ON regions (code);")

    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            iin VARCHAR(12) UNIQUE,
            phone VARCHAR(20) UNIQUE,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE,
            hashed_password VARCHAR(255) NOT NULL,
            role user_role NOT NULL DEFAULT 'citizen',
            region_id INTEGER REFERENCES regions(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            is_active BOOLEAN NOT NULL DEFAULT true,
            age INTEGER,
            gender VARCHAR(10),
            organization VARCHAR(255)
        );
    """)
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_iin ON users (iin);")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email);")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_phone ON users (phone);")

    op.execute("""
        CREATE TABLE IF NOT EXISTS surveys (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            created_by INTEGER NOT NULL REFERENCES users(id),
            status survey_status NOT NULL DEFAULT 'draft',
            region_id INTEGER REFERENCES regions(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            end_date DATE
        );
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_surveys_created_at ON surveys (created_at);")

    op.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id SERIAL PRIMARY KEY,
            survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
            question_text TEXT NOT NULL,
            question_type question_type NOT NULL,
            order_index INTEGER NOT NULL DEFAULT 0
        );
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS options (
            id SERIAL PRIMARY KEY,
            question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
            option_text TEXT NOT NULL,
            order_index INTEGER NOT NULL DEFAULT 0
        );
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS responses (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            survey_id INTEGER NOT NULL REFERENCES surveys(id),
            question_id INTEGER NOT NULL REFERENCES questions(id),
            option_id INTEGER REFERENCES options(id),
            text_answer TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uq_response_user_survey_question UNIQUE (user_id, survey_id, question_id)
        );
    """)

    # --- ENSURE COLUMNS EXIST (idempotent) ---
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10);")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS organization VARCHAR(255);")
    op.execute("ALTER TABLE surveys ADD COLUMN IF NOT EXISTS category VARCHAR(100);")

    # --- SEED DATA (only if regions is empty) ---
    count = conn.execute(sa.text("SELECT COUNT(*) FROM regions")).scalar()
    if count > 0:
        return

    userrole      = postgresql.ENUM('citizen', 'government', name='user_role', create_type=False)
    survey_status = postgresql.ENUM('draft', 'active', 'completed', name='survey_status', create_type=False)
    question_type = postgresql.ENUM('single', 'multiple', 'text', name='question_type', create_type=False)

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
        sa.column("phone", sa.String),
        sa.column("name", sa.String),
        sa.column("email", sa.String),
        sa.column("hashed_password", sa.String),
        sa.column("role", userrole),
        sa.column("region_id", sa.Integer),
        sa.column("is_active", sa.Boolean),
        sa.column("age", sa.Integer),
        sa.column("gender", sa.String),
        sa.column("organization", sa.String),
    )
    surveys_t = sa.table(
        "surveys",
        sa.column("id", sa.Integer),
        sa.column("title", sa.String),
        sa.column("description", sa.Text),
        sa.column("category", sa.String),
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

    demo_pwd  = hash_password("demo123")
    admin_pwd = hash_password("admin123")

    # 17 регионов Казахстана
    op.bulk_insert(
        regions_t,
        [
            {"id": 1,  "name": "Алматы",                "code": "ALM"},
            {"id": 2,  "name": "Астана",                 "code": "AST"},
            {"id": 3,  "name": "Шымкент",                "code": "SHY"},
            {"id": 4,  "name": "Карагандинская",         "code": "KAR"},
            {"id": 5,  "name": "Актюбинская",            "code": "AKT"},
            {"id": 6,  "name": "Алматинская",            "code": "ALO"},
            {"id": 7,  "name": "Атырауская",             "code": "ATY"},
            {"id": 8,  "name": "Восточно-Казахстанская", "code": "VKO"},
            {"id": 9,  "name": "Жамбылская",             "code": "ZHM"},
            {"id": 10, "name": "Западно-Казахстанская",  "code": "ZKO"},
            {"id": 11, "name": "Костанайская",           "code": "KST"},
            {"id": 12, "name": "Кызылординская",         "code": "KZL"},
            {"id": 13, "name": "Мангистауская",          "code": "MAN"},
            {"id": 14, "name": "Павлодарская",           "code": "PAV"},
            {"id": 15, "name": "Северо-Казахстанская",   "code": "SKO"},
            {"id": 16, "name": "Туркестанская",          "code": "TUR"},
            {"id": 17, "name": "Абайская",               "code": "ABA"},
        ],
    )

    # 20 пользователей: 5 government + 15 citizen
    op.bulk_insert(
        users_t,
        [
            # --- government (5) ---
            {"id": 1,  "iin": "000000000001", "phone": "+77011110001", "name": "Алихан Смаилов",     "email": "gov1@example.com",      "hashed_password": admin_pwd, "role": "government", "region_id": 2,  "is_active": True, "age": 45, "gender": "male",   "organization": "Министерство цифрового развития"},
            {"id": 2,  "iin": "000000000002", "phone": "+77011110002", "name": "Нурлан Абенов",      "email": "gov2@example.com",      "hashed_password": admin_pwd, "role": "government", "region_id": 3,  "is_active": True, "age": 38, "gender": "male",   "organization": "Акимат г. Шымкент"},
            {"id": 3,  "iin": "000000000003", "phone": "+77011110003", "name": "Мадина Касымова",    "email": "gov3@example.com",      "hashed_password": admin_pwd, "role": "government", "region_id": 5,  "is_active": True, "age": 41, "gender": "female", "organization": "Министерство здравоохранения"},
            {"id": 4,  "iin": "000000000004", "phone": "+77011110004", "name": "Серік Жұмабеков",    "email": "gov4@example.com",      "hashed_password": admin_pwd, "role": "government", "region_id": 8,  "is_active": True, "age": 50, "gender": "male",   "organization": "Акимат ВКО"},
            {"id": 5,  "iin": "000000000005", "phone": "+77011110005", "name": "Гүлнар Сейтқали",    "email": "gov5@example.com",      "hashed_password": admin_pwd, "role": "government", "region_id": 11, "is_active": True, "age": 36, "gender": "female", "organization": "Министерство образования"},
            # --- citizen (15) ---
            {"id": 6,  "iin": "000000000006", "phone": "+77011110006", "name": "Айгерим Бекова",     "email": "citizen1@example.com",  "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 1,  "is_active": True, "age": 27, "gender": "female", "organization": None},
            {"id": 7,  "iin": "000000000007", "phone": "+77011110007", "name": "Дана Сейткали",      "email": "citizen2@example.com",  "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 4,  "is_active": True, "age": 33, "gender": "female", "organization": None},
            {"id": 8,  "iin": "000000000008", "phone": "+77011110008", "name": "Бауыржан Ержанов",   "email": "citizen3@example.com",  "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 2,  "is_active": True, "age": 29, "gender": "male",   "organization": None},
            {"id": 9,  "iin": "000000000009", "phone": "+77011110009", "name": "Салтанат Омарова",   "email": "citizen4@example.com",  "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 8,  "is_active": True, "age": 52, "gender": "female", "organization": None},
            {"id": 10, "iin": "000000000010", "phone": "+77011110010", "name": "Ерлан Досымов",      "email": "citizen5@example.com",  "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 11, "is_active": True, "age": 61, "gender": "male",   "organization": None},
            {"id": 11, "iin": "000000000011", "phone": "+77011110011", "name": "Жанар Ахметова",     "email": "citizen6@example.com",  "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 16, "is_active": True, "age": 44, "gender": "female", "organization": None},
            {"id": 12, "iin": "000000000012", "phone": "+77011110012", "name": "Тимур Касенов",      "email": "citizen7@example.com",  "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 7,  "is_active": True, "age": 35, "gender": "male",   "organization": None},
            {"id": 13, "iin": "000000000013", "phone": "+77011110013", "name": "Асель Нурланова",    "email": "citizen8@example.com",  "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 3,  "is_active": True, "age": 23, "gender": "female", "organization": None},
            {"id": 14, "iin": "000000000014", "phone": "+77011110014", "name": "Рустем Байжанов",    "email": "citizen9@example.com",  "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 6,  "is_active": True, "age": 39, "gender": "male",   "organization": None},
            {"id": 15, "iin": "000000000015", "phone": "+77011110015", "name": "Меруерт Алиева",     "email": "citizen10@example.com", "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 9,  "is_active": True, "age": 31, "gender": "female", "organization": None},
            {"id": 16, "iin": "000000000016", "phone": "+77011110016", "name": "Даурен Сатыбалды",   "email": "citizen11@example.com", "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 12, "is_active": True, "age": 47, "gender": "male",   "organization": None},
            {"id": 17, "iin": "000000000017", "phone": "+77011110017", "name": "Камила Джаксыбекова","email": "citizen12@example.com", "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 13, "is_active": True, "age": 26, "gender": "female", "organization": None},
            {"id": 18, "iin": "000000000018", "phone": "+77011110018", "name": "Нұрболат Әбенов",    "email": "citizen13@example.com", "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 14, "is_active": True, "age": 55, "gender": "male",   "organization": None},
            {"id": 19, "iin": "000000000019", "phone": "+77011110019", "name": "Зарина Мусина",      "email": "citizen14@example.com", "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 15, "is_active": True, "age": 42, "gender": "female", "organization": None},
            {"id": 20, "iin": "000000000020", "phone": "+77011110020", "name": "Арман Сагынтаев",    "email": "citizen15@example.com", "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 17, "is_active": True, "age": 58, "gender": "male",   "organization": None},
            # --- молодёжь 18-24 (8 новых), чуть больше мужчин ---
            {"id": 21, "iin": "000000000021", "phone": "+77011110021", "name": "Данияр Сейіт",        "email": "youth1@example.com",    "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 1,  "is_active": True, "age": 19, "gender": "male",   "organization": None},
            {"id": 22, "iin": "000000000022", "phone": "+77011110022", "name": "Арсен Қасымов",       "email": "youth2@example.com",    "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 2,  "is_active": True, "age": 22, "gender": "male",   "organization": None},
            {"id": 23, "iin": "000000000023", "phone": "+77011110023", "name": "Айару Нұрова",         "email": "youth3@example.com",    "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 3,  "is_active": True, "age": 20, "gender": "female", "organization": None},
            {"id": 24, "iin": "000000000024", "phone": "+77011110024", "name": "Бекзат Омаров",        "email": "youth4@example.com",    "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 4,  "is_active": True, "age": 18, "gender": "male",   "organization": None},
            {"id": 25, "iin": "000000000025", "phone": "+77011110025", "name": "Нұрдаулет Әлі",       "email": "youth5@example.com",    "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 6,  "is_active": True, "age": 21, "gender": "male",   "organization": None},
            {"id": 26, "iin": "000000000026", "phone": "+77011110026", "name": "Мөлдір Серікова",      "email": "youth6@example.com",    "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 8,  "is_active": True, "age": 24, "gender": "female", "organization": None},
            {"id": 27, "iin": "000000000027", "phone": "+77011110027", "name": "Жасұлан Тілеубек",    "email": "youth7@example.com",    "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 16, "is_active": True, "age": 20, "gender": "male",   "organization": None},
            {"id": 28, "iin": "000000000028", "phone": "+77011110028", "name": "Сәуле Бержанова",      "email": "youth8@example.com",    "hashed_password": demo_pwd,  "role": "citizen",    "region_id": 11, "is_active": True, "age": 23, "gender": "female", "organization": None},
        ],
    )

    # 6 опросов
    op.bulk_insert(
        surveys_t,
        [
            {"id": 1, "title": "Качество государственных услуг",   "description": "Оценка удовлетворённости граждан государственными услугами.", "category": "Цифровизация",       "created_by": 1, "status": "active",    "region_id": 2,  "end_date": None},
            {"id": 2, "title": "Состояние дорог и инфраструктуры", "description": "Опрос о качестве дорог и городской инфраструктуры.",          "category": "Инфраструктура",     "created_by": 1, "status": "completed", "region_id": 1,  "end_date": None},
            {"id": 3, "title": "Экология и чистота города",        "description": "Оценка экологической ситуации в городе.",                      "category": "Экология",           "created_by": 2, "status": "active",    "region_id": 3,  "end_date": None},
            {"id": 4, "title": "Качество медицинских услуг",       "description": "Опрос об уровне медицинского обслуживания.",                    "category": "Здравоохранение",    "created_by": 2, "status": "completed", "region_id": 4,  "end_date": None},
            {"id": 5, "title": "Образование и школы",              "description": "Удовлетворённость качеством образования.",                      "category": "Образование",        "created_by": 3, "status": "active",    "region_id": 5,  "end_date": None},
            {"id": 6, "title": "Безопасность в районе",            "description": "Оценка уровня безопасности и работы полиции.",                  "category": "Социальная политика","created_by": 3, "status": "completed", "region_id": 8,  "end_date": None},
        ],
    )

    # 18 вопросов (3 на каждый опрос)
    op.bulk_insert(
        questions_t,
        [
            # Survey 1 — Госуслуги
            {"id": 1,  "survey_id": 1, "question_text": "Как вы оцениваете качество госуслуг?",           "question_type": "single",   "order_index": 0},
            {"id": 2,  "survey_id": 1, "question_text": "Какими госуслугами вы пользовались?",            "question_type": "multiple", "order_index": 1},
            {"id": 3,  "survey_id": 1, "question_text": "Ваши предложения по улучшению?",                 "question_type": "text",     "order_index": 2},
            # Survey 2 — Дороги
            {"id": 4,  "survey_id": 2, "question_text": "Как вы оцениваете состояние дорог?",             "question_type": "single",   "order_index": 0},
            {"id": 5,  "survey_id": 2, "question_text": "Какие проблемы инфраструктуры наиболее острые?", "question_type": "multiple", "order_index": 1},
            {"id": 6,  "survey_id": 2, "question_text": "Комментарии о дорожной ситуации?",               "question_type": "text",     "order_index": 2},
            # Survey 3 — Экология
            {"id": 7,  "survey_id": 3, "question_text": "Как вы оцениваете чистоту города?",              "question_type": "single",   "order_index": 0},
            {"id": 8,  "survey_id": 3, "question_text": "Какие экологические проблемы вас беспокоят?",    "question_type": "multiple", "order_index": 1},
            {"id": 9,  "survey_id": 3, "question_text": "Ваши комментарии об экологии?",                  "question_type": "text",     "order_index": 2},
            # Survey 4 — Медицина
            {"id": 10, "survey_id": 4, "question_text": "Довольны ли вы медицинским обслуживанием?",      "question_type": "single",   "order_index": 0},
            {"id": 11, "survey_id": 4, "question_text": "Какие медуслуги недоступны в вашем районе?",     "question_type": "multiple", "order_index": 1},
            {"id": 12, "survey_id": 4, "question_text": "Ваши пожелания по улучшению медицины?",          "question_type": "text",     "order_index": 2},
            # Survey 5 — Образование
            {"id": 13, "survey_id": 5, "question_text": "Как вы оцениваете качество образования?",        "question_type": "single",   "order_index": 0},
            {"id": 14, "survey_id": 5, "question_text": "Что нужно улучшить в школах?",                   "question_type": "multiple", "order_index": 1},
            {"id": 15, "survey_id": 5, "question_text": "Ваши предложения по образованию?",               "question_type": "text",     "order_index": 2},
            # Survey 6 — Безопасность
            {"id": 16, "survey_id": 6, "question_text": "Чувствуете ли вы себя в безопасности?",          "question_type": "single",   "order_index": 0},
            {"id": 17, "survey_id": 6, "question_text": "Какие проблемы безопасности вас беспокоят?",     "question_type": "multiple", "order_index": 1},
            {"id": 18, "survey_id": 6, "question_text": "Ваши предложения по безопасности?",              "question_type": "text",     "order_index": 2},
        ],
    )

    # 43 варианта ответа
    op.bulk_insert(
        options_t,
        [
            # Q1
            {"id": 1,  "question_id": 1,  "option_text": "Отлично",               "order_index": 0},
            {"id": 2,  "question_id": 1,  "option_text": "Хорошо",                "order_index": 1},
            {"id": 3,  "question_id": 1,  "option_text": "Удовлетворительно",     "order_index": 2},
            {"id": 4,  "question_id": 1,  "option_text": "Плохо",                 "order_index": 3},
            # Q2
            {"id": 5,  "question_id": 2,  "option_text": "eGov",                  "order_index": 0},
            {"id": 6,  "question_id": 2,  "option_text": "ЦОН",                   "order_index": 1},
            {"id": 7,  "question_id": 2,  "option_text": "Портал госзакупок",     "order_index": 2},
            {"id": 8,  "question_id": 2,  "option_text": "Налоговый портал",      "order_index": 3},
            # Q4
            {"id": 9,  "question_id": 4,  "option_text": "Хорошее",               "order_index": 0},
            {"id": 10, "question_id": 4,  "option_text": "Среднее",               "order_index": 1},
            {"id": 11, "question_id": 4,  "option_text": "Плохое",                "order_index": 2},
            # Q5
            {"id": 12, "question_id": 5,  "option_text": "Ямы на дорогах",        "order_index": 0},
            {"id": 13, "question_id": 5,  "option_text": "Нехватка парковок",     "order_index": 1},
            {"id": 14, "question_id": 5,  "option_text": "Плохое освещение",      "order_index": 2},
            {"id": 15, "question_id": 5,  "option_text": "Нет тротуаров",         "order_index": 3},
            # Q7
            {"id": 16, "question_id": 7,  "option_text": "Чисто",                 "order_index": 0},
            {"id": 17, "question_id": 7,  "option_text": "Средне",                "order_index": 1},
            {"id": 18, "question_id": 7,  "option_text": "Грязно",                "order_index": 2},
            # Q8
            {"id": 19, "question_id": 8,  "option_text": "Загрязнение воздуха",   "order_index": 0},
            {"id": 20, "question_id": 8,  "option_text": "Загрязнение воды",      "order_index": 1},
            {"id": 21, "question_id": 8,  "option_text": "Мусор на улицах",       "order_index": 2},
            {"id": 22, "question_id": 8,  "option_text": "Вырубка деревьев",      "order_index": 3},
            # Q10
            {"id": 23, "question_id": 10, "option_text": "Да",                    "order_index": 0},
            {"id": 24, "question_id": 10, "option_text": "Частично",              "order_index": 1},
            {"id": 25, "question_id": 10, "option_text": "Нет",                   "order_index": 2},
            # Q11
            {"id": 26, "question_id": 11, "option_text": "Скорая помощь",         "order_index": 0},
            {"id": 27, "question_id": 11, "option_text": "Узкие специалисты",     "order_index": 1},
            {"id": 28, "question_id": 11, "option_text": "Аптеки",                "order_index": 2},
            {"id": 29, "question_id": 11, "option_text": "Диагностика",           "order_index": 3},
            # Q13
            {"id": 30, "question_id": 13, "option_text": "Высокое",               "order_index": 0},
            {"id": 31, "question_id": 13, "option_text": "Среднее",               "order_index": 1},
            {"id": 32, "question_id": 13, "option_text": "Низкое",                "order_index": 2},
            # Q14
            {"id": 33, "question_id": 14, "option_text": "Квалификация учителей", "order_index": 0},
            {"id": 34, "question_id": 14, "option_text": "Оснащение классов",     "order_index": 1},
            {"id": 35, "question_id": 14, "option_text": "Учебные программы",     "order_index": 2},
            {"id": 36, "question_id": 14, "option_text": "Здания и ремонт",       "order_index": 3},
            # Q16
            {"id": 37, "question_id": 16, "option_text": "Да, полностью",         "order_index": 0},
            {"id": 38, "question_id": 16, "option_text": "Не всегда",             "order_index": 1},
            {"id": 39, "question_id": 16, "option_text": "Нет",                   "order_index": 2},
            # Q17
            {"id": 40, "question_id": 17, "option_text": "Кражи",                 "order_index": 0},
            {"id": 41, "question_id": 17, "option_text": "Хулиганство",           "order_index": 1},
            {"id": 42, "question_id": 17, "option_text": "Плохое освещение",      "order_index": 2},
            {"id": 43, "question_id": 17, "option_text": "Нет патрулей",          "order_index": 3},
        ],
    )

    # 54 ответа (3 юзера на каждый опрос × 3 вопроса × 6 опросов)
    op.bulk_insert(
        responses_t,
        [
            # Survey 1 — госуслуги
            {"id": 1,  "user_id": 6,  "survey_id": 1, "question_id": 1,  "option_id": 2,    "text_answer": None},
            {"id": 2,  "user_id": 6,  "survey_id": 1, "question_id": 2,  "option_id": 5,    "text_answer": None},
            {"id": 3,  "user_id": 6,  "survey_id": 1, "question_id": 3,  "option_id": None, "text_answer": "Нужно сократить время ожидания."},
            {"id": 4,  "user_id": 8,  "survey_id": 1, "question_id": 1,  "option_id": 3,    "text_answer": None},
            {"id": 5,  "user_id": 8,  "survey_id": 1, "question_id": 2,  "option_id": 6,    "text_answer": None},
            {"id": 6,  "user_id": 8,  "survey_id": 1, "question_id": 3,  "option_id": None, "text_answer": "Хотелось бы больше онлайн-услуг."},
            {"id": 7,  "user_id": 13, "survey_id": 1, "question_id": 1,  "option_id": 1,    "text_answer": None},
            {"id": 8,  "user_id": 13, "survey_id": 1, "question_id": 2,  "option_id": 7,    "text_answer": None},
            {"id": 9,  "user_id": 13, "survey_id": 1, "question_id": 3,  "option_id": None, "text_answer": "Интерфейс eGov неудобен для пожилых."},
            # Survey 2 — дороги
            {"id": 10, "user_id": 6,  "survey_id": 2, "question_id": 4,  "option_id": 11,   "text_answer": None},
            {"id": 11, "user_id": 6,  "survey_id": 2, "question_id": 5,  "option_id": 12,   "text_answer": None},
            {"id": 12, "user_id": 6,  "survey_id": 2, "question_id": 6,  "option_id": None, "text_answer": "На главных улицах много ям."},
            {"id": 13, "user_id": 7,  "survey_id": 2, "question_id": 4,  "option_id": 10,   "text_answer": None},
            {"id": 14, "user_id": 7,  "survey_id": 2, "question_id": 5,  "option_id": 13,   "text_answer": None},
            {"id": 15, "user_id": 7,  "survey_id": 2, "question_id": 6,  "option_id": None, "text_answer": "Нет тротуаров в моём районе."},
            {"id": 16, "user_id": 14, "survey_id": 2, "question_id": 4,  "option_id": 11,   "text_answer": None},
            {"id": 17, "user_id": 14, "survey_id": 2, "question_id": 5,  "option_id": 15,   "text_answer": None},
            {"id": 18, "user_id": 14, "survey_id": 2, "question_id": 6,  "option_id": None, "text_answer": "Нужно расширить дороги в пригороде."},
            # Survey 3 — экология
            {"id": 19, "user_id": 8,  "survey_id": 3, "question_id": 7,  "option_id": 17,   "text_answer": None},
            {"id": 20, "user_id": 8,  "survey_id": 3, "question_id": 8,  "option_id": 19,   "text_answer": None},
            {"id": 21, "user_id": 8,  "survey_id": 3, "question_id": 9,  "option_id": None, "text_answer": "Воздух стал хуже за последние годы."},
            {"id": 22, "user_id": 9,  "survey_id": 3, "question_id": 7,  "option_id": 18,   "text_answer": None},
            {"id": 23, "user_id": 9,  "survey_id": 3, "question_id": 8,  "option_id": 21,   "text_answer": None},
            {"id": 24, "user_id": 9,  "survey_id": 3, "question_id": 9,  "option_id": None, "text_answer": "Слишком много мусора во дворах."},
            {"id": 25, "user_id": 15, "survey_id": 3, "question_id": 7,  "option_id": 18,   "text_answer": None},
            {"id": 26, "user_id": 15, "survey_id": 3, "question_id": 8,  "option_id": 20,   "text_answer": None},
            {"id": 27, "user_id": 15, "survey_id": 3, "question_id": 9,  "option_id": None, "text_answer": "Река загрязнена промышленными стоками."},
            # Survey 4 — медицина
            {"id": 28, "user_id": 6,  "survey_id": 4, "question_id": 10, "option_id": 24,   "text_answer": None},
            {"id": 29, "user_id": 6,  "survey_id": 4, "question_id": 11, "option_id": 27,   "text_answer": None},
            {"id": 30, "user_id": 6,  "survey_id": 4, "question_id": 12, "option_id": None, "text_answer": "Нужно больше специалистов в поликлиниках."},
            {"id": 31, "user_id": 7,  "survey_id": 4, "question_id": 10, "option_id": 25,   "text_answer": None},
            {"id": 32, "user_id": 7,  "survey_id": 4, "question_id": 11, "option_id": 29,   "text_answer": None},
            {"id": 33, "user_id": 7,  "survey_id": 4, "question_id": 12, "option_id": None, "text_answer": "Очереди очень длинные."},
            {"id": 34, "user_id": 16, "survey_id": 4, "question_id": 10, "option_id": 24,   "text_answer": None},
            {"id": 35, "user_id": 16, "survey_id": 4, "question_id": 11, "option_id": 26,   "text_answer": None},
            {"id": 36, "user_id": 16, "survey_id": 4, "question_id": 12, "option_id": None, "text_answer": "Скорая приезжает слишком долго."},
            # Survey 5 — образование
            {"id": 37, "user_id": 10, "survey_id": 5, "question_id": 13, "option_id": 31,   "text_answer": None},
            {"id": 38, "user_id": 10, "survey_id": 5, "question_id": 14, "option_id": 34,   "text_answer": None},
            {"id": 39, "user_id": 10, "survey_id": 5, "question_id": 15, "option_id": None, "text_answer": "Нужно обновить компьютеры в школах."},
            {"id": 40, "user_id": 11, "survey_id": 5, "question_id": 13, "option_id": 32,   "text_answer": None},
            {"id": 41, "user_id": 11, "survey_id": 5, "question_id": 14, "option_id": 33,   "text_answer": None},
            {"id": 42, "user_id": 11, "survey_id": 5, "question_id": 15, "option_id": None, "text_answer": "Учителям нужно повысить зарплату."},
            {"id": 43, "user_id": 17, "survey_id": 5, "question_id": 13, "option_id": 31,   "text_answer": None},
            {"id": 44, "user_id": 17, "survey_id": 5, "question_id": 14, "option_id": 35,   "text_answer": None},
            {"id": 45, "user_id": 17, "survey_id": 5, "question_id": 15, "option_id": None, "text_answer": "Программы устарели, нужна цифровизация."},
            # Survey 6 — безопасность
            {"id": 46, "user_id": 8,  "survey_id": 6, "question_id": 16, "option_id": 38,   "text_answer": None},
            {"id": 47, "user_id": 8,  "survey_id": 6, "question_id": 17, "option_id": 40,   "text_answer": None},
            {"id": 48, "user_id": 8,  "survey_id": 6, "question_id": 18, "option_id": None, "text_answer": "Много краж в нашем районе."},
            {"id": 49, "user_id": 12, "survey_id": 6, "question_id": 16, "option_id": 37,   "text_answer": None},
            {"id": 50, "user_id": 12, "survey_id": 6, "question_id": 17, "option_id": 42,   "text_answer": None},
            {"id": 51, "user_id": 12, "survey_id": 6, "question_id": 18, "option_id": None, "text_answer": "Тёмные улицы создают угрозу."},
            {"id": 52, "user_id": 18, "survey_id": 6, "question_id": 16, "option_id": 39,   "text_answer": None},
            {"id": 53, "user_id": 18, "survey_id": 6, "question_id": 17, "option_id": 43,   "text_answer": None},
            {"id": 54, "user_id": 18, "survey_id": 6, "question_id": 18, "option_id": None, "text_answer": "Полиция не реагирует на вызовы вовремя."},
            # Молодёжь 18-24 → Survey 1 (госуслуги)
            {"id": 55, "user_id": 21, "survey_id": 1, "question_id": 1,  "option_id": 1,    "text_answer": None},
            {"id": 56, "user_id": 21, "survey_id": 1, "question_id": 2,  "option_id": 5,    "text_answer": None},
            {"id": 57, "user_id": 21, "survey_id": 1, "question_id": 3,  "option_id": None, "text_answer": "Мобильное приложение eGov работает быстро."},
            {"id": 58, "user_id": 22, "survey_id": 1, "question_id": 1,  "option_id": 2,    "text_answer": None},
            {"id": 59, "user_id": 22, "survey_id": 1, "question_id": 2,  "option_id": 6,    "text_answer": None},
            {"id": 60, "user_id": 22, "survey_id": 1, "question_id": 3,  "option_id": None, "text_answer": "Цифровизация ЦОН идёт хорошо, но очереди ещё есть."},
            {"id": 61, "user_id": 23, "survey_id": 1, "question_id": 1,  "option_id": 3,    "text_answer": None},
            {"id": 62, "user_id": 23, "survey_id": 1, "question_id": 2,  "option_id": 7,    "text_answer": None},
            {"id": 63, "user_id": 23, "survey_id": 1, "question_id": 3,  "option_id": None, "text_answer": "Нужно добавить онлайн-запись к специалистам."},
            {"id": 64, "user_id": 24, "survey_id": 1, "question_id": 1,  "option_id": 2,    "text_answer": None},
            {"id": 65, "user_id": 24, "survey_id": 1, "question_id": 2,  "option_id": 8,    "text_answer": None},
            {"id": 66, "user_id": 24, "survey_id": 1, "question_id": 3,  "option_id": None, "text_answer": "Налоговый портал стал удобнее."},
            # Молодёжь 18-24 → Survey 3 (экология)
            {"id": 67, "user_id": 25, "survey_id": 3, "question_id": 7,  "option_id": 17,   "text_answer": None},
            {"id": 68, "user_id": 25, "survey_id": 3, "question_id": 8,  "option_id": 19,   "text_answer": None},
            {"id": 69, "user_id": 25, "survey_id": 3, "question_id": 9,  "option_id": None, "text_answer": "Смог над городом виден каждое утро."},
            {"id": 70, "user_id": 26, "survey_id": 3, "question_id": 7,  "option_id": 18,   "text_answer": None},
            {"id": 71, "user_id": 26, "survey_id": 3, "question_id": 8,  "option_id": 22,   "text_answer": None},
            {"id": 72, "user_id": 26, "survey_id": 3, "question_id": 9,  "option_id": None, "text_answer": "Парков стало меньше, деревья вырубают."},
            {"id": 73, "user_id": 27, "survey_id": 3, "question_id": 7,  "option_id": 17,   "text_answer": None},
            {"id": 74, "user_id": 27, "survey_id": 3, "question_id": 8,  "option_id": 21,   "text_answer": None},
            {"id": 75, "user_id": 27, "survey_id": 3, "question_id": 9,  "option_id": None, "text_answer": "Мусорные баки переполняются в жаркое время."},
            {"id": 76, "user_id": 28, "survey_id": 3, "question_id": 7,  "option_id": 18,   "text_answer": None},
            {"id": 77, "user_id": 28, "survey_id": 3, "question_id": 8,  "option_id": 20,   "text_answer": None},
            {"id": 78, "user_id": 28, "survey_id": 3, "question_id": 9,  "option_id": None, "text_answer": "Качество воды в кранах оставляет желать лучшего."},
        ],
    )

    conn.execute(sa.text("SELECT setval('regions_id_seq',   (SELECT COALESCE(MAX(id), 1) FROM regions));"))
    conn.execute(sa.text("SELECT setval('users_id_seq',     (SELECT COALESCE(MAX(id), 1) FROM users));"))
    conn.execute(sa.text("SELECT setval('surveys_id_seq',   (SELECT COALESCE(MAX(id), 1) FROM surveys));"))
    conn.execute(sa.text("SELECT setval('questions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM questions));"))
    conn.execute(sa.text("SELECT setval('options_id_seq',   (SELECT COALESCE(MAX(id), 1) FROM options));"))
    conn.execute(sa.text("SELECT setval('responses_id_seq', (SELECT COALESCE(MAX(id), 1) FROM responses));"))


def downgrade():
    op.execute("DROP TABLE IF EXISTS responses CASCADE;")
    op.execute("DROP TABLE IF EXISTS options CASCADE;")
    op.execute("DROP TABLE IF EXISTS questions CASCADE;")
    op.execute("ALTER TABLE surveys DROP COLUMN IF EXISTS category;")
    op.execute("DROP TABLE IF EXISTS surveys CASCADE;")
    op.execute("DROP TABLE IF EXISTS users CASCADE;")
    op.execute("DROP TABLE IF EXISTS regions CASCADE;")

    op.execute("DROP TYPE IF EXISTS question_type;")
    op.execute("DROP TYPE IF EXISTS survey_status;")
    op.execute("DROP TYPE IF EXISTS user_role;")