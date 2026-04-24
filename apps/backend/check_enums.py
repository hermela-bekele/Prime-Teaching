import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def check_enums():
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
    
    # Check enum types
    enums = ['school_type', 'user_role', 'stream_type', 'session_type', 'session_status', 'assessment_type', 'completion_status', 'generation_status', 'job_type', 'job_status']
    
    for enum_name in enums:
        try:
            values = await conn.fetch(f"SELECT unnest(enum_range(NULL::{enum_name})) as value")
            print(f"\n{enum_name}:")
            for v in values:
                print(f"  - {v['value']}")
        except Exception as e:
            print(f"\n{enum_name}: Error - {e}")
    
    await conn.close()

asyncio.run(check_enums())