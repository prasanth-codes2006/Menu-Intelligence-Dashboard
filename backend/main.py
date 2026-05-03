from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routes import menu, orders

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Menu Intelligence Dashboard API")

# Configure CORS for frontend access
origins = [
    "http://localhost:5173", # Vite default port
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
    return {"message": "Welcome to the Menu Intelligence Dashboard API"}
