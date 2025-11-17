from fastapi_users import schemas
from pydantic import BaseModel, EmailStr
from typing import Optional
from config import settings


class UserRead(schemas.BaseUser[int]):
    username: str
    profile_icon_filename: str

    @property
    def profile_icon_url(self):
        return f"{settings.PROFILE_ICON_URL_PATH}/{self.profile_icon_filename}"


class UserCreate(schemas.BaseUserCreate):
    username: str


class UserUpdate(schemas.BaseUserUpdate):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
