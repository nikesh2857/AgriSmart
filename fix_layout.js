const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Layout.tsx', 'utf-8');
code = code.replace(
  /<div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-0\.5 shadow-sm hover:border-slate-300 transition-colors">\s*<TranslateWidget id="google_translate_element" \/>\s*<\/div>/g,
  '<div className="flex items-center bg-white border border-slate-200 rounded-full shadow-sm hover:border-slate-300 transition-colors">\n              <TranslateWidget id="google_translate_element" />\n            </div>'
);
fs.writeFileSync('src/components/layout/Layout.tsx', code);
