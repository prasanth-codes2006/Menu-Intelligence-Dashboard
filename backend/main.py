"""
Menu Intelligence Dashboard — FastAPI Backend Entry Point

This is the main application file that:
  1. Creates the FastAPI app instance
  2. Configures CORS for frontend access
  3. Registers all route modules (menu, orders, analytics, reports)
  4. Provides a health-check root endpoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routes import menu, orders, analytics, reports

# ---------------------------------------------------------------------------
# NOTE: With Supabase, tables are created via the SQL Editor (schema.sql).
# The line below is kept as a safety net — it won't create tables that
# already exist, thanks to "CREATE TABLE IF NOT EXISTS" behaviour.
# ---------------------------------------------------------------------------
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Menu Intelligence Dashboard API",
    description=(
        "Backend for the Menu Intelligence Dashboard — powered by Supabase PostgreSQL.\n\n"
        "## Features\n"
        "- **Menu Management**: CRUD operations for menu items\n"
        "- **Order Management**: CRUD operations for orders\n"
        "- **Analytics**: Bestsellers, low-margin, low-performance analysis\n"
        "- **Reports**: Monthly sales, revenue reports, CSV export\n"
        "- **Smart Recommendations**: AI-driven suggestions for menu optimisation\n"
    ),
    version="2.0.0",
)

# Configure CORS for frontend access
origins = [
    "http://localhost:5173",   # Vite default port
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register all routers
# ---------------------------------------------------------------------------
app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(reports.router)


@app.get("/", tags=["root"])
def read_root():
    """Health-check / welcome endpoint."""
    return {
        "message": "Welcome to the Menu Intelligence Dashboard API",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "menu": "/menu",
            "orders": "/orders",
            "analytics": "/analytics/summary",
            "reports": "/reports/monthly-sales",
        },
    }
