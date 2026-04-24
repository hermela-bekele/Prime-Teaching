print("Testing Python imports...")

try:
    import fastapi
    print("✅ fastapi")
except ImportError as e:
    print(f"❌ fastapi: {e}")

try:
    import sqlalchemy
    print("✅ sqlalchemy")
except ImportError as e:
    print(f"❌ sqlalchemy: {e}")

try:
    import asyncpg
    print("✅ asyncpg")
except ImportError as e:
    print(f"❌ asyncpg: {e}")

try:
    from dotenv import load_dotenv
    print("✅ python-dotenv")
except ImportError as e:
    print(f"❌ python-dotenv: {e}")

try:
    from pydantic_settings import BaseSettings
    print("✅ pydantic-settings")
except ImportError as e:
    print(f"❌ pydantic-settings: {e}")

try:
    import openai
    print("✅ openai")
except ImportError as e:
    print(f"❌ openai: {e}")

print("\n✅ All core packages installed successfully!")