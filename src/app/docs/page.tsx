"use client";

import {
  Zap,
  ShieldCheck,
  Search,
  Network,
  Cpu,
  EyeOff,
  Layers,
  Database,
  ArrowRight,
  AlertCircle,
  Globe2,
  Lock,
  Menu
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Decorative Postal Marks (Fixed Background) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute top-20 right-10 w-32 h-20 opacity-[0.03] rotate-12" viewBox="0 0 100 60">
          <path d="M 10 15 Q 20 10 30 15 Q 40 20 50 15 Q 60 10 70 15 Q 80 20 90 15" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 10 25 Q 20 20 30 25 Q 40 30 50 25 Q 60 20 70 25 Q 80 30 90 25" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 10 35 Q 20 30 30 35 Q 40 40 50 35 Q 60 30 70 35 Q 80 40 90 35" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Navigation - Brutalist Style */}
      <nav className="sticky top-0 w-full z-50 bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center text-white rounded-none">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <span className="font-doto font-bold text-2xl uppercase tracking-tighter">PriceOracle<span className="text-black">.</span></span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/demo" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:underline decoration-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Demo
            </Link>
            <Link href="/admin/dashboard" className="hidden md:flex text-sm font-bold uppercase tracking-widest hover:underline decoration-2">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 flex flex-col lg:flex-row gap-16 relative z-10">

        {/* Sidebar - Sticky & Stark */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-32 h-fit">
          <div className="space-y-12 border-l-2 border-black/10 pl-6">
            <div className="space-y-6">
              <h4 className="font-doto font-bold text-lg uppercase">System Vision</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><a href="#problem-solution" className="hover:text-black hover:translate-x-1 duration-200 block">Resolving Confusion</a></li>
                <li><a href="#trust-clarity" className="hover:text-black hover:translate-x-1 duration-200 block">Building Trust</a></li>
                <li><a href="#innovations" className="hover:text-black hover:translate-x-1 duration-200 block">Original Innovations</a></li>
                <li><a href="#project-timeline" className="hover:text-black hover:translate-x-1 duration-200 block">Development Story</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-doto font-bold text-lg uppercase">Core Logic</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><a href="#process-overview" className="hover:text-black hover:translate-x-1 duration-200 block">The Pipeline</a></li>
                <li><a href="#input-analysis" className="hover:text-black hover:translate-x-1 duration-200 block">1. Input Analysis</a></li>
                <li><a href="#vector-search" className="hover:text-black hover:translate-x-1 duration-200 block">2. Vector Memory</a></li>
                <li><a href="#web-intelligence" className="hover:text-black hover:translate-x-1 duration-200 block">3. Web Intelligence</a></li>
                <li><a href="#extraction-pipeline" className="hover:text-black hover:translate-x-1 duration-200 block">4. Extraction Recall</a></li>
                <li><a href="#ai-synthesis" className="hover:text-black hover:translate-x-1 duration-200 block">5. AI Synthesis</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-doto font-bold text-lg uppercase">Protocols</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><a href="#admin-panel" className="hover:text-black hover:translate-x-1 duration-200 block">Control Center</a></li>
                <li><a href="#reporting-loop" className="hover:text-black hover:translate-x-1 duration-200 block">Integrity Loop</a></li>
                <li><a href="#anonymous-data" className="hover:text-black hover:translate-x-1 duration-200 block">Privacy Shield</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-doto font-bold text-lg uppercase">Tech Specs</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><a href="#resilient-search" className="hover:text-black hover:translate-x-1 duration-200 block">Resilient Search</a></li>
                <li><a href="#tech-stack" className="hover:text-black hover:translate-x-1 duration-200 block">Stack</a></li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl">
          {/* Header */}
          <section className="mb-24 relative">
            <div className="absolute -left-2 top-2 w-full h-full bg-slate-100/50 -z-10 skew-y-1 rounded-3xl opacity-0 md:opacity-100"></div>
            <h1 className="text-6xl md:text-7xl font-doto font-black mb-8 uppercase tracking-tighter leading-[0.9]">
              System<br />Architecture.
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl leading-relaxed border-l-4 border-black pl-6">
              A transparent breakdown of the hybrid valuation engine.
              Combining vector memory with live web intelligence for verified price verdicts.
            </p>
          </section>

          {/* Vision & Impact Sections */}
          <section id="problem-solution" className="scroll-mt-32 mb-32 group">
            <h2 className="text-4xl font-doto font-bold mb-10 flex items-center gap-4 uppercase tracking-tight group-hover:underline decoration-4 underline-offset-8">
              <Zap className="w-10 h-10 stroke-1 fill-black" />
              Resolving Confusion
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all bg-white">
                <h4 className="text-xl font-bold mb-4 font-doto uppercase">The Noise</h4>
                <p className="text-gray-600 leading-relaxed">
                  Market prices are obfuscated by EMI traps, bait offers, and fragmented listings. Finding the "true cost" has become a research project.
                </p>
              </div>
              <div className="border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all bg-black text-white">
                <h4 className="text-xl font-bold mb-4 font-doto uppercase">The Signal</h4>
                <p className="text-gray-400 leading-relaxed">
                  PriceOracle acts as a neutral clearing layer. It aggregates real-time context and crowdsourced memory to expose the mathematical truth.
                </p>
              </div>
            </div>
          </section>

          <section id="trust-clarity" className="scroll-mt-32 mb-32">
            <div className="flex items-end gap-4 mb-10">
              <h2 className="text-4xl font-doto font-bold uppercase tracking-tight">
                Proof of Truth
              </h2>
              <div className="h-2 flex-1 bg-black/5 mb-3"></div>
            </div>

            <p className="text-xl text-gray-500 mb-10 leading-relaxed">
              We don't just provide a number; we provide the evidence.
              Search snippets, sources, and confidence scores allow users to verify intelligence independently.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Source Transparency", "Fact-based Verdicts", "User Conflict Resolution", "Real-time Verification"].map((item, i) => (
                <div key={i} className="px-4 py-4 border border-black text-xs font-bold uppercase tracking-widest text-center hover:bg-black hover:text-white transition-colors cursor-default">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section id="innovations" className="scroll-mt-32 mb-32">
            <div className="flex items-end gap-4 mb-10">
              <h2 className="text-4xl font-doto font-bold uppercase tracking-tight">
                Innovations
              </h2>
              <div className="h-2 flex-1 bg-black/5 mb-3"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border-2 border-black bg-white">
                <h4 className="font-bold text-sm mb-2 uppercase tracking-tight">Drill-down logic</h4>
                <p className="text-xs text-gray-500">Intelligent identifying of deep product links within search results.</p>
              </div>
              <div className="p-6 border-2 border-black bg-white">
                <h4 className="font-bold text-sm mb-2 uppercase tracking-tight">6-Stage Recall</h4>
                <p className="text-xs text-gray-500">Tiered extraction pipeline to ensure near 100% price detection.</p>
              </div>
              <div className="p-6 border-2 border-black bg-white">
                <h4 className="font-bold text-sm mb-2 uppercase tracking-tight">Tiered Fetchers</h4>
                <p className="text-xs text-gray-500">Multi-provider fetch fallbacks to bypass bot-walls.</p>
              </div>
            </div>
          </section>

          <section id="project-timeline" className="scroll-mt-32 mb-32">
            <div className="p-8 bg-black text-white border-2 border-black relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="text-center md:text-left">
                  <span className="text-5xl font-doto font-bold text-emerald-400">5 Days</span>
                  <p className="text-xs text-gray-400 uppercase tracking-[4px] font-bold mt-2">Sprint Time</p>
                </div>
                <div className="flex-1 border-l border-white/20 pl-8">
                  <h4 className="font-bold text-lg mb-2 uppercase font-doto">The Intensive Build</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    This entire engine—from the tiered search architecture to the vector-powered valuation logic—was designed, implemented, and refined in a single intensive sprint.
                  </p>
                </div>
              </div>
              <Cpu className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>
          </section>

          {/* Process Overview */}
          <section id="process-overview" className="scroll-mt-32 mb-24">
            <div className="bg-slate-50 border-2 border-black p-4 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Network className="w-32 h-32" />
              </div>
              <h2 className="text-3xl font-doto font-bold mb-12 uppercase tracking-widest border-b-2 border-black pb-4 inline-block">
                The Pipeline
              </h2>

              <div className="space-y-12 relative z-10">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-16 h-16 border-2 border-black bg-white flex items-center justify-center shrink-0 text-2xl font-doto font-bold">01</div>
                  <div className="bg-white border-2 border-black p-6 w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <h4 className="font-bold text-lg uppercase mb-2">Input Parsing</h4>
                    <code className="bg-gray-100 px-2 py-1 text-sm">"iPhone 15 Pro for 120000 in Delhi"</code>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col md:flex-row gap-8 items-start pl-8 md:pl-20 border-l-2 border-dashed border-black/20 ml-8 md:ml-0">
                  <div className="w-16 h-16 border-2 border-black bg-white flex items-center justify-center shrink-0 text-2xl font-doto font-bold">02</div>
                  <div className="grid md:grid-cols-2 gap-4 w-full">
                    <div className="bg-white border-2 border-black p-6 hover:bg-blue-50 transition-colors">
                      <h4 className="font-bold text-xs uppercase tracking-widest mb-2 text-blue-600">Vector Memory</h4>
                      <p className="text-sm">Historical context check via pgvector embeddings.</p>
                    </div>
                    <div className="bg-white border-2 border-black p-6 hover:bg-emerald-50 transition-colors">
                      <h4 className="font-bold text-xs uppercase tracking-widest mb-2 text-emerald-600">Web Intelligence</h4>
                      <p className="text-sm">Real-time crawl via DuckDuckGo & Jina Reader.</p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-16 h-16 border-2 border-black bg-black text-white flex items-center justify-center shrink-0 text-2xl font-doto font-bold">03</div>
                  <div className="bg-black text-white border-2 border-black p-6 w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                    <h4 className="font-bold text-lg uppercase mb-2">Final Verdict</h4>
                    <div className="text-sm text-gray-400 font-mono">
                      {"{ price: 118000, verdict: 'Fair', confidence: 0.92 }"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Steps - Styled brutally */}
          <div className="space-y-32">

            {/* Input Analysis */}
            <section id="input-analysis" className="scroll-mt-32">
              <h3 className="font-doto font-black text-3xl uppercase mb-8 decoration-4 decoration-black underline underline-offset-8">01. Parsing Logic</h3>
              <div className="pl-6 border-l-4 border-black space-y-6">
                <p className="text-lg text-gray-600">Regex patterns isolate token types before execution.</p>
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex items-center gap-4 p-4 border-b border-gray-200">
                    <span className="font-bold w-24">PRICE</span>
                    <span className="text-gray-500">Matches "₹1,20,000", "50k", "500 bucks"</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 border-b border-gray-200">
                    <span className="font-bold w-24 text-blue-600">LOCATION</span>
                    <span className="text-gray-500">Matches "in Delhi", "at Mumbai"</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Vector Search */}
            <section id="vector-search" className="scroll-mt-32">
              <h3 className="font-doto font-black text-3xl uppercase mb-8 decoration-4 decoration-black underline underline-offset-8">02. Vector Memory</h3>
              <div className="pl-6 border-l-4 border-black space-y-6">
                <p className="text-lg text-gray-600">PostgreSQL database powered by <code>pgvector</code>. Every valuation is embedded into a 1536-dimensional vector.</p>
                <ul className="space-y-4">
                  <li className="bg-gray-50 p-4 border-l-4 border-black">
                    <span className="font-bold uppercase tracking-wider block mb-1">Semantic Matching</span>
                    <span className="text-sm text-gray-500">Matches "MacBook Air" with "Apple Laptop M2" based on meaning, not just keywords.</span>
                  </li>
                  <li className="bg-gray-50 p-4 border-l-4 border-black">
                    <span className="font-bold uppercase tracking-wider block mb-1">Market Memory</span>
                    <span className="text-sm text-gray-500">Provides a historical baseline to sanity check live web results.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Web Intelligence */}
            <section id="web-intelligence" className="scroll-mt-32">
              <h3 className="font-doto font-black text-3xl uppercase mb-8 decoration-4 decoration-black underline underline-offset-8">03. Web Intelligence</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="border-2 border-black p-8 relative">
                  <div className="absolute top-4 right-4"><Globe2 className="w-6 h-6 opacity-20" /></div>
                  <h4 className="font-bold uppercase tracking-widest mb-4">Priority Search</h4>
                  <p className="text-sm text-gray-600 mb-4">Restricted to high-trust domains (Amazon, Flipkart) for rapid signal.</p>
                  <code className="block bg-gray-100 p-2 text-xs">site:amazon.in "iPhone 15"</code>
                </div>
                <div className="border-2 border-black p-8 relative">
                  <div className="absolute top-4 right-4"><Search className="w-6 h-6 opacity-20" /></div>
                  <h4 className="font-bold uppercase tracking-widest mb-4">Deep Search</h4>
                  <p className="text-sm text-gray-600 mb-4">Broad sweep for forums, local news, and retailer pages.</p>
                  <code className="block bg-gray-100 p-2 text-xs">"iPhone 15 market price India"</code>
                </div>
              </div>
            </section>

            {/* Extraction Pipeline */}
            <section id="extraction-pipeline" className="scroll-mt-32">
              <h3 className="font-doto font-black text-3xl uppercase mb-12 decoration-4 decoration-black underline underline-offset-8">04. 6-Stage Recall</h3>
              <div className="space-y-4">
                {[
                  "AI Snippet Parse",
                  "Snippet Heuristics (Aggressive Regex)",
                  "Jina Reader Fetch (Full Page)",
                  "Custom Scraper Fallback (Axios)",
                  "Deep Content Analysis (LLM)",
                  "Global Regex Fallback"
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-6 p-4 border-b border-black/10 hover:bg-black hover:text-white transition-colors cursor-crosshair group">
                    <span className="font-doto font-bold text-2xl text-gray-300 group-hover:text-white/50">0{i + 1}</span>
                    <span className="font-medium uppercase tracking-wider">{step}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Synthesis */}
            <section id="ai-synthesis" className="scroll-mt-32">
              <h3 className="font-doto font-black text-3xl uppercase mb-8 decoration-4 decoration-black underline underline-offset-8">05. AI Synthesis</h3>
              <div className="flex flex-col gap-6">
                <p className="text-lg text-gray-600">Secure transmission of aggregated context to external AI for final verdict generation.</p>
                <div className="bg-gray-100 p-6 border-l-4 border-purple-500 font-mono text-sm">
                  <div className="text-purple-600 mb-2 font-bold">// Logic Prompt Output</div>
                  <div className="space-y-2 text-gray-600">
                    <p>IF User.Price &gt; Market.Price THEN <span className="text-red-500 font-bold">OVERPRICED</span></p>
                    <p>IF User.Price &lt; Market.Price THEN <span className="text-emerald-600 font-bold">UNDERPRICED</span></p>
                    <p>ELSE <span className="text-blue-600 font-bold">FAIR DEAL</span></p>
                  </div>
                </div>
              </div>
            </section>

            {/* Admin Section */}
            <section id="admin-panel" className="scroll-mt-32 p-12 bg-black text-white mt-24">
              <div className="flex items-center gap-6 mb-12">
                <ShieldCheck className="w-12 h-12" />
                <div>
                  <h2 className="text-4xl font-doto font-bold uppercase">Control Center</h2>
                  <p className="text-gray-400">Restricted Access Protocol</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8 text-sm">
                <div className="border border-white/20 p-6">
                  <h4 className="font-bold text-emerald-400 uppercase mb-2">Metrics Dashboard</h4>
                  <p className="text-gray-400">Real-time health monitoring of search cluster and API consumption.</p>
                </div>
                <div className="border border-white/20 p-6">
                  <h4 className="font-bold text-emerald-400 uppercase mb-2">Source Governance</h4>
                  <p className="text-gray-400">Dynamic whitelist/blacklist for domain authority management.</p>
                </div>
              </div>
            </section>

            {/* Reporting Loop */}
            <section id="reporting-loop" className="scroll-mt-32">
              <h2 className="text-3xl font-doto font-bold mb-8 uppercase tracking-tight">Integrity Loop</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <p className="text-gray-600">Human-in-the-loop validation to continuously refine logic. Flagged results directly influence the system.</p>
                  <ul className="space-y-3 text-sm font-bold uppercase tracking-widest text-gray-500">
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500"></div> Neutralize incorrect prices</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500"></div> Prune broken links</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500"></div> Adjust confidence weights</li>
                  </ul>
                </div>
                <div className="bg-amber-50 border-2 border-amber-200 p-8 flex items-center justify-center">
                  <AlertCircle className="w-16 h-16 text-amber-500/50" />
                  <div className="ml-6">
                    <span className="block text-2xl font-black text-amber-900 mb-1">User Flags</span>
                    <span className="text-sm font-bold uppercase text-amber-700">Trigger Review Queue</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Anonymous Data */}
            <section id="anonymous-data" className="scroll-mt-32">
              <h2 className="text-3xl font-doto font-bold mb-8 uppercase tracking-tight">Privacy Shield</h2>
              <div className="border-t-4 border-b-4 border-black py-12">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <EyeOff className="w-24 h-24 stroke-1" />
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold uppercase tracking-widest">Zero-Identity Storage</h4>
                    <p className="text-gray-600">
                      Contributor data is processed through an isolation layer. We strip all session IDs and IP references.
                      A price entry consists only of metadata: <b>[item, price, currency, timestamp]</b>.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Resilient Search */}
            <section id="resilient-search" className="scroll-mt-32">
              <h2 className="text-3xl font-doto font-bold mb-8 uppercase tracking-tight">Resilient Infrastructure</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 border-l-4 border-gray-300">
                  <span className="font-bold uppercase block mb-2">Provider Fallback</span>
                  <p className="text-sm text-gray-500">Automatic switch to Serper.dev backup pool if DuckDuckGo is rate-limited.</p>
                </div>
                <div className="bg-gray-50 p-6 border-l-4 border-gray-300">
                  <span className="font-bold uppercase block mb-2">Key Rotation</span>
                  <p className="text-sm text-gray-500">Round-robin rotation across multiple API keys to maintain 99.9% uptime.</p>
                </div>
              </div>
            </section>

          </div>

          <section id="tech-stack" className="mt-32 pt-16 border-t-4 border-black">
            <h3 className="text-2xl font-doto font-bold mb-10 uppercase tracking-tight">Technical Stack</h3>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-[2px]">Frontend</h4>
                <div className="h-0.5 w-10 bg-black"></div>
                <ul className="space-y-2 text-sm font-bold uppercase tracking-wider">
                  <li>Next.js 15</li>
                  <li>TypeScript</li>
                  <li>Tailwind CSS</li>
                  <li>Lucide Icons</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-[2px]">Intelligence</h4>
                <div className="h-0.5 w-10 bg-black"></div>
                <ul className="space-y-2 text-sm font-bold uppercase tracking-wider">
                  <li>AI Inference</li>
                  <li>DuckDuckGo Search</li>
                  <li>Jina Reader</li>
                  <li>Node HTML Markdown</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-[2px]">Backend</h4>
                <div className="h-0.5 w-10 bg-black"></div>
                <ul className="space-y-2 text-sm font-bold uppercase tracking-wider">
                  <li>PostgreSQL</li>
                  <li>Prisma ORM</li>
                  <li>pgvector</li>
                  <li>Axios Scraper</li>
                </ul>
              </div>
            </div>
          </section>

          <footer className="mt-32 pt-12 border-t-4 border-black flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="font-doto font-bold text-xl uppercase tracking-tighter">PriceOracle<span className="text-black">.</span></span>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">© 2026 Engine v2.0</p>
            </div>
            <div className="flex gap-8 text-sm font-bold uppercase tracking-widest text-black/40">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <Link href="/demo" className="hover:text-black transition-colors">Terminal</Link>
              <Link href="#" className="hover:text-black transition-colors">GitHub</Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
