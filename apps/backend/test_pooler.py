import asyncio
import asyncpg
import socket

async def test_pooler():
    # Try to find IPv4 for pooler
    host = "db.ulqjphgkvtdoaiayujoh.supabase.co"
    port = 6543  # Pooler port
    
    print(f"Testing pooler connection to {host}:{port}")
    
    # Try different methods
    connection_strings = [
        # Method 1: Direct with hostname
        f"postgresql://postgres:Ayuetete1406@{host}:{port}/postgres",
        
        # Method 2: With SSL required
        f"postgresql://postgres:Ayuetete1406@{host}:{port}/postgres?sslmode=require",
        
        # Method 3: Pooler full connection string
        f"postgresql://postgres:Ayuetete1406@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
    ]
    
    for i, conn_str in enumerate(connection_strings, 1):
        print(f"\nMethod {i}:")
        try:
            conn = await asyncpg.connect(conn_str)
            version = await conn.fetchval("SELECT version()")
            print(f"  ✅ CONNECTED! Version: {version[:50]}...")
            await conn.close()
            return True
        except Exception as e:
            print(f"  ❌ Failed: {str(e)[:100]}")
    
    return False

asyncio.run(test_pooler())