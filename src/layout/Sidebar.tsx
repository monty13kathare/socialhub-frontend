import { useEffect, useState, type ReactNode } from "react";
import { getUser } from "../utils/userStorage";
import { getInitials } from "../utils/helper";
import { useNavigate } from "react-router-dom";
import { getUserDetail } from "../api/user";
import {
  Box,
  House,
  MessageCircle,
  Settings,
  ShieldPlus,
  Users,
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

interface MenuItem {
  id: string;
  icon: ReactNode;
  label: string;
  path: string;
  badge: number | string | null;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("home");
  const [communities, setCommunities] = useState<any[]>([]);
  const user = getUser();
  const shortName = getInitials(`${user?.name}`);

  const menuItems: MenuItem[] = [
    { id: "home", icon: <House />, label: "Home", badge: null, path: "/" },
    // { id: 'explore', icon: '🔍', label: 'Explore', badge: 'New', path: '/explore' },
    {
      id: "friends",
      icon: <Users />,
      label: "Friends",
      badge: null,
      path: "/users",
    },
    {
      id: "communities",
      icon: <Box />,
      label: "Communities",
      badge: null,
      path: "/communities",
    },
    {
      id: "settings",
      icon: <Settings />,
      label: "Settings",
      badge: null,
      path: "/settings",
    },

    // { id: 'notifications', icon: '🔔', label: 'Notifications', badge: 3, path: '/notifications' },
    {
      id: "messages",
      icon: <MessageCircle />,
      label: "Messages",
      badge: null,
      path: "/messages",
    },
    // { id: 'bookmarks', icon: '📑', label: 'Bookmarks', badge: null, path: '/bookmarks' },
    {
      id: "premium",
      icon: <ShieldPlus />,
      label: "Premium",
      badge: "Pro",
      path: "/premium",
    },
    // { id: 'dashboard', icon: '⭐', label: 'Dashboard', badge: 'new', path: '/dashboard' },
  ];

  const handleNavigation = (item: MenuItem) => {
    setActiveItem(item.id);
    navigate(item.path);
    if (onClose) onClose();
  };

  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!user?._id) return;
      const res = await getUserDetail(user._id);
      setCommunities(res?.data?.joinedCommunities);
    };

    fetchUserDetail();
  }, [user?._id]);

  return (
    <div className="h-full flex flex-col bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 ">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4">
          {/* User Profile */}
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center space-x-3 p-4 bg-slate-700/50 rounded-xl mb-6 hover:bg-slate-700/70 transition-all duration-200 cursor-pointer"
          >
            <div className="w-12 h-12 linear-to-br from-purple-500 to-pink-500 rounded-xl overflow-hidden flex items-center justify-center text-white font-bold">
              {user?.avatar !== "" ? (
                <img
                  src={user?.avatar}
                  alt="dp"
                  className="w-full h-fit object-cover"
                />
              ) : (
                shortName
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">{user?.name}</h3>
              <p className="text-slate-400 text-xs">@{user?.username}</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1 mb-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                  activeItem === item.id
                    ? "bg-linear-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      typeof item.badge === "number"
                        ? "bg-red-500 text-white"
                        : "bg-yellow-500 text-slate-900"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Communities Section */}
          {communities?.length !== 0 && (
            <div className="mb-6">
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Join Communities
              </h3>
              <div className="space-y-2">
                {communities?.map((community, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 cursor-pointer group"
                    onClick={() =>
                      navigate(`/communities/${community._id}`, {
                        state: { community },
                      })
                    }
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${community.bannerColor}`}
                    >
                      {community.name[0]}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium">
                        {community.name}
                      </h4>
                      <p className="text-slate-400 text-xs">
                        {community.members?.length} members
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full bg-green-500`}></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Button - Fixed at bottom */}
      {/* <div className="p-4 border-t border-slate-700/50">
        <button 
          // onClick={() => handleNavigation('create')}
          className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 text-sm"
        >
          Create Post
        </button>
      </div> */}
    </div>
  );
}
