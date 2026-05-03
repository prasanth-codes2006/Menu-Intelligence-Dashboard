from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routes import menu, orders

# ---------------------------------------------------------------------------
# NOTE: With Supabase, tables are created via the SQL Editor (schema.sql).
# The line below is kept as a safety net — it won't create tables that
# already exist, thanks to "CREATE TABLE IF NOT EXISTS" behaviour.
# ---------------------------------------------------------------------------
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Menu Intelligence Dashboard API",
    description="Backend for the Menu Intelligence Dashboard — powered by Supabase PostgreSQL",
    version="1.0.0",
)

# Configure CORS for frontend access
origins = [
    "http://localhost:5173",   # Vite default port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(menu.router)
app.include_router(orders.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Menu Intelligence Dashboard API (Supabase)"}
