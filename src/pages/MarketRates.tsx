import { useState, useEffect } from 'react';
import { PageType } from '../types';
import { ArrowLeft, MapPin, Globe, Map as MapIcon, ChevronDown, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

export function MarketRates({ onNavigate }: { onNavigate: (page: PageType) => void }) {
  const [scope, setScope] = useState<'local' | 'state' | 'national'>('local');
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const data = await apiClient.get(`/api/market-rates?scope=${scope}`);
        setRates(data);
      } catch (error) {
        console.error("Failed to fetch market rates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, [scope]);

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Live Market Rates</h1>
        <p className="text-slate-500 mt-1">Real-time agricultural commodity prices across different markets.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-6 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Market Scope</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setScope('local')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${scope === 'local' ? 'bg-green-50 text-green-700 border border-green-200' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
              >
                <MapPin className="w-5 h-5" />
                Local Market
              </button>
              <button 
                onClick={() => setScope('state')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${scope === 'state' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
              >
                <MapIcon className="w-5 h-5" />
                State Market
              </button>
              <button 
                onClick={() => setScope('national')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${scope === 'national' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
              >
                <Globe className="w-5 h-5" />
                National Market
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Live Quotes</h2>
            {loading ? (
              <div className="py-20 text-center text-slate-500">Loading market rates...</div>
            ) : (
              <div className="grid gap-4">
                {rates.map((item, index) => (
                  <div key={index} className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md hover:border-green-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0 border border-green-100">
                        <span className="text-2xl">{item.crop === 'Wheat' ? '🌾' : item.crop === 'Rice (Paddy)' ? '🍚' : item.crop === 'Cotton' ? '🧶' : item.crop === 'Sugarcane' ? '🎋' : '🌽'}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{item.crop}</h3>
                        <div className="flex items-center gap-3 text-sm mt-1">
                          <span className="text-slate-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Updated {item.updated}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-1">Current Price / Qtl</p>
                        <p className="font-bold text-xl text-slate-800">₹{item.currentPrice}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-400 mb-1">vs Yesterday</p>
                        <div className={`flex items-center gap-1 font-semibold ${
                          item.trendDirection === 'up' ? 'text-green-600' : 
                          item.trendDirection === 'down' ? 'text-red-500' : 'text-slate-500'
                        }`}>
                          {item.trendDirection === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                           item.trendDirection === 'down' ? <TrendingDown className="w-4 h-4" /> : 
                           <TrendingUp className="w-4 h-4 opacity-0" />}
                          {item.trend}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
