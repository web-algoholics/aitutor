from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from auth.auth import current_active_user
from auth.models import User
from database import get_session
from config import settings
import uuid
import os
import base64

router = APIRouter(prefix="/users", tags=["users"])

UPLOAD_DIR_PATH = settings.UPLOAD_DIR
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def is_allowed_file(filename: str) -> bool:
    return os.path.splitext(filename.lower())[1] in ALLOWED_EXTENSIONS

@router.post("/me/upload-icon")
async def upload_profile_icon(
    file: UploadFile = File(...),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session)
):
    # Validate file
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    if not is_allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, JPEG, PNG, GIF allowed.")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File size exceeds 5MB limit.")
    await file.seek(0)

    # Generate a unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR_PATH, unique_filename)

    # Save the file
    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    # Update the user's profile_icon_filename
    user.profile_icon_filename = unique_filename
    session.add(user)
    await session.commit()
    await session.refresh(user)

    return {"filename": unique_filename, "url": user.profile_icon_url}

@router.get("/me/icon")
async def get_profile_icon(user: User = Depends(current_active_user)):
    if not user.profile_icon_filename:
        raise HTTPException(status_code=404, detail="No profile icon found")
    file_path = os.path.join(settings.UPLOAD_DIR, user.profile_icon_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Profile icon file not found")
    with open(file_path, "rb") as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode("utf-8")
        mime_type = "image/jpeg" if user.profile_icon_filename.endswith((".jpg", ".jpeg")) else "image/png"
        return {"image": f"data:{mime_type};base64,{encoded_image}"}

@router.get("/icon/{user_id}", response_class=FileResponse)
async def get_user_icon_by_id(
    user_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session)
):
    # Fetch user by ID
    result = await session.exec(select(User).where(User.id == user_id, User.is_active == True))
    user = result.first()
    if not user:
        raise HTTPException(404, "User not found or inactive")
    
    # Serve default icon if no profile_icon_filename
    if not user.profile_icon_filename:
        return FileResponse(os.path.join(settings.UPLOAD_DIR, "default_icon.png"))
    
    # Serve user’s icon
    file_path = os.path.join(settings.UPLOAD_DIR, user.profile_icon_filename)
    if not os.path.exists(file_path):
        raise HTTPException(404, "Profile icon not found")
    return FileResponse(file_path)