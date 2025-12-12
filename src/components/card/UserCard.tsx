// components/UserCard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { followUser, getUserDetail, unfollowUser } from '../../api/user';

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bannerColor: string;
  bio: string;
  location: string;
  createdAt: string;
  isVerified: boolean;
  role: string;
  posts: any[];
  communities: any[];
  followers?: any[];
  following?: any[];
  isFollowing?: boolean;
  tags?: string[];
}

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing || false);
  const navigate = useNavigate();

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      if (isFollowing) {
        await unfollowUser(user._id);
        setIsFollowing(false);
      } else {
        await followUser(user._id);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow/Unfollow error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = async() => {
    const res = await getUserDetail(user?._id);
    console.log('res', res)
    navigate(`/user/${user._id}`,{state:{user: res?.data}});
  };

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 cursor-pointer group"
      onClick={handleUserClick}
    >
      {/* Banner */}
      <div 
        className={`h-12 sm:h-16 md:h-20 ${user.bannerColor} relative transition-all duration-300 group-hover:brightness-110`}
      />

      {/* User Info */}
      <div className="p-4 sm:p-5 md:p-6">
        {/* Avatar and Basic Info */}
        <div className="flex items-start gap-3 mb-3 sm:mb-4">
          {/* Avatar */}
          <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 border-slate-800 flex items-center justify-center text-white font-bold text-base sm:text-lg md:text-xl relative -mt-8 sm:-mt-10 md:-mt-12 shadow-lg ${user.avatar ? 'bg-slate-600' : user.bannerColor}`}>
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              getUserInitials(user.name)
            )}
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-slate-800 shadow-lg">
                ✓
              </div>
            )}
          </div>

          {/* Follow Button */}
          <button
            onClick={handleFollow}
            disabled={isLoading}
            className={`ml-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 min-w-20 sm:min-w-[90px] flex items-center justify-center ${
              isLoading
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : isFollowing
                ? 'bg-slate-700/50 text-slate-300 hover:bg-red-500/20 hover:text-red-400 border border-slate-600 hover:border-red-500/30'
                : 'bg-purple-500 text-white hover:bg-purple-600 border border-purple-500'
            }`}
          >
            {isLoading ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : isFollowing ? (
              'Unfollow'
            ) : (
              'Follow'
            )}
          </button>
        </div>

        {/* Name and Username */}
        <div className="mb-2 sm:mb-3">
          <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors duration-200 text-lg sm:text-xl md:text-2xl leading-tight truncate">
            {user.username}
          </h3>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg truncate">{user.name}</p>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-slate-300 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Location */}
        {/* {user.location && (
          <div className="flex items-center text-slate-500 text-xs sm:text-sm mb-2">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{user.location}</span>
          </div>
        )} */}

       
      </div>
    </div>
  );
}