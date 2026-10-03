import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlalchemy import text
from app.core.config import settings
from app.database.connection import engine, SessionLocal, Base
from app.database.seed_data import seed_database
# Import models to ensure metadata registration
import app.models  # noqa

# Routers
from app.api.auth import router as auth_router
from app.api.listings import router as listings_router
from app.api.inquiries import router as inquiries_router
from app.api.favorites import router as favorites_router
from app.api.admin import router as admin_router
from app.api.upload import router as upload_router, UPLOAD_DIR

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables
    Base.metadata.create_all(bind=engine)

    # Safe automated schema migration for SQLite
    try:
        with engine.connect() as conn:
            # Check listings.documents
            res = conn.execute(text("PRAGMA table_info(listings)")).fetchall()
            listing_cols = [r[1] for r in res]
            if "documents" not in listing_cols:
                conn.execute(text("ALTER TABLE listings ADD COLUMN documents JSON DEFAULT '[]'"))
                conn.commit()

            # Check users.is_active
            res_user = conn.execute(text("PRAGMA table_info(users)")).fetchall()
            user_cols = [r[1] for r in res_user]
            if "is_active" not in user_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1"))
                conn.commit()
    except Exception as e:
        print(f"Schema check notice: {e}")

    # Seed initial demo data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite default port 5173, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for Uploads (Device images and legal documents)
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include API Routers
app.include_router(auth_router, prefix="/api")
app.include_router(listings_router, prefix="/api")
app.include_router(inquiries_router, prefix="/api")
app.include_router(favorites_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(upload_router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": "Cedro Real Estate API",
        "status": "online",
        "version": settings.VERSION,
        "docs": "/docs",
        "uploads": "/uploads"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
