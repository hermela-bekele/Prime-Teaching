import asyncio
from src.core.config import get_settings, postgres_dsn
from sqlalchemy import text

async def test_connection():
    from src.core.database import engine
    
    settings = get_settings()
    dsn = postgres_dsn(settings)
    print(f"Connecting to: {dsn.split('@')[1] if '@' in dsn else 'database'}")
    
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT COUNT(*) FROM schools"))
            count = result.scalar()
            print(f"✅ Connected successfully! Found {count} schools")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())