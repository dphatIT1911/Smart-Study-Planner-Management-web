from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "Study Planner App"
    # Provide a default or require it to be set in environment variables
    DATABASE_URL: str = Field(..., description="PostgreSQL Database URL from Render")

    # This will load the variables from .env if present
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

settings = Settings()
