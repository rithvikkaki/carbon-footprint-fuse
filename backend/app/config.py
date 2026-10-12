import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Carbon Footprint Fuse API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database URL: defaults to local SQLite file for seamless dev, configurable to Postgres
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./ecofuse.db"
    )
    
    # JWT & Auth
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
    ]

    # Rate Limiting configuration (requests per window)
    RATE_LIMIT_ENABLED: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
    RATE_LIMIT_LOGIN: int = int(os.getenv("RATE_LIMIT_LOGIN", "10"))  # per minute
    RATE_LIMIT_REGISTER: int = int(os.getenv("RATE_LIMIT_REGISTER", "5"))  # per minute
    RATE_LIMIT_MARKETPLACE: int = int(os.getenv("RATE_LIMIT_MARKETPLACE", "30"))  # per minute

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=True,
    )

    def model_post_init(self, __context):
        insecure_blacklist = {
            "eco_fuse_super_secret_production_key_change_in_prod_99182",
            "dev_only_ephemeral_secret_key_never_for_production",
            "ecofuse_jwt_production_secret_key_change_me_before_release_9941",
            "dev_secret_key_change_in_production_123456789",
            "secret",
            "changeme",
        }
        cors_env = os.getenv("CORS_ORIGINS")
        if cors_env:
            if cors_env.strip() == "*":
                self.CORS_ORIGINS = ["*"]
            else:
                self.CORS_ORIGINS = [o.strip() for o in cors_env.split(",") if o.strip()]

        if self.ENVIRONMENT.lower() == "production":
            if not self.SECRET_KEY or len(self.SECRET_KEY.strip()) < 32 or self.SECRET_KEY in insecure_blacklist:
                raise ValueError(
                    "CRITICAL SECURITY ERROR: In production mode, SECRET_KEY must be explicitly set, "
                    "at least 32 characters long, and cannot match known development/insecure template keys."
                )
        elif not self.SECRET_KEY:
            # Ephemeral fallback explicitly scoped only for local dev/testing
            self.SECRET_KEY = "dev_only_ephemeral_secret_key_never_for_production"

settings = Settings()
