import asyncio
import asyncpg
import socket

# Disable IPv6 globally for this script
socket.setdefaulttimeout(30)

# Force getaddrinfo to only return IPv4 addresses
original_getaddrinfo = socket.getaddrinfo

def ipv4_only_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    # Force AF_INET (IPv4) family
    return original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)

# Override the function
socket.getaddrinfo = ipv4_only_getaddrinfo

async def test_connection():
    # Try different methods
    methods = [
        ("Direct", "db.ulqjphgkvtdoaiayujoh.supabase.co", 5432),
        ("Pooler", "db.ulqjphgkvtdoaiayujoh.supabase.co", 6543),
    ]
    
    password = "Ayuetete1406"
    
    for name, host, port in methods:
        print(f"Trying {name} - {host}:{port}...")
        try:
            # First resolve manually to IPv4
            try:
                addrinfo = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
                ipv4 = addrinfo[0][4][0]
                print(f"  Resolved to IPv4: {ipv4}")
                
                conn = await asyncpg.connect(
                    host=ipv4,  # Use IPv4 address directly
                    port=port,
                    user="postgres",
                    password=password,
                    database="postgres",
                    ssl="require"
                )
                print(f"  ✅ CONNECTED! Connected via {name}")
                version = await conn.fetchval("SELECT version()")
                print(f"  PostgreSQL: {version[:60]}...")
                await conn.close()
                return True
                
            except socket.gaierror as e:
                print(f"  Failed to resolve: {e}")
            except Exception as e:
                print(f"  Connection failed: {e}")
        except Exception as e:
            print(f"  Error: {e}")
    
    return False

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    if not success:
        print("\n❌ All methods failed.")
        print("\nAlternative: Use a local PostgreSQL database")