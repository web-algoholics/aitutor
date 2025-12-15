from sqlmodel import Field, SQLModel
from sqlalchemy import Column, Integer, Date
from typing import Optional
from datetime import date
from config import settings


class User(SQLModel, table=True):
    """
    The User model that maps to the 'users' table in the database.
    FastAPI-Users will use this to store user data.
    """
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, sa_column=Column(Integer, primary_key=True, autoincrement=True))
    email: str = Field(sa_column_kwargs={"unique": True}, index=True, nullable=False)
    username: str = Field(index=True, nullable=False)
    profile_icon_filename: str = Field(default="default_icon.png", max_length=255, nullable=False)
    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True, nullable=False)
    is_superuser: bool = Field(default=False, nullable=False)
    is_verified: bool = Field(default=False, nullable=False)
    current_streak: int = Field(default=0, nullable=False)  # Days in a row studying
    last_study_date: Optional[date] = Field(default=None, sa_column=Column(Date, nullable=True))  # Last day user studied

    @property
    def profile_icon_url(self):
        return f"{settings.PROFILE_ICON_URL_PATH}/{self.profile_icon_filename}"