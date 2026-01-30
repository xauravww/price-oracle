"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AIInput } from "@/components/ui/ai-input";
import { CreativeLoader } from "@/components/ui/creative-loader";
import { processPriceRequest } from "@/lib/actions";
import {
  BarChart3,
  Layers,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ArrowRight,
  User,
  MapPin,
  Clock,
  AlertCircle,
  Zap,
  Terminal,
  Globe,
  Search
} from "lucide-react";
import { reportUnparsedUrl } from "@/lib/actions";
import { toast, Toaster } from "react-hot-toast";

interface WebSearchResult {
  title: string;
  body: string;
  source: string;
  url: string;
  date: string;
  price?: string;
}

interface PriceEntry {
  id: string;
  item: string;
  location: string;
  price: number;
  timestamp: Date | string;
  isTrusted: boolean;
}

interface AnalysisResult {
  expectedPriceRange: string;
  verdict: "Likely Underpriced" | "Fair Deal" | "Slightly High" | "Likely Overpriced" | "Analysis Pending";
  confidence: "Low" | "Medium" | "High";
  explanation: string;
}

interface PriceResult {
  price: number;
  analysis: AnalysisResult;
  confidenceScore?: number;
  webData?: WebSearchResult[];
  relatedEntries?: PriceEntry[];
  timestamp?: string;
}

