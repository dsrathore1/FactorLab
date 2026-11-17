"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [number, setNumber] = useState("8051");
  const [algorithm, setAlgorithm] = useState("both");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setData(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/factorize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number, algorithm }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "Something went wrong.");
      setData(payload);
    } catch (err) {
      setError(err.message || "Could not connect to the backend. Is FastAPI running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <nav className="nav">
        <a className="brand" href="#"><span className="brand-icon">π</span> FactorLab</a>
        <span className="nav-tag">MATHS PROJECT · ALGORITHM VISUALIZER</span>
      </nav>

      <section className="hero">
        <div className="eyebrow"><span className="pulse" /> MATHEMATICS MEETS ALGORITHMS</div>
        <h1>Explore the building blocks<br /><span>of every integer.</span></h1>
        <p className="intro">Discover prime factors and compare two classic factorization algorithms: Trial Division and Pollard&apos;s Rho.</p>
      </section>

      <section className="workspace">
        <div className="panel input-panel">
          <div className="section-label">01 / INPUT</div>
          <h2>Factorize a number</h2>
          <p className="muted">Enter an integer greater than 1.</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="number">YOUR NUMBER</label>
            <input id="number" value={number} onChange={(e) => setNumber(e.target.value)} inputMode="numeric" placeholder="e.g. 8051" />
            <label htmlFor="algorithm">ALGORITHM</label>
            <select id="algorithm" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
              <option value="both">Compare both algorithms</option>
              <option value="trial">Trial Division</option>
              <option value="rho">Pollard&apos;s Rho</option>
            </select>
            <button disabled={loading || !number.trim()}>{loading ? "Calculating..." : "Find prime factors"} <span>→</span></button>
          </form>
          {error && <div className="error">{error}</div>}
          <div className="hint">Try an example: <button className="sample" onClick={() => setNumber("8051")} type="button">8051</button><button className="sample" onClick={() => setNumber("10403")} type="button">10403</button><button className="sample" onClick={() => setNumber("99991")} type="button">99991</button></div>
        </div>

        <div className="panel result-panel">
          <div className="section-label">02 / RESULTS</div>
          <h2>Factorization results</h2>
          {!data && <div className="empty"><div className="empty-symbol">∑</div><strong>Your results will appear here</strong><span>Enter a number and run an algorithm to begin.</span></div>}
          {data && <div className="results">
            <div className="number-line"><span>INPUT NUMBER</span><strong>{data.number}</strong></div>
            {data.results.map((result) => (
              <article className="result-card" key={result.algorithm}>
                <div className="result-heading"><h3>{result.algorithm}</h3><span className="done">COMPLETE</span></div>
                <div className="factor-line">{result.factors.map((factor, i) => <span className="factor" key={`${factor}-${i}`}>{factor}</span>)}</div>
                <div className="equation">{data.number} = {result.factors.join(" × ")}</div>
                <div className="stats">
                  <div><strong>{result.steps.toLocaleString()}</strong><span>Steps / iterations</span></div>
                  <div><strong>{result.time_ms} ms</strong><span>Execution time</span></div>
                </div>
              </article>
            ))}
          </div>}
        </div>
      </section>

      {data && data.results.length > 1 && (
        <section className="panel comparison">
          <div className="section-label">03 / COMPARISON</div>
          <h2>Algorithm performance</h2>
          <p className="muted">Measurements from this run on your machine.</p>
          <div className="compare-grid">
            {data.results.map((r) => <div key={r.algorithm}><span>{r.algorithm}</span><strong>{r.time_ms} <small>ms</small></strong><div className="bar"><i style={{ width: `${Math.max(4, r.time_ms / Math.max(...data.results.map(x => x.time_ms), 0.0001) * 100)}%` }} /></div><small>{r.steps.toLocaleString()} steps / iterations</small></div>)}
          </div>
          <p className="footnote">Runtime varies with the input, hardware, and Pollard&apos;s Rho random starting values. A single run is not a universal performance benchmark.</p>
        </section>
      )}

      <section className="concepts">
        <div><span className="concept-icon">÷</span><h3>Trial Division</h3><p>Tests possible divisors in sequence until the remaining value is prime.</p></div>
        <div><span className="concept-icon">ρ</span><h3>Pollard&apos;s Rho</h3><p>Uses a pseudo-random sequence and GCD to discover a non-trivial factor.</p></div>
        <div><span className="concept-icon">✳</span><h3>Prime Factorization</h3><p>Expresses an integer as a product of prime numbers.</p></div>
      </section>
      <footer>FactorLab <span>Built with Next.js &amp; FastAPI</span></footer>
    </main>
  );
}
