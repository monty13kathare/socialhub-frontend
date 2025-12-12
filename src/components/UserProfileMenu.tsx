import React from 'react';
import {
    User,
    Settings,
    LogOut,
    CreditCard,
    Bell,
    Shield,
    HelpCircle,
} from 'lucide-react';
import type { UserType } from '../types/types';

interface UserProfileMenuProps {
    user: UserType;
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    onProfileClick: () => void;
    onSettingsClick: () => void;
}

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
    user,
    isOpen,
    onClose,
    onLogout,
    onProfileClick,
    onSettingsClick
}) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50"
                onClick={onClose}
            />

            {/* Menu */}
            <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 text-white rounded-lg shadow-lg border border-gray-200 z-50">
                {/* User Info Section */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                                {user.email}
                            </p>
                            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                    <button
                        onClick={onProfileClick}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        Your Profile
                    </button>

                    <button
                        onClick={onSettingsClick}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        Account Settings
                    </button>

                    <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <CreditCard className="w-4 h-4 mr-3 text-gray-400" />
                        Billing & Subscription
                    </button>

                    <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Bell className="w-4 h-4 mr-3 text-gray-400" />
                        Notifications
                        <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            3
                        </span>
                    </button>

                    <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Shield className="w-4 h-4 mr-3 text-gray-400" />
                        Privacy & Security
                    </button>

                    <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <HelpCircle className="w-4 h-4 mr-3 text-gray-400" />
                        Help & Support
                    </button>
                </div>

                {/* Footer Section */}
                <div className="p-2 border-t border-gray-100">
                    <button
                        onClick={onLogout}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default UserProfileMenu;