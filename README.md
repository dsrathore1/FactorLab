# FactorLab — Prime Factorization Visualizer

A submission-ready minor-project starter using Next.js (JavaScript) and FastAPI (Python).

## Features
- Factorize positive integers using Trial Division and Pollard's Rho.
- Run either algorithm or compare both.
- View prime factors, steps/iterations, and execution time.
- FastAPI interactive API docs at `/docs`.

## Requirements
- Python 3.9+
- Node.js 18+

## Run backend
```bash
cd backend
python -m venv venv
# Windows Git Bash:
source venv/Scripts/activate
# Windows PowerShell:
# .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Backend: http://127.0.0.1:8000

## Run frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:3000

## Notes
- Enter a positive integer greater than 1.
- Pollard's Rho is randomized; its iteration count and runtime can vary.
- Timings are illustrative measurements from a single local run, not universal complexity guarantees.
- This educational demo is intended for modest-sized integers, not cryptographic-scale benchmarking.

## Prime-size experiments (v2)

The experiment panel can generate a semiprime `n = p × q` with an exact composite bit length (8, 16, 32, 64, 128, or 256 bits), then run Trial Division, Pollard's Rho, or both. Each selected factorization algorithm runs in its own child process and receives the configured timeout (1–60 seconds); timed-out workers are terminated.

### New API

`POST /api/generate-experiment`

```json
{
  "bits": 16,
  "algorithm": "both",
  "timeout_seconds": 5
}
```

`POST /api/factorize` continues to accept manual numbers and now also accepts `timeout_seconds`:

```json
{
  "number": "8051",
  "algorithm": "both",
  "timeout_seconds": 5
}
```

Each result has a `status` of `completed`, `timeout`, or `error`. The timeout is applied independently to each selected algorithm, so `both` may take up to twice the configured timeout, plus process startup overhead.

Miller–Rabin is used to generate probable primes. For inputs of 64 bits or more it is probabilistic (32 random rounds by default), not a mathematical proof of primality. This is an educational experiment, not a production RSA key generator. Pollard's Rho is not expected to factor every 256-bit semiprime within a short timeout.

### Backend local setup

```bash
cd backend
python -m venv venv
# Windows Git Bash: source venv/Scripts/activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Run tests:

```bash
cd backend
pytest -q
```

Build the backend container from the `backend` directory:

```bash
docker build -t factorlab-api .
docker run -p 8000:8000 factorlab-api
```

The frontend uses `NEXT_PUBLIC_API_URL` for the backend origin. Set it in Vercel to the deployed FastAPI URL and redeploy the frontend after changing it.
