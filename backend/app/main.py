from __future__ import annotations

import multiprocessing as mp
import time
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.algorithms.factorization import factorization_worker, generate_semiprime

app = FastAPI(
    title="FactorLab API",
    description="Educational prime generation and integer factorization experiments.",
    version="2.0.0",
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
    timeout_seconds: int = Field(default=5, ge=1, le=60)


class GenerateExperimentRequest(BaseModel):
    bits: int = Field(..., ge=8, le=256)
    algorithm: Literal["trial", "rho", "both"] = "both"
    timeout_seconds: int = Field(default=5, ge=1, le=60)


def _run_with_timeout(number: int, algorithm: str, timeout_seconds: int) -> dict:
    # Spawn is safe on Windows and isolates CPU-bound work so it can be killed.
    ctx = mp.get_context("spawn")
    recv_conn, send_conn = ctx.Pipe(duplex=False)
    process = ctx.Process(
        target=factorization_worker, args=(number, algorithm, send_conn)
    )
    started = time.perf_counter()
    process.start()
    send_conn.close()
    process.join(timeout_seconds)
    elapsed = round((time.perf_counter() - started) * 1000, 4)

    if process.is_alive():
        process.terminate()
        process.join(1)
        if process.is_alive() and hasattr(process, "kill"):
            process.kill()
            process.join()
        recv_conn.close()
        return {
            "algorithm": (
                "Trial Division (6k ± 1)" if algorithm == "trial" else "Pollard's Rho"
            ),
            "status": "timeout",
            "time_ms": elapsed,
            "timeout_seconds": timeout_seconds,
            "message": f"Stopped after {timeout_seconds} seconds.",
        }

    if recv_conn.poll(0.2):
        try:
            result = recv_conn.recv()
        except EOFError:
            result = None
        recv_conn.close()
        if result is not None:
            if result.get("status") == "error":
                return {
                    "algorithm": algorithm,
                    "status": "error",
                    "time_ms": elapsed,
                    "message": result["error"],
                }
            return result
    recv_conn.close()
    return {
        "algorithm": algorithm,
        "status": "error",
        "time_ms": elapsed,
        "message": "Worker exited without returning a result.",
    }


def _validate_number(raw: str) -> int:
    value = raw.strip()
    if not value.isdigit():
        raise HTTPException(status_code=400, detail="Enter a valid positive integer.")
    n = int(value)
    if n <= 1:
        raise HTTPException(status_code=400, detail="Number must be greater than 1.")
    if n.bit_length() > 4096:
        raise HTTPException(
            status_code=400, detail="Maximum supported manual input is 4096 bits."
        )
    return n


def _run_selected(n: int, algorithm: str, timeout_seconds: int) -> list[dict]:
    selected = ["trial", "rho"] if algorithm == "both" else [algorithm]
    # Each selected algorithm receives its own full timeout budget.
    return [_run_with_timeout(n, item, timeout_seconds) for item in selected]


@app.get("/")
def home():
    return {
        "message": "Welcome to FactorLab API",
        "status": "running",
        "version": "2.0.0",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/factorize")
def factorize(payload: FactorRequest):
    n = _validate_number(payload.number)
    return {
        "number": str(n),
        "bits": n.bit_length(),
        "timeout_seconds": payload.timeout_seconds,
        "results": _run_selected(n, payload.algorithm, payload.timeout_seconds),
    }


@app.post("/api/generate-experiment")
def generate_experiment(payload: GenerateExperimentRequest):
    try:
        p, q, n = generate_semiprime(payload.bits)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    results = _run_selected(n, payload.algorithm, payload.timeout_seconds)
    return {
        "generated": True,
        "bits": payload.bits,
        "number": str(n),
        "original_primes": {"p": str(p), "q": str(q)},
        "timeout_seconds": payload.timeout_seconds,
        "results": results,
    }
