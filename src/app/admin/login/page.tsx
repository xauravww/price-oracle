
"use client";

import { useState } from "react";
import { adminLogin } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Zap, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await adminLogin(formData);

    if (result.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(result.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative Postal Marks (Fixed Background) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute top-20 right-10 w-32 h-20 opacity-[0.05] rotate-12" viewBox="0 0 100 60">
          <path d="M 10 15 Q 20 10 30 15 Q 40 20 50 15 Q 60 10 70 15 Q 80 20 90 15" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 10 25 Q 20 20 30 25 Q 40 30 50 25 Q 60 20 70 25 Q 80 30 90 25" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 10 35 Q 20 30 30 35 Q 40 40 50 35 Q 60 30 70 35 Q 80 40 90 35" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-multiply"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">

          <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-black/10">
            <div className="w-10 h-10 bg-black flex items-center justify-center text-white rounded-none shrink-0">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="font-doto font-bold text-xl uppercase tracking-tighter leading-none">PriceOracle<span className="text-black">.</span></h1>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Restricted Access</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500">Identity</label>
              <div className="relative group">
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="USERNAME"
                  className="w-full px-4 py-3 bg-white border-2 border-black text-black font-bold focus:outline-none focus:bg-gray-50 placeholder:text-gray-300 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500">Key</label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border-2 border-black text-black font-bold focus:outline-none focus:bg-gray-50 placeholder:text-gray-300 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-500 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-doto font-bold uppercase tracking-widest py-4 border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Authenticate</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-black/10 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
              <Lock className="w-3 h-3" />
              <span>Encrypted Connection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
