from __future__ import annotations

import math
import secrets
import time
from collections import Counter


def is_prime(n: int, rounds: int = 32) -> bool:
    """Probabilistic Miller-Rabin primality test (strong for this demo)."""
    if n < 2:
        return False
    small_primes = (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37)
    for p in small_primes:
        if n == p:
            return True
        if n % p == 0:
            return False
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1
    # Deterministic bases for n < 2^64; random bases above that.
    bases = (2, 325, 9375, 28178, 450775, 9780504, 1795265022) if n < 2**64 else None
    for i in range(rounds if bases is None else len(bases)):
        a = (bases[i] % n) if bases is not None else secrets.randbelow(n - 3) + 2
        if a < 2:
            continue
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(s - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    return True


def generate_prime(bits: int) -> int:
    """Generate a probable prime with exactly `bits` bits."""
    if bits < 2:
        raise ValueError("Prime bit length must be at least 2")
    while True:
        candidate = secrets.randbits(bits) | (1 << (bits - 1)) | 1
        if is_prime(candidate):
            return candidate


def generate_semiprime(bits: int) -> tuple[int, int, int]:
    """Generate distinct probable primes p,q where n=p*q has exactly `bits` bits."""
    if bits < 8 or bits > 256:
        raise ValueError("Supported composite sizes are 8 to 256 bits")
    p_bits = bits // 2
    q_bits = bits - p_bits
    while True:
        p = generate_prime(p_bits)
        q = generate_prime(q_bits)
        if p == q:
            continue
        n = p * q
        if n.bit_length() == bits:
            return p, q, n


def trial_division(n: int) -> dict:
    start = time.perf_counter()
    original, factors, steps = n, [], 0
    while n % 2 == 0:
        factors.append(2)
        n //= 2
        steps += 1
    # 6k +/- 1 candidates: 5, 7, 11, 13, ...
    divisor, step = 3, 2
    while divisor * divisor <= n:
        steps += 1
        if n % divisor == 0:
            factors.append(divisor)
            n //= divisor
        else:
            divisor += step
            step = 6 - step
    if n > 1:
        factors.append(n)
    return _result("Trial Division (6k ± 1)", original, factors, steps, start)


def pollards_rho(n: int) -> tuple[int, int]:
    if n % 2 == 0:
        return 2, 1
    if n % 3 == 0:
        return 3, 1
    iterations = 0
    while True:
        x = secrets.randbelow(n - 2) + 2
        y, c, d = x, secrets.randbelow(n - 1) + 1, 1
        while d == 1:
            x = (x * x + c) % n
            y = (y * y + c) % n
            y = (y * y + c) % n
            d = math.gcd(abs(x - y), n)
            iterations += 1
        if d != n:
            return d, iterations


def _rho_factor(n: int, factors: list[int]) -> int:
    if n == 1:
        return 0
    if is_prime(n):
        factors.append(n)
        return 0
    divisor, iterations = pollards_rho(n)
    return iterations + _rho_factor(divisor, factors) + _rho_factor(n // divisor, factors)


def pollard_factorization(n: int) -> dict:
    start, factors = time.perf_counter(), []
    iterations = _rho_factor(n, factors)
    factors.sort()
    return _result("Pollard's Rho", n, factors, iterations, start)


def _result(name: str, original: int, factors: list[int], steps: int, start: float) -> dict:
    return {
        "algorithm": name,
        "input": str(original),
        "factors": [str(x) for x in sorted(factors)],
        "steps": steps,
        "time_ms": round((time.perf_counter() - start) * 1000, 4),
    }


def factorization_worker(number: int, algorithm: str, send_conn) -> None:
    """Child-process entry point; parent can terminate it on timeout."""
    try:
        if algorithm == "trial":
            result = trial_division(number)
        elif algorithm == "rho":
            result = pollard_factorization(number)
        else:
            raise ValueError("Unknown algorithm")
        send_conn.send({"status": "completed", **result})
    except BaseException as exc:  # send a safe failure back to the parent
        send_conn.send({"status": "error", "error": str(exc)[:300]})
    finally:
        send_conn.close()
