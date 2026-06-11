import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Box, CalendarCheck, ClipboardCheck,
  History, Settings, LogOut, X, Moon, Bell, Check, Users
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationsContext';

const Sidebar = ({ onLogout, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const { isDarkMode, setIsDarkMode } = useTheme();
  const { notifEnabled, setNotifEnabled } = useNotifications();

  // Local draft state — only applied on Save
  const [draftDark, setDraftDark] = useState(isDarkMode);
  const [draftNotif, setDraftNotif] = useState(notifEnabled);

  const openSettings = () => {
    // Reset draft to current saved values each time modal opens
    setDraftDark(isDarkMode);
    setDraftNotif(notifEnabled);
    setSaved(false);
    setIsSettingsOpen(true);
  };

  const handleSave = () => {
    setIsDarkMode(draftDark);
    setNotifEnabled(draftNotif);
    localStorage.setItem('notifEnabled', String(draftNotif));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsSettingsOpen(false);
    }, 1000);
  };

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { name: 'Dashboard',  path: '/',           icon: LayoutDashboard },
    { name: 'Inventory',  path: '/inventory',   icon: Box },
    { name: 'Bookings',   path: '/bookings',    icon: CalendarCheck },
    // Approvals and Users are admin-only
    ...(isAdmin ? [
      { name: 'Approvals', path: '/approvals', icon: ClipboardCheck },
      { name: 'Users',     path: '/users',     icon: Users },
    ] : []),
    { name: 'History',    path: '/history',    icon: History },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <>
      <div className="h-screen w-64 bg-brand-dark text-white flex flex-col fixed left-0 top-0 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-gray-700">
          <div className="bg-brand-blue p-2 rounded-lg">
            <Box size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-wide">AssetIQ</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Actions */}
        <div className="p-4 border-t border-gray-700 space-y-2 bg-gray-900 bg-opacity-50">
          <button
            onClick={openSettings}
            className="flex items-center gap-3 px-4 py-2 w-full text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Settings size={18} />
            <span className="font-medium text-sm">Account Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-red-400 hover:bg-red-500 hover:bg-opacity-10 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in text-gray-800">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Settings size={20} className="text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Account Settings</h2>
                  <p className="text-xs text-gray-400">Changes apply on Save</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 p-2 rounded-lg">
                    <Moon size={16} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Dark Mode</p>
                    <p className="text-xs text-gray-400">Switch to dark theme</p>
                  </div>
                </div>
                {/* Toggle Switch */}
                <button
                  onClick={() => setDraftDark((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    draftDark ? 'bg-brand-blue' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      draftDark ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* In-App Notifications Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-50 p-2 rounded-lg">
                    <Bell size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">In-App Notifications</p>
                    <p className="text-xs text-gray-400">Booking status alerts in the header</p>
                  </div>
                </div>
                <button
                  onClick={() => setDraftNotif((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    draftNotif ? 'bg-brand-blue' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      draftNotif ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Preview tag */}
              {draftDark !== isDarkMode && (
                <p className="text-xs text-center text-indigo-500 font-medium animate-pulse">
                  Dark mode will apply after saving
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  saved
                    ? 'bg-green-500'
                    : 'bg-brand-blue hover:bg-blue-700'
                }`}
              >
                {saved ? (
                  <>
                    <Check size={16} />
                    Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;