import asyncio
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import scan_github, scan_url

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

app = FastAPI(
    title="VaultScan API",
    description="Lightweight vulnerability scanner API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_url.router)
app.include_router(scan_github.router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "VaultScan API"}


async def keep_alive():
    """Self-ping every 10 minutes to prevent Render free tier sleep."""
    await asyncio.sleep(30)  # wait 30 secs after startup before first ping
    while True:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.get(
                    "https://vaultscan-backend-q36e.onrender.com/api/health"
                )
        except Exception:
            pass  # silently ignore errors
        await asyncio.sleep(600)  # ping every 10 minutes


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(keep_alive())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)