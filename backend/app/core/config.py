from typing import Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, model_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Study Planner App"
    ENVIRONMENT: str = Field("development", description="Application environment: development/production")
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
    FRONTEND_URL: str = Field("http://localhost:5173", description="Frontend application URL")

    # CORS Settings - accepts comma-separated string or JSON array from env var
    BACKEND_CORS_ORIGINS: Union[str, list[str]] = "*"
    
    @model_validator(mode="after")
    def validate_and_fix_settings(self):
        """Ensure all settings are properly formatted for application use."""
        # 0. Environment-specific overrides
        env = (self.ENVIRONMENT or "").strip().lower()
        if env in {"production", "prod"}:
            self.BACKEND_CORS_ORIGINS = ["https://study-planner-deploy-beryl.vercel.app"]

        # 1. Fix DATABASE_URL for SQLAlchemy 1.4+ compatibility (postgres:// -> postgresql://)
        # And ensure sslmode=require is used for Render DBs
        db_url = self.DATABASE_URL
        if db_url and db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
        
        # Add sslmode=require if connecting to Render (dpg-...) and not specified
        if db_url and "render.com" in db_url and "sslmode" not in db_url:
            separator = "&" if "?" in db_url else "?"
            db_url = f"{db_url}{separator}sslmode=require"
            
        self.DATABASE_URL = db_url

        # 2. Ensure BACKEND_CORS_ORIGINS is always a list
        origins = self.BACKEND_CORS_ORIGINS
        if isinstance(origins, str):
            self.BACKEND_CORS_ORIGINS = [o.strip() for o in origins.split(",") if o.strip()]
            
        return self

    # This will load the variables from .env if present
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

settings = Settings()
