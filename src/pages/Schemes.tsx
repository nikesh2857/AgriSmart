import { ArrowRight, CheckCircle } from 'lucide-react';

const schemes = [
  { 
    id: 1, 
    title: 'PM-Kisan Samman Nidhi', 
    amount: '₹6,000 / year', 
    desc: 'Income support to all landholding farmer families.', 
    tags: ['Income Support', 'Central'],
    advantages: ['Direct bank transfer in three equal installments', 'Helps procure inputs like seeds and fertilizers', 'Reduces dependency on local moneylenders'],
    links: [
      { label: 'Apply Online', url: 'https://www.pmkisan.gov.in/homenew.aspx?utm_source=chatgpt.com' }
    ]
  },
  { 
    id: 2, 
    title: 'Pradhan Mantri Fasal Bima Yojana', 
    amount: 'Variable', 
    desc: 'Crop insurance scheme offering coverage against natural calamities.', 
    tags: ['Insurance', 'Central'],
    advantages: ['Low premium rates for farmers (1.5% to 2%)', 'Full insured amount against crop loss', 'Use of technology for quick claim settlement'],
    links: [
      { label: 'Crop Insurance', url: 'https://www.pmfby.gov.in/?utm_source=chatgpt.com' },
      { label: 'Farmer Registration', url: 'https://www.pmfby.gov.in/farmerRegistrationForm/?utm_source=chatgpt.com' }
    ]
  },
  { 
    id: 3, 
    title: 'State Subsidy for Drip Irrigation (PMKSY)', 
    amount: 'Up to 75% Subsidy', 
    desc: 'Financial assistance for installing micro-irrigation systems.', 
    tags: ['Subsidy', 'State'],
    advantages: ['Saves up to 50% water usage', 'Improves crop yield and quality', 'Reduces labor and fertilizer costs'],
    links: [
      { label: 'Apply Online', url: 'https://pmksy-mowr.nic.in/?utm_source=chatgpt.com' }
    ]
  },
];

export function Schemes() {
  return (
    <div className="space-y-6 pb-20">
      
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-3xl p-8 text-white shadow-md">
        <h2 className="text-3xl font-bold mb-2">Government Schemes & Subsidies</h2>
        <p className="text-green-100 max-w-xl">Find and apply for financial assistance, insurance, and equipment subsidies directly through official government portals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {schemes.map(s => (
          <div key={s.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex gap-2 mb-4">
              {s.tags.map(t => (
                <span key={t} className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                  {t}
                </span>
              ))}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{s.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{s.desc}</p>
            
            <div className="mb-4 flex-1">
              <p className="text-xs text-slate-700 font-semibold mb-2 uppercase tracking-wider">Key Advantages:</p>
              <ul className="space-y-1.5">
                {s.advantages.map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t border-slate-100 pt-4 mb-4">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Benefit</p>
              <p className="text-lg font-bold text-green-700">{s.amount}</p>
            </div>
            
            <div className="flex flex-col gap-2 mt-auto">
              {s.links.map((link, idx) => (
                <a 
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  {link.label} <ArrowRight className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
