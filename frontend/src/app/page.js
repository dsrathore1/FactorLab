"use client";

import { useState } from "react";
import {
  BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import "./globals.css";

const API_URL = (process.env.API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const tooltipStyle = { backgroundColor: "#111827", border: "1px solid #39445b", borderRadius: 8, color: "#eef2ff" };

export default function Home() {
  const [mode, setMode] = useState("generate");
  const [bits, setBits] = useState("16");
  const [number, setNumber] = useState("8051");
  const [algorithm, setAlgorithm] = useState("both");
  const [timeout, setTimeout] = useState("5");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runExperiment(e) {
    e.preventDefault();
    setError(""); setData(null); setLoading(true);
    try {
      const endpoint = mode === "generate" ? "/api/generate-experiment" : "/api/factorize";
      const body = mode === "generate"
        ? { bits: Number(bits), algorithm, timeout_seconds: Number(timeout) }
        : { number, algorithm, timeout_seconds: Number(timeout) };
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "The experiment could not be started.");
      setData(payload);
    } catch (err) {
      setError(err.message || "Could not connect to the FactorLab API.");
    } finally { setLoading(false); }
  }

  const completed = data?.results?.filter((r) => r.status === "completed") ?? [];
  const chartData = completed.map((r) => ({
    algorithm: r.algorithm,
    "Execution time (ms)": Number(r.time_ms),
    "Steps / iterations": Number(r.steps),
  }));

  return (
    <main className="shell">
      <nav className="nav"><a className="brand" href="#"><span className="brand-icon">π</span> FactorLab</a><span className="nav-tag">MATHS PROJECT · ALGORITHM VISUALIZER</span></nav>
      <section className="hero">
        <div className="eyebrow"><span className="pulse" /> MATHEMATICS MEETS ALGORITHMS</div>
        <h1>Explore the building blocks<br /><span>of every integer.</span></h1>
        <p className="intro">Generate semiprimes of a chosen bit length, factor them, and compare algorithm performance under a time limit.</p>
      </section>

      <section className="workspace">
        <div className="panel input-panel">
          <div className="section-label">01 / EXPERIMENT SETUP</div>
          <h2>Configure an experiment</h2>
          <div className="mode-switch" role="group" aria-label="Input mode">
            <button type="button" className={mode === "generate" ? "mode-active" : ""} onClick={() => { setMode("generate"); setData(null); }}>Generate semiprime</button>
            <button type="button" className={mode === "manual" ? "mode-active" : ""} onClick={() => { setMode("manual"); setData(null); }}>Enter number</button>
          </div>
          <form onSubmit={runExperiment}>
            {mode === "generate" ? <>
              <label htmlFor="bits">COMPOSITE NUMBER SIZE</label>
              <select id="bits" value={bits} onChange={(e) => setBits(e.target.value)}>
                {[8, 16, 32, 64, 128, 256].map((b) => <option value={b} key={b}>{b}-bit</option>)}
              </select>
              <p className="field-note">The generated composite n = p × q will have exactly this many bits. p and q are distinct probable primes.</p>
            </> : <>
              <label htmlFor="number">YOUR NUMBER</label>
              <input id="number" value={number} onChange={(e) => setNumber(e.target.value)} inputMode="numeric" placeholder="e.g. 8051" />
            </>}
            <label htmlFor="algorithm">ALGORITHM</label>
            <select id="algorithm" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
              <option value="both">Compare both algorithms</option>
              <option value="trial">Optimized Trial Division</option>
              <option value="rho">Pollard&apos;s Rho</option>
            </select>
            <label htmlFor="timeout">TIMEOUT PER ALGORITHM</label>
            <select id="timeout" value={timeout} onChange={(e) => setTimeout(e.target.value)}>
              {[2, 5, 10, 20, 30, 60].map((s) => <option value={s} key={s}>{s} seconds</option>)}
            </select>
            <button disabled={loading || (mode === "manual" && !number.trim())}>{loading ? "Running experiment…" : mode === "generate" ? "Generate & factorize" : "Find prime factors"} <span>→</span></button>
          </form>
          {error && <div className="error">{error}</div>}
          <div className="hint">{mode === "generate" ? "A new random semiprime is generated each time." : <>Try: <button className="sample" onClick={() => setNumber("8051")} type="button">8051</button><button className="sample" onClick={() => setNumber("10403")} type="button">10403</button><button className="sample" onClick={() => setNumber("99991")} type="button">99991</button></>}</div>
        </div>

        <div className="panel result-panel">
          <div className="section-label">02 / RESULTS</div><h2>Factorization results</h2>
          {!data && <div className="empty"><div className="empty-symbol">∑</div><strong>Your experiment will appear here</strong><span>Choose a bit size or enter an integer to begin.</span></div>}
          {data && <div className="results">
            <div className="number-line"><span>COMPOSITE INPUT · {data.bits ?? data.number?.length * 3.3} BITS</span><strong className="break-number">{data.number}</strong></div>
            {data.original_primes && <div className="generated-primes"><div><span>GENERATED PRIME p</span><strong>{data.original_primes.p}</strong></div><div><span>GENERATED PRIME q</span><strong>{data.original_primes.q}</strong></div></div>}
            {data.results.map((result, i) => <article className="result-card" key={`${result.algorithm}-${i}`}>
              <div className="result-heading"><h3>{result.algorithm}</h3><span className={result.status === "completed" ? "done" : result.status === "timeout" ? "timed-out" : "failed"}>{result.status === "completed" ? "COMPLETE" : result.status === "timeout" ? "TIMEOUT" : "ERROR"}</span></div>
              {result.status === "completed" ? <>
                <div className="factor-line">{result.factors.map((factor, j) => <span className="factor" key={`${factor}-${j}`}>{factor}</span>)}</div>
                <div className="equation">{data.number} = {result.factors.join(" × ")}</div>
                <div className="stats"><div><strong>{Number(result.steps).toLocaleString()}</strong><span>Steps / iterations</span></div><div><strong>{result.time_ms} ms</strong><span>Execution time</span></div></div>
                {data.original_primes && <p className="field-note">Recovered factors match generated primes: {result.factors.map(BigInt).sort((a,b) => a < b ? -1 : 1).map(String).join(" and ") === [data.original_primes.p, data.original_primes.q].sort((a,b) => BigInt(a) < BigInt(b) ? -1 : 1).join(" and ") ? "Yes" : "Check factor list"}</p>}
              </> : <p className="status-message">{result.message || "The algorithm did not complete."} {result.time_ms != null && `Elapsed: ${result.time_ms} ms.`}</p>}
            </article>)}
            {data.original_primes && <p className="security-note">Educational experiment: the generator displays p and q because it created them. In a real factorization challenge, keep the original factors hidden from the solver.</p>}
          </div>}
        </div>
      </section>

      {chartData.length > 0 && <section className="panel comparison">
        <div className="section-label">03 / VISUAL COMPARISON</div><h2>Algorithm performance graph</h2><p className="muted">Only successfully completed runs are included in these charts.</p>
        <div className="chart-grid">
          {[{ title: "Execution time", key: "Execution time (ms)", suffix: "ms", color: "#e0b13f" }, { title: "Steps / iterations", key: "Steps / iterations", suffix: "steps", color: "#f2cf68" }].map((chart) => <div className="chart-card" key={chart.key}>
            <h3>{chart.title}</h3><p>{chart.key === "Execution time (ms)" ? "Lower is faster · milliseconds" : "Number of computational steps"}</p>
            <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 5 }}><CartesianGrid stroke="#293449" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="algorithm" tick={{ fill: "#c6b991", fontSize: 11 }} axisLine={{ stroke: "#39445b" }} tickLine={false} /><YAxis tick={{ fill: "#8995aa", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toLocaleString()} ${chart.suffix}`, chart.title]} /><Bar dataKey={chart.key} fill={chart.color} radius={[6, 6, 0, 0]} maxBarSize={76} /></BarChart></ResponsiveContainer></div>
          </div>)}
        </div>
        <p className="footnote">A timeout means the worker process was stopped after the selected limit. It is not a failed mathematical result. Timings vary by hardware and random starting values.</p>
      </section>}

      <section className="concepts"><div><span className="concept-icon">÷</span><h3>Trial Division</h3><p>Tests candidate divisors using the 6k ± 1 optimization.</p></div><div><span className="concept-icon">ρ</span><h3>Pollard&apos;s Rho</h3><p>Uses randomized sequences and GCD calculations to find non-trivial factors.</p></div><div><span className="concept-icon">✳</span><h3>Miller–Rabin</h3><p>Quickly checks whether generated candidates are probably prime.</p></div></section>
      <footer>FactorLab <span>Built with Next.js &amp; FastAPI</span></footer>
    </main>
  );
}
