import asyncio
import sys
import os

# Add the current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import asyncpg

load_dotenv()

async def create_tables():
    # Get database URL from .env
    import os
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        # Build from individual components
        host = os.getenv("DB_HOST", "localhost")
        port = os.getenv("DB_PORT", "5432")
        user = os.getenv("DB_USERNAME", "postgres")
        password = os.getenv("DB_PASSWORD", "password")
        database = os.getenv("DB_NAME", "prime_teaching")
        database_url = f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{database}"
    
    print(f"Connecting to database...")
    engine = create_async_engine(database_url, echo=True)
    
    async with engine.begin() as conn:
        # Enable UUID extension
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
        print("✅ UUID extension enabled")
        
        # Create ENUM types
        enums = [
            ("school_type", "('private', 'public', 'pilot', 'other')"),
            ("user_role", "('teacher', 'department_head', 'school_leader', 'admin')"),
            ("stream_type", "('core', 'natural_science', 'social_science')"),
            ("session_type", "('teaching', 'revision', 'quiz', 'test_prep', 'unit_test')"),
            ("session_status", "('planned', 'generated', 'delivered', 'missed', 'rescheduled')"),
            ("assessment_type", "('quiz', 'unit_test', 'term_exam', 'practice_set')"),
            ("completion_status", "('not_started', 'completed', 'partially_completed', 'missed', 'rescheduled')"),
            ("generation_status", "('draft', 'generated', 'reviewed', 'approved')"),
            ("job_type", "('calendar_generation', 'lesson_plan_generation', 'teaching_note_generation', 'assessment_generation')"),
            ("job_status", "('queued', 'processing', 'completed', 'failed')"),
        ]
        
        for enum_name, enum_values in enums:
            try:
                await conn.execute(text(f"CREATE TYPE {enum_name} AS ENUM {enum_values}"))
                print(f"✅ Created enum: {enum_name}")
            except Exception as e:
                if "already exists" in str(e):
                    print(f"⚠️ Enum {enum_name} already exists")
                else:
                    print(f"❌ Error creating {enum_name}: {e}")
        
        # Import and create all tables
        try:
            from src.models import Base
            await conn.run_sync(Base.metadata.create_all)
            print("✅ All tables created successfully!")
        except ImportError as e:
            print(f"⚠️ Could not import models: {e}")
            print("Creating tables manually...")
            
            # Create schools table
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS schools (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    school_id VARCHAR(50) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    code VARCHAR(50),
                    type school_type DEFAULT 'private',
                    country VARCHAR(100) DEFAULT 'Ethiopia',
                    region_city VARCHAR(255),
                    status VARCHAR(20) DEFAULT 'active',
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """))
            print("✅ Created schools table")
            
            # Create users table
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id VARCHAR(50) UNIQUE NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role user_role DEFAULT 'teacher',
                    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
                    department_name VARCHAR(255),
                    grade_access JSONB DEFAULT '[]',
                    subject_access JSONB DEFAULT '[]',
                    stream_access JSONB DEFAULT '[]',
                    active_status VARCHAR(20) DEFAULT 'active',
                    visibility_scope VARCHAR(50) DEFAULT 'own_records',
                    last_login_date TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """))
            print("✅ Created users table")
            
            # Create subjects table
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS subjects (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    subject_id VARCHAR(50) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    grade_level VARCHAR(20) DEFAULT 'grade_11',
                    stream_type stream_type DEFAULT 'core',
                    curriculum_version VARCHAR(255),
                    is_active BOOLEAN DEFAULT TRUE,
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """))
            print("✅ Created subjects table")
            
            # Create units table
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS units (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    unit_id VARCHAR(50) UNIQUE NOT NULL,
                    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
                    unit_number INTEGER NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    stream_type stream_type DEFAULT 'core',
                    textbook_start_page INTEGER,
                    textbook_end_page INTEGER,
                    default_priority_order INTEGER,
                    recommended_total_sessions INTEGER,
                    is_active BOOLEAN DEFAULT TRUE,
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """))
            print("✅ Created units table")
            
            # Create calendar_sessions table
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS calendar_sessions (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    session_id VARCHAR(50) UNIQUE NOT NULL,
                    subject_id UUID REFERENCES subjects(id),
                    unit_id UUID REFERENCES units(id),
                    session_number_global INTEGER NOT NULL,
                    session_number_in_unit INTEGER NOT NULL,
                    session_title VARCHAR(255),
                    planned_date DATE,
                    session_type session_type DEFAULT 'teaching',
                    learning_goal_summary TEXT,
                    status session_status DEFAULT 'planned',
                    requires_lesson_plan BOOLEAN DEFAULT TRUE,
                    requires_teaching_note BOOLEAN DEFAULT TRUE,
                    requires_quiz BOOLEAN DEFAULT FALSE,
                    teacher_owner_id UUID REFERENCES users(id),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """))
            print("✅ Created calendar_sessions table")
    
    await engine.dispose()
    print("\n🎉 Database schema setup complete!")

if __name__ == "__main__":
    asyncio.run(create_tables())