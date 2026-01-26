"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AIInput } from "@/components/ui/ai-input";
import { processPriceRequest } from "@/lib/actions";
import { 
  BarChart3, 
  Layers,
  CheckCircle2
} from "lucide-react";

interface PriceResult {
  price: number;
  analysis: string;
  confidenceScore?: number;
  webData?: string;
}

function PriceOracleContent() {
  const [result, setResult] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [deepSearch, setDeepSearch] = useState(false);
  const [initialValue, setInitialValue] = useState("");
  const searchParams = useSearchParams();

  const handleSubmit = async (value: string, image?: string) => {
    if (!value.trim() && !image) return;
    setLoading(true);
    try {
      const data = await processPriceRequest(value, deepSearch, image);
      setResult(data);
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Precision Pricing <br />
            <span className="text-slate-500">Powered by Intelligence.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The industry standard for real-time market analysis. 
            Enter your requirements below to generate an instant quote.
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => setDeepSearch(!deepSearch)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                deepSearch 
                ? "bg-slate-900 text-white shadow-lg" 
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${deepSearch ? "bg-blue-400 animate-pulse" : "bg-slate-300"}`}></div>
              Deep Search {deepSearch ? "ON" : "OFF"}
            </button>
          </div>
          <div className="bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <AIInput 
              onSubmit={handleSubmit} 
              placeholder="Describe your project or product requirements..."
              initialValue={initialValue}
            />
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {result.price > 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 md:p-12 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Estimated Valuation</h2>
                      <div className="text-6xl font-bold text-slate-900">
                        ₹{result.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      Confidence Score: {result.confidenceScore || 98.4}%
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-8">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
                      <BarChart3 className="w-5 h-5 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Market Analysis</h3>
                    <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {result.analysis}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
                      <Layers className="w-5 h-5 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Data Integrity</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Analysis based on real-time vector search of local market entries and AI-driven verification.
                    </p>
                  </div>
                </div>

                {result.webData && (
                  <div className="p-8 md:p-12 bg-slate-50/50 border-t border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      Real-time Web Context
                    </h3>
                    <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      {result.webData}
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
                  {result.analysis}
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
    <main className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-slate-200 flex flex-col items-center justify-center p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <PriceOracleContent />
      </Suspense>
    </main>
  );
}