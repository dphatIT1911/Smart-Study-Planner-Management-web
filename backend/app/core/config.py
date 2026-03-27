from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "Study Planner App"
    # Provide a default or require it to be set in environment variables
    DATABASE_URL: str = Field(..., description="PostgreSQL Database URL from Render")
    
    # JWT Auth settings
    SECRET_KEY: str = Field("your-super-secret-key-change-in-production", description="Secret key for JWT")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    # SMTP Settings
    SMTP_HOST: str = Field("smtp.gmail.com", description="SMTP Server Host")
    SMTP_PORT: int = Field(587, description="SMTP Server Port")
    SMTP_USER: str = Field("", description="SMTP User")
    SMTP_PASSWORD: str = Field("", description="SMTP Password")
    EMAILS_FROM_EMAIL: str = Field("info@smartstudy.com", description="From email address")
    EMAILS_FROM_NAME: str = Field("Smart Study Planner", description="From email name")

    # This will load the variables from .env if present
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

settings = Settings()
