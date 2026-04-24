import asyncio
import asyncpg

async def test_connection():
    # Connection parameters
    # These are the defaults for a standard PostgreSQL + pgAdmin installation
    config = {
        "host": "localhost",
        "port": 5432,
        "user": "postgres",
        "password": "password",  # Change this to your actual pgAdmin password
        "database": "postgres"   # Connect to default database first
    }
    
    print("=== Testing PostgreSQL Connection ===")
    print(f"Host: {config['host']}")
    print(f"Port: {config['port']}")
    print(f"User: {config['user']}")
    print(f"Password: {'*' * len(config['password'])}")
    
    try:
        # Try to connect
        conn = await asyncpg.connect(**config)
        print("\n✅ Connected to PostgreSQL!")
        
        # Get version
        version = await conn.fetchval("SELECT version()")
        print(f"Version: {version.split(',')[0]}")
        
        # List databases
        databases = await conn.fetch("SELECT datname FROM pg_database WHERE datistemplate = false")
        print("\n📋 Existing databases:")
        for db in databases:
            print(f"  - {db['datname']}")
        
        # Check if prime_teaching exists
        result = await conn.fetchval(
            "SELECT COUNT(*) FROM pg_database WHERE datname = 'prime_teaching'"
        )
        
        if result == 0:
            print("\n⚠️ Database 'prime_teaching' does not exist.")
            print("   You can create it from pgAdmin or run:")
            print("   CREATE DATABASE prime_teaching;")
        else:
            print("\n✅ Database 'prime_teaching' exists!")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"\n❌ Connection failed: {e}")
        print("\nTroubleshooting:")
        print("1. Check if PostgreSQL service is running")
        print("2. Verify your password in pgAdmin")
        print("3. In pgAdmin, right-click 'PostgreSQL 16' → Properties → Connection tab")
        print("   Check: Host: localhost, Port: 5432")
        return False

if __name__ == "__main__":
    asyncio.run(test_connection())