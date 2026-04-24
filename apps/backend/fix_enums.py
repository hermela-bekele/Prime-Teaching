import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def fix_enums():
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    user = os.getenv("DB_USERNAME", "postgres")
    password = os.getenv("DB_PASSWORD", "password")
    database = os.getenv("DB_NAME", "prime_teaching")
    
    conn = await asyncpg.connect(
        host=host,
        port=int(port),
        user=user,
        password=password,
        database=database
    )
    
    print("Fixing enum types...")
    
    # Drop and recreate school_type with lowercase values
    try:
        await conn.execute("DROP TYPE IF EXISTS school_type CASCADE")
        await conn.execute("CREATE TYPE school_type AS ENUM ('private', 'public', 'pilot', 'other')")
        print("✅ Recreated school_type with lowercase values")
    except Exception as e:
        print(f"Error recreating school_type: {e}")
    
    # Drop and recreate user_role with lowercase values
    try:
        await conn.execute("DROP TYPE IF EXISTS user_role CASCADE")
        await conn.execute("CREATE TYPE user_role AS ENUM ('teacher', 'department_head', 'school_leader', 'admin')")
        print("✅ Recreated user_role with lowercase values")
    except Exception as e:
        print(f"Error recreating user_role: {e}")
    
    # Drop and recreate stream_type with lowercase values
    try:
        await conn.execute("DROP TYPE IF EXISTS stream_type CASCADE")
        await conn.execute("CREATE TYPE stream_type AS ENUM ('core', 'natural_science', 'social_science')")
        print("✅ Recreated stream_type with lowercase values")
    except Exception as e:
        print(f"Error recreating stream_type: {e}")
    
    # Drop and recreate session_type with lowercase values
    try:
        await conn.execute("DROP TYPE IF EXISTS session_type CASCADE")
        await conn.execute("CREATE TYPE session_type AS ENUM ('teaching', 'revision', 'quiz', 'test_prep', 'unit_test')")
        print("✅ Recreated session_type with lowercase values")
    except Exception as e:
        print(f"Error recreating session_type: {e}")
    
    # Drop and recreate session_status with lowercase values
    try:
        await conn.execute("DROP TYPE IF EXISTS session_status CASCADE")
        await conn.execute("CREATE TYPE session_status AS ENUM ('planned', 'generated', 'delivered', 'missed', 'rescheduled')")
        print("✅ Recreated session_status with lowercase values")
    except Exception as e:
        print(f"Error recreating session_status: {e}")
    
    # Drop and recreate assessment_type with lowercase values
    try:
        await conn.execute("DROP TYPE IF EXISTS assessment_type CASCADE")
        await conn.execute("CREATE TYPE assessment_type AS ENUM ('quiz', 'unit_test', 'term_exam', 'practice_set')")
        print("✅ Recreated assessment_type with lowercase values")
    except Exception as e:
        print(f"Error recreating assessment_type: {e}")
    
    # Drop and recreate completion_status with lowercase values
    try:
        await conn.execute("DROP TYPE IF EXISTS completion_status CASCADE")
        await conn.execute("CREATE TYPE completion_status AS ENUM ('not_started', 'completed', 'partially_completed', 'missed', 'rescheduled')")
        print("✅ Recreated completion_status with lowercase values")
    except Exception as e:
        print(f"Error recreating completion_status: {e}")
    
    # Drop and recreate generation_status with lowercase values
    try:
        await conn.execute("DROP TYPE IF EXISTS generation_status CASCADE")
        await conn.execute("CREATE TYPE generation_status AS ENUM ('draft', 'generated', 'reviewed', 'approved')")
        print("✅ Recreated generation_status with lowercase values")
    except Exception as e:
        print(f"Error recreating generation_status: {e}")
    
    # Drop and recreate job_type with lowercase values
    try:
        await conn.execute("DROP TYPE IF EXISTS job_type CASCADE")
        await conn.execute("CREATE TYPE job_type AS ENUM ('calendar_generation', 'lesson_plan_generation', 'teaching_note_generation', 'assessment_generation')")
        print("✅ Recreated job_type with lowercase values")
    except Exception as e:
        print(f"Error recreating job_type: {e}")
    
    # Drop and recreate job_status with lowercase values
    try:
        await conn.execute("DROP TYPE IF EXISTS job_status CASCADE")
        await conn.execute("CREATE TYPE job_status AS ENUM ('queued', 'processing', 'completed', 'failed')")
        print("✅ Recreated job_status with lowercase values")
    except Exception as e:
        print(f"Error recreating job_status: {e}")
    
    # Recreate tables that depend on these enums
    print("\nRecreating tables...")
    
    # Drop tables in correct order
    tables_to_drop = [
        'calendar_sessions', 'units', 'subjects', 'users', 'schools'
    ]
    
    for table in tables_to_drop:
        try:
            await conn.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
            print(f"  Dropped {table}")
        except Exception as e:
            print(f"  Error dropping {table}: {e}")
    
    # Recreate schools table
    await conn.execute("""
        CREATE TABLE schools (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    """)
    print("✅ Created schools table")
    
    # Recreate users table
    await conn.execute("""
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    """)
    print("✅ Created users table")
    
    # Recreate subjects table
    await conn.execute("""
        CREATE TABLE subjects (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    """)
    print("✅ Created subjects table")
    
    # Recreate units table
    await conn.execute("""
        CREATE TABLE units (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    """)
    print("✅ Created units table")
    
    # Recreate calendar_sessions table
    await conn.execute("""
        CREATE TABLE calendar_sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    print("✅ Created calendar_sessions table")
    
    print("\n🎉 Enums and tables fixed successfully!")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_enums())