from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "PRIME EduAI API"
    env: str = "development"
    api_prefix: str = "/api/v1"

    postgres_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/prime_eduai"
    redis_url: str = "redis://localhost:6379/0"

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    supabase_jwt_secret: str = ""
    auth_provider: str = "supabase"


@lru_cache
def get_settings() -> Settings:
    return Settings()
