
"use client";

import Link from 'next/link';

export default function DocsPage() {
  const steps = [
    {
      title: "1. Data Collection",
      desc: "Users anonymously report prices paid for local services (autos, street food, repairs) along with their location.",
      icon: "📝"
    },
    {
      title: "2. Weighted Processing",
      desc: "Our engine applies weights based on recency (newer is better), upvotes (community trust), and contributor reputation.",
      icon: "⚖️"
    },
    {
      title: "3. Statistical Analysis",
      desc: "We calculate the weighted average, median, and volatility index to understand market stability.",
      icon: "📊"
    },
    {
      title: "4. Dynamic Verdict",
      desc: "A 'Fair Price' range is generated. If market volatility is high, the range expands to account for fluctuations.",
      icon: "🎯"
    }
  ];

  return (
    <main className="min-h-screen bg-white p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-4">
          <Link href="/" className="text-blue-600 font-bold text-sm hover:underline">← Back to Oracle</Link>
          <h1 className="text-4xl font-black tracking-tighter">System Documentation</h1>
          <p className="text-slate-500 text-lg">How Price Oracle ensures transparency in unorganized markets.</p>
        </header>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold border-b pb-2">The Logic Flow</h2>
          <div className="grid gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="text-3xl">{step.icon}</div>
                <div>
                  <h3 className="font-black text-slate-800">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2">Algorithm Deep Dive</h2>
          <div className="bg-slate-900 text-slate-300 p-8 rounded-[2rem] font-mono text-sm overflow-x-auto">
            <p className="text-blue-400 mb-4">{"// Simplified Weighting Formula"}</p>
            <p>FinalWeight = RecencyWeight * ReputationWeight * ConsensusWeight</p>
            <p className="mt-4 text-blue-400">{"// Dynamic Range Calculation"}</p>
            <p>RangeMultiplier = 0.15 + (VolatilityIndex * 0.2)</p>
            <p>FairRange = [Average * (1 - Multiplier), Average * (1 + Multiplier)]</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">Trust Mechanisms</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <p className="text-sm text-slate-600"><b>Anomaly Detection:</b> Prices exceeding 1.8x the average are flagged as &quot;Unlikely&quot; to prevent spam.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <p className="text-sm text-slate-600"><b>Decay Function:</b> Data older than 30 days loses 90% of its weight to keep the oracle current.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <p className="text-sm text-slate-600"><b>Confidence Score:</b> A transparency metric (0-100%) based on sample size and price consistency.</p>
            </li>
          </ul>
        </section>

        <footer className="pt-12 text-center border-t">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Oracle Protocol v2.0 • Open Transparency</p>
        </footer>
      </div>
    </main>
  );
}
      