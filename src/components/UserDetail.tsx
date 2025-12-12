import { useEffect, useState, useMemo } from 'react';
import { getUser, setUpdatedUser } from '../utils/userStorage';
import { getInitials } from '../utils/helper';
import { followUser, getUserDetail, LikedPost, unfollowUser, updateProfile } from '../api/user';
import { EditProfileModal } from '../model/EditProfileModal';
import CommunityCard from './card/CommunityCard';
import FollowModal from '../model/FollowModal';
import { useNavigate, useParams } from 'react-router-dom';
import Post from './card/Post';

interface ProfilePageProps {
    isOwnProfile?: boolean;
}

type PostType = 'all' | 'image' | 'code' | 'achievement' | 'poll';

export default function UserDetail({ isOwnProfile }: ProfilePageProps) {
    const navigate = useNavigate();
    const currentUser = getUser();
    const { id } = useParams() as { id: string };
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
    const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userDetail, setUserDetail] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [likedPost, setLikedPost] = useState<any[]>([])

    const isViewingOwnProfile = isOwnProfile || id === currentUser?._id || !id;

    // Post type tabs
    const [activePostType, setActivePostType] = useState<PostType>('all');
    const [activeTab, setActiveTab] = useState('posts');


    // Memoized filtered posts for better performance
    const filteredPosts = useMemo(() => {
        if (!userDetail?.posts) return [];

        if (activePostType === 'all') return userDetail.posts;

        return userDetail.posts.filter((post: any) => {
            switch (activePostType) {
                case 'image':
                    return post.type === 'image';
                case 'code':
                    return post.type === 'code';
                case 'achievement':
                    return post.type === 'achievement';
                case 'poll':
                    return post.type === 'poll';
                default:
                    return true;
            }
        });
    }, [userDetail?.posts, activePostType]);


    const fetchUser = async () => {
        try {
            let targetId = isViewingOwnProfile ? currentUser?._id : id;
            if (!targetId) return;

            const res = await getUserDetail(targetId);
            setUserDetail(res?.data);
        } catch (err) {
            console.error("User fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchLikedPost = async () => {
            const res = await LikedPost();
            console.log("liked post", res.data?.posts)
            setLikedPost(res.data?.posts)
        }

        fetchLikedPost();
    }, [])

    const handleFollow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoading(true);

        try {
            if (userDetail?.isFollowing) {
                await unfollowUser(userDetail._id);
                fetchUser();
            } else {
                await followUser(userDetail._id);
                fetchUser();
            }
        } catch (err) {
            console.error("Follow/Unfollow error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [id, isViewingOwnProfile]);

    const handleUpdate = () => { }
    const handleDelete = () => { }
    const handleLike = () => { }
    const handleComment = () => { }
    const handleJoinCommunity = () => { }


    const handleMessage = () => {
        console.log('Navigate to messages with user:', userDetail._id);
        navigate(`/messages/${id}`)
    };

    const handleSaveProfile = async (updatedUser: any) => {
        try {
            setIsSaving(true);
            const result = await updateProfile(updatedUser);
            setUpdatedUser(result?.data.user);
            window.location.reload();
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Post type icons
    const postTypeIcons = {
        all: '📝',
        image: '🖼️',
        code: '💻',
        achievement: '🏆',
        poll: '📊'
    };

    const postTypeLabels = {
        all: 'All Posts',
        image: 'Images',
        code: 'Code',
        achievement: 'Achievements',
        poll: 'Polls'
    };

    // Update your renderTabContent function
    const renderTabContent = () => {
        switch (activeTab) {
            case 'posts':
                return (
                    <div className="space-y-6">
                        {/* Post Type Filter Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {(Object.keys(postTypeIcons) as PostType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setActivePostType(type)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activePostType === type
                                        ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                                        }`}
                                >
                                    <span className="text-base">{postTypeIcons[type]}</span>
                                    <span className="hidden sm:inline">{postTypeLabels[type]}</span>
                                </button>
                            ))}
                        </div>

                        {/* Masonry Posts Grid */}
                        <div className="space-y-4">
                            {filteredPosts.length > 0 ? (
                                <div className="masonry-grid">
                                    {filteredPosts.map((post: any) => (
                                        <div key={post._id} className="masonry-item break-inside-avoid mb-4">
                                            <Post
                                                post={post}
                                                onUpdate={handleUpdate}
                                                onDelete={handleDelete}
                                                onLike={handleLike}
                                                onComment={handleComment}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                                    <div className="text-slate-400 mb-4">
                                        <div className="w-20 h-20 mx-auto mb-4 opacity-50 flex items-center justify-center">
                                            {activePostType === 'all' ? '📝' : postTypeIcons[activePostType]}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-300 mb-2">
                                        No {activePostType !== 'all' ? postTypeLabels[activePostType] : 'posts'} found
                                    </h3>
                                    <p className="text-slate-400 text-sm max-w-md mx-auto">
                                        {isOwnProfile
                                            ? `You haven't created any ${activePostType !== 'all' ? postTypeLabels[activePostType].toLowerCase() : 'posts'} yet.`
                                            : `No ${activePostType !== 'all' ? postTypeLabels[activePostType].toLowerCase() : 'posts'} available.`
                                        }
                                    </p>
                                    {isOwnProfile && activePostType === 'all' && (
                                        <button
                                            onClick={() => { /* Navigate to post creation */ }}
                                            className="mt-6 px-6 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
                                        >
                                            Create Your First Post
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'communities':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
                            {userDetail?.createdCommunities?.map((userCommunity: any) => (
                                <CommunityCard
                                    key={userCommunity._id}
                                    community={userCommunity}
                                    toggleJoinCommunity={handleJoinCommunity}
                                // onEditCommunity={handleEditCommunity}
                                // onDeleteCommunity={handleDeleteCommunity}
                                // onUpdateCommunity={handleUpdateCommunity}
                                />
                            ))}
                        </div>

                        {(!userDetail?.createdCommunities || userDetail.createdCommunities.length === 0) && (
                            <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                                <div className="text-slate-400 mb-4">
                                    <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-300 mb-2">
                                    No Communities Joined
                                </h3>
                                <p className="text-slate-400 text-sm mb-6">
                                    {isOwnProfile ? "You haven't joined any communities yet" : "No communities joined yet"}
                                </p>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => {/* Navigate to communities discovery */ }}
                                        className="px-6 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
                                    >
                                        Explore Communities
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );

            // case 'saved':
            //     return isOwnProfile ? (
            //         <div className="space-y-4">
            //             {/* Saved posts implementation */}
            //             <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            //                 <div className="text-slate-400 mb-4">
            //                     <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            //                     </svg>
            //                 </div>
            //                 <h3 className="text-lg font-semibold text-slate-300 mb-2">No Saved Posts</h3>
            //                 <p className="text-slate-400 text-sm">Posts you save will appear here</p>
            //             </div>
            //         </div>
            //     ) : (
            //         <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            //             <div className="text-slate-400 mb-4">
            //                 <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            //                 </svg>
            //             </div>
            //             <p className="text-slate-400 text-lg font-medium">This content is private</p>
            //         </div>
            //     );

            case 'liked':
                return isOwnProfile ? (
                    <div className="space-y-4">
                        {/* Liked posts implementation */}
                        {
                            likedPost?.length > 0 ? (
                                <div className="masonry-grid">
                                    {likedPost.map((post: any) => (
                                        <div key={post._id} className="masonry-item break-inside-avoid mb-4">
                                            <Post
                                                post={post}
                                                onUpdate={handleUpdate}
                                                onDelete={handleDelete}
                                                onLike={handleLike}
                                                onComment={handleComment}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                                    <div className="text-slate-400 mb-4">
                                        <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No Liked Posts</h3>
                                    <p className="text-slate-400 text-sm">Posts you like will appear here</p>
                                </div>
                            )
                        }

                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                        <div className="text-slate-400 mb-4">
                            <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <p className="text-slate-400 text-lg font-medium">This content is private</p>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
                <div className="animate-pulse">
                    <div className="h-48 sm:h-56 md:h-64 bg-slate-700 rounded-2xl mb-6"></div>
                    <div className="bg-slate-800/50 rounded-2xl p-6 mb-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-700 rounded-full -mt-16"></div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="h-6 bg-slate-700 rounded w-48 mx-auto md:mx-0 mb-2"></div>
                                <div className="h-4 bg-slate-700 rounded w-32 mx-auto md:mx-0 mb-3"></div>
                                <div className="h-4 bg-slate-700 rounded w-64 mx-auto md:mx-0 mb-2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-4">
            {/* Cover Photo */}
            <div className="h-40 sm:h-48 md:h-56 lg:h-64 rounded-2xl overflow-hidden mb-4 sm:mb-6 relative">
                <div
                    className={`w-full h-full ${userDetail?.bannerColor}`}
                >

                </div>
                {/* Gold shine effect */}
                <div className={`absolute inset-0 bg-linear-to-r from-transparent via-purple-500 to-transparent -skew-x-12 transform -translate-x-full animate-shine`}></div>
            </div>

            {/* Profile Header */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-purple-500/20 mb-4 sm:mb-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4 lg:space-x-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-linear-to-r from-purple-500 to-pink-500 overflow-hidden rounded-full flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold -mt-12 sm:-mt-14 md:-mt-16 border-4 border-slate-900 shadow-lg">
                                {userDetail?.avatar ? (
                                    <img
                                        src={userDetail.avatar}
                                        alt="profile"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    getInitials(userDetail?.name || '')
                                )}
                            </div>
                            {userDetail?.isVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-slate-900">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="text-center md:text-left flex-1 min-w-0">
                            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                                    {userDetail?.name}
                                </h1>
                            </div>
                            <p className="text-slate-400 mb-3 text-sm sm:text-base">@{userDetail?.username}</p>
                            <p className="text-white text-sm sm:text-base mb-2 line-clamp-2">
                                {userDetail?.bio || "No bio yet"}
                            </p>
                            {userDetail?.location && (
                                <div className="flex items-center text-slate-400 text-xs sm:text-sm justify-center md:justify-start">
                                    <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>

                                    <span className="truncate">
                                        {[
                                            userDetail.location.city,
                                            userDetail.location.state,
                                            userDetail.location.country
                                        ]
                                            .filter(Boolean) // removes empty values
                                            .join(", ")}
                                    </span>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 sm:space-x-3 mt-4 md:mt-0 justify-center md:justify-start">
                        {isOwnProfile ? (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl font-semibold transition-all bg-linear-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="hidden sm:inline">Edit Profile</span>
                                <span className="sm:hidden">Edit</span>
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleMessage}
                                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-700/50 text-white rounded-xl hover:bg-slate-600/50 transition-all text-sm"
                                >
                                    <span>💬</span>
                                    <span className="hidden sm:inline">Message</span>
                                </button>
                                <button
                                    onClick={handleFollow}
                                    disabled={isLoading}
                                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all text-sm ${userDetail?.isFollowing
                                        ? 'bg-slate-700/50 text-white hover:bg-slate-600/50'
                                        : 'bg-linear-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25'
                                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            {userDetail?.isFollowing ? 'Unfollow' : 'Follow'}
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between sm:justify-around space-x-2 sm:space-x-4 mt-6 pt-6 border-t border-slate-700/50">
                    <div className="text-center flex-1">
                        <div className="text-white font-bold text-lg sm:text-xl">{userDetail?.posts?.length || 0}</div>
                        <div className="text-slate-400 text-xs sm:text-sm">Posts</div>
                    </div>
                    <div className="text-center flex-1 cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsFollowersModalOpen(true)}>
                        <div className="text-white font-bold text-lg sm:text-xl">{userDetail?.followers?.length || 0}</div>
                        <div className="text-slate-400 text-xs sm:text-sm">Followers</div>
                    </div>
                    <div className="text-center flex-1 cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsFollowingModalOpen(true)}>
                        <div className="text-white font-bold text-lg sm:text-xl">{userDetail?.following?.length || 0}</div>
                        <div className="text-slate-400 text-xs sm:text-sm">Following</div>
                    </div>
                    <div className="text-center flex-1">
                        <div className="text-white font-bold text-lg sm:text-xl">{userDetail?.createdCommunities?.length || 0}</div>
                        <div className="text-slate-400 text-xs sm:text-sm">Communities</div>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex space-x-1 bg-slate-700/50 rounded-2xl p-1 mb-4 sm:mb-6">
                {['posts', 'communities', ...(isOwnProfile ? ['liked'] : [])].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 capitalize ${activeTab === tab
                            ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                            : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-slate-800/50 rounded-2xl p-3 sm:p-4 lg:p-6 border border-slate-700/50 shadow-lg min-h-[400px]">
                {renderTabContent()}
            </div>

            {/* Edit Profile Modal */}
            {isOwnProfile && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={currentUser}
                    onSave={handleSaveProfile}
                    isLoading={isSaving}
                />
            )}

            <FollowModal
                isOpen={isFollowersModalOpen}
                onClose={() => setIsFollowersModalOpen(false)}
                users={userDetail?.followers}
                type="followers"
            />

            <FollowModal
                isOpen={isFollowingModalOpen}
                onClose={() => setIsFollowingModalOpen(false)}
                users={userDetail?.following}
                type="following"
            />
        </div>
    );
}