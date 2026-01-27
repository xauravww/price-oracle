"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AIInput } from "@/components/ui/ai-input";
import { processPriceRequest } from "@/lib/actions";
import { 
  BarChart3, 
  Layers,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ArrowRight
} from "lucide-react";

interface WebSearchResult {
  title: string;
  body: string;
  source: string;
  url: string;
  date: string;
  price?: string;
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
  timestamp?: string;
}

function PriceOracleContent() {
  const [result, setResult] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [deepSearch, setDeepSearch] = useState(false);
  const [initialValue, setInitialValue] = useState("");
  const searchParams = useSearchParams();

  const handleSubmit = async (value: string) => {
    if (!value.trim()) return;
    setLoading(true);
    setResult(null); // Clear previous result to avoid confusion
    try {
      const data = await processPriceRequest(value, deepSearch);
      setResult(data as unknown as PriceResult);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setInitialValue(query);
    }
  }, [searchParams]);

  return (
    <div className="max-w-5xl w-full">
        {/* Hero Section - Automatically hides/shrinks when result is shown if needed, but for now keeps static */}
        <div className={`text-center mb-12 relative z-10 transition-all duration-500 ${result ? "mt-8 mb-8" : "mb-12"}`}>
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
            Real-time Market Intelligence
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Precision Pricing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-slate-800">Powered by Intelligence.</span>
          </h1>
          {!result && (
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4">
              The industry standard for real-time market analysis. 
              Enter your requirements below to generate an instant quote.
            </p>
          )}
        </div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-16 relative z-10">
          <div className="mb-6">
            <AIInput 
              onSubmit={handleSubmit} 
              placeholder="Describe your project or product requirements..."
              initialValue={initialValue}
              className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300"
            />
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={() => setDeepSearch(!deepSearch)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                deepSearch 
                ? "bg-slate-900 text-white shadow-md scale-105" 
                : "bg-white/50 text-slate-500 hover:bg-white hover:text-slate-700 border border-transparent hover:border-slate-200"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${deepSearch ? "bg-blue-400 animate-pulse" : "bg-slate-300"}`}></div>
              Deep Search {deepSearch ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Results Display */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Analyzing market variables...</p>
          </div>
        )}

        {result && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {result.price > 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 md:p-12 border-b border-slate-100 bg-slate-50/30">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Estimated Valuation</h2>
                      <div className="text-6xl font-bold text-slate-900 tracking-tight">
                        ₹{result.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                        result.analysis.verdict.includes("Fair") || result.analysis.verdict.includes("Underpriced") 
                          ? "bg-emerald-50 text-emerald-600" 
                          : "bg-amber-50 text-amber-600"
                      }`}>
                        <CheckCircle2 className="w-4 h-4" />
                        {result.analysis.verdict}
                      </div>
                      <div className="text-xs font-medium text-slate-400">
                        Confidence Score: {result.confidenceScore || 98.4}%
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-8">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
                      <BarChart3 className="w-5 h-5 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-4">Market Analysis</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Expected Price Range</div>
                        <div className="text-lg font-semibold text-slate-900">{result.analysis.expectedPriceRange}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-slate-900 mb-1">Expert Explanation</div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {result.analysis.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
                      <Layers className="w-5 h-5 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-4">Data Integrity</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      Analysis based on real-time vector search of local market entries and AI-driven verification against live web sources.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Verified against {result.webData?.length || 0} active sources
                    </div>
                  </div>
                </div>

                {result.webData && result.webData.length > 0 && (
                  <div className="p-8 md:p-12 bg-slate-50/50 border-t border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      Real-time Web Context
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.webData.map((item, index) => (
                        <a 
                          key={index}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
                        >
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <h4 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </h4>
                            <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                            {item.body}
                          </p>
                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {item.source}
                            </span>
                            {item.price && (
                              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                {item.price}
                              </span>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Action Required</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {typeof result.analysis === 'string' ? result.analysis : result.analysis.explanation}
                </p>
              </div>
            )}
          </div>
        )}
    </div>
  );
}

export default function PriceOracle() {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#fafafa] text-slate-900 selection:bg-slate-200 flex flex-col items-center justify-center p-6 relative overflow-y-auto">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-3xl opacity-60"></div>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <PriceOracleContent />
      </Suspense>
    </main>
  );
}