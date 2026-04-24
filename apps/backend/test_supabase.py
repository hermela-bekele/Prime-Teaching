import asyncio
import asyncpg
import socket
import ssl

async def connect_supabase():
    # Method 1: Try direct connection
    print("=== Method 1: Direct connection ===")
    try:
        conn = await asyncpg.connect(
            host="db.ulqjphgkvtdoaiayujoh.supabase.co",
            port=5432,
            user="postgres",
            password="Ayuetete1406",
            database="postgres",
            command_timeout=30
        )
        print("✅ Connected via Method 1!")
        result = await conn.fetchval("SELECT 1")
        print(f"Test query result: {result}")
        await conn.close()
        return True
    except Exception as e:
        print(f"❌ Method 1 failed: {e}")
    
    # Method 2: Try with SSL mode
    print("\n=== Method 2: With SSL parameters ===")
    try:
        conn = await asyncpg.connect(
            host="db.ulqjphgkvtdoaiayujoh.supabase.co",
            port=5432,
            user="postgres",
            password="Ayuetete1406",
            database="postgres",
            ssl='require'
        )
        print("✅ Connected via Method 2!")
        await conn.close()
        return True
    except Exception as e:
        print(f"❌ Method 2 failed: {e}")
    
    # Method 3: Use connection pooler (port 6543)
    print("\n=== Method 3: Connection pooler (port 6543) ===")
    try:
        conn = await asyncpg.connect(
            host="db.ulqjphgkvtdoaiayujoh.supabase.co",
            port=6543,  # Pooler port
            user="postgres",
            password="Ayuetete1406",
            database="postgres",
            ssl='require'
        )
        print("✅ Connected via Method 3!")
        await conn.close()
        return True
    except Exception as e:
        print(f"❌ Method 3 failed: {e}")
    
    # Method 4: Use IPv6 explicitly
    print("\n=== Method 4: IPv6 address directly ===")
    try:
        conn = await asyncpg.connect(
            host="2a05:d018:135e:1676:69d3:d492:5f5d:3502",  # IPv6 from nslookup
            port=5432,
            user="postgres",
            password="Ayuetete1406",
            database="postgres"
        )
        print("✅ Connected via Method 4!")
        await conn.close()
        return True
    except Exception as e:
        print(f"❌ Method 4 failed: {e}")
    
    return False

if __name__ == "__main__":
    success = asyncio.run(connect_supabase())
    if success:
        print("\n🎉 Database connection working!")
    else:
        print("\n❌ All connection methods failed")
        print("\nPossible issues:")
        print("1. Check your password in .env file")
        print("2. Your IP might be blocked by Supabase")
        print("3. Try from a different network (mobile hotspot)")