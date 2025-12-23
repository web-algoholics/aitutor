import os
import asyncio
import logging
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import init_db
from config import settings

from auth.auth import fastapi_users, current_active_user, auth_backend
from auth.models import User
from auth.schemas import UserRead, UserCreate, UserUpdate
from auth.routing import router as upload_router
from jobs.routing import router as jobs_router
from theory.routing import router as theory_router
from quizzes.routing import router as quizzes_router
from anki.routing import router as anki_router
from chat.routing import router as chat_router


# Configure logging
logging.basicConfig(
    level=logging.INFO,  # Show INFO level and above
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # Output to console
        logging.FileHandler('logs/app.log'),  # Save to file
        logging.FileHandler('logs/errors.log', mode='a')  # Error logs
    ]
)

# Create logs directory
os.makedirs('logs', exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Wait a bit for database to be ready
    for _ in range(5):
        try:
            await init_db()
            break
        except Exception as e:
            print(f"Database connection failed, retrying... Error: {e}")
            await asyncio.sleep(2)
    else:
        raise Exception("Could not connect to database after multiple attempts")
    yield


app = FastAPI(lifespan=lifespan)
app.mount(settings.PROFILE_ICON_URL_PATH, StaticFiles(directory=settings.UPLOAD_DIR), name="profile_icons")


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8099", "http://localhost:8000", "http://127.0.0.1:8099", "http://127.0.0.1:8000"],  # Allow frontend and API origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include ALL FastAPI-Users Routers ---
# Auth Routers (no redundant schema passing)
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/cookie",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

app.include_router(upload_router)
app.include_router(jobs_router)

# Theory router
app.include_router(theory_router)

# Quizzes router
app.include_router(quizzes_router)

# Anki router
app.include_router(anki_router)
app.include_router(chat_router)

# --- Example Protected Route ---
@app.get("/protected")
def protected_route(user: User = Depends(current_active_user)):
    return {"message": f"Hello {user.email}! Your session is active."}