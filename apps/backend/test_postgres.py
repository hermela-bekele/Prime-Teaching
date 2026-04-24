import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def test_connection():
    database_url = os.getenv("DATABASE_URL")
    
    print(f"Testing connection to local PostgreSQL...")
    print(f"URL: {database_url}")
    
    try:
        # Connect to PostgreSQL
        conn = await asyncpg.connect(database_url)
        
        # Test connection
        version = await conn.fetchval("SELECT version()")
        print(f"✅ Connected successfully!")
        print(f"PostgreSQL version: {version.split(',')[0]}")
        
        # Create a test table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS connection_test (
                id SERIAL PRIMARY KEY,
                test_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Insert test row
        await conn.execute("INSERT INTO connection_test DEFAULT VALUES")
        
        # Get count
        count = await conn.fetchval("SELECT COUNT(*) FROM connection_test")
        print(f"✅ Test table created with {count} rows")
        
        # Drop test table
        await conn.execute("DROP TABLE connection_test")
        print("✅ Test cleanup completed")
        
        await conn.close()
        print("\n🎉 PostgreSQL is working perfectly!")
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. Make sure PostgreSQL is installed and running")
        print("2. Check if port 5432 is available")
        print("3. Verify password in .env matches installation password")
        print("\nCheck service status:")
        print("  Get-Service -Name postgresql*")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    if not success:
        print("\nNeed help? Try:")
        print("  Start-Service postgresql-x64-16")