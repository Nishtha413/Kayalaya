from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "KayaLaya API"

    # Database
    DATABASE_URL: str = "postgresql://kayalaya_user:kayalaya_pass@localhost:5432/kayalaya_db"

    # JWT Auth
    JWT_SECRET_KEY: str = "CHANGE_ME_IN_ENV"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    class Config:
        env_file = ".env"


settings = Settings()
