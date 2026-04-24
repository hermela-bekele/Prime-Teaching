import asyncio
import asyncpg
import socket

# Force IPv4
socket.setdefaulttimeout(30)

async def test_connection():
    # Your connection parameters
    host = "db.ulqjphgkvtdoaiayujoh.supabase.co"
    port = 5432
    user = "postgres"
    password = "Ayuetete1406"
    database = "postgres"
    
    print(f"Attempting to connect to {host}:{port}...")
    
    # First, resolve to IPv4 address
    try:
        # Force IPv4 resolution
        addrinfo = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        ipv4_address = addrinfo[0][4][0]
        print(f"Resolved IPv4 address: {ipv4_address}")
        
        conn = await asyncpg.connect(
            host=ipv4_address,  # Use IP directly
            port=port,
            user=user,
            password=password,
            database=database
        )
        
        version = await conn.fetchval("SELECT version()")
        print(f"✅ Connected! Version: {version[:50]}...")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ Failed: {e}")

asyncio.run(test_connection())