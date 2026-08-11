import { 
  LayoutDashboard, ShoppingCart, Briefcase, Droplets, 
  Stethoscope, Leaf, TestTube, Sprout, Landmark, 
  Bot, Tractor, Sparkles, TrendingUp, CalendarDays, Map
} from 'lucide-react';
import { Users } from 'lucide-react';
import { PageType, User } from '../../types';
import { cn } from '../../lib/utils';

interface SidebarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  user: User;
}

const navItems: { id: PageType; label: string; icon: any; roles?: string[] }[] = [
  { id: 'dashboard', label: 'Farmer Portal', icon: LayoutDashboard, roles: ['farmer', 'admin'] },
  { id: 'marketplace', label: 'Buyer Dashboard', icon: ShoppingCart, roles: ['buyer'] },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart, roles: ['farmer', 'admin'] },
  { id: 'market-rates', label: 'Market Rates', icon: TrendingUp, roles: ['farmer', 'admin', 'worker'] },
  { id: 'erp', label: 'Farm Map', icon: Map, roles: ['farmer', 'admin'] },
  { id: 'manage-tasks', label: 'Manage Tasks', icon: CalendarDays, roles: ['farmer', 'admin'] },
  { id: 'disease', label: 'Disease Detection', icon: Stethoscope, roles: ['farmer', 'admin'] },
  { id: 'organic', label: 'Organic Market', icon: Leaf, roles: ['farmer', 'admin', 'buyer'] },
  { id: 'fertilizer', label: 'Fertilizer AI', icon: TestTube, roles: ['farmer', 'admin'] },
  { id: 'seed', label: 'Seed Recommender', icon: Sprout, roles: ['farmer', 'admin'] },
  { id: 'schemes', label: 'Govt Schemes', icon: Landmark, roles: ['farmer', 'admin'] },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, roles: ['farmer', 'admin', 'worker'] },
  { id: 'rental', label: 'Equipment Rental', icon: Tractor, roles: ['farmer', 'admin'] },
  { id: 'book-workers', label: 'Book Workers', icon: Users, roles: ['farmer', 'admin'] },
  { id: 'worker-jobs', label: 'Work', icon: Briefcase, roles: ['worker'] },
  { id: 'admin-bookings', label: 'All Bookings', icon: CalendarDays, roles: ['admin'] },
];

export function Sidebar({ currentPage, setCurrentPage, user }: SidebarProps) {
  return (
    <div className="w-64 bg-[#0A2F1D] text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto border-r border-green-900/50">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <div className="p-2 bg-green-500 rounded-lg">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          AgriSmart
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1 pb-6 mt-4">
        {navItems
          .filter(item => !item.roles || item.roles.includes(user.role))
          .map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium border border-transparent",
                isActive 
                  ? "bg-green-800/80 text-white shadow-sm border-green-700/50" 
                  : "text-green-100/70 hover:bg-green-800/40 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-green-400" : "text-green-100/50 group-hover:text-green-300")} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
