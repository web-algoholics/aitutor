from typing import Optional
from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, IntegerIDMixin
from fastapi_users.db import SQLAlchemyUserDatabase
from fastapi_users.authentication import AuthenticationBackend, CookieTransport, JWTStrategy
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_session
from config import settings
from .models import User
from .email import send_verification_email, send_reset_password_email

# --- Authentication Configuration ---
SECRET = settings.SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Use Cookie transport for session-like behavior
# For cross-site requests (localhost -> remote server) we need SameSite=None
# But SameSite=None requires secure=True and HTTPS
cookie_transport = CookieTransport(
    cookie_max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    cookie_name="auth_token",
    cookie_secure=True,  # Required for SameSite=None
    cookie_httponly=True,
    cookie_samesite="none",  # Allow cross-site cookies
)

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=SECRET,
        lifetime_seconds=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

auth_backend = AuthenticationBackend(
    name="cookie-jwt",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

# --- Database Adapter ---
async def get_user_db(session: AsyncSession = Depends(get_session)):
    yield SQLAlchemyUserDatabase(session, User)

# --- User Manager ---
class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(self, user: User, token: str, request: Optional[Request] = None):
        print(f"User {user.id} has requested a password reset. Reset token: {token}")
        await send_reset_password_email(user.email, token)

    async def on_after_request_verify(self, user: User, token: str, request: Optional[Request] = None):
        print(f"Verification requested for user {user.id}. Verification token: {token}")
        await send_verification_email(user.email, token)

    async def on_after_verify(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has been verified.")


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)

# --- FastAPIUsers instance ---
fastapi_users = FastAPIUsers[User, int](
    get_user_manager=get_user_manager,           # ← async user db adapter
    auth_backends=[auth_backend],        # ← list of auth backends
)

# --- Public Dependencies ---
current_active_user = fastapi_users.current_user(active=True)
current_verified_user = fastapi_users.current_user(active=True, verified=True)