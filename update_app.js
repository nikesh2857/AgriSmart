const fs = require('fs');

// 1. Update src/types.ts
let typesCode = fs.readFileSync('src/types.ts', 'utf8');
if (!typesCode.includes("'worker-jobs'")) {
  typesCode = typesCode.replace("'book-workers';", "'book-workers'\n  | 'worker-jobs';");
  fs.writeFileSync('src/types.ts', typesCode);
}

// 2. Update src/App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes("WorkerJobs")) {
  appCode = appCode.replace(
    "import { BookWorkers } from './pages/BookWorkers';",
    "import { BookWorkers } from './pages/BookWorkers';\nimport { WorkerJobs } from './pages/WorkerJobs';"
  );
  appCode = appCode.replace(
    "case 'book-workers': return <BookWorkers user={user!} />;",
    "case 'book-workers': return <BookWorkers user={user!} />;\n      case 'worker-jobs': return <WorkerJobs user={user!} />;"
  );
  
  appCode = appCode.replace(
    "} else if (newUser.role === 'buyer') {",
    "} else if (newUser.role === 'worker') {\n      setCurrentPage('worker-jobs');\n    } else if (newUser.role === 'buyer') {"
  );
  fs.writeFileSync('src/App.tsx', appCode);
}

// 3. Update src/components/layout/Layout.tsx
let layoutCode = fs.readFileSync('src/components/layout/Layout.tsx', 'utf8');
if (!layoutCode.includes("'worker-jobs'")) {
  layoutCode = layoutCode.replace(
    "'book-workers': 'Book Workers',",
    "'book-workers': 'Book Workers',\n    'worker-jobs': 'Work Dashboard',"
  );
  fs.writeFileSync('src/components/layout/Layout.tsx', layoutCode);
}

// 4. Update src/components/layout/Sidebar.tsx
let sidebarCode = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
sidebarCode = sidebarCode.replace(
  "{ id: 'dashboard', label: 'Farmer Portal', icon: LayoutDashboard, roles: ['farmer', 'admin', 'worker'] },",
  "{ id: 'dashboard', label: 'Farmer Portal', icon: LayoutDashboard, roles: ['farmer', 'admin'] },"
);
sidebarCode = sidebarCode.replace(
  "{ id: 'marketplace', label: 'Marketplace', icon: ShoppingCart, roles: ['farmer', 'admin', 'worker'] },",
  "{ id: 'marketplace', label: 'Marketplace', icon: ShoppingCart, roles: ['farmer', 'admin'] },"
);
sidebarCode = sidebarCode.replace(
  "{ id: 'erp', label: 'Farm Management', icon: Briefcase, roles: ['farmer', 'admin', 'worker'] },",
  "{ id: 'erp', label: 'Farm Management', icon: Briefcase, roles: ['farmer', 'admin'] },"
);
sidebarCode = sidebarCode.replace(
  "{ id: 'irrigation', label: 'Smart Irrigation', icon: Droplets, roles: ['farmer', 'admin', 'worker'] },",
  "{ id: 'irrigation', label: 'Smart Irrigation', icon: Droplets, roles: ['farmer', 'admin'] },"
);
sidebarCode = sidebarCode.replace(
  "{ id: 'disease', label: 'Disease Detection', icon: Stethoscope, roles: ['farmer', 'admin', 'worker'] },",
  "{ id: 'disease', label: 'Disease Detection', icon: Stethoscope, roles: ['farmer', 'admin'] },"
);
sidebarCode = sidebarCode.replace(
  "{ id: 'organic', label: 'Organic Market', icon: Leaf },",
  "{ id: 'organic', label: 'Organic Market', icon: Leaf, roles: ['farmer', 'admin', 'buyer'] },"
);
sidebarCode = sidebarCode.replace(
  "{ id: 'fertilizer', label: 'Fertilizer AI', icon: TestTube, roles: ['farmer', 'admin', 'worker'] },",
  "{ id: 'fertilizer', label: 'Fertilizer AI', icon: TestTube, roles: ['farmer', 'admin'] },"
);
sidebarCode = sidebarCode.replace(
  "{ id: 'seed', label: 'Seed Recommender', icon: Sprout, roles: ['farmer', 'admin', 'worker'] },",
  "{ id: 'seed', label: 'Seed Recommender', icon: Sprout, roles: ['farmer', 'admin'] },"
);
sidebarCode = sidebarCode.replace(
  "{ id: 'schemes', label: 'Govt Schemes', icon: Landmark, roles: ['farmer', 'admin', 'worker'] },",
  "{ id: 'schemes', label: 'Govt Schemes', icon: Landmark, roles: ['farmer', 'admin'] },"
);
sidebarCode = sidebarCode.replace(
  "{ id: 'rental', label: 'Equipment Rental', icon: Tractor, roles: ['farmer', 'admin', 'worker'] },",
  "{ id: 'rental', label: 'Equipment Rental', icon: Tractor, roles: ['farmer', 'admin'] },"
);
sidebarCode = sidebarCode.replace(
  "{ id: 'ai-assistant', label: 'AI Assistant', icon: Bot },",
  "{ id: 'ai-assistant', label: 'AI Assistant', icon: Bot, roles: ['farmer', 'admin', 'worker'] },"
);
sidebarCode = sidebarCode.replace(
  "{ id: 'market-rates', label: 'Market Rates', icon: TrendingUp },",
  "{ id: 'market-rates', label: 'Market Rates', icon: TrendingUp, roles: ['farmer', 'admin', 'worker'] },"
);

if (!sidebarCode.includes("'worker-jobs'")) {
  sidebarCode = sidebarCode.replace(
    "{ id: 'admin-bookings', label: 'All Bookings', icon: CalendarDays, roles: ['admin'] },",
    "{ id: 'worker-jobs', label: 'Work', icon: Briefcase, roles: ['worker'] },\n  { id: 'admin-bookings', label: 'All Bookings', icon: CalendarDays, roles: ['admin'] },"
  );
}

fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebarCode);
console.log('Done updating navigation files.');
