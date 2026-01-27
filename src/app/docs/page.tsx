import { 
  ShieldCheck, 
  Zap, 
  Database, 
  Search, 
  BarChart4, 
  Globe2,
  ArrowRight,
  Code2,
  Cpu,
  Lock,
  Layers,
  Network,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Zap className="w-5 h-5" />
            </div>
            <span>PriceOracle<span className="text-primary">.</span></span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Admin Portal</Link>
            <Link href="/demo" className="px-4 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 flex gap-12">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-32 h-fit">
          <div className="space-y-8">
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Core Concepts</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#process-overview" className="hover:text-primary transition-colors">Process Overview</a></li>
                <li><a href="#input-analysis" className="hover:text-primary transition-colors">1. Input Analysis</a></li>
                <li><a href="#vector-search" className="hover:text-primary transition-colors">2. Vector Search</a></li>
                <li><a href="#web-intelligence" className="hover:text-primary transition-colors">3. Web Intelligence</a></li>
                <li><a href="#ai-synthesis" className="hover:text-primary transition-colors">4. AI Synthesis</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Technical Details</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#tech-stack" className="hover:text-primary transition-colors">Tech Stack</a></li>
                <li><a href="#data-privacy" className="hover:text-primary transition-colors">Data & Privacy</a></li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl">
          {/* Header */}
          <section className="mb-16">
            <h1 className="text-4xl font-extrabold mb-6 tracking-tight lg:text-5xl">
              How PriceOracle Works
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A transparent, step-by-step breakdown of our hybrid valuation engine. 
              We combine local vector memory with live web intelligence to deliver verified price verdicts.
            </p>
          </section>

          {/* Process Overview */}
          <section id="process-overview" className="scroll-mt-24 mb-20">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Network className="w-8 h-8 text-primary" />
              The Pipeline
            </h2>
            
            <div className="bg-slate-50 border rounded-2xl p-8 mb-8 overflow-x-auto">
              <div className="min-w-[700px] flex flex-col gap-8">
                {/* Step 1 */}
                <div className="flex justify-center">
                  <div className="bg-white px-6 py-3 rounded-lg border shadow-sm flex flex-col items-center w-64">
                    <span className="font-bold text-slate-900">1. User Input</span>
                    <span className="text-xs text-slate-500">"iPhone 15 Pro for 120000 in Delhi"</span>
                  </div>
                </div>

                {/* Arrow Down */}
                <div className="flex justify-center -my-4 relative z-10">
                  <div className="w-0.5 h-8 bg-slate-300"></div>
                </div>

                {/* Step 2: Parallel */}
                <div className="flex justify-center gap-8">
                  <div className="bg-blue-50 border-blue-200 border px-4 py-4 rounded-xl shadow-sm w-64 text-center">
                    <span className="font-bold text-blue-900 block mb-1">2A. Historical Check</span>
                    <span className="text-[10px] text-blue-700 block">
                      Local SQLite Vector DB search for similar past entries
                    </span>
                  </div>
                  <div className="bg-emerald-50 border-emerald-200 border px-4 py-4 rounded-xl shadow-sm w-64 text-center">
                    <span className="font-bold text-emerald-900 block mb-1">2B. Web Crawler</span>
                    <span className="text-[10px] text-emerald-700 block">
                      DuckDuckGo + Trusted Source Filters + Jina Reader
                    </span>
                  </div>
                </div>

                {/* Connecting Lines */}
                <div className="flex justify-center -my-4 relative z-0">
                   <div className="w-64 h-8 border-b-2 border-l-2 border-r-2 border-slate-300 rounded-b-xl"></div>
                </div>
                <div className="flex justify-center -mt-4">
                   <div className="w-0.5 h-8 bg-slate-300"></div>
                </div>

                {/* Step 3 */}
                <div className="flex justify-center">
                  <div className="bg-purple-50 border-purple-200 border px-6 py-4 rounded-xl shadow-sm text-center w-80">
                    <span className="font-bold text-purple-900 block mb-2">3. AI Synthesis (External API)</span>
                    <span className="text-xs text-purple-700 block">
                      Aggregated Context + Logic Prompt <br/> sent to Llama 3.1 (via Groq/OpenAI)
                    </span>
                  </div>
                </div>

                {/* Arrow Down */}
                <div className="flex justify-center -my-4">
                  <div className="w-0.5 h-8 bg-slate-300"></div>
                </div>

                {/* Step 4 */}
                <div className="flex justify-center">
                  <div className="bg-slate-900 text-white px-6 py-3 rounded-lg shadow-lg flex flex-col items-center w-64">
                    <span className="font-bold">4. Final Verdict</span>
                    <span className="text-xs text-slate-400">JSON: {"{ price, verdict, confidence }"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Steps */}
          <div className="space-y-24">
            
            {/* Step 1: Input Analysis */}
            <section id="input-analysis" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">1</div>
                <h2 className="text-2xl font-bold">Input Analysis & Parsing</h2>
              </div>
              <div className="pl-14">
                <p className="text-muted-foreground mb-4">
                  Before any search happens, we parse the raw text input to extract structured data points.
                </p>
                <div className="bg-slate-50 border rounded-xl p-5 font-mono text-sm space-y-2">
                  <div className="flex gap-4">
                    <span className="text-slate-400 select-none">Regex 1:</span>
                    <span className="text-purple-600">Price Extraction</span>
                    <span className="text-slate-500">Detects formats like "₹1,20,000", "Rs 50k", "500 bucks"</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-400 select-none">Regex 2:</span>
                    <span className="text-blue-600">Location</span>
                    <span className="text-slate-500">Identifies "in Delhi", "at Mumbai" patterns</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-400 select-none">Logic:</span>
                    <span className="text-emerald-600">Item Isolation</span>
                    <span className="text-slate-500">Removes price/location tokens to get raw product name</span>
                  </div>
                </div>

                <div className="mt-8 bg-amber-50/50 border border-amber-100 rounded-xl p-6">
                   <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Edge Case: Missing Price Input
                   </h4>
                   <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      If a user searches for <i>"iPhone 15 Pro"</i> without specifying a price (e.g., omitting <i>"for ₹1,20,000"</i>), the system adapts its response strategy:
                   </p>
                   <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Action</span>
                          <p className="text-sm text-slate-700">
                            The system <b>skips the Verdict generation</b> since there is no baseline to compare against.
                          </p>
                      </div>
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Output</span>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span>Verdict:</span>
                                <span className="font-mono text-amber-600">"Analysis Pending"</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span>Web Data:</span>
                                <span className="font-mono text-emerald-600">Displayed</span>
                            </div>
                            <div className="text-xs text-slate-500 italic mt-1 border-t pt-2">
                                "Please tell me what price you are getting..."
                            </div>
                          </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Step 2: Vector Search */}
            <section id="vector-search" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">2</div>
                <h2 className="text-2xl font-bold">Vector Memory Search</h2>
              </div>
              <div className="pl-14">
                <p className="text-muted-foreground mb-4">
                  We maintain a local SQLite database powered by <code>sqlite-vec</code>. Every time a user gets a valuation or contributes data, it's embedded into a 384-dimensional vector.
                </p>
                <ul className="space-y-3 text-sm text-foreground/80 list-disc list-outside ml-4">
                  <li>
                    <b>Semantic Matching:</b> We find similar items even if the phrasing is different (e.g., "MacBook Air" vs "Apple Laptop M2").
                  </li>
                  <li>
                    <b>Historical Context:</b> Provides a baseline "market memory" to sanity check live web results.
                  </li>
                </ul>
              </div>
            </section>

            {/* Step 3: Web Intelligence */}
            <section id="web-intelligence" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">3</div>
                <h2 className="text-2xl font-bold">Live Web Intelligence</h2>
              </div>
              <div className="pl-14">
                <p className="text-muted-foreground mb-6">
                  We perform a real-time crawl using DuckDuckGo's API, running two parallel search strategies to ensure coverage and accuracy.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="border p-5 rounded-xl">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Priority Search
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Restricted to Trusted Sources configured by admins.
                    </p>
                    <code className="text-[10px] bg-slate-100 p-1 rounded block">
                      site:amazon.in OR site:flipkart.com "iPhone 15 price"
                    </code>
                  </div>
                  <div className="border p-5 rounded-xl">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-blue-600" />
                      General Search
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Broad search to catch forum discussions, news, and other retailers.
                    </p>
                    <code className="text-[10px] bg-slate-100 p-1 rounded block">
                      "iPhone 15 price India"
                    </code>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg mt-6">
                  <h4 className="font-bold text-amber-900 text-sm mb-1">Diversity Filter Logic</h4>
                  <p className="text-xs text-amber-800">
                    To prevent one retailer from dominating the results, we programmatically cap results to <b>max 2 per domain</b>. This ensures the AI gets a diverse perspective of the market.
                  </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg mt-4">
                  <h4 className="font-bold text-indigo-900 text-sm mb-1 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Deep Search (Optional)
                  </h4>
                  <p className="text-xs text-indigo-800 mb-2">
                    When Deep Search is enabled, we go beyond snippets. We use <b>Jina Reader</b> to fetch the full markdown content of the top 4 search results.
                  </p>
                  <code className="text-[10px] bg-white/50 p-1.5 rounded block text-indigo-900 font-mono">
                    fetch(`https://r.jina.ai/$&#123;url&#125;`) -&gt; Full Content Extraction
                  </code>
                </div>
              </div>
            </section>

            {/* Step 4: AI Synthesis */}
            <section id="ai-synthesis" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700">4</div>
                <h2 className="text-2xl font-bold">AI Synthesis (External API)</h2>
              </div>
              <div className="pl-14">
                <p className="text-muted-foreground mb-6">
                  We do not run LLMs locally. We securely transmit the aggregated context to an external inference provider (Groq Llama 3.1 or OpenAI GPT-4o-mini) to generate the final verdict.
                </p>

                <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-xs overflow-x-auto">
                  <div className="text-slate-500 mb-2">// System Prompt Structure</div>
                  <p className="mb-4">
                    You are a price transparency expert.<br/>
                    Goal: Evaluate if a user's proposed price is a good deal based on historical data.
                  </p>
                  <p className="mb-4">
                    <span className="text-purple-400">CRITICAL LOGIC:</span><br/>
                    - If User Price &gt; Market Price -&gt; <span className="text-red-400">OVERPRICED</span><br/>
                    - If User Price &lt; Market Price -&gt; <span className="text-emerald-400">UNDERPRICED</span><br/>
                    - If Similar -&gt; <span className="text-blue-400">FAIR DEAL</span>
                  </p>
                  <p>
                    <span className="text-purple-400">STRICT JSON OUTPUT:</span><br/>
                    {"{ expectedPriceRange, verdict, confidence, explanation }"}
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* Tech Stack Footer */}
          <section id="tech-stack" className="mt-24 pt-12 border-t">
            <h3 className="text-lg font-bold mb-6">Built With</h3>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium">Next.js 15</span>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium">TypeScript</span>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium">SQLite (better-sqlite3)</span>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium">sqlite-vec</span>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium">DuckDuckGo API</span>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium">Jina Reader</span>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium">Groq / OpenAI API</span>
            </div>
          </section>

          <footer className="mt-12 py-8 text-sm text-muted-foreground flex justify-between items-center">
            <p>© 2026 PriceOracle Engine.</p>
            <div className="flex gap-4">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/demo" className="hover:underline">App</Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
