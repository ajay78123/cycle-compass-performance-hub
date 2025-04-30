
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, users, cycles, kras, reviews
from app.database import init_db

app = FastAPI(
    title="KRA/KPI Review System API",
    description="Backend API for KRA/KPI Review System",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables
@app.on_event("startup")
async def startup():
    await init_db()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(cycles.router, prefix="/api/cycles", tags=["Review Cycles"])
app.include_router(kras.router, prefix="/api/kras", tags=["KRAs and KPIs"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
