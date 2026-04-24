import asyncio
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

async def test_database():
    try:
        import asyncpg
        
        database_url = os.getenv("DATABASE_URL")
        
        if not database_url:
            print("❌ DATABASE_URL not found in .env file")
            print("Please create .env file with your database URL")
            return
        
        print(f"📡 Connecting to database...")
        
        # Extract connection parameters
        # Format: postgresql+asyncpg://user:pass@host:5432/dbname
        # Or: postgresql://user:pass@host:5432/dbname
        
        # Remove protocol prefix if present
        clean_url = database_url.replace("postgresql+asyncpg://", "")
        clean_url = clean_url.replace("postgresql://", "")
        
        # Parse connection string
        user_pass, rest = clean_url.split("@", 1)
        user, password = user_pass.split(":", 1)
        host_port, dbname = rest.split("/", 1)
        host, port = host_port.split(":", 1)
        
        print(f"   Host: {host}")
        print(f"   Database: {dbname}")
        print(f"   User: {user}")
        
        # Connect
        conn = await asyncpg.connect(
            user=user,
            password=password,
            database=dbname,
            host=host,
            port=port
        )
        
        version = await conn.fetchval("SELECT version()")
        print(f"✅ Connected successfully!")
        print(f"   PostgreSQL version: {version[:50]}...")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_database())