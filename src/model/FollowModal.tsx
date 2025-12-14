import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface FollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
  type: "followers" | "following";
}

export default function FollowModal({
  isOpen,
  onClose,
  users,
  type,
}: FollowModalProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const isFollowing = false;

  const filteredUsers = users?.filter(
    (user) =>
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const redirectUser = (userId: string) => {
    navigate(`/user/${userId}`);
    window.scrollTo(0, 0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden border border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white capitalize">
            {type} ({users.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors duration-200"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="overflow-y-auto max-h-96 custom-scrollbar">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No {type} found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 border-b border-slate-700/50 last:border-b-0"
              >
                <div
                  onClick={() => redirectUser(user?._id)}
                  className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0 ">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold text-sm truncate">
                        {user.username}
                      </h3>
                      {user.isVerified && (
                        <span
                          className="text-blue-400 text-xs"
                          title="Verified"
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm truncate">
                      {user.name}
                    </p>
                  </div>
                </div>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                    isFollowing
                      ? "bg-slate-700/50 text-slate-300 hover:bg-red-500/20 hover:text-red-400"
                      : "bg-purple-500 text-white hover:bg-purple-600"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
