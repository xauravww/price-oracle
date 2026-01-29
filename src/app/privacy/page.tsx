
import { Shield, Database, Globe, EyeOff, Lock } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-slate-200 py-24 px-6 relative overflow-hidden">
            {/* Background Subtle Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none fixed">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/20 rounded-full blur-3xl opacity-60"></div>
            </div>

            <article className="max-w-3xl mx-auto relative z-10">
                <header className="mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
                        <Shield className="w-6 h-6 text-slate-900" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
                        Privacy & Data <br />
                        <span className="text-slate-400">Transparency.</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
                        At PriceOracle, we believe transparency is the foundation of a fair market.
                        This policy outlines how we handle anonymous data to empower consumers through intelligence.
                    </p>
                </header>

                <section className="space-y-12">
                    {/* Section 1: Contributor Data */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <Database className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Contributor Data</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            When users contribute price entries, we store only essential market metrics: item name, price, location, and a generic timestamp.
                        </p>
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                            <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                                    <p className="text-sm text-slate-500"><span className="text-slate-900 font-semibold">Anonymous Storage:</span> We do not store names, emails, or personal identifiers with price entries.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                                    <p className="text-sm text-slate-500"><span className="text-slate-900 font-semibold">Aggregation:</span> Individual entries are pooled to create market averages and trend lines.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                                    <p className="text-sm text-slate-500"><span className="text-slate-900 font-semibold">Masking:</span> Public results only show "Anonymous Contributor" to ensure participant privacy.</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 2: Web Context Data */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-50 rounded-xl">
                                <Globe className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Real-time Web Context (WB Data)</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            To provide accurate verdicts, PriceOracle cross-references user data with public market listings.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-lg">
                                <h3 className="font-bold mb-2">Sources</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    We extract information from public search engines and major retailers. This data is used only for real-time comparative analysis.
                                </p>
                            </div>
                            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                                <h3 className="font-bold mb-2 text-slate-900">Processing</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Web results are processed through third-party readability services (like Jina) to isolate pricing data from distracting clutter.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Data Security */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-50 rounded-xl">
                                <Lock className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Data Integrity</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            We do not sell data to advertisers. Our intelligence model's only purpose is to help people pay what is fair. All data is stored securely using encrypted cloud infrastructure.
                        </p>
                    </div>
                </section>

                <footer className="mt-24 pt-12 border-t border-slate-100">
                    <Link href="/" className="text-sm font-bold text-slate-900 hover:text-slate-600 transition-colors inline-flex items-center gap-2">
                        Back to Oracle
                    </Link>
                    <p className="text-xs text-slate-400 mt-4 italic">
                        Last updated: January 2026. This policy is living and will evolve with our technology.
                    </p>
                </footer>
            </article>
        </main>
    );
}
