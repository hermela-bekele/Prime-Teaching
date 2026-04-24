import asyncio
import sys
import os
from datetime import datetime
import bcrypt

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
import asyncpg

load_dotenv()

async def seed_data():
    # Get connection parameters
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    user = os.getenv("DB_USERNAME", "postgres")
    password = os.getenv("DB_PASSWORD", "password")
    database = os.getenv("DB_NAME", "prime_teaching")
    
    print("🌱 Seeding database...")
    
    # Connect to database
    conn = await asyncpg.connect(
        host=host,
        port=int(port),
        user=user,
        password=password,
        database=database
    )
    
    try:
        # 1. Create School
        print("  📚 Creating school...")
        school_id = await conn.fetchval("""
            INSERT INTO schools (school_id, name, type, country, region_city, status)
            VALUES ('SCH-001', 'Pilot School A', 'pilot', 'Ethiopia', 'Addis Ababa', 'active')
            ON CONFLICT (school_id) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        """)
        
        # 2. Hash password for users (demo123)
        password_hash = bcrypt.hashpw(b"demo123", bcrypt.gensalt()).decode('utf-8')
        
        # 3. Create Users
        print("  👥 Creating users...")
        
        users_data = [
            ("USR-001", "John Teacher", "teacher@primeteaching.com", "teacher", "Mathematics", "own_records"),
            ("USR-002", "Jane Head", "depthead@primeteaching.com", "department_head", "Mathematics", "department_records"),
            ("USR-003", "Bob Leader", "leader@primeteaching.com", "school_leader", None, "school_records"),
        ]
        
        for user_id, name, email, role, dept, scope in users_data:
            await conn.execute("""
                INSERT INTO users (user_id, full_name, email, password_hash, role, school_id, department_name, visibility_scope)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name
            """, user_id, name, email, password_hash, role, school_id, dept, scope)
        
        # 4. Create Subjects
        print("  📖 Creating subjects...")
        
        subjects_data = [
            ("SUB-001", "Mathematics", "core"),
            ("SUB-002", "Mathematics", "natural_science"),
            ("SUB-003", "Mathematics", "social_science"),
        ]
        
        for subj_id, name, stream in subjects_data:
            await conn.execute("""
                INSERT INTO subjects (subject_id, name, stream_type, is_active)
                VALUES ($1, $2, $3, true)
                ON CONFLICT (subject_id) DO UPDATE SET name = EXCLUDED.name
            """, subj_id, name, stream)
        
        # Get subject ID for core
        subject_id = await conn.fetchval("SELECT id FROM subjects WHERE subject_id = 'SUB-001'")
        
        # 5. Create Units
        print("  📦 Creating units...")
        
        units_data = [
            (1, "Further on Relations and Functions", 12),
            (2, "Rational Expressions and Rational Functions", 10),
            (3, "Coordinate Geometry", 8),
            (4, "Mathematical Reasoning", 6),
            (5, "Statistics and Probability", 10),
            (6, "Matrices and Determinants", 12),
            (7, "The Set of Complex Numbers", 8),
        ]
        
        for num, title, sessions in units_data:
            await conn.execute("""
                INSERT INTO units (unit_id, subject_id, unit_number, title, stream_type, recommended_total_sessions, is_active)
                VALUES ($1, $2, $3, $4, 'core', $5, true)
                ON CONFLICT (unit_id) DO UPDATE SET title = EXCLUDED.title
            """, f"UNT-{num:03d}", subject_id, num, title, sessions)
        
        # Get unit ID for Unit 1
        unit_id = await conn.fetchval("SELECT id FROM units WHERE unit_id = 'UNT-001'")
        
        teacher_uuid = await conn.fetchval("SELECT id FROM users WHERE email = 'teacher@primeteaching.com'")

        # 5b. One subtopic (required FK for calendar_sessions)
        print("  📝 Creating sample subtopic...")
        subtopic_id = await conn.fetchval("""
            INSERT INTO subtopics (subtopic_id, unit_id, subtopic_number, title, difficulty_level, assessment_checkpoint, revision_needed_after)
            VALUES ('SUBTOP-001', $1, '1', 'Relations and Functions — Introduction', 'foundational', false, false)
            ON CONFLICT (subtopic_id) DO UPDATE SET title = EXCLUDED.title
            RETURNING id
        """, unit_id)

        # 5c. Calendar run (required FK for calendar_sessions)
        print("  🗓️ Creating sample calendar run...")
        run_id = await conn.fetchval("""
            INSERT INTO calendar_runs (
                calendar_run_id, school_id, subject_id, created_by_id,
                audience_scope, sequencing_mode, academic_year_label,
                total_available_sessions, generation_status
            )
            VALUES ('RUN-SEED-001', $1, $2, $3, 'teacher', 'textbook_order', '2025-2026', 40, 'generated')
            ON CONFLICT (calendar_run_id) DO UPDATE SET academic_year_label = EXCLUDED.academic_year_label
            RETURNING id
        """, school_id, subject_id, teacher_uuid)

        # 6. Create Calendar Sessions (Sample)
        print("  📅 Creating sample sessions...")
        
        from datetime import date, timedelta
        
        start_date = date.today()
        for i in range(5):
            session_num = i + 1
            session_date = start_date + timedelta(days=i * 7)  # Weekly sessions
            
            await conn.execute("""
                INSERT INTO calendar_sessions (
                    session_id, calendar_run_id, subject_id, unit_id, subtopic_id,
                    session_number_global, session_number_in_unit, session_title, planned_date,
                    session_type, learning_goal_summary, status,
                    requires_lesson_plan, requires_teaching_note, requires_quiz,
                    teacher_owner_id, school_owner_id
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'teaching', $10, 'planned', true, true, false, $11, $12)
                ON CONFLICT (session_id) DO NOTHING
            """,
                f"SES-{session_num:03d}",
                run_id,
                subject_id,
                unit_id,
                subtopic_id,
                session_num,
                session_num,
                f"Session {session_num}: Lesson Content",
                session_date,
                f"Learning goals for session {session_num}",
                teacher_uuid,
                school_id,
            )
        
        # Count records
        school_count = await conn.fetchval("SELECT COUNT(*) FROM schools")
        user_count = await conn.fetchval("SELECT COUNT(*) FROM users")
        subject_count = await conn.fetchval("SELECT COUNT(*) FROM subjects")
        unit_count = await conn.fetchval("SELECT COUNT(*) FROM units")
        session_count = await conn.fetchval("SELECT COUNT(*) FROM calendar_sessions")
        
        print("\n✅ Database seeded successfully!")
        print("\n📊 Seed Summary:")
        print(f"  - Schools: {school_count}")
        print(f"  - Users: {user_count}")
        print(f"  - Subjects: {subject_count}")
        print(f"  - Units: {unit_count}")
        print(f"  - Sessions: {session_count}")
        print("\n🔐 Demo Login Credentials:")
        print("  teacher@primeteaching.com / demo123")
        print("  depthead@primeteaching.com / demo123")
        print("  leader@primeteaching.com / demo123")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(seed_data())