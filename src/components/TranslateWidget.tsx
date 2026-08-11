import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ur', name: 'اردو (Urdu)' },
];

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function TranslateWidget({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only initialize once globally
    if (!document.getElementById('google-translate-script')) {
      const el = document.createElement('div');
      el.id = 'google_translate_element_global';
      // Visually hide instead of display: none to ensure scripts run
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.style.top = '-9999px';
      document.body.appendChild(el);

      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: LANGUAGES.map(l => l.code).join(','),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          }, 'google_translate_element_global');
        }
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const changeLanguage = (code: string) => {
    setIsOpen(false);
    
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    
    // Always update cookies
    document.cookie = `googtrans=/en/${code}; path=/`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;
    
    if (select) {
      select.value = code;
      try {
        select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      } catch (e) {
        const event = document.createEvent('HTMLEvents');
        event.initEvent('change', true, true);
        select.dispatchEvent(event);
      }
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 bg-white/50 backdrop-blur-sm border border-slate-200 transition-colors cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        title="Change Language"
      >
        <Globe className="w-5 h-5 text-slate-600 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 top-12 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Language</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
