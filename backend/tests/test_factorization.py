from app.algorithms.factorization import (
    generate_semiprime,
    is_prime,
    pollard_factorization,
    trial_division,
)


def test_miller_rabin_known_values():
    assert is_prime(2)
    assert is_prime(97)
    assert is_prime(2**61 - 1)
    assert not is_prime(1)
    assert not is_prime(221)


def test_trial_division_factorization():
    result = trial_division(8051)
    assert result["factors"] == ["83", "97"]


def test_pollard_rho_factorization():
    result = pollard_factorization(10403)
    assert result["factors"] == ["101", "103"]


def test_generated_semiprime_has_exact_bit_length():
    p, q, n = generate_semiprime(16)
    assert p != q
    assert is_prime(p) and is_prime(q)
    assert p * q == n
    assert n.bit_length() == 16
