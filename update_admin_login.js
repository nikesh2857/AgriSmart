const fs = require('fs');
let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');

homeCode = homeCode.replace(
  "const [name, setName] = useState('');",
  "const [name, setName] = useState('');\n  const [showAdminLogin, setShowAdminLogin] = useState(false);\n  const [adminEmail, setAdminEmail] = useState('');\n  const [adminPassword, setAdminPassword] = useState('');\n  const [adminError, setAdminError] = useState('');"
);

homeCode = homeCode.replace(
  "const handleAdminLogin = () => {",
  "const handleAdminLoginSubmit = (e: FormEvent) => {\n    e.preventDefault();\n    if (adminEmail === 'admin@agrismart.com' && adminPassword === 'admin123') {\n      onLogin({\n        id: 'admin-1',\n        name: 'System Admin',\n        role: 'admin',\n        avatar: ''\n      });\n    } else {\n      setAdminError('Invalid email or password. Try admin@agrismart.com / admin123');\n    }\n  };\n\n  const handleAdminLogin = () => {"
);

homeCode = homeCode.replace(
  "onClick={handleAdminLogin}",
  "onClick={() => setShowAdminLogin(true)}"
);

const adminModal = `
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Admin Login</h2>
              <p className="text-slate-500 text-sm mt-1">Access the administrative portal</p>
            </div>
            
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              {adminError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
                  {adminError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                <input 
                  type="email" 
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@agrismart.com" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" 
                  required 
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="w-1/2 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-md shadow-green-600/20 transition-all"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

homeCode = homeCode.replace(
  "{/* Left side: Branding/Hero */}",
  adminModal + "\n      {/* Left side: Branding/Hero */}"
);

fs.writeFileSync('src/pages/Home.tsx', homeCode);
console.log('Updated admin login');
