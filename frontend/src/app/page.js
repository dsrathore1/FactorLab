"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const chartTooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #39445b",
  borderRadius: "8px",
  color: "#eef2ff",
};

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

  const chartData = data?.results?.map((result) => ({
    algorithm: result.algorithm,
    "Execution time (ms)": Number(result.time_ms),
    "Steps / iterations": Number(result.steps),
  })) ?? [];

  return (
    <main className="shell">
      <nav className="nav">
        <a className="brand" href="#"><span className="brand-icon">π</span> FactorLab</a>
        <span className="nav-tag">MINOR PROJECT · ALGORITHM VISUALIZER</span>
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
                  <div><strong>{Number(result.steps).toLocaleString()}</strong><span>Steps / iterations</span></div>
                  <div><strong>{result.time_ms} ms</strong><span>Execution time</span></div>
                </div>
              </article>
            ))}
          </div>}
        </div>
      </section>

      {data && data.results.length > 1 && (
        <section className="panel comparison">
          <div className="section-label">03 / VISUAL COMPARISON</div>
          <h2>Algorithm performance graph</h2>
          <p className="muted">Live measurements returned by the backend for this input.</p>

          <div className="chart-grid">
            <div className="chart-card">
              <h3>Execution time</h3>
              <p>Lower is faster · milliseconds</p>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 5 }}>
                    <CartesianGrid stroke="#293449" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="algorithm" tick={{ fill: "#c6b991", fontSize: 11 }} axisLine={{ stroke: "#39445b" }} tickLine={false} />
                    <YAxis tick={{ fill: "#8995aa", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [`${value} ms`, "Execution time"]} />
                    <Bar dataKey="Execution time (ms)" fill="#e0b13f" radius={[6, 6, 0, 0]} maxBarSize={76} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3>Steps / iterations</h3>
              <p>Number of computational steps</p>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 5 }}>
                    <CartesianGrid stroke="#293449" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="algorithm" tick={{ fill: "#c6b991", fontSize: 11 }} axisLine={{ stroke: "#39445b" }} tickLine={false} />
                    <YAxis tick={{ fill: "#8995aa", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [Number(value).toLocaleString(), "Steps / iterations"]} />
                    <Bar dataKey="Steps / iterations" fill="#f2cf68" radius={[6, 6, 0, 0]} maxBarSize={76} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <p className="footnote">Runtime can vary with hardware and Pollard&apos;s Rho random starting values. Compare repeated runs for a more reliable benchmark; one run is not a universal performance guarantee.</p>
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
