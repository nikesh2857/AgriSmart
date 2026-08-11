import { useState, FormEvent } from 'react';
import { TestTube, FlaskConical, Droplet, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { apiClient } from '../lib/apiClient';
export function Fertilizer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    cropType: 'Maize',
    soilType: 'Clay',
    nitrogen: 28,
    phosphorus: 14,
    potassium: 110,
    ph: 5.8
  });

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const data = await apiClient.post('/api/ai/fertilizer', formData);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze data.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">AI Fertilizer Optimizer</h2>
        <p className="text-slate-500">Enter your soil test metrics to get a precise, custom-blended fertilizer recommendation.</p>
      </div>

      {!result ? (
        <form onSubmit={handleAnalyze} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Field Basics */}
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Field Basics</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Crop Type</label>
                <select 
                  value={formData.cropType}
                  onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                >
                  <option>Wheat</option>
                  <option>Rice</option>
                  <option>Maize</option>
                  <option>Cotton</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Soil Type</label>
                <select 
                  value={formData.soilType}
                  onChange={(e) => setFormData({...formData, soilType: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                >
                  <option>Loamy</option>
                  <option>Clay</option>
                  <option>Sandy</option>
                  <option>Black Soil</option>
                </select>
              </div>
            </div>

            {/* NPK Values */}
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Soil NPK Metrics (mg/kg)</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nitrogen (N)</label>
                  <div className="relative">
                    <FlaskConical className="w-4 h-4 text-blue-400 absolute left-3 top-3" />
                    <input type="number" 
                      value={formData.nitrogen}
                      onChange={(e) => setFormData({...formData, nitrogen: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Phosphorus (P)</label>
                  <div className="relative">
                    <TestTube className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                    <input type="number" 
                      value={formData.phosphorus}
                      onChange={(e) => setFormData({...formData, phosphorus: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Potassium (K)</label>
                  <div className="relative">
                    <Droplet className="w-4 h-4 text-orange-400 absolute left-3 top-3" />
                    <input type="number" 
                      value={formData.potassium}
                      onChange={(e) => setFormData({...formData, potassium: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none" required />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">pH Level</label>
                <input type="number" step="0.1" 
                  value={formData.ph}
                  onChange={(e) => setFormData({...formData, ph: Number(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" required />
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={analyzing}
            className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-2"
          >
            {analyzing ? 'Processing AI Models...' : 'Generate Optimization Plan'} 
            {!analyzing && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-green-100"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Optimal Mix Generated</h3>
              <p className="text-slate-500">Based on {formData.cropType} cultivation in {formData.soilType} soil with pH {formData.ph}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
              <h4 className="text-sm font-semibold text-slate-500 mb-1">Urea (Nitrogen)</h4>
              <p className="text-3xl font-bold text-slate-800">{result.urea_kg_per_ha} <span className="text-base font-medium text-slate-500">kg/ha</span></p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
              <h4 className="text-sm font-semibold text-slate-500 mb-1">DAP (Phosphorus)</h4>
              <p className="text-3xl font-bold text-slate-800">{result.dap_kg_per_ha} <span className="text-base font-medium text-slate-500">kg/ha</span></p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
              <h4 className="text-sm font-semibold text-slate-500 mb-1">MOP (Potassium)</h4>
              <p className="text-3xl font-bold text-slate-800">{result.mop_kg_per_ha} <span className="text-base font-medium text-slate-500">kg/ha</span></p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h4 className="font-semibold text-blue-900 mb-2">Application Timing Rule</h4>
            <p className="text-sm text-blue-800/80 leading-relaxed">
              {result.timing_rule}
            </p>
          </div>
          
          <button 
            onClick={() => setResult(null)}
            className="mt-8 text-green-600 font-semibold text-sm hover:underline"
          >
            ← Calculate for another field
          </button>
        </motion.div>
      )}
    </div>
  );
}