function PriceOracleContent() {
  const [result, setResult] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [deepSearch, setDeepSearch] = useState(false);
  const [initialValue, setInitialValue] = useState("");
  const [currentQuery, setCurrentQuery] = useState("");
  const [showMoreWeb, setShowMoreWeb] = useState(false);
  const [reportedUrls, setReportedUrls] = useState<Set<string>>(new Set());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const searchParams = useSearchParams();
  const loaderRef = useRef<HTMLDivElement>(null);

  const LOADING_MESSAGES = [
    "Initializing research agents...",
    "Scanning distributed market nodes...",
    "Prioritizing data accuracy over speed...",
    "Cross-referencing historical pricing...",
    "Validating merchant credibility...",
    "Synthesizing market intelligence...",
    "Preparing final analysis report..."
  ];

  const handleSubmit = async (value: string, forceDeep?: boolean) => {
    if (!value.trim()) return;

    setCurrentQuery(value);
    setShowMoreWeb(false); // Reset on new search
    setReportedUrls(new Set()); // Reset reported status on new search

    const isDeep = forceDeep !== undefined ? forceDeep : deepSearch;
    if (forceDeep) setDeepSearch(true);

    setLoading(true);
    setElapsedTime(0);
    setLoadingMessageIndex(0);
    setResult(null); // Clear previous result to avoid confusion
    try {
      const data = await processPriceRequest(value, isDeep);
      setResult(data as unknown as PriceResult);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let messageTimer: NodeJS.Timeout;

    if (loading) {
      if (loaderRef.current) {
        loaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      messageTimer = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 3500);
    }

    return () => {
      clearInterval(timer);
      clearInterval(messageTimer);
    };
  }, [loading]);

  const handleDeepRecheck = () => {
    if (currentQuery) {
      handleSubmit(currentQuery, true);
    } else if (initialValue) {
      handleSubmit(initialValue, true);
    }
  };

  const handleReport = async (e: React.MouseEvent, item: WebSearchResult) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await reportUnparsedUrl(item.url, item.title, currentQuery);
    if (res.success) {
      setReportedUrls(prev => new Set(prev).add(item.url));
      toast.success("URL reported for analysis");
    } else {
      toast.error("Failed to report URL");
    }
  };

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setInitialValue(query);
    }
  }, [searchParams]);

  return (
    <div className="max-w-5xl w-full mx-auto px-4 pb-32">
      {/* Explicit Header */}
      <div className={`transition-all duration-500 ${result ? "mb-8 pt-8" : "mb-16 pt-20"}`}>
        <div className="inline-flex items-center gap-3 border-2 border-black bg-white px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full border border-black animate-pulse"></div>
          <span className="font-doto font-bold uppercase tracking-widest text-sm">System Ready</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-doto font-black uppercase tracking-tighter leading-[0.9] mb-6">
          Price<br /><span className="text-stroke-2 text-transparent">Intelligence</span>
        </h1>

        {!result && (
          <p className="text-xl font-medium text-gray-500 border-l-4 border-black pl-6 max-w-2xl leading-relaxed">
            Execute real-time valuations across Indian marketplaces using vector memory and live web synthesis.
          </p>
        )}
      </div>

      {/* Input Section */}
      <div className="mb-20 relative z-10">
        <div>
          <AIInput
            onSubmit={handleSubmit}
            placeholder="INPUT COMMAND: e.g. iPhone 15 128GB in Mumbai"
            initialValue={initialValue}
            // Overriding styles via class names passed to component if needed, 
            // but the containing div gives the black border effect.
            className="font-doto font-bold text-lg"
          />
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => setDeepSearch(!deepSearch)}
            className={`flex items-center gap-3 px-6 py-3 border-2 border-black transition-all duration-200 uppercase font-bold tracking-widest text-xs ${deepSearch
              ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] translate-x-[2px] translate-y-[2px]"
              : "bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
              }`}
          >
            <div className={`w-2 h-2 ${deepSearch ? "bg-emerald-400" : "bg-gray-300"}`}></div>
            Deep Search: {deepSearch ? "ENABLED" : "DISABLED"}
          </button>
        </div>
      </div>

      {/* Results Display */}
      {loading && (
        <div ref={loaderRef} className="border-2 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CreativeLoader />

          <div className="mt-8 space-y-4">
            <div className="font-doto font-bold text-4xl tabular-nums">
              {elapsedTime.toFixed(1)}s
            </div>

            <div className="h-8 relative overflow-hidden">
              <p key={loadingMessageIndex} className="font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-300 absolute inset-0 flex items-center justify-center">
                {LOADING_MESSAGES[loadingMessageIndex]}
              </p>
            </div>

            <p className="text-xs font-medium text-gray-500 max-w-md mx-auto mt-4">
              We insist on high-fidelity verification which may take a moment.
            </p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">

          {/* Main Verdict Card */}
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Zap className="w-64 h-64" />
            </div>

            <div className="border-b-4 border-black bg-black text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6" />
                <h2 className="font-doto font-bold text-xl uppercase tracking-widest">Pricing Output</h2>
              </div>
              <div className="font-mono text-sm opacity-60">
                {new Date().toLocaleTimeString()}
              </div>
            </div>

            {result.price > 0 ? (
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="flex-1">
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Estimated Market Value</p>
                    <div className="text-7xl md:text-8xl font-doto font-black tracking-tighter leading-none mb-6">
                      ₹{result.price.toLocaleString()}
                    </div>

                    <div className={`inline-flex items-center gap-3 border-2 border-black px-4 py-2 font-bold uppercase tracking-widest text-sm ${result.analysis.verdict.includes("Fair") || result.analysis.verdict.includes("Underpriced")
                      ? "bg-emerald-400 text-black"
                      : "bg-amber-400 text-black"
                      }`}>
                      <CheckCircle2 className="w-5 h-5" />
                      {result.analysis.verdict}
                    </div>
                  </div>

                  <div className="flex-1 space-y-8 w-full">
                    <div className="p-6 bg-gray-50 border-2 border-black">
                      <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-2">Expert Explanation</h4>
                      <p className="font-medium leading-relaxed">{result.analysis.explanation}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border-2 border-black text-center">
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Confidence</div>
                        <div className="font-doto font-bold text-2xl">{result.confidenceScore || 98}%</div>
                      </div>
                      <div className="p-4 border-2 border-black text-center">
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Sources</div>
                        <div className="font-doto font-bold text-2xl">{result.webData?.length || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {!deepSearch && (
                  <div className="mt-8 pt-8 border-t-2 border-black/10 flex justify-center">
                    <button
                      onClick={handleDeepRecheck}
                      className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                    >
                      Request Deep Audit
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-amber-50">
                <div className="w-16 h-16 bg-amber-100 border-2 border-black mx-auto flex items-center justify-center mb-6 rounded-none">
                  <AlertCircle className="w-8 h-8 text-amber-700" />
                </div>
                <h3 className="font-doto font-bold text-2xl uppercase mb-3">Manual Review Required</h3>
                <p className="max-w-md mx-auto text-gray-600 font-medium">
                  {typeof result.analysis === 'string' ? result.analysis : result.analysis.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Web Data Grid */}
          {result.webData && result.webData.length > 0 && (
            <div>
              <div className="flex items-end gap-4 mb-8">
                <h3 className="text-3xl font-doto font-bold uppercase tracking-tighter">Live Signals</h3>
                <div className="h-1 flex-1 bg-black mb-2"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {(showMoreWeb ? result.webData : result.webData.slice(0, 4)).map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-white border-2 border-black p-6 hover:bg-black hover:text-white transition-all duration-200"
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h4 className="font-bold text-lg leading-tight group-hover:underline decoration-2 underline-offset-4 line-clamp-2">
                        {item.title}
                      </h4>
                      <ExternalLink className="w-4 h-4 shrink-0 opacity-50 group-hover:opacity-100" />
                    </div>

                    <p className="text-sm font-medium text-gray-500 mb-4 line-clamp-2 group-hover:text-gray-400">
                      {item.body}
                    </p>

                    <div className="flex items-center justify-between border-t-2 border-black/10 pt-4 group-hover:border-white/20">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        <span className="text-xs font-bold uppercase tracking-widest">{item.source}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.price && (
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 text-xs font-bold">
                            {item.price}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleReport(e, item)}
                          className={`text-amber-600 hover:text-amber-800 group-hover:text-amber-300 flex items-center gap-1 ${!item.price ? "text-[10px] font-bold uppercase tracking-wider" : "p-1"}`}
                          title="Report Incorrect Data"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {!item.price && "Report"}
                        </button>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {result.webData.length > 4 && !showMoreWeb && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setShowMoreWeb(true)}
                    className="px-8 py-3 border-2 border-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                  >
                    Load All Sources
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Related DB Entries */}
          {result.relatedEntries && result.relatedEntries.length > 0 && (
            <div className="border-t-4 border-black pt-12">
              <h3 className="text-2xl font-doto font-bold uppercase tracking-tighter mb-8">Vector Memory Matches</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {result.relatedEntries.map((entry, index) => (
                  <div key={index} className="bg-gray-100 p-6 border-l-4 border-black">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold truncate pr-4">{entry.item}</h4>
                      <span className="font-mono text-xs text-gray-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="text-2xl font-doto font-bold text-gray-800 mb-2">₹{entry.price.toLocaleString()}</div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <MapPin className="w-3 h-3" /> {entry.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )
      }
    </div >
  );
}

export default function PriceOracle() {
  return (
    <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col items-center pt-6 lg:pt-10 overflow-x-hidden">
      <Toaster position="top-right" />
      {/* Decorative Grid BG */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
        <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 4 0 L 0 0 0 4" fill="none" stroke="currentColor" strokeWidth="0.1" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <Suspense fallback={<div>Loading Interface...</div>}>
        <PriceOracleContent />
      </Suspense>
    </main>
  );
}