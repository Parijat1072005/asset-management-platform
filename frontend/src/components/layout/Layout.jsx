import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { LogOut, User as UserIcon, X, Bell, CheckCheck, Package, CalendarClock, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationsContext';

const statusConfig = {
  Approved: { color: 'text-green-600', bg: 'bg-green-50', icon: Package },
  Rejected: { color: 'text-red-600',   bg: 'bg-red-50',   icon: AlertCircle },
  Returned: { color: 'text-blue-600',  bg: 'bg-blue-50',  icon: CalendarClock },
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) markAllRead();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Notifications</h3>
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-brand-blue hover:underline"
              title="Mark all read"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                <Bell size={28} className="mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = statusConfig[n.status] || statusConfig.Approved;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 ${n.read ? '' : 'bg-blue-50/40 dark:bg-blue-900/10'}`}
                  >
                    <div className={`${cfg.bg} p-2 rounded-lg shrink-0 mt-0.5`}>
                      <Icon size={14} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                        {n.assetName}
                      </p>
                      <p className={`text-xs font-medium ${cfg.color}`}>
                        Booking {n.status}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {n.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 bg-brand-blue rounded-full shrink-0 mt-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Layout = ({ children, onLogout, user }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex h-screen bg-brand-light dark:bg-gray-900 transition-colors duration-300">
      <Sidebar onLogout={onLogout} user={user} />
      <div className="flex-1 ml-64 overflow-auto">

        <header className="bg-white dark:bg-gray-800 h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Workspace</h2>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell />

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold hover:ring-4 hover:ring-blue-100 transition-all"
              >
                {userInitial}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <p className="font-semibold text-gray-800 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { setShowProfileModal(true); setIsProfileOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-brand-blue rounded-lg transition flex items-center gap-2"
                    >
                      <UserIcon size={16} /> My Profile
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition flex items-center gap-2 mt-1"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-8 relative z-0">
          {children}
        </main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="bg-brand-dark p-6 text-white text-center relative">
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="w-20 h-20 bg-brand-blue rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3 shadow-lg">
                {userInitial}
              </div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-brand-blue bg-blue-900 bg-opacity-30 inline-block px-3 py-1 rounded-full text-xs mt-2 capitalize border border-blue-800">
                {user?.role} Account
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email Address</label>
                <p className="text-gray-800 dark:text-white font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</label>
                <p className="text-gray-800 dark:text-white font-medium capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;