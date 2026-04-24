from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    app_name: str = "PRIME EduAI API"
    env: str = "development"
    api_prefix: str = "/api/v1"

    # Database - Your variables
    db_host: str = "localhost"
    db_port: int = 5432
    db_username: str = "postgres"
    db_password: str = "password"
    db_name: str = "prime_teaching"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # Auth — used to sign/verify API JWTs (login). Falls back to supabase_jwt_secret if set.
    jwt_secret: str = ""
    supabase_jwt_secret: str = ""
    auth_provider: str = "supabase"

    # CORS (comma-separated origins, e.g. http://localhost:3000)
    cors_origins: str = "http://localhost:3000"
    
    # Debug
    debug: bool = False

@lru_cache
def get_settings() -> Settings:
    return Settings()


def jwt_signing_secret(settings: Settings) -> str:
    secret = (settings.jwt_secret or settings.supabase_jwt_secret or "").strip()
    if secret:
        return secret
    if settings.env == "development":
        return "prime-dev-jwt-secret-change-me"
    raise ValueError("Set JWT_SECRET or SUPABASE_JWT_SECRET for token signing.")


def postgres_dsn(settings: Settings) -> str:
    """Async SQLAlchemy URL for asyncpg."""
    user = settings.db_username
    password = settings.db_password
    host = settings.db_host
    port = settings.db_port
    name = settings.db_name
    return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{name}"