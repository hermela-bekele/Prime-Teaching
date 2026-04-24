import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def verify():
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
    
    print("=== Database Verification ===\n")
    
    # Get all tables
    tables = await conn.fetch("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    
    print("📋 Tables created:")
    for table in tables:
        # Get row count
        count = await conn.fetchval(f"SELECT COUNT(*) FROM {table['table_name']}")
        status = "✅" if count > 0 else "⚠️"
        print(f"  {status} {table['table_name']}: {count} rows")
    
    await conn.close()
    print("\n🎉 Database is ready for use!")

if __name__ == "__main__":
    asyncio.run(verify())