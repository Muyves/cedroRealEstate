import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/upload", tags=["Uploads"])

# Define upload directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
IMAGES_DIR = os.path.join(UPLOAD_DIR, "images")
DOCS_DIR = os.path.join(UPLOAD_DIR, "documents")

# Ensure directories exist
os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"}
ALLOWED_DOC_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".rtf", ".zip"}
MAX_FILE_SIZE = 30 * 1024 * 1024  # 30 MB

def get_file_extension(filename: str) -> str:
    _, ext = os.path.splitext(filename)
    return ext.lower()

def sanitize_filename(filename: str) -> str:
    # Keep safe alphanumeric characters, underscores, and dashes
    base_name = os.path.basename(filename)
    clean_name = "".join(c for c in base_name if c.isalnum() or c in "._- ")
    return clean_name or "file"

@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_single_file(
    file: UploadFile = File(...),
    folder: str = Form("images"),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a single image or legal document from device.
    Saves to /uploads/images or /uploads/documents and returns accessible static URL.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")

    ext = get_file_extension(file.filename)
    folder_clean = folder.lower()

    if folder_clean == "images":
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported image type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}"
            )
        target_dir = IMAGES_DIR
    elif folder_clean == "documents":
        allowed_all = ALLOWED_DOC_EXTENSIONS.union(ALLOWED_IMAGE_EXTENSIONS)
        if ext not in allowed_all:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported document type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_DOC_EXTENSIONS))}"
            )
        target_dir = DOCS_DIR
    else:
        raise HTTPException(status_code=400, detail="Invalid folder type. Must be 'images' or 'documents'")

    # Generate unique safe filename
    clean_original = sanitize_filename(file.filename)
    unique_prefix = uuid.uuid4().hex[:12]
    saved_filename = f"{unique_prefix}_{clean_original}"
    dest_path = os.path.join(target_dir, saved_filename)

    # Save file and calculate size
    try:
        total_size = 0
        with open(dest_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                total_size += len(chunk)
                if total_size > MAX_FILE_SIZE:
                    os.remove(dest_path)
                    raise HTTPException(status_code=413, detail=f"File exceeds maximum allowed size of 30MB")
                buffer.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    finally:
        await file.close()

    # Accessible URL from frontend
    file_url = f"/uploads/{folder_clean}/{saved_filename}"

    return {
        "url": file_url,
        "name": clean_original,
        "size": total_size,
        "type": file.content_type or "application/octet-stream",
        "folder": folder_clean
    }

@router.post("/multiple", status_code=status.HTTP_201_CREATED)
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    folder: str = Form("images"),
    current_user: User = Depends(get_current_user)
):
    """
    Batch upload multiple images or documents from device.
    """
    uploaded = []
    errors = []

    for file in files:
        try:
            res = await upload_single_file(file=file, folder=folder, current_user=current_user)
            uploaded.append(res)
        except Exception as e:
            errors.append({"filename": file.filename, "error": str(e)})

    return {
        "uploaded": uploaded,
        "errors": errors,
        "total_success": len(uploaded),
        "total_failed": len(errors)
    }
