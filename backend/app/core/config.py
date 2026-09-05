from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Data Analyst API"
    app_version: str = "0.1.0"
    environment: str = "development"
    frontend_url: str = "http://localhost:3000"
    supabase_url: str = ""
    supabase_publishable_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
