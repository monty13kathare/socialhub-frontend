import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { removeToken } from '../utils/cookieHelper';
import { getUser, removeUser } from '../utils/userStorage';
import { getInitials } from '../utils/helper';
import { Bell, Box, House, LogOut, MessageCircle, Settings, ShieldPlus, User, Users } from 'lucide-react';

type NavigationItem = {
  id: string;
  label: string;
  path: string;
  icon?: ReactNode;
};

export default function Topbar() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const shortName = getInitials(`${user?.name}`)


  const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Home', path: '/',icon: <House />  },
    { id: 'friends', label: 'Friends', path: '/users', icon: <Users /> },
    { id: 'communities', label: 'Communities', path: '/communities',  icon: <Box /> },
    { id: 'settings', label: 'Settings', path: '/settings', icon: <Settings /> },
  ];

  const mobileMenuItems: NavigationItem[] = [
    ...navigationItems,
    // { id: 'notifications', label: 'Notifications', path: '/notifications', icon: '🔔' },
    // { id: 'messages', label: 'Messages', path: '/messages' },
    // { id: 'settings', label: 'Settings', path: '/settings', icon: '⚙️' },
    { id: 'premium', label: 'Premium', path: '/premium', icon: <ShieldPlus/> },

  ];

  const profileMenuItems:NavigationItem[] = [
    { id: 'profile', label: 'Your Profile', path: '/profile', icon: <User/> },
    { id: 'settings', label: 'Settings', path: '/settings', icon: <Settings /> },
    { id: 'logout', label: 'Logout', path: '/logout', icon: <LogOut/> },
  ];

  // Update active tab based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = navigationItems.find(item =>
      item.path === currentPath || currentPath.startsWith(item.path + '/')
    );
    if (currentItem) {
      setActiveTab(currentItem.id);
    }
  }, [location.pathname]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigation = (item: NavigationItem) => {
    setActiveTab(item.id);
    navigate(item.path);
    setIsMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleProfileMenuToggle = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleProfileMenuItemClick = (item: typeof profileMenuItems[0]) => {
    if (item.id === 'logout') {
      logout();
    } else {
      navigate(item.path);
    }
    setIsProfileMenuOpen(false);
  };

  const logout = () => {
    removeToken();
    removeUser();
    window.location.reload();
  }

  return (
    <>
      {/* Topbar */}
      <div className="fixed  top-0 left-0 right-0 bg-slate-800/90 backdrop-blur-xl border-b border-purple-500/20 z-50">
        <div className="w-full flex items-center justify-between p-4 mx-auto">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 flex-1 md:flex-none">
            <button
              onClick={handleMobileMenuToggle}
              className="lg:hidden text-white p-2 hover:bg-slate-700/50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => handleNavigation(navigationItems[0])}
            >
              <div className="w-8 h-8 bg-linear-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                S
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">SocialHub</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-700/50 rounded-2xl p-1 mx-4">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`px-4 lg:px-6 py-2 rounded-xl transition-all duration-200 capitalize font-medium flex gap-4 ${activeTab === item.id
                    ? 'text-white bg-linear-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <button
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-800"></span>
            </button>


            <button
              // onClick={() => handleNavigation(mobileMenuItems[5])} // Messages
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 relative"
              aria-label="Messages"
            >
              <MessageCircle size={18} onClick={() => navigate("/messages")} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></span>
            </button>

            {/* Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={handleProfileMenuToggle}
                className="w-8 h-8 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full overflow-hidden flex items-center justify-center text-white font-bold cursor-pointer shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                aria-label="Profile menu"
              >
                {
                  user?.avatar !== "" ?
                    <img src={user?.avatar} alt="dp" className='w-full h-fit object-cover' />
                    : shortName
                }
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-12 w-72 bg-slate-800/95 backdrop-blur-xl border border-purple-500/20 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                  {/* User Info Section */}
                  <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-linear-to-r from-cyan-500 to-blue-500 overflow-hidden rounded-full flex items-center justify-center text-white font-bold">
                        {
                          user?.avatar !== "" ?
                            <img src={user?.avatar} alt="dp" className='w-full h-fit object-cover' />
                            : shortName
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{user?.name}</p>
                        <p className="text-slate-400 text-sm truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2 space-y-1">
                    {profileMenuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleProfileMenuItemClick(item)}
                        className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${item.id === 'logout'
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                          }`}
                      >
                        <span className="text-lg w-6 text-center">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden mt-16"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="bg-slate-800/95 border-b border-purple-500/20 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 space-y-2">
              {mobileMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 capitalize font-medium ${activeTab === item.id
                      ? 'text-white bg-linear-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed positioning */}
      <div className="h-16"></div>
    </>
  );
}