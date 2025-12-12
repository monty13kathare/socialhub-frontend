import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getPostById, joinCommunity, leaveCommunity } from "../api/community";
import { CommunityActionModal } from "../model/CommunityActionModal";
import type { Post } from "../types/types";
import CreatePost from "../components/CreatePost";
import { getUser } from "../utils/userStorage";
import CommunityPostCard from "../components/card/CommunityPostCard";

export default function CommunityDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getUser();
  const community = location.state?.community;

  const isMember = community?.members?.some(
    (member: any) => member?.user?._id === currentUser?._id
  );
  const isAdmin = community?.createdBy?._id === currentUser?._id;

  const canPost = isMember || isAdmin;

  const [activeTab, setActiveTab] = useState<"posts" | "members" | "about">(
    "posts"
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"join" | "leave">("join");
  const [isLoading, setIsLoading] = useState(false);

  console.log("community", community);
  console.log("posts", posts);

  useEffect(() => {
    const fetchCommunityPost = async () => {
      try {
        if (!id) return;
        const res = await getPostById(id);
        setPosts(res?.data?.posts);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };

    fetchCommunityPost();
  }, []);

  const handleAction = async (communityId: string) => {
    setIsLoading(true);
    try {
      if (modalType === "join") {
        await joinCommunity(communityId);
      } else {
        await leaveCommunity(communityId);
      }
    } catch (error) {
      console.error(`Error ${modalType}ing community:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClick = () => {
    setModalType("join");
    setIsModalOpen(true);
  };

  const handleLeaveClick = () => {
    setModalType("leave");
    setIsModalOpen(true);
  };

  // Post Creation Functions
  const handleStartCreatingPost = () => {
    setIsCreatingPost(true);
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "moderator":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-slate-700/50 text-slate-400 border-slate-600/50";
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "moderator":
        return "Mod";
      default:
        return "Member";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Community Header Banner */}
      <div className={`bg-linear-to-r ${community?.bannerColor} relative`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col sm:flex-row items-start space-x-4 mb-4 lg:mb-0">
              <button
                onClick={() => navigate("/communities")}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-200 mt-1 mb-2"
              >
                ← Back
              </button>
              <div className="w-13 h-13 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl backdrop-blur-sm border border-white/30">
                {community?.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                  {community?.name}
                </h1>
                <p className="text-white/80 text-base sm:text-lg max-w-2xl w-full">
                  {community?.description}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={canPost ? handleStartCreatingPost : handleJoinClick}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg bg-white text-slate-900 hover:bg-slate-100 border border-white`}
              >
                {canPost ? "Create Post" : "Join Community"}
              </button>
              {isMember && (
                <button
                  onClick={handleLeaveClick}
                  className="px-6 py-3 bg-slate-800/50 text-white rounded-xl font-semibold hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/50 backdrop-blur-sm"
                >
                  Leave
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={handleLeaveClick}
                  className="px-6 py-3 bg-slate-800/50 text-white rounded-xl font-semibold hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/50 backdrop-blur-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto  sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Community Stats */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-white font-semibold mb-4">Community Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Members</span>
                  <span className="text-white font-semibold">
                    {community?.members.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Online Now</span>
                  <span className="text-green-400 font-semibold">
                    {community?.members?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Your Status</span>
                  <span
                    className={`font-semibold ${
                      isMember
                        ? "text-green-400"
                        : isAdmin
                        ? "text-purple-500"
                        : "text-yellow-400"
                    }`}
                  >
                    {isMember ? "Member" : isAdmin ? "Admin" : "Visitor"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Category</span>
                  <span className="text-white font-semibold capitalize">
                    {community?.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {canPost && (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsCreatingPost(true);
                    }}
                    className="w-full text-left p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 flex items-center space-x-3"
                  >
                    <span>🖼️</span>
                    <span>Create Post</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingPost(true);
                    }}
                    className="w-full text-left p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 flex items-center space-x-3"
                  >
                    <span>📊</span>
                    <span>Create Poll</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingPost(true);
                    }}
                    className="w-full text-left p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 flex items-center space-x-3"
                  >
                    <span>💻</span>
                    <span>Share Code</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingPost(true);
                    }}
                    className="w-full text-left p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 flex items-center space-x-3"
                  >
                    <span>🎉</span>
                    <span>Share Achievement</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Navigation Tabs */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-1 mb-6">
              <div className="flex space-x-1">
                {[
                  { id: "posts" as const, label: "Posts", count: posts.length },
                  {
                    id: "members" as const,
                    label: "Members",
                    count: community?.members.length,
                  },
                  {
                    id: "about" as const,
                    label: "About",
                    count: community?.rules.length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                      activeTab === tab.id
                        ? "bg-slate-700 text-white shadow-lg"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="bg-slate-700/50 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Create Post Form */}
            {isCreatingPost && canPost && (
              <CreatePost
                community={community}
                currentUser={community.members[0]?.user}
                onPostCreated={(post) => {
                  setPosts((prev) => [post, ...prev]);
                  setIsCreatingPost(false);
                }}
                onCancel={() => setIsCreatingPost(false)}
              />
            )}

            {/* Posts Tab */}
            {activeTab === "posts" && (
              <div className="space-y-6">
                {posts?.map((post: any) => (
                  <CommunityPostCard
                    post={post}
                    key={post._id}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}

            {/* Members Tab */}
            {activeTab === "members" && (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">
                      Community Members ({community?.members.length})
                    </h3>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search members..."
                        className="bg-slate-800/30 border border-slate-700/50 rounded-xl py-2 px-4 pl-10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 text-sm"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        🔍
                      </span>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {community?.members?.map((member: any) => (
                    <div
                      key={member._id}
                      className="p-6 hover:bg-slate-700/30 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-linear-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center overflow-hidden justify-center text-white font-bold">
                              <img
                                src={member?.user?.avatar}
                                alt="userProfile"
                                className="w-full h-fit object-cover "
                              />
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${
                                member.role === "admin"
                                  ? "bg-red-500"
                                  : member.role === "moderator"
                                  ? "bg-purple-500"
                                  : "bg-green-500"
                              }`}
                            ></div>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">
                              {member?.user.name}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              {member?.user.username}
                            </p>
                            <p className="text-slate-500 text-xs">
                              Joined{" "}
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-sm rounded-lg border ${getRoleColor(
                            member.role
                          )}`}
                        >
                          {getRoleBadge(member.role)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === "about" && (
              <div className="space-y-6">
                {/* Creator Information */}
                {community.createdBy && (
                  <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                    <h3 className="text-white font-semibold text-xl mb-4">
                      Community Creator
                    </h3>
                    <div className="flex items-center space-x-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                      <div className="relative">
                        <div className="w-16 h-16 bg-linear-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center overflow-hidden justify-center text-white font-bold">
                          <img
                            src={community.createdBy.avatar}
                            alt="Creator avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 bg-purple-500"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-white font-semibold text-lg">
                            {community.createdBy.name}
                          </h4>
                          <span className="px-2 py-1 text-xs rounded-lg border bg-red-500/20 text-red-400 border-red-500/30">
                            Admin
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-1">
                          @{community.createdBy.username}
                        </p>
                        <p className="text-slate-500 text-xs">
                          Created this community on{" "}
                          {new Date(community.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                  <h3 className="text-white font-semibold text-xl mb-4">
                    Community Rules
                  </h3>
                  <div className="space-y-3">
                    {community.rules.map((rule: any, index: any) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50"
                      >
                        <span className="text-purple-400 font-semibold text-sm mt-0.5">
                          {index + 1}.
                        </span>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {rule}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                  <h3 className="text-white font-semibold text-xl mb-4">
                    About This Community
                  </h3>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    {community.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col gap-2 md:flex-row justify-between p-3 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-400">Created</span>
                      <span className="text-white">
                        {new Date(community.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row justify-between p-3 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-400">Category</span>
                      <span className="text-white capitalize">
                        {community.category}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row justify-between p-3 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-400">Total Posts</span>
                      <span className="text-white">{posts?.length || 0}</span>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row justify-between p-3 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-400">Active Members</span>
                      <span className="text-green-400">87%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CommunityActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        community={community}
        type={modalType}
        onConfirm={handleAction}
        isLoading={isLoading}
      />
    </div>
  );
}
