from typing import Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from app.algorithms.factorization import trial_division, pollard_factorization

app = FastAPI(
    title="FactorLab API",
    description="Educational prime factorization using Trial Division and Pollard's Rho.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://factor-lab-chi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FactorRequest(BaseModel):
    number: str = Field(..., description="Positive integer greater than 1")
    algorithm: Literal["trial", "rho", "both"] = "both"


@app.get("/")
def home():
    return {"message": "Welcome to FactorLab API", "status": "running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/factorize")
def factorize(payload: FactorRequest):
    raw = payload.number.strip()
    if not raw.isdigit():
        raise HTTPException(status_code=400, detail="Enter a valid positive integer.")
    n = int(raw)
    if n <= 1:
        raise HTTPException(status_code=400, detail="Number must be greater than 1.")
    if n > 10**18:
        raise HTTPException(status_code=400, detail="For this demo, enter a number up to 10^18.")

    results = []
    if payload.algorithm in ("trial", "both"):
        results.append(trial_division(n))
    if payload.algorithm in ("rho", "both"):
        results.append(pollard_factorization(n))

    return {"number": str(n), "results": results}
