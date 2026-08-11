const fs = require('fs');
let layoutCode = fs.readFileSync('src/components/layout/Layout.tsx', 'utf8');

layoutCode = layoutCode.replace(
  "import { ReactNode, useEffect } from 'react';",
  "import { ReactNode, useEffect, useState } from 'react';\nimport { useAppContext } from '../../context/AppContext';"
);

layoutCode = layoutCode.replace(
  "export function Layout({ children, currentPage, setCurrentPage, user, onLogout }: LayoutProps) {",
  "export function Layout({ children, currentPage, setCurrentPage, user, onLogout }: LayoutProps) {\n  const { notifications, setNotifications } = useAppContext();\n  const [showNotifications, setShowNotifications] = useState(false);\n\n  const userNotifications = notifications.filter(n => n.userId === user.id || n.userId === user.role + '_all');\n  const unreadCount = userNotifications.filter(n => !n.read).length;\n"
);

layoutCode = layoutCode.replace(
  /<button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-full hover:bg-slate-100">\s*<Bell className="w-5 h-5" \/>\s*<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"><\/span>\s*<\/button>/g,
  `<div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-full hover:bg-slate-100"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-semibold text-slate-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => setNotifications(notifications.map(n => userNotifications.includes(n) ? { ...n, read: true } : n))}
                          className="text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {userNotifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                          No notifications yet
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {userNotifications.map(n => (
                            <div key={n.id} className={\`p-4 hover:bg-slate-50 transition-colors \${!n.read ? 'bg-green-50/30' : ''}\`}>
                              <p className="font-medium text-sm text-slate-800">{n.title}</p>
                              <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-2">{new Date(n.timestamp).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>`
);

fs.writeFileSync('src/components/layout/Layout.tsx', layoutCode);
console.log('Layout updated with notifications');
