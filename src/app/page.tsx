"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Search, 
  CheckCircle2, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Store,
  Building2,
  HelpCircle,
  Clock,
  Database
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#fafafa]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
            v2.0 Now Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900">
            The Truth About <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
              Market Prices.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stop overpaying. Stop guessing. Get real-time price intelligence powered by AI and verified community data.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/demo">
              <Button size="lg" className="h-12 px-8 text-base rounded-full shadow-lg hover:shadow-xl transition-all">
                Launch App <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full bg-white/50 hover:bg-white border-slate-200">
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Showcase using EmptyState design */}
      <section className="px-4 py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why PriceOracle?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We combine web scraping, vector search, and LLMs to give you the most accurate price valuation possible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <EmptyState
              title="No Guesswork"
              description="Instantly validate prices against thousands of online sources."
              icons={[Search, CheckCircle2, ShieldCheck]}
              className="bg-slate-50/50 border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all"
            />
            <EmptyState
              title="Real-time Trends"
              description="Track market volatility and price history effortlessly."
              icons={[TrendingUp, BarChart3, Zap]}
              className="bg-slate-50/50 border-slate-100 hover:border-blue-200 hover:shadow-md transition-all"
            />
            <EmptyState
              title="Community Powered"
              description="Benefit from a decentralized network of price reporters."
              icons={[Users, Globe]}
              className="bg-slate-50/50 border-slate-100 hover:border-purple-200 hover:shadow-md transition-all"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium mb-4">
              Simple & Transparent
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Get an accurate market valuation for any item in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-slate-100 -translate-y-1/2 -z-10"></div>

            {/* Step 1 */}
            <div className="bg-white p-8 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 transition-all duration-300 flex flex-col items-center text-center group bg-slate-50/50">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                <Search className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <div className="absolute -top-3 -right-3 w-7 h-7 bg-white border border-slate-100 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">1</div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Check Price</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Enter any product name (e.g., "iPhone 15 Pro"). Our system understands specific models.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 transition-all duration-300 flex flex-col items-center text-center group bg-slate-50/50">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                <ShieldCheck className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <div className="absolute -top-3 -right-3 w-7 h-7 bg-white border border-slate-100 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">2</div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Live Analysis</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                We scan live listings from <span className="font-medium text-slate-700">Verified Sources</span> and trusted marketplaces.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 transition-all duration-300 flex flex-col items-center text-center group bg-slate-50/50">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                <CheckCircle2 className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <div className="absolute -top-3 -right-3 w-7 h-7 bg-white border border-slate-100 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">3</div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Get Valuation</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Receive an instant, unbiased price verdict. Know exactly if a deal is Fair or Overpriced.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="bg-white px-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 hover:no-underline hover:text-blue-600 transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-500 shrink-0" />
                  Where does the data come from?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed text-base pb-6">
                We aggregate data from over 50+ trusted online marketplaces, classifieds, and verified community submissions. Our AI filters out outliers to ensure accuracy.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white px-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 hover:no-underline hover:text-blue-600 transition-colors">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                  Is the data real-time?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed text-base pb-6">
                Yes. Our web search agents scan live listings the moment you make a request. Historical data is updated daily to reflect the latest market trends.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white px-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 hover:no-underline hover:text-blue-600 transition-colors">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                  Is it free to use?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed text-base pb-6">
                Yes, the price search and analysis features are completely free to use for everyone.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-slate-600 py-12 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h3 className="text-slate-900 text-xl font-bold mb-4 flex items-center gap-2">
              <div className="bg-slate-900 p-1.5 rounded-lg">
                <Search className="h-4 w-4 text-white" />
              </div>
              PriceOracle
            </h3>
            <p className="max-w-xs leading-relaxed text-slate-500">
              The world's most advanced price intelligence platform. Empowering you with data.
            </p>
          </div>
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/demo" className="hover:text-blue-600 transition-colors">Search App</Link></li>
              <li><Link href="/docs" className="hover:text-blue-600 transition-colors">Documentation</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">Admin</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-slate-100 text-sm text-center text-slate-400">
          © {new Date().getFullYear()} PriceOracle Inc. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
