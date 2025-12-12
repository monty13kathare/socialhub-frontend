import { Mail, User, Info, AtSign } from "lucide-react";

interface UserCard {
    user: any;
}

export default function UserCard({ user }: UserCard) {
    if (!user) return null;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-10 w-full max-w-md transition-all">
                <div className="flex flex-col items-center text-center space-y-4">
                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={
                                user.avatar?.startsWith("http")
                                    ? user.avatar
                                    : `http://localhost:5000${user.avatar}`
                            }
                            alt={user.name}
                            className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500 shadow-md"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "https://via.placeholder.com/150";
                            }}
                        />
                    </div>

                    {/* Name and Username */}
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
                            <User className="w-5 h-5 text-indigo-500" /> {user.name}
                        </h2>
                        <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
                            <AtSign className="w-4 h-4" /> {user.username}
                        </p>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                        <Mail className="w-4 h-4 text-indigo-500" />
                        <span>{user.email}</span>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <div className="mt-3 p-3 bg-indigo-50 rounded-lg w-full">
                            <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                <Info className="w-4 h-4" />
                                <span className="text-sm font-medium">Bio</span>
                            </div>
                            <p className="text-gray-700 text-sm">{user.bio}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
