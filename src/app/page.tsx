"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Layers, Search, Database } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col bg-white text-foreground font-sans selection:bg-black selection:text-white">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 relative overflow-hidden">
        {/* Decorative Spinning Circle */}
        <div className="absolute top-10 right-10 md:top-20 md:right-20 pointer-events-none opacity-20 md:opacity-40">
          <svg
            className="w-[140px] h-[140px] animate-spin-slow"
            viewBox="0 0 140 140"
            style={{ animationDuration: "20s" }}
          >
            <defs>
              <path id="circlePathHero" d="M 70,70 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0" fill="transparent" />
            </defs>
            <text className="text-[11px] fill-current font-serif uppercase" style={{ fontWeight: 400, letterSpacing: "0.15em" }}>
              <textPath href="#circlePathHero" startOffset="0%">
                Price Oracle • Market Intelligence •
              </textPath>
            </text>
          </svg>
        </div>

        {/* Postal Marks Decoration */}
        <svg className="absolute left-4 top-20 w-28 h-20 opacity-20 rotate-[-10deg] pointer-events-none" viewBox="0 0 100 60">
          <path d="M 10 15 Q 20 10 30 15 Q 40 20 50 15 Q 60 10 70 15 Q 80 20 90 15" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M 10 25 Q 20 20 30 25 Q 40 30 50 25 Q 60 20 70 25 Q 80 30 90 25" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M 10 35 Q 20 30 30 35 Q 40 40 50 35 Q 60 30 70 35 Q 80 40 90 35" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>


        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center justify-center px-3 py-1 border border-black rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <span className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse"></span>
            Live Market Data
          </div>

          <h1 className="text-5xl md:text-8xl font-doto font-black tracking-tight leading-[0.9] uppercase text-balance">
            Real-Time <br />
            <span className="text-muted-foreground">Valuation.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed font-sans">
            Decentralized market memory & web intelligence layer. Resolving price confusion with brutal accuracy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/demo">
              <Button size="lg" className="rounded-none border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors px-8 py-6 text-lg font-doto uppercase tracking-wider">
                Start Price Check <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="rounded-none border-2 border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors px-8 py-6 text-lg font-doto uppercase tracking-wider">
                Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-24 border-t border-black/10 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { i: Layers, t: "6-Stage Recall", d: "Tiered extraction pipeline ensuring near 100% price detection from any web source." },
              { i: Search, t: "Drill-down Context", d: "AI navigation that identifies deep retailers links directly from search snippets." },
              { i: Database, t: "Anonymized Memory", d: "Vector-powered historical processing that protects user identity." }
            ].map((f, idx) => (
              <div key={idx} className="group space-y-4">
                <div className="w-12 h-12 flex items-center justify-center border border-black/20 bg-white group-hover:bg-black group-hover:text-white transition-colors">
                  <f.i className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-doto font-bold uppercase tracking-tight">{f.t}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <section className="py-24 px-6 border-t border-black/10 text-center">
        <Link href="/demo" className="group inline-block">
          <h2 className="text-4xl md:text-6xl font-doto font-black uppercase tracking-tighter group-hover:underline underline-offset-8 decoration-4 decoration-black/30">
            Start Search
          </h2>
        </Link>
        <div className="mt-12 flex justify-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/docs" className="hover:text-foreground transition-colors">Architecture</Link>
        </div>
      </section>
    </main>
  );
}
