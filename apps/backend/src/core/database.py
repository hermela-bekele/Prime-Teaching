from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.core.config import get_settings, postgres_dsn

settings = get_settings()

# Create async engine
engine = create_async_engine(
    postgres_dsn(settings),
    echo=settings.debug,
    pool_size=10,
    max_overflow=20,
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db() -> AsyncSession:
    """Dependency for FastAPI endpoints"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()