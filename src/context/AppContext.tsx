import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WorkerRequest {
  id: string;
  farmerName: string;
  farmerId: string;
  phone: string;
  farmerAddress: string;
  workAddress: string;
  workName: string;
  dateTime: string;
  workersNeeded: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  acceptedByWorkerId?: string;
}

export interface AppNotification {
  id: string;
  userId: string; // The user who receives the notification
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface AppContextType {
  workerRequests: WorkerRequest[];
  setWorkerRequests: React.Dispatch<React.SetStateAction<WorkerRequest[]>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [workerRequests, setWorkerRequests] = useState<WorkerRequest[]>([
    {
      id: 'WR-001',
      farmerName: 'Rajesh Kumar',
      farmerId: 'farmer1',
      phone: '+91 98765 43210',
      farmerAddress: 'Plot 4, Green Valley',
      workAddress: 'Plot 4, Sector B, Green Valley',
      workName: 'Harvesting Wheat',
      dateTime: '2026-07-25T08:00',
      workersNeeded: 5,
      status: 'pending'
    }
  ]);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <AppContext.Provider value={{ workerRequests, setWorkerRequests, notifications, setNotifications, addNotification }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
