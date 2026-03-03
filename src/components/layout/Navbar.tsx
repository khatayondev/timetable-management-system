import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, User, LogOut, Settings as SettingsIcon, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import NotificationBell from '../common/NotificationBell';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white h-[72px] px-4 md:px-6 shadow-sm z-50 w-full flex-shrink-0 border-b border-gray-100">
      <div className="flex items-center justify-between gap-4 h-full">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Type keywords to search"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FFF]/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-[#5B5FFF] to-[#7C8FFF] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-[#2F2E41]">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-[#2F2E41]">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || user?.role}</p>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;