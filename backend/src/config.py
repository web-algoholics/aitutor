from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import EmailStr
from pathlib import Path
import os

#Compute the path to .env.local
env_path = Path(__file__).resolve().parent.parent.parent / ".env.local"


class Settings(BaseSettings):
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_HOST: str = "db"
    DB_NAME: str = "app_db"

    SECRET_KEY: str = "your-secret-key"

    SUPERUSER_EMAIL: str = "admin@example.com"
    SUPERUSER_PASSWORD: str = "your-super-strong-password"

    REDIS_URL: str = "redis://redis:6379"

    # --- Email Settings ---
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: EmailStr
    MAIL_PORT: int = 587
    MAIL_SERVER: str
    MAIL_FROM_NAME: str = "Your App Name"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    # --- Uploads Settings ---
    UPLOAD_DIR: str = "uploads/profile_icons"
    PROFILE_ICON_URL_PATH: str = "/profile-icons"

    # --- Frontend url ---
    FRONTEND_URL: str = "http://localhost:8099"
    GIGACHAT_API_KEY: str
    
    @property
    def DATABASE_URL(self):
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}/{self.DB_NAME}"

    def ensure_upload_dir(self):
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)

    model_config = SettingsConfigDict(
        env_file=env_path,
        env_file_encoding='utf-8'
    )

settings = Settings()
settings.ensure_upload_dir()