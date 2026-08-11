export type PageType =
  | 'dashboard'
  | 'marketplace'
  | 'erp'
  | 'disease'
  | 'organic'
  | 'fertilizer'
  | 'seed'
  | 'schemes'
  | 'ai-assistant'
  | 'rental'
  | 'profile'
  | 'cart'
  | 'manage-tasks'
  | 'plot-map'
  | 'market-rates'
  | 'admin-bookings'
  | 'book-workers'
  | 'worker-jobs';

export interface User {
  id: string;
  name: string;
  role: 'farmer' | 'buyer' | 'admin' | 'worker';
  avatar: string;
  phone?: string;
}
