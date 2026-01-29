import { Shield, Database, Globe, Lock, ArrowLeft, Terminal } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white py-24 px-6 relative overflow-hidden">
            {/* Decorative Grid BG */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
                <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                        <path d="M 4 0 L 0 0 0 4" fill="none" stroke="currentColor" strokeWidth="0.1" />
                    </pattern>
                    <rect width="100" height="100" fill="url(#grid)" />
                </svg>
            </div>

            <article className="max-w-4xl mx-auto relative z-10">
                <header className="mb-20">
                    <div className="inline-flex items-center gap-3 border-2 border-black bg-white px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black animate-pulse"></div>
                        <span className="font-doto font-bold uppercase tracking-widest text-sm">Protocol: Transparency</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-doto font-black uppercase tracking-tighter leading-[0.9] mb-8">
                        Data<br /><span className="text-stroke-2 text-transparent">Privacy</span>
                    </h1>

                    <p className="text-xl font-medium text-gray-500 border-l-4 border-black pl-6 max-w-2xl leading-relaxed">
                        Transparency is the foundation of a fair market. We do not store personal identifiers with price entries.
                    </p>
                </header>

                <div className="space-y-16">
                    {/* Section 1: Contributor Data */}
                    <section className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4 mb-6 border-b-4 border-black pb-4">
                            <Database className="w-8 h-8" />
                            <h2 className="font-doto font-bold text-2xl uppercase tracking-widest">Contributor Data</h2>
                        </div>

                        <p className="font-medium text-lg mb-8">
                            When users contribute price entries, we store only essential market metrics: item name, price, location, and a generic timestamp.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-6 border-2 border-black">
                                <div className="font-bold uppercase tracking-wider text-xs mb-2 text-gray-400">Parameter</div>
                                <div className="font-doto font-bold text-lg">Anonymous Storage</div>
                                <p className="text-sm mt-2 text-gray-600">No names, emails, or PII stored.</p>
                            </div>
                            <div className="bg-gray-50 p-6 border-2 border-black">
                                <div className="font-bold uppercase tracking-wider text-xs mb-2 text-gray-400">Parameter</div>
                                <div className="font-doto font-bold text-lg">Aggregation</div>
                                <p className="text-sm mt-2 text-gray-600">Entries pooled for averages.</p>
                            </div>
                            <div className="bg-gray-50 p-6 border-2 border-black">
                                <div className="font-bold uppercase tracking-wider text-xs mb-2 text-gray-400">Parameter</div>
                                <div className="font-doto font-bold text-lg">Masking</div>
                                <p className="text-sm mt-2 text-gray-600">Publicly "Anonymous".</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Web Context Data */}
                    <section className="bg-black text-white p-8 shadow-[8px_8px_0px_0px_rgba(100,100,100,1)]">
                        <div className="flex items-center gap-4 mb-6 border-b-4 border-white/20 pb-4">
                            <Globe className="w-8 h-8" />
                            <h2 className="font-doto font-bold text-2xl uppercase tracking-widest">Web Context (WB)</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="font-bold text-emerald-400 uppercase tracking-wider mb-4">Data Sources</h3>
                                <p className="font-mono text-sm leading-relaxed opacity-80">
                                    // SYSTEM ACCESS<br />
                                    We extract information from public search engines and major retailers. This data is used only for real-time comparative analysis.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-400 uppercase tracking-wider mb-4">Processing Logic</h3>
                                <p className="font-mono text-sm leading-relaxed opacity-80">
                                    // READABILITY PARSE<br />
                                    Web results are processed through third-party readability services to isolate pricing data from clutter.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Data Security */}
                    <section className="bg-white border-2 border-black p-8 border-dashed">
                        <div className="flex items-center gap-4 mb-4">
                            <Lock className="w-6 h-6" />
                            <h2 className="font-doto font-bold text-xl uppercase tracking-widest">Integrity Protocols</h2>
                        </div>
                        <p className="font-medium leading-relaxed max-w-3xl">
                            We do not sell data to advertisers. Our intelligence model's only purpose is to help people pay what is fair. All data is stored securely using encrypted cloud infrastructure.
                        </p>
                    </section>
                </div>

                <footer className="mt-24 flex items-center justify-between border-t-4 border-black pt-8">
                    <Link href="/" className="group flex items-center gap-3 font-bold uppercase tracking-widest hover:bg-black hover:text-white px-6 py-3 border-2 border-black transition-all">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Return to Oracle
                    </Link>

                    <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-400">
                        <Terminal className="w-4 h-4" />
                        <span>LAST_UPDATE: JAN_2026</span>
                    </div>
                </footer>
            </article>
        </main>
    );
}
