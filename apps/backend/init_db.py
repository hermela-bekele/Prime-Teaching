#!/usr/bin/env python
"""
Initialize the database - Create all tables
Run: python init_db.py
"""

import asyncio
import sys
import os

# Add src to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine
from src.models import Base
from src.core.config import get_settings, postgres_dsn

async def init_database():
    """Create all tables in the database"""
    settings = get_settings()
    
    dsn = postgres_dsn(settings)
    print("Connecting to database...")
    print(f"URL: {dsn.split('@')[-1] if '@' in dsn else dsn}")
    
    # Create engine
    engine = create_async_engine(
        dsn,
        echo=True,  # Set to False for production
    )
    
    try:
        # Create all tables
        async with engine.begin() as conn:
            print("Creating tables...")
            await conn.run_sync(Base.metadata.create_all)
            print("✅ All tables created successfully!")
            
        # Print table list
        async with engine.connect() as conn:
            from sqlalchemy import text
            result = await conn.execute(text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public' ORDER BY table_name"
            ))
            tables = result.fetchall()
            print("\n📋 Created tables:")
            for table in tables:
                print(f"  - {table[0]}")
            
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        raise
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_database())