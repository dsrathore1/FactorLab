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
