import math
import random
import time


def is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n in (2, 3):
        return True
    if n % 2 == 0:
        return False
    d = 3
    while d * d <= n:
        if n % d == 0:
            return False
        d += 2
    return True


def trial_division(n: int) -> dict:
    start = time.perf_counter()
    original = n
    factors = []
    steps = 0

    while n % 2 == 0:
        factors.append(2)
        n //= 2
        steps += 1

    divisor = 3
    while divisor * divisor <= n:
        steps += 1
        if n % divisor == 0:
            factors.append(divisor)
            n //= divisor
        else:
            divisor += 2

    if n > 1:
        factors.append(n)

    return {
        "algorithm": "Trial Division",
        "input": str(original),
        "factors": [str(x) for x in factors],
        "steps": steps,
        "time_ms": round((time.perf_counter() - start) * 1000, 4),
    }


def pollards_rho(n: int) -> tuple[int, int]:
    if n % 2 == 0:
        return 2, 1
    if n % 3 == 0:
        return 3, 1

    iterations = 0
    while True:
        x = random.randrange(2, n - 1)
        y = x
        c = random.randrange(1, n - 1)
        d = 1

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
    start = time.perf_counter()
    original = n
    factors = []
    iterations = _rho_factor(n, factors)
    factors.sort()
    return {
        "algorithm": "Pollard's Rho",
        "input": str(original),
        "factors": [str(x) for x in factors],
        "steps": iterations,
        "time_ms": round((time.perf_counter() - start) * 1000, 4),
    }
