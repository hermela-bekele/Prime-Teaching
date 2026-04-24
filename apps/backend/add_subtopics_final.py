import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def add_subtopics():
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
    
    print("📝 Adding subtopics...")
    
    # Get unit_id for Unit 1
    unit_record = await conn.fetchrow(
        "SELECT id FROM units WHERE unit_id = 'UNT-001'"
    )
    
    if not unit_record:
        print("❌ Unit 1 not found")
        return
    
    unit_id = unit_record['id']
    print(f"Found Unit 1 with ID: {unit_id}")
    
    # First, set default values for the table
    await conn.execute("""
        ALTER TABLE subtopics 
        ALTER COLUMN revision_needed_after SET DEFAULT false,
        ALTER COLUMN textbook_start_page DROP NOT NULL,
        ALTER COLUMN textbook_end_page DROP NOT NULL
    """)
    print("✅ Set default values for subtopics table")
    
    subtopics_data = [
        ("1.1", "Revision on relations", "FOUNDATIONAL", 2, False),
        ("1.2", "Some additional types of functions", "INTERMEDIATE", 2, False),
        ("1.3", "Classification of functions", "INTERMEDIATE", 2, True),
        ("1.4", "Composition of functions", "ADVANCED", 2, False),
        ("1.5", "Inverse functions and their graphs", "ADVANCED", 2, True),
    ]
    
    for sub_num, title, difficulty, sessions, checkpoint in subtopics_data:
        try:
            # Check if already exists
            exists = await conn.fetchval(
                "SELECT COUNT(*) FROM subtopics WHERE unit_id = $1 AND subtopic_number = $2",
                unit_id, sub_num
            )
            
            if exists == 0:
                await conn.execute("""
                    INSERT INTO subtopics (
                        subtopic_id, unit_id, subtopic_number, title, 
                        difficulty_level, recommended_sessions, 
                        assessment_checkpoint, revision_needed_after
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, false)
                """,
                    f"SUBT-{sub_num.replace('.', '')}",
                    unit_id,
                    sub_num,
                    title,
                    difficulty,
                    sessions,
                    checkpoint
                )
                print(f"  ✅ Added: {sub_num} {title}")
            else:
                print(f"  ⚠️ Already exists: {sub_num} {title}")
        except Exception as e:
            print(f"  ❌ Error adding {sub_num}: {e}")
    
    # Verify
    count = await conn.fetchval(
        "SELECT COUNT(*) FROM subtopics WHERE unit_id = $1", 
        unit_id
    )
    print(f"\n📊 Total subtopics for Unit 1: {count}")
    
    # List all subtopics
    subtopics = await conn.fetch(
        """SELECT subtopic_number, title, difficulty_level, assessment_checkpoint 
           FROM subtopics WHERE unit_id = $1 ORDER BY subtopic_number""",
        unit_id
    )
    
    print("\n📋 Subtopics in database:")
    for sub in subtopics:
        checkpoint = "✓" if sub['assessment_checkpoint'] else " "
        print(f"  [{checkpoint}] {sub['subtopic_number']}: {sub['title']} ({sub['difficulty_level']})")
    
    await conn.close()
    print("\n✅ Subtopics added successfully!")

if __name__ == "__main__":
    asyncio.run(add_subtopics())