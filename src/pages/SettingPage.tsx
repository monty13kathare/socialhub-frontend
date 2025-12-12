import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, removeUser } from "../utils/userStorage";
import { removeToken } from "../utils/cookieHelper";
import DeleteModal2 from "../model/DeleteModal2";
import { deleteAccount } from "../api/user";
import { deleteAllCommunity } from "../api/community";
import { deleteAllPosts } from "../api/userPost";
import {
  Bell,
  CircleUserRound,
  Palette,
  TriangleAlert,
  Users,
  Globe,
  Mail,
  Shield,
  Download,
  Upload,
  Moon,
  Sun,
  Languages,
  Type,
  FileText,
  Activity,
  Heart,
  Share2,
  Settings as SettingsIcon,
  ChevronRight,
  Camera,
  Save,
} from "lucide-react";

type SettingsSection =
  | "account"
  | "privacy"
  | "notifications"
  | "content"
  | "social"
  | "danger"
  | "data";

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  subCategories?: {
    id: string;
    label: string;
    enabled: boolean;
  }[];
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("account");
  const [userData, setUserData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const navigate = useNavigate();

  const user: any = getUser();

  // Activity stats (simulated)
  const [activityStats] = useState({
    posts: 42,
    followers: 156,
    following: 89,
    communities: 7,
    likes: 1247,
    comments: 326,
    achievements: 12,
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "post" as "post" | "community" | "account" | "data",
    itemName: "",
    isLoading: false,
    requiresConfirmation: false,
  });

  // Form states
  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    username: "",
    bio: "",
    website: "",
    location: "",
    birthDate: "",
    gender: "",
  });

  const [socialForm, setSocialForm] = useState({
    twitter: "",
    instagram: "",
    github: "",
    linkedin: "",
    displaySocialLinks: true,
    autoFollowBack: false,
  });

  const [privacyForm, setPrivacyForm] = useState({
    profileVisibility: "public",
    showOnlineStatus: true,
    allowTagging: true,
    allowMessages: "everyone",
    searchVisibility: true,
    dataSharing: false,
    hideLikedPosts: false,
    hideFollowersCount: false,
    hideFollowingCount: false,
    blockList: [] as string[],
    mutedUsers: [] as string[],
  });

  const [notificationCategories, setNotificationCategories] = useState<
    NotificationCategory[]
  >([
    {
      id: "likes",
      label: "Likes",
      description: "When someone likes your posts",
      enabled: true,
      subCategories: [
        { id: "post_likes", label: "Post Likes", enabled: true },
        { id: "comment_likes", label: "Comment Likes", enabled: true },
      ],
    },
    {
      id: "comments",
      label: "Comments",
      description: "New comments on your posts",
      enabled: true,
      subCategories: [
        { id: "post_comments", label: "Post Comments", enabled: true },
        { id: "reply_comments", label: "Replies", enabled: true },
        { id: "mention_comments", label: "Mentions", enabled: true },
      ],
    },
    {
      id: "follows",
      label: "Follows",
      description: "New followers and follow requests",
      enabled: true,
    },
    {
      id: "shares",
      label: "Shares",
      description: "When someone shares your posts",
      enabled: true,
    },
    {
      id: "community",
      label: "Community",
      description: "Updates from your communities",
      enabled: true,
      subCategories: [
        { id: "new_members", label: "New Members", enabled: true },
        { id: "mod_actions", label: "Moderator Actions", enabled: false },
        { id: "community_posts", label: "New Community Posts", enabled: true },
      ],
    },
    {
      id: "achievements",
      label: "Achievements",
      description: "When you earn new achievements",
      enabled: true,
    },
    {
      id: "messages",
      label: "Messages",
      description: "New direct messages",
      enabled: true,
    },
  ]);

  const [contentForm, setContentForm] = useState({
    language: "en",
    theme: "dark",
    autoPlayVideos: false,
    reduceMotion: false,
    fontSize: "medium",
    density: "comfortable" as "compact" | "comfortable" | "spacious",
    showNSFW: false,
    autoExpandImages: true,
    defaultPostType: "text" as "text" | "image" | "poll" | "code",
    codeTheme: "dracula",
  });

  const [dataSettings, setDataSettings] = useState({
    autoDeleteOldPosts: false,
    deleteAfterMonths: 12,
    exportDataFormat: "json" as "json" | "csv",
    allowDataCollection: false,
    clearSearchHistory: false,
    clearViewHistory: false,
  });

  useEffect(() => {
    if (user) {
      setUserData(user);
      setAccountForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        bio: user.bio || "",
        location: user?.location
          ? `${user.location.city}, ${user.location.state}, ${user.location.country}`
          : "",
        birthDate: user.birthDate || "",
        gender: user.gender || "",
      }));

      if (user.avatar) setProfileImage(user.avatar);
      if (user.coverImage) setCoverImage(user.coverImage);

      // Initialize social form from user data
      if (user.socialLinks) {
        setSocialForm((prev) => ({
          ...prev,
          ...user.socialLinks,
        }));
      }
    }
  }, []);

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        // Update in local storage
        if (userData) {
          const updatedUser = {
            ...userData,
            profileImage: reader.result as string,
          };
          // updateUser(updatedUser);
          setUserData(updatedUser);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
        // Update in local storage
        if (userData) {
          const updatedUser = {
            ...userData,
            coverImage: reader.result as string,
          };
          // updateUser(updatedUser);
          setUserData(updatedUser);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSectionSave = async (
    section: string,
    saveFunction: () => Promise<void>
  ) => {
    setSavingStates((prev) => ({ ...prev, [section]: true }));
    try {
      await saveFunction();
      // Show success toast/notification
      console.log(`${section} settings saved successfully`);
    } catch (error) {
      console.error(`Error saving ${section}:`, error);
    } finally {
      setSavingStates((prev) => ({ ...prev, [section]: false }));
    }
  };

  const handleAccountUpdate = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update user in local storage
    if (userData) {
      const updatedUser = {
        ...userData,
        ...accountForm,
        // profileImage: profileImage || userData.profileImage,
        // coverImage: coverImage || userData.coverImage
      };
      // updateUser(updatedUser);
      setUserData(updatedUser);

      console.log("updatedUser", updatedUser);
    }

    setIsLoading(false);
  };

  const handlePrivacyUpdate = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Privacy settings updated:", privacyForm);
    setIsLoading(false);
  };

  const handleSocialUpdate = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Social settings updated:", socialForm);
    setIsLoading(false);
  };

  const handleNotificationUpdate = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Notification settings updated:", notificationCategories);
    setIsLoading(false);
  };

  const handleContentUpdate = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Content preferences updated:", contentForm);
    setIsLoading(false);
  };

  const handleDataSettingsUpdate = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Data settings updated:", dataSettings);
    setIsLoading(false);
  };

  const handleExportData = async () => {
    setIsLoading(true);
    // Simulate data export
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const exportData = {
      user: userData,
      settings: {
        account: accountForm,
        privacy: privacyForm,
        notifications: notificationCategories,
        content: contentForm,
        social: socialForm,
        data: dataSettings,
      },
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `socialhub-data-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setIsLoading(false);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          // Handle imported data
          console.log("Imported data:", data);
          // Show success message
        } catch (error) {
          console.error("Error parsing import file:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Delete handlers
  const handleDeletePostsClick = () => {
    setDeleteModal({
      isOpen: true,
      type: "post",
      itemName: "all your posts",
      isLoading: false,
      requiresConfirmation: true,
    });
  };

  const handleDeleteCommunitiesClick = () => {
    setDeleteModal({
      isOpen: true,
      type: "community",
      itemName: "all your communities",
      isLoading: false,
      requiresConfirmation: true,
    });
  };

  const handleDeleteAccountClick = () => {
    setDeleteModal({
      isOpen: true,
      type: "account",
      itemName: "",
      isLoading: false,
      requiresConfirmation: true,
    });
  };

  const handleClearDataClick = () => {
    setDeleteModal({
      isOpen: true,
      type: "data",
      itemName: "all your personal data",
      isLoading: false,
      requiresConfirmation: true,
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      switch (deleteModal.type) {
        case "post":
          await deleteAllPosts();
          console.log("All posts deleted");
          break;

        case "community":
          await deleteAllCommunity();
          console.log("All communities deleted");
          break;

        case "account":
          await deleteAccount();
          removeToken();
          removeUser();
          navigate("/");
          window.location.reload();
          break;

        case "data":
          // Clear user data (simulated)
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log("All personal data cleared");
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteModal({
        isOpen: false,
        type: "post",
        itemName: "",
        isLoading: false,
        requiresConfirmation: false,
      });
    }
  };

  const handleDeleteModalClose = () => {
    setDeleteModal({
      isOpen: false,
      type: "post",
      itemName: "",
      isLoading: false,
      requiresConfirmation: false,
    });
  };

  const toggleNotificationCategory = (categoryId: string) => {
    setNotificationCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  const toggleNotificationSubCategory = (
    categoryId: string,
    subCategoryId: string
  ) => {
    setNotificationCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            subCategories: cat.subCategories?.map((sub) =>
              sub.id === subCategoryId
                ? { ...sub, enabled: !sub.enabled }
                : sub
            ),
          }
          : cat
      )
    );
  };

  const settingsSections = [
    {
      id: "account" as SettingsSection,
      label: "Account",
      icon: <CircleUserRound size={18} />,
    },
    {
      id: "social" as SettingsSection,
      label: "Social",
      icon: <Users size={18} />,
    },
    {
      id: "privacy" as SettingsSection,
      label: "Privacy",
      icon: <Shield size={18} />,
    },
    {
      id: "notifications" as SettingsSection,
      label: "Notifications",
      icon: <Bell size={18} />,
    },
    {
      id: "content" as SettingsSection,
      label: "Content",
      icon: <Palette size={18} />,
    },
    {
      id: "data" as SettingsSection,
      label: "Data",
      icon: <Download size={18} />,
    },
    {
      id: "danger" as SettingsSection,
      label: "Danger Zone",
      icon: <TriangleAlert size={18} />,
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-6 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold ">Settings</h1>
              <p className="text-slate-400 mt-2">
                Manage your account settings and preferences
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <SettingsIcon size={16} className="text-slate-500" />
              <span className="text-slate-400">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              {
                icon: <FileText size={14} />,
                label: "Posts",
                value: activityStats.posts,
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Users size={14} />,
                label: "Followers",
                value: activityStats.followers,
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: <Heart size={14} />,
                label: "Likes",
                value: activityStats.likes,
                color: "from-red-500 to-orange-500",
              },
              // { icon: <MessageSquare size={14}/>, label: 'Comments', value: activityStats.comments, color: 'from-green-500 to-emerald-500' },
              {
                icon: <Share2 size={14} />,
                label: "Following",
                value: activityStats.following,
                color: "from-yellow-500 to-amber-500",
              },
              {
                icon: <Activity size={14} />,
                label: "Communities",
                value: activityStats.communities,
                color: "from-indigo-500 to-blue-500",
              },
              // { icon: <Award size={14}/>, label: 'Achievements', value: activityStats.achievements, color: 'from-rose-500 to-pink-500' }
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2 rounded-lg bg-linear-to-r ${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${activeSection === section.id
                        ? "text-white bg-linear-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/30"
                      }`}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      {section.icon}
                    </span>
                    <span className="font-medium">{section.label}</span>
                    {activeSection === section.id && (
                      <ChevronRight size={16} className="ml-auto" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/20 mt-4">
              <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleExportData}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <Download size={14} />
                    Export Data
                  </span>
                  {isLoading && (
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  )}
                </button>
                <label className="w-full flex items-center justify-between px-3 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/30 rounded-lg transition-colors cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Upload size={14} />
                    Import Data
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-slate-700/30 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CircleUserRound size={14} />
                    View Profile
                  </span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* User Info Card */}
            {userData && (
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/20 mt-4">
                <div className="relative">
                  {/* Cover Image */}
                  <div
                    className={`relative h-24 rounded-xl overflow-hidden mb-10 ${user.bannerColor}`}
                  >
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-r from-cyan-500/20 to-blue-500/20" />
                    )}
                    <label className="absolute bottom-2 right-2 p-1.5 bg-slate-900/80 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                      <Camera size={14} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Profile Image */}
                  <div className="absolute -bottom-6 left-4">
                    <div className="relative">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-16 h-16 rounded-full border-4 border-slate-800 object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full border-4 border-slate-800 bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                          {userData.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <label className="absolute -bottom-1 -right-1 p-1 bg-slate-900 border-2 border-slate-800 rounded-full cursor-pointer hover:bg-slate-800 transition-colors">
                        <Camera size={12} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-bold text-white">{userData.name}</h3>
                  <p className="text-slate-400 text-sm">@{userData.username}</p>
                  {userData.bio && (
                    <p className="text-slate-300 text-sm mt-2 line-clamp-2">
                      {userData.bio}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Account Status</span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                    <span>Member since</span>
                    <span>
                      {formatDate(
                        userData.createdAt || new Date().toISOString()
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
              {/* Account Settings */}
              {activeSection === "account" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Account Settings</h2>
                    <button
                      onClick={() =>
                        handleSectionSave("account", handleAccountUpdate)
                      }
                      disabled={savingStates.account || isLoading}
                      className="px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingStates.account ? "Saving..." : "Save Changes"}
                      <Save size={16} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          <CircleUserRound size={14} />
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={accountForm.name}
                          onChange={(e) =>
                            setAccountForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          <Mail size={14} />
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={accountForm.email}
                          onChange={(e) =>
                            setAccountForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                          placeholder="Enter your email"
                        />
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          @ Username
                        </label>
                        <input
                          type="text"
                          value={accountForm.username}
                          onChange={(e) =>
                            setAccountForm((prev) => ({
                              ...prev,
                              username: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                          placeholder="Choose a username"
                        />
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          <Globe size={14} />
                          Location
                        </label>
                        <input
                          type="text"
                          value={accountForm.location}
                          onChange={(e) =>
                            setAccountForm((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                          placeholder="Your location"
                        />
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2">
                          Gender
                        </label>
                        <select
                          value={accountForm.gender}
                          onChange={(e) =>
                            setAccountForm((prev) => ({
                              ...prev,
                              gender: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                        >
                          <option value="">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2">
                          Birth Date
                        </label>
                        <input
                          type="date"
                          value={accountForm.birthDate}
                          onChange={(e) =>
                            setAccountForm((prev) => ({
                              ...prev,
                              birthDate: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className=" text-sm font-medium text-slate-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={accountForm.bio}
                        onChange={(e) =>
                          setAccountForm((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                        placeholder="Tell us about yourself..."
                      />
                      <div className="text-xs text-slate-400 mt-1">
                        {accountForm.bio.length}/150 characters
                      </div>
                    </div>

                    <div>
                      <label className=" text-sm font-medium text-slate-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={accountForm.website}
                        onChange={(e) =>
                          setAccountForm((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Social Settings */}
              {activeSection === "social" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Social Settings</h2>
                    <button
                      onClick={() =>
                        handleSectionSave("social", handleSocialUpdate)
                      }
                      disabled={savingStates.social || isLoading}
                      className="px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingStates.social ? "Saving..." : "Save Changes"}
                      <Save size={16} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2">
                          Twitter
                        </label>
                        <input
                          type="text"
                          value={socialForm.twitter}
                          onChange={(e) =>
                            setSocialForm((prev) => ({
                              ...prev,
                              twitter: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                          placeholder="@username"
                        />
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2">
                          Instagram
                        </label>
                        <input
                          type="text"
                          value={socialForm.instagram}
                          onChange={(e) =>
                            setSocialForm((prev) => ({
                              ...prev,
                              instagram: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                          placeholder="@username"
                        />
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2">
                          GitHub
                        </label>
                        <input
                          type="text"
                          value={socialForm.github}
                          onChange={(e) =>
                            setSocialForm((prev) => ({
                              ...prev,
                              github: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                          placeholder="username"
                        />
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2">
                          LinkedIn
                        </label>
                        <input
                          type="text"
                          value={socialForm.linkedin}
                          onChange={(e) =>
                            setSocialForm((prev) => ({
                              ...prev,
                              linkedin: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                          placeholder="username"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                        <div>
                          <h3 className="font-medium text-white">
                            Display Social Links
                          </h3>
                          <p className="text-sm text-slate-400">
                            Show your social links on your profile
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={socialForm.displaySocialLinks}
                            onChange={(e) =>
                              setSocialForm((prev) => ({
                                ...prev,
                                displaySocialLinks: e.target.checked,
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                        <div>
                          <h3 className="font-medium text-white">
                            Auto Follow Back
                          </h3>
                          <p className="text-sm text-slate-400">
                            Automatically follow back users who follow you
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={socialForm.autoFollowBack}
                            onChange={(e) =>
                              setSocialForm((prev) => ({
                                ...prev,
                                autoFollowBack: e.target.checked,
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy & Safety */}
              {activeSection === "privacy" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Privacy & Safety</h2>
                    <button
                      onClick={() =>
                        handleSectionSave("privacy", handlePrivacyUpdate)
                      }
                      disabled={savingStates.privacy || isLoading}
                      className="px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingStates.privacy ? "Saving..." : "Save Changes"}
                      <Save size={16} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2">
                          Profile Visibility
                        </label>
                        <select
                          value={privacyForm.profileVisibility}
                          onChange={(e) =>
                            setPrivacyForm((prev) => ({
                              ...prev,
                              profileVisibility: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                        >
                          <option value="public">Public (Everyone)</option>
                          <option value="friends">Friends Only</option>
                          <option value="private">Private (Only Me)</option>
                        </select>
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2">
                          Who Can Message You
                        </label>
                        <select
                          value={privacyForm.allowMessages}
                          onChange={(e) =>
                            setPrivacyForm((prev) => ({
                              ...prev,
                              allowMessages: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                        >
                          <option value="everyone">Everyone</option>
                          <option value="friends">Friends Only</option>
                          <option value="none">No One</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          key: "showOnlineStatus",
                          label: "Show Online Status",
                          description: "Let others see when you're online",
                        },
                        {
                          key: "allowTagging",
                          label: "Allow Tagging",
                          description: "Allow others to tag you in posts",
                        },
                        {
                          key: "searchVisibility",
                          label: "Search Visibility",
                          description:
                            "Allow your profile to appear in search results",
                        },
                        {
                          key: "hideLikedPosts",
                          label: "Hide Liked Posts",
                          description: "Keep your liked posts private",
                        },
                        {
                          key: "hideFollowersCount",
                          label: "Hide Followers Count",
                          description: "Hide your follower count from others",
                        },
                        {
                          key: "hideFollowingCount",
                          label: "Hide Following Count",
                          description: "Hide your following count from others",
                        },
                        {
                          key: "dataSharing",
                          label: "Data Sharing",
                          description:
                            "Allow data sharing for analytics (anonymous)",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between py-3 border-b border-slate-700/50"
                        >
                          <div>
                            <h3 className="font-medium text-white">
                              {item.label}
                            </h3>
                            <p className="text-sm text-slate-400">
                              {item.description}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                privacyForm[
                                item.key as keyof typeof privacyForm
                                ] as boolean
                              }
                              onChange={(e) =>
                                setPrivacyForm((prev) => ({
                                  ...prev,
                                  [item.key]: e.target.checked,
                                }))
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Blocked & Muted Users */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-700/20 rounded-xl p-4">
                        <h3 className="font-medium text-white mb-3">
                          Blocked Users
                        </h3>
                        {privacyForm.blockList.length > 0 ? (
                          <div className="space-y-2">
                            {privacyForm.blockList
                              .slice(0, 3)
                              .map((user, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-slate-300">
                                    @{user}
                                  </span>
                                  <button className="text-red-400 hover:text-red-300 text-xs">
                                    Unblock
                                  </button>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">
                            No blocked users
                          </p>
                        )}
                        <button className="mt-3 text-sm text-purple-400 hover:text-purple-300">
                          Manage Blocked Users →
                        </button>
                      </div>

                      <div className="bg-slate-700/20 rounded-xl p-4">
                        <h3 className="font-medium text-white mb-3">
                          Muted Users
                        </h3>
                        {privacyForm.mutedUsers.length > 0 ? (
                          <div className="space-y-2">
                            {privacyForm.mutedUsers
                              .slice(0, 3)
                              .map((user, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-slate-300">
                                    @{user}
                                  </span>
                                  <button className="text-cyan-400 hover:text-cyan-300 text-xs">
                                    Unmute
                                  </button>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">
                            No muted users
                          </p>
                        )}
                        <button className="mt-3 text-sm text-purple-400 hover:text-purple-300">
                          Manage Muted Users →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeSection === "notifications" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">
                      Notification Settings
                    </h2>
                    <button
                      onClick={() =>
                        handleSectionSave(
                          "notifications",
                          handleNotificationUpdate
                        )
                      }
                      disabled={savingStates.notifications || isLoading}
                      className="px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingStates.notifications
                        ? "Saving..."
                        : "Save Changes"}
                      <Save size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {notificationCategories.map((category) => (
                      <div
                        key={category.id}
                        className="bg-slate-700/20 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-white">
                              {category.label}
                            </h3>
                            <p className="text-sm text-slate-400">
                              {category.description}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={category.enabled}
                              onChange={() =>
                                toggleNotificationCategory(category.id)
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                          </label>
                        </div>

                        {category.subCategories && category.enabled && (
                          <div className="ml-4 space-y-2 border-l border-slate-700/50 pl-4">
                            {category.subCategories.map((subCat) => (
                              <div
                                key={subCat.id}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm text-slate-300">
                                  {subCat.label}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={subCat.enabled}
                                    onChange={() =>
                                      toggleNotificationSubCategory(
                                        category.id,
                                        subCat.id
                                      )
                                    }
                                    className="sr-only peer"
                                  />
                                  <div className="w-8 h-4 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="bg-slate-700/20 rounded-xl p-4">
                      <h3 className="font-medium text-white mb-3">
                        Notification Delivery
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                          <div className="text-lg font-bold text-white">
                            Push
                          </div>
                          <div className="text-sm text-slate-400">
                            Real-time
                          </div>
                          <div className="mt-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto"></div>
                          </div>
                        </div>
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                          <div className="text-lg font-bold text-white">
                            Email
                          </div>
                          <div className="text-sm text-slate-400">
                            Daily digest
                          </div>
                          <div className="mt-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto"></div>
                          </div>
                        </div>
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                          <div className="text-lg font-bold text-white">
                            In-app
                          </div>
                          <div className="text-sm text-slate-400">Always</div>
                          <div className="mt-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content & Display */}
              {activeSection === "content" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Content & Display</h2>
                    <button
                      onClick={() =>
                        handleSectionSave("content", handleContentUpdate)
                      }
                      disabled={savingStates.content || isLoading}
                      className="px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingStates.content ? "Saving..." : "Save Changes"}
                      <Save size={16} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          <Languages size={14} />
                          Language
                        </label>
                        <select
                          value={contentForm.language}
                          onChange={(e) =>
                            setContentForm((prev) => ({
                              ...prev,
                              language: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="ja">Japanese</option>
                        </select>
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          {contentForm.theme === "dark" ? (
                            <Moon size={14} />
                          ) : (
                            <Sun size={14} />
                          )}
                          Theme
                        </label>
                        <select
                          value={contentForm.theme}
                          onChange={(e) =>
                            setContentForm((prev) => ({
                              ...prev,
                              theme: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                        >
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="auto">Auto (System)</option>
                        </select>
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          <Type size={14} />
                          Font Size
                        </label>
                        <select
                          value={contentForm.fontSize}
                          onChange={(e) =>
                            setContentForm((prev) => ({
                              ...prev,
                              fontSize: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2">
                          Content Density
                        </label>
                        <select
                          value={contentForm.density}
                          onChange={(e) =>
                            setContentForm((prev) => ({
                              ...prev,
                              density: e.target.value as any,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                        >
                          <option value="compact">Compact</option>
                          <option value="comfortable">Comfortable</option>
                          <option value="spacious">Spacious</option>
                        </select>
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2">
                          Default Post Type
                        </label>
                        <select
                          value={contentForm.defaultPostType}
                          onChange={(e) =>
                            setContentForm((prev) => ({
                              ...prev,
                              defaultPostType: e.target.value as any,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                        >
                          <option value="text">Text</option>
                          <option value="image">Image</option>
                          <option value="poll">Poll</option>
                          <option value="code">Code</option>
                        </select>
                      </div>
                      <div>
                        <label className=" text-sm font-medium text-slate-300 mb-2">
                          Code Theme
                        </label>
                        <select
                          value={contentForm.codeTheme}
                          onChange={(e) =>
                            setContentForm((prev) => ({
                              ...prev,
                              codeTheme: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                        >
                          <option value="dracula">Dracula</option>
                          <option value="monokai">Monokai</option>
                          <option value="solarized">Solarized</option>
                          <option value="github">GitHub</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          key: "autoPlayVideos",
                          label: "Auto-play Videos",
                          description: "Automatically play videos in feed",
                        },
                        {
                          key: "reduceMotion",
                          label: "Reduce Motion",
                          description: "Reduce animations and transitions",
                        },
                        {
                          key: "showNSFW",
                          label: "Show NSFW Content",
                          description:
                            "Show not-safe-for-work content (warnings applied)",
                        },
                        {
                          key: "autoExpandImages",
                          label: "Auto-expand Images",
                          description: "Automatically expand images in feed",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between py-3 border-b border-slate-700/50"
                        >
                          <div>
                            <h3 className="font-medium text-white">
                              {item.label}
                            </h3>
                            <p className="text-sm text-slate-400">
                              {item.description}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                contentForm[
                                item.key as keyof typeof contentForm
                                ] as boolean
                              }
                              onChange={(e) =>
                                setContentForm((prev) => ({
                                  ...prev,
                                  [item.key]: e.target.checked,
                                }))
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Data Management */}
              {activeSection === "data" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Data Management</h2>
                    <button
                      onClick={() =>
                        handleSectionSave("data", handleDataSettingsUpdate)
                      }
                      disabled={savingStates.data || isLoading}
                      className="px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingStates.data ? "Saving..." : "Save Changes"}
                      <Save size={16} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-700/20 rounded-xl p-6">
                      <h3 className="font-medium text-white mb-4">
                        Data Export & Import
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={handleExportData}
                          disabled={isLoading}
                          className="p-4 bg-slate-800/50 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                              <Download size={20} className="text-cyan-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                Export Data
                              </div>
                              <div className="text-sm text-slate-400">
                                Download all your data
                              </div>
                            </div>
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-slate-400 group-hover:text-cyan-400"
                          />
                        </button>

                        <label className="p-4 bg-slate-800/50 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                              <Upload size={20} className="text-cyan-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                Import Data
                              </div>
                              <div className="text-sm text-slate-400">
                                Restore from backup
                              </div>
                            </div>
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-slate-400 group-hover:text-cyan-400"
                          />
                          <input
                            type="file"
                            accept=".json,.csv"
                            onChange={handleImportData}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                        <div>
                          <h3 className="font-medium text-white">
                            Auto-delete Old Posts
                          </h3>
                          <p className="text-sm text-slate-400">
                            Automatically delete posts older than specified
                            months
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={dataSettings.deleteAfterMonths}
                            onChange={(e) =>
                              setDataSettings((prev) => ({
                                ...prev,
                                deleteAfterMonths: parseInt(e.target.value),
                              }))
                            }
                            disabled={!dataSettings.autoDeleteOldPosts}
                            className="bg-slate-700/30 border border-slate-600/50 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
                          >
                            <option value="6">6 months</option>
                            <option value="12">12 months</option>
                            <option value="24">24 months</option>
                          </select>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={dataSettings.autoDeleteOldPosts}
                              onChange={(e) =>
                                setDataSettings((prev) => ({
                                  ...prev,
                                  autoDeleteOldPosts: e.target.checked,
                                }))
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                          </label>
                        </div>
                      </div>

                      {[
                        {
                          key: "allowDataCollection",
                          label: "Allow Data Collection",
                          description:
                            "Allow anonymous data collection for analytics",
                        },
                        {
                          key: "clearSearchHistory",
                          label: "Clear Search History",
                          description:
                            "Automatically clear search history weekly",
                        },
                        {
                          key: "clearViewHistory",
                          label: "Clear View History",
                          description:
                            "Automatically clear viewed posts history",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between py-3 border-b border-slate-700/50"
                        >
                          <div>
                            <h3 className="font-medium text-white">
                              {item.label}
                            </h3>
                            <p className="text-sm text-slate-400">
                              {item.description}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                dataSettings[
                                item.key as keyof typeof dataSettings
                                ] as boolean
                              }
                              onChange={(e) =>
                                setDataSettings((prev) => ({
                                  ...prev,
                                  [item.key]: e.target.checked,
                                }))
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-red-400">
                            Clear All Personal Data
                          </h3>
                          <p className="text-red-300/80 text-sm mt-1">
                            Permanently delete all your personal data including
                            search history, viewed posts, and activity logs.
                          </p>
                        </div>
                        <button
                          onClick={handleClearDataClick}
                          className="px-4 py-2 bg-red-500/20 text-red-400 font-medium rounded-lg hover:bg-red-500/30 transition-all whitespace-nowrap border border-red-500/30"
                        >
                          Clear Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              {activeSection === "danger" && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-red-400">
                    Danger Zone
                  </h2>

                  <div className="space-y-6">
                    {/* Delete All Posts */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FileText size={18} className="text-red-400" />
                            <h3 className="font-semibold text-red-400 text-lg">
                              Delete All Posts
                            </h3>
                          </div>
                          <p className="text-red-300/80">
                            Permanently delete all posts you've created. This
                            action cannot be undone.
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-red-300/60">
                            <span>Posts: {activityStats.posts}</span>
                            <span>•</span>
                            <span>Likes: {activityStats.likes}</span>
                            <span>•</span>
                            <span>Comments: {activityStats.comments}</span>
                          </div>
                        </div>
                        <button
                          onClick={handleDeletePostsClick}
                          disabled={isLoading}
                          className="px-6 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[140px]"
                        >
                          {isLoading ? "Deleting..." : "Delete All Posts"}
                        </button>
                      </div>
                    </div>

                    {/* Delete All Communities */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Users size={18} className="text-red-400" />
                            <h3 className="font-semibold text-red-400 text-lg">
                              Delete All Communities
                            </h3>
                          </div>
                          <p className="text-red-300/80">
                            Permanently delete all communities you've created.
                            This will remove all community data including
                            members and posts.
                          </p>
                          <div className="text-sm text-red-300/60 mt-2">
                            Affects {activityStats.communities} communities
                          </div>
                        </div>
                        <button
                          onClick={handleDeleteCommunitiesClick}
                          disabled={isLoading}
                          className="px-6 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[200px]"
                        >
                          {isLoading ? "Deleting..." : "Delete Communities"}
                        </button>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <TriangleAlert size={18} className="text-red-400" />
                            <h3 className="font-semibold text-red-400 text-lg">
                              Delete Account
                            </h3>
                          </div>
                          <p className="text-red-300/80">
                            Permanently delete your account and all associated
                            data. This action cannot be undone and will remove:
                          </p>
                          <ul className="text-sm text-red-300/60 mt-2 space-y-1">
                            <li>• All your posts, comments, and likes</li>
                            <li>• Your profile and social connections</li>
                            <li>• Community memberships and ownerships</li>
                            <li>• All activity history and achievements</li>
                          </ul>
                        </div>
                        <button
                          onClick={handleDeleteAccountClick}
                          disabled={isLoading}
                          className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[140px]"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal2
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        type={deleteModal.type}
        itemName={deleteModal.itemName}
        isLoading={deleteModal.isLoading}
        requiresConfirmation={deleteModal.requiresConfirmation}
        confirmationText="DELETE"
      />
    </div>
  );
}
