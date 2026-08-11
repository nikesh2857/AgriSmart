import { useState } from 'react';
import { Sprout, MapPin, Sun, Droplets, Loader2, Target, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface ScoredSeed {
  seedId: string;
  seedName: string;
  cropName: string;
  baseScore: number;
  finalScore: number;
  yieldEstMin: number | null;
  yieldEstMax: number | null;
  appliedRules: string[];
}

interface RecommendationResponse {
  topRecommendations: ScoredSeed[];
  aiExplanation: string | null;
  historyId: string;
}

export function Seed() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  
  // Form state
  const [state, setState] = useState('MAHARASHTRA');
  const [district, setDistrict] = useState('PUNE');
  const [season, setSeason] = useState('KHARIF');
  const [soilType, setSoilType] = useState('BLACK SOIL');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await apiClient.post<RecommendationResponse>('/api/recommendations/generate', {
        lat: 18.5204, // Mock GPS
        lng: 73.8567, // Mock GPS
        state,
        district,
        season,
        soilType
      });
      setResult(response);
    } catch (err) {
      console.error(err);
      alert('Failed to generate recommendation. Make sure you are logged in and the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4">
      
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-2xl mb-4 text-green-600">
          <Sprout className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">AI Seed Recommendation Engine</h1>
        <p className="text-slate-600">Our advanced Rule Engine + AI system analyzes your farm profile, soil conditions, and live weather to recommend the highest yielding seeds.</p>
      </div>

      {!result && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" /> State
              </label>
              <select value={state} onChange={(e) => setState(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 focus:border-green-500 outline-none">
                <option value="ANDHRA PRADESH">Andhra Pradesh</option>
                <option value="ARUNACHAL PRADESH">Arunachal Pradesh</option>
                <option value="ASSAM">Assam</option>
                <option value="BIHAR">Bihar</option>
                <option value="CHHATTISGARH">Chhattisgarh</option>
                <option value="GOA">Goa</option>
                <option value="GUJARAT">Gujarat</option>
                <option value="HARYANA">Haryana</option>
                <option value="HIMACHAL PRADESH">Himachal Pradesh</option>
                <option value="JHARKHAND">Jharkhand</option>
                <option value="KARNATAKA">Karnataka</option>
                <option value="KERALA">Kerala</option>
                <option value="MADHYA PRADESH">Madhya Pradesh</option>
                <option value="MAHARASHTRA">Maharashtra</option>
                <option value="MANIPUR">Manipur</option>
                <option value="MEGHALAYA">Meghalaya</option>
                <option value="MIZORAM">Mizoram</option>
                <option value="NAGALAND">Nagaland</option>
                <option value="ODISHA">Odisha</option>
                <option value="PUNJAB">Punjab</option>
                <option value="RAJASTHAN">Rajasthan</option>
                <option value="SIKKIM">Sikkim</option>
                <option value="TAMIL NADU">Tamil Nadu</option>
                <option value="TELANGANA">Telangana</option>
                <option value="TRIPURA">Tripura</option>
                <option value="UP">Uttar Pradesh</option>
                <option value="UTTARAKHAND">Uttarakhand</option>
                <option value="WEST BENGAL">West Bengal</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" /> District
              </label>
              <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 focus:border-green-500 outline-none" placeholder="E.g. Pune" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Sun className="w-4 h-4 text-green-600" /> Growing Season
              </label>
              <select value={season} onChange={(e) => setSeason(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 focus:border-green-500 outline-none">
                <option value="KHARIF">Kharif (Monsoon)</option>
                <option value="RABI">Rabi (Winter)</option>
                <option value="ZAID">Zaid (Summer)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-green-600" /> Soil Type
              </label>
              <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 focus:border-green-500 outline-none">
                <option value="BLACK SOIL">Black Soil</option>
                <option value="ALLUVIAL">Alluvial</option>
                <option value="LOAMY">Loamy</option>
                <option value="RED SOIL">Red Soil</option>
              </select>
            </div>

          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-200 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
            {loading ? 'Analyzing Agrometrics...' : 'Generate Recommendations'}
          </button>
        </form>
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Top Recommendations</h2>
            <button onClick={() => setResult(null)} className="text-sm font-medium text-slate-500 hover:text-slate-800">Start Over</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Seeds List */}
            <div className="lg:col-span-2 space-y-4">
              {result.topRecommendations.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
                  <p className="text-slate-500">No seeds matched your specific constraints.</p>
                </div>
              ) : (
                result.topRecommendations.map((seed, idx) => (
                  <div key={seed.seedId} className={`bg-white p-6 rounded-3xl border transition-all ${idx === 0 ? 'border-green-400 shadow-md shadow-green-100 ring-4 ring-green-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-slate-800">{seed.seedName}</h3>
                          {idx === 0 && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">Best Match</span>}
                        </div>
                        <p className="text-sm font-medium text-slate-500">Crop: {seed.cropName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-green-600">{seed.finalScore}<span className="text-sm text-slate-400 font-medium">/100</span></div>
                        <p className="text-xs text-slate-400 font-medium">Confidence Score</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">Est. Yield</p>
                        <p className="font-bold text-slate-800">{seed.yieldEstMin}-{seed.yieldEstMax} q/ha</p>
                      </div>
                    </div>

                    {seed.appliedRules.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {seed.appliedRules.map((rule, i) => (
                          <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-md border border-blue-100">
                            <CheckCircle2 className="w-3 h-3" /> {rule}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* AI Explanation */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Sprout className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold">AI Agronomist</h3>
                </div>
                
                <div className="prose prose-invert prose-sm">
                  {result.aiExplanation ? (
                    result.aiExplanation.split('\n').map((para, i) => (
                      para.trim() ? <p key={i} className="mb-4 text-slate-300 leading-relaxed">{para}</p> : null
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No detailed AI explanation available.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
