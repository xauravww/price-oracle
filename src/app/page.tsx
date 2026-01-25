
"use client";

import { useState, useEffect } from 'react';
import { calculatePriceClarity, PriceEntry, PriceAnalysis } from '@/lib/priceEngine';

export default function Home() {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [entries, setEntries] = useState<PriceEntry[]>([]);
  const [analysis, setAnalysis] = useState<PriceAnalysis | null>(null);
  const [isContributing, setIsContributing] = useState(false);
  const [filterLocation, setFilterLocation] = useState('');
  const [webContext, setWebContext] = useState<any[]>([]);
  const [isLoadingWeb, setIsLoadingWeb] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { getEntries } = await import('@/lib/actions');
      const data = await getEntries();
      setEntries(data);
    };
    loadData();
  }, []);

  const handleCheck = async () => {
    if (!item || !price) return;
    
    const { searchSimilarEntries } = await import('@/lib/actions');
    const similarEntries = await searchSimilarEntries(item);
    
    // Filter by location if specified
    const filtered = filterLocation 
      ? similarEntries.filter(e => e.location.includes(filterLocation))
      : similarEntries;

    const result = calculatePriceClarity(Number(price), filtered);
    setAnalysis(result);

    setIsLoadingWeb(true);
    let currentWebContext: any[] = [];
    try {
      const { fetchWebPriceContext } = await import('@/lib/searchService');
      currentWebContext = await fetchWebPriceContext(item);
      setWebContext(currentWebContext);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingWeb(false);
    }

    setIsAiLoading(true);
    try {
      const { getExpertOpinion } = await import('@/lib/priceEngine');
      const opinion = await getExpertOpinion(item, Number(price), filtered);
      // Format for UI: The UI expects { opinion: string, negotiationTips: string[] }
      // We'll parse the opinion or just wrap it
      setAiAdvice({
        opinion: opinion,
        negotiationTips: ["Ask for a discount if paying cash", "Check other vendors in the same area"]
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !price || !location) return;
    
    try {
      const { addEntry, getEntries } = await import('@/lib/actions');
      await addEntry({
        item,
        location,
        price: Number(price),
        contributorId: 'anon',
      });
      
      const updatedData = await getEntries();
      setEntries(updatedData);
      setIsContributing(false);
      alert("Contribution saved to database.");
    } catch (err) {
      console.error(err);
      alert("Failed to save contribution.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] p-4 font-sans text-slate-900">
      <div className="max-w-lg mx-auto space-y-6 pb-20">
        <header className="flex justify-between items-center py-8">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-blue-600">PRICE ORACLE <span className="text-[10px] bg-blue-100 px-2 py-0.5 rounded-full align-middle ml-1">v2.0</span></h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Anti-Inflation Intelligence</p>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-8 border border-slate-100">
          <div className="flex mb-8 bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setIsContributing(false)} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${!isContributing ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>VERIFY PRICE</button>
            <button onClick={() => setIsContributing(true)} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${isContributing ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>REPORT DATA</button>
          </div>

          {!isContributing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <input type="text" placeholder="Item e.g. 'Auto'..." className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={item} onChange={(e) => setItem(e.target.value)} />
                <div className="flex gap-4">
                  <input type="number" placeholder="Price (₹)" className="flex-[2] p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={price} onChange={(e) => setPrice(e.target.value)} />
                  <input type="text" placeholder="Area" className="flex-[1] p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} />
                </div>
              </div>
              <button onClick={handleCheck} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">RUN ANALYSIS</button>
            </div>
          ) : (
            <form onSubmit={handleContribute} className="space-y-4">
              <input type="text" placeholder="What did you buy?" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" required onChange={(e) => setItem(e.target.value)} />
              <input type="text" placeholder="Location" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" required onChange={(e) => setLocation(e.target.value)} />
              <input type="number" placeholder="Price Paid (₹)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" required onChange={(e) => setPrice(e.target.value)} />
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl">SUBMIT</button>
            </form>
          )}
        </div>

        {analysis && !isContributing && (
          <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-4">
            {(aiAdvice || isAiLoading) && (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">AI Expert Opinion</span>
                  </div>
                  {isAiLoading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm font-bold text-slate-100">{aiAdvice?.opinion}</p>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-[8px] font-black text-blue-400 uppercase block mb-2">Negotiation Tips</span>
                        <ul className="space-y-1">
                          {aiAdvice?.negotiationTips?.map((tip: string, i: number) => (
                            <li key={i} className="text-[11px] text-slate-300 flex gap-2"><span>•</span> {tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={`rounded-[2.5rem] p-8 border-2 ${analysis.status === 'Fair' ? 'bg-emerald-50 border-emerald-100' : analysis.status === 'High' ? 'bg-orange-50 border-orange-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block ${analysis.status === 'Fair' ? 'bg-emerald-200 text-emerald-700' : 'bg-orange-200 text-orange-700'}`}>Verdict</div>
                  <h3 className={`text-4xl font-black mt-3 ${analysis.status === 'Fair' ? 'text-emerald-700' : 'text-orange-700'}`}>{analysis.status}</h3>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase">Confidence</div>
                  <div className="text-3xl font-black text-blue-600">{analysis.confidenceScore}%</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/60 p-4 rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-400 uppercase">Market Avg</span>
                  <span className="text-xl font-black">₹{analysis.averagePrice}</span>
                </div>
                <div className="bg-white/60 p-4 rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-400 uppercase">Trend</span>
                  <span className={`text-sm font-black ${analysis.priceTrend === 'Rising' ? 'text-rose-500' : 'text-emerald-500'}`}>{analysis.priceTrend}</span>
                </div>
                <div className="bg-white/60 p-4 rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-400 uppercase">Volatility</span>
                  <span className="text-sm font-black">{Math.round(analysis.volatilityIndex * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {(webContext.length > 0 || isLoadingWeb) && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Web Verification</h3>
            <div className="grid gap-3">
              {webContext.map((web, idx) => (
                <a key={idx} href={web.url} target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div className="flex-1 pr-4">
                    <div className="text-[10px] font-black text-blue-500 uppercase mb-1">{web.source.substring(0, 20)}...</div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{web.snippet}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900">₹{web.price}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Market Pulse</h3>
          <div className="space-y-3">
            {entries.slice(0, 4).map((entry) => (
              <div key={entry.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center">
                <div>
                  <div className="font-black text-slate-700">{entry.item}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{entry.location}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 text-xl">₹{entry.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
