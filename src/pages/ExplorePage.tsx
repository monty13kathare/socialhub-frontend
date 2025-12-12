import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Shared Types
interface Tag {
  id: string;
  name: string;
  type: "user" | "post";
  count: number;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  joinDate: string;
  followers: number;
  following: number;
  posts: number;
  isVerified: boolean;
  isFollowing: boolean;
  tags: string[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  tags: string[];
  category: string;
  isLiked: boolean;
  isBookmarked: boolean;
  media?: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  }[];
  readTime: number;
  isPublic: boolean;
}

type ContentType = "all" | "users" | "posts";
type SortBy =
  | "relevance"
  | "popular"
  | "recent"
  | "name"
  | "likes"
  | "followers";

interface SearchFilters {
  query: string;
  contentType: ContentType;
  tags: string[];
  category: string;
  location: string;
  minFollowers: number;
  maxFollowers: number;
  minLikes: number;
  maxLikes: number;
  dateRange: string;
  sortBy: SortBy;
  verifiedOnly: boolean;
  readTime: string;
}

export default function ExplorePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    type: "user" | "post";
    data: any;
  } | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    contentType: "all",
    tags: [],
    category: "all",
    location: "",
    minFollowers: 0,
    maxFollowers: 1000000,
    minLikes: 0,
    maxLikes: 100000,
    dateRange: "any",
    sortBy: "relevance",
    verifiedOnly: false,
    readTime: "any",
  });

  const navigate = useNavigate();

  // Initialize mock data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);

      // Mock Users
      const mockUsers: User[] = [
        {
          id: "1",
          name: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          avatar: "",
          bio: "Software developer and tech enthusiast. Love to share knowledge and learn new things.",
          location: "New York, USA",
          joinDate: "2023-01-15",
          followers: 1250,
          following: 350,
          posts: 89,
          isVerified: true,
          isFollowing: false,
          tags: ["developer", "javascript", "react", "typescript", "webdev"],
        },
        {
          id: "2",
          name: "Sarah Wilson",
          username: "sarahw",
          email: "sarah@example.com",
          avatar: "",
          bio: "Digital marketer and content creator. Passionate about social media trends.",
          location: "London, UK",
          joinDate: "2023-03-20",
          followers: 8900,
          following: 1200,
          posts: 234,
          isVerified: true,
          isFollowing: true,
          tags: [
            "marketing",
            "content",
            "socialmedia",
            "influencer",
            "digital",
          ],
        },
        {
          id: "3",
          name: "Mike Chen",
          username: "mikechen",
          email: "mike@example.com",
          avatar: "",
          bio: "Photographer and travel blogger. Capturing moments around the world.",
          location: "Tokyo, Japan",
          joinDate: "2023-06-10",
          followers: 3200,
          following: 450,
          posts: 156,
          isVerified: false,
          isFollowing: false,
          tags: ["photography", "travel", "art", "creative", "adventure"],
        },
      ];

      // Mock Posts
      const mockPosts: Post[] = [
        {
          id: "1",
          title: "Getting Started with React and TypeScript",
          content:
            "A comprehensive guide to setting up React with TypeScript, covering best practices and common patterns...",
          excerpt:
            "Learn how to set up React with TypeScript and build type-safe applications",
          author: mockUsers[0],
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
          likes: 1245,
          comments: 89,
          shares: 45,
          views: 12500,
          tags: ["react", "typescript", "webdev", "frontend", "programming"],
          category: "technology",
          isLiked: false,
          isBookmarked: false,
          readTime: 8,
          isPublic: true,
        },
        {
          id: "2",
          title: "The Future of Artificial Intelligence in 2024",
          content:
            "Exploring the latest trends and developments in AI technology and what to expect in the coming year...",
          excerpt:
            "Discover the cutting-edge advancements in AI and machine learning",
          author: mockUsers[1],
          createdAt: "2024-01-12T14:20:00Z",
          updatedAt: "2024-01-12T14:20:00Z",
          likes: 3200,
          comments: 156,
          shares: 289,
          views: 45000,
          tags: ["ai", "machinelearning", "technology", "future", "innovation"],
          category: "technology",
          isLiked: true,
          isBookmarked: true,
          readTime: 12,
          isPublic: true,
        },
        {
          id: "3",
          title: "Travel Photography: Capturing the Perfect Shot",
          content:
            "Essential techniques and gear recommendations for stunning travel photography...",
          excerpt:
            "Master the art of travel photography with these expert tips",
          author: mockUsers[2],
          createdAt: "2024-01-10T11:20:00Z",
          updatedAt: "2024-01-10T11:20:00Z",
          likes: 1500,
          comments: 92,
          shares: 56,
          views: 18000,
          tags: ["photography", "travel", "art", "creative", "tips"],
          category: "photography",
          isLiked: true,
          isBookmarked: false,
          readTime: 7,
          isPublic: true,
        },
      ];

      setUsers(mockUsers);
      setPosts(mockPosts);
      setFilteredUsers(mockUsers);
      setFilteredPosts(mockPosts);

      // Extract and combine tags
      const userTags = mockUsers.flatMap((user) =>
        user.tags.map((tag) => ({
          id: `user-${tag}`,
          name: tag,
          type: "user" as const,
          count: 1,
        }))
      );

      const postTags = mockPosts.flatMap((post) =>
        post.tags.map((tag) => ({
          id: `post-${tag}`,
          name: tag,
          type: "post" as const,
          count: 1,
        }))
      );

      // Combine and count tags
      const allTagsMap = new Map();
      [...userTags, ...postTags].forEach((tag) => {
        const existing = allTagsMap.get(tag.name);
        if (existing) {
          existing.count += 1;
        } else {
          allTagsMap.set(tag.name, { ...tag, count: 1 });
        }
      });

      const combinedTags = Array.from(allTagsMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 tags

      setAllTags(combinedTags);

      // Extract categories
      const uniqueCategories = Array.from(
        new Set(mockPosts.map((post) => post.category))
      );
      setCategories(uniqueCategories);

      setIsLoading(false);
    };

    initializeData();
  }, []);

  // Optimized filtering with useMemo
  const { filteredUsers: memoizedUsers, filteredPosts: memoizedPosts } =
    useMemo(() => {
      if (isLoading) return { filteredUsers: [], filteredPosts: [] };

      let usersResult = [...users];
      let postsResult = [...posts];

      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        usersResult = usersResult.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query) ||
            user.bio.toLowerCase().includes(query) ||
            user.tags.some((tag) => tag.toLowerCase().includes(query))
        );
        postsResult = postsResult.filter(
          (post) =>
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query) ||
            post.tags.some((tag) => tag.toLowerCase().includes(query)) ||
            post.author.name.toLowerCase().includes(query)
        );
      }

      // Tags filter
      if (filters.tags.length > 0) {
        usersResult = usersResult.filter((user) =>
          filters.tags.some((tag) => user.tags.includes(tag))
        );
        postsResult = postsResult.filter((post) =>
          filters.tags.some((tag) => post.tags.includes(tag))
        );
      }

      // Location filter (users only)
      if (filters.location) {
        usersResult = usersResult.filter((user) =>
          user.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      // Category filter (posts only)
      if (filters.category !== "all") {
        postsResult = postsResult.filter(
          (post) => post.category === filters.category
        );
      }

      // Followers range (users only)
      usersResult = usersResult.filter(
        (user) =>
          user.followers >= filters.minFollowers &&
          user.followers <= filters.maxFollowers
      );

      // Likes range (posts only)
      postsResult = postsResult.filter(
        (post) =>
          post.likes >= filters.minLikes && post.likes <= filters.maxLikes
      );

      // Verified filter (users only)
      if (filters.verifiedOnly) {
        usersResult = usersResult.filter((user) => user.isVerified);
      }

      // Read time filter (posts only)
      if (filters.readTime !== "any") {
        postsResult = postsResult.filter((post) => {
          switch (filters.readTime) {
            case "short":
              return post.readTime <= 5;
            case "medium":
              return post.readTime > 5 && post.readTime <= 10;
            case "long":
              return post.readTime > 10;
            default:
              return true;
          }
        });
      }

      // Date range filter
      const now = new Date();
      if (filters.dateRange !== "any") {
        const filterDate = (dateString: string) => {
          const date = new Date(dateString);
          const diffTime = Math.abs(now.getTime() - date.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          switch (filters.dateRange) {
            case "today":
              return diffDays <= 1;
            case "week":
              return diffDays <= 7;
            case "month":
              return diffDays <= 30;
            case "year":
              return diffDays <= 365;
            default:
              return true;
          }
        };

        usersResult = usersResult.filter((user) => filterDate(user.joinDate));
        postsResult = postsResult.filter((post) => filterDate(post.createdAt));
      }

      // Sorting
      const sortItems = (items: any[], type: "user" | "post") => {
        return items.sort((a, b) => {
          switch (filters.sortBy) {
            case "popular":
              return type === "user"
                ? b.followers - a.followers
                : b.likes +
                    b.comments +
                    b.shares -
                    (a.likes + a.comments + a.shares);
            case "recent":
              return (
                new Date(
                  b[type === "user" ? "joinDate" : "createdAt"]
                ).getTime() -
                new Date(
                  a[type === "user" ? "joinDate" : "createdAt"]
                ).getTime()
              );
            case "likes":
              return type === "post" ? b.likes - a.likes : 0;
            case "followers":
              return type === "user" ? b.followers - a.followers : 0;
            case "name":
              return type === "user"
                ? a.name.localeCompare(b.name)
                : a.title.localeCompare(b.title);
            case "relevance":
            default:
              return 0;
          }
        });
      };

      usersResult = sortItems(usersResult, "user");
      postsResult = sortItems(postsResult, "post");

      return { filteredUsers: usersResult, filteredPosts: postsResult };
    }, [users, posts, filters, isLoading]);

  // Update filtered results when memoized results change
  useEffect(() => {
    setFilteredUsers(memoizedUsers);
    setFilteredPosts(memoizedPosts);
  }, [memoizedUsers, memoizedPosts]);

  // Handlers
  const handleFilterChange = useCallback(
    (key: keyof SearchFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleTagToggle = useCallback((tagName: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter((t) => t !== tagName)
        : [...prev.tags, tagName],
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      query: "",
      contentType: "all",
      tags: [],
      category: "all",
      location: "",
      minFollowers: 0,
      maxFollowers: 1000000,
      minLikes: 0,
      maxLikes: 100000,
      dateRange: "any",
      sortBy: "relevance",
      verifiedOnly: false,
      readTime: "any",
    });
  }, []);

  const handleFollow = useCallback((userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              isFollowing: !user.isFollowing,
              followers: user.isFollowing
                ? user.followers - 1
                : user.followers + 1,
            }
          : user
      )
    );
  }, []);

  const handleLike = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  }, []);

  const handleBookmark = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  }, []);

  const handleUserClick = useCallback(
    (userId: string) => {
      navigate(`/profile/${userId}`);
    },
    [navigate]
  );

  const handlePostClick = useCallback((post: Post) => {
    setSelectedItem({ type: "post", data: post });
  }, []);

  const handleAuthorClick = useCallback(
    (authorId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/profile/${authorId}`);
    },
    [navigate]
  );

  // Utility functions
  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  }, []);

  const getTimeAgo = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }, []);

  const getCategoryIcon = useCallback((category: string): string => {
    const icons: { [key: string]: string } = {
      programming: "💻",
      technology: "🔧",
      health: "🏥",
      photography: "📸",
      design: "🎨",
      lifestyle: "🌟",
      business: "💼",
      science: "🔬",
    };
    return icons[category] || "📄";
  }, []);

  // Determine which content to show based on active tab and filters
  const showUsers =
    filters.contentType === "all" || filters.contentType === "users";
  const showPosts =
    filters.contentType === "all" || filters.contentType === "posts";

  const hasActiveFilters =
    filters.query ||
    filters.tags.length > 0 ||
    filters.category !== "all" ||
    filters.location ||
    filters.verifiedOnly ||
    filters.contentType !== "all";

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Explore</h1>
          <p className="text-slate-400 mt-2">
            Discover amazing content and connect with people
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-slate-800/50 rounded-2xl border border-purple-500/20 backdrop-blur-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users, posts, tags..."
                  value={filters.query}
                  onChange={(e) => handleFilterChange("query", e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                  🔍
                </div>
              </div>
            </div>

            {/* Content Type Tabs */}
            <div className="flex bg-slate-700/50 rounded-xl p-1">
              {(["all", "users", "posts"] as ContentType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    handleFilterChange("contentType", tab);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                    filters.contentType === tab
                      ? "text-white bg-purple-500 shadow-lg shadow-purple-500/25"
                      : "text-slate-300 hover:text-white hover:bg-slate-600/50"
                  }`}
                >
                  {tab === "all" ? "All" : tab}
                </button>
              ))}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto px-6 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl hover:bg-slate-600/50 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Filters</span>
              <span
                className={`transform transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="lg:w-auto px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-200"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Location */}
                {showUsers && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="City, Country"
                      value={filters.location}
                      onChange={(e) =>
                        handleFilterChange("location", e.target.value)
                      }
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Category */}
                {showPosts && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        handleFilterChange("category", e.target.value)
                      }
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {getCategoryIcon(category)}{" "}
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) =>
                      handleFilterChange("dateRange", e.target.value)
                    }
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  >
                    <option value="any">Any Time</option>
                    <option value="today">Today</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                    <option value="year">Past Year</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
                    {showUsers && (
                      <option value="followers">Most Followers</option>
                    )}
                    {showPosts && <option value="likes">Most Likes</option>}
                    <option value="popular">Most Popular</option>
                    <option value="recent">Most Recent</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>

                {/* Followers Range */}
                {showUsers && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Followers: {formatNumber(filters.minFollowers)} -{" "}
                      {formatNumber(filters.maxFollowers)}
                    </label>
                    <div className="flex space-x-4 items-center">
                      <input
                        type="range"
                        min="0"
                        max="1000000"
                        step="1000"
                        value={filters.minFollowers}
                        onChange={(e) =>
                          handleFilterChange(
                            "minFollowers",
                            parseInt(e.target.value)
                          )
                        }
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="0"
                        max="1000000"
                        step="1000"
                        value={filters.maxFollowers}
                        onChange={(e) =>
                          handleFilterChange(
                            "maxFollowers",
                            parseInt(e.target.value)
                          )
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}

                {/* Likes Range */}
                {showPosts && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Likes: {formatNumber(filters.minLikes)} -{" "}
                      {formatNumber(filters.maxLikes)}
                    </label>
                    <div className="flex space-x-4 items-center">
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="1000"
                        value={filters.minLikes}
                        onChange={(e) =>
                          handleFilterChange(
                            "minLikes",
                            parseInt(e.target.value)
                          )
                        }
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="1000"
                        value={filters.maxLikes}
                        onChange={(e) =>
                          handleFilterChange(
                            "maxLikes",
                            parseInt(e.target.value)
                          )
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tags Filter */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Popular Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.name)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                        filters.tags.includes(tag.name)
                          ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                      }`}
                    >
                      <span>#{tag.name}</span>
                      <span className="text-xs opacity-75">({tag.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Filters */}
              <div className="mt-6 flex flex-wrap gap-4">
                {showUsers && (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.verifiedOnly}
                      onChange={(e) =>
                        handleFilterChange("verifiedOnly", e.target.checked)
                      }
                      className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm text-slate-300">
                      Verified Users Only
                    </span>
                  </label>
                )}
                {showPosts && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Read Time
                    </label>
                    <select
                      value={filters.readTime}
                      onChange={(e) =>
                        handleFilterChange("readTime", e.target.value)
                      }
                      className="bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="any">Any Length</option>
                      <option value="short">Short (1-5 min)</option>
                      <option value="medium">Medium (5-10 min)</option>
                      <option value="long">Long (10+ min)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-full text-sm flex items-center space-x-1"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="hover:text-purple-300"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.verifiedOnly && (
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-sm flex items-center space-x-1">
                <span>Verified</span>
                <button
                  onClick={() => handleFilterChange("verifiedOnly", false)}
                  className="hover:text-blue-300"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category !== "all" && (
              <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full text-sm flex items-center space-x-1">
                <span>{filters.category}</span>
                <button
                  onClick={() => handleFilterChange("category", "all")}
                  className="hover:text-green-300"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-slate-400">
            Found{" "}
            {showUsers && (
              <span className="text-white font-semibold">
                {filteredUsers.length} users
              </span>
            )}
            {showUsers && showPosts && <span> and </span>}
            {showPosts && (
              <span className="text-white font-semibold">
                {filteredPosts.length} posts
              </span>
            )}
            {filters.query && ` for "${filters.query}"`}
          </p>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 animate-pulse"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700 rounded mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="h-3 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-4/5"></div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 && filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No results found
            </h3>
            <p className="text-slate-400 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600 transition-all duration-200"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Users Section */}
            {showUsers && filteredUsers.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="w-2 h-8 bg-cyan-500 rounded-full mr-3"></span>
                  Users ({filteredUsers.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onFollow={handleFollow}
                      onClick={handleUserClick}
                      formatNumber={formatNumber}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Posts Section */}
            {showPosts && filteredPosts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="w-2 h-8 bg-purple-500 rounded-full mr-3"></span>
                  Posts ({filteredPosts.length})
                </h2>
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onBookmark={handleBookmark}
                      onClick={handlePostClick}
                      onAuthorClick={handleAuthorClick}
                      formatNumber={formatNumber}
                      getTimeAgo={getTimeAgo}
                      getCategoryIcon={getCategoryIcon}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-slate-800 rounded-2xl border border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.type === "post" && (
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedItem.data.title}
                  </h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-slate-300 whitespace-pre-line">
                  {selectedItem.data.content}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// User Card Component
const UserCard = ({ user, onFollow, onClick, formatNumber }: any) => (
  <div
    className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-200 cursor-pointer group"
    onClick={() => onClick(user.id)}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
          {user.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs">
              ✓
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors duration-200">
            {user.name}
          </h3>
          <p className="text-slate-400 text-sm">@{user.username}</p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFollow(user.id);
        }}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          user.isFollowing
            ? "bg-slate-700/50 text-slate-300 hover:bg-red-500/20 hover:text-red-400 border border-slate-600 hover:border-red-500/30"
            : "bg-cyan-500 text-white hover:bg-cyan-600 border border-cyan-500"
        }`}
      >
        {user.isFollowing ? "Unfollow" : "Follow"}
      </button>
    </div>

    <p className="text-slate-300 text-sm mb-4 line-clamp-2">{user.bio}</p>

    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
      <span>{user.location}</span>
      <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
    </div>

    <div className="flex items-center justify-between text-sm mb-4">
      <div className="text-center">
        <div className="font-semibold text-white">
          {formatNumber(user.followers)}
        </div>
        <div className="text-slate-400">Followers</div>
      </div>
      <div className="text-center">
        <div className="font-semibold text-white">
          {formatNumber(user.following)}
        </div>
        <div className="text-slate-400">Following</div>
      </div>
      <div className="text-center">
        <div className="font-semibold text-white">{user.posts}</div>
        <div className="text-slate-400">Posts</div>
      </div>
    </div>

    <div className="flex flex-wrap gap-1">
      {user.tags.slice(0, 3).map((tag: string) => (
        <span
          key={tag}
          className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs"
        >
          #{tag}
        </span>
      ))}
      {user.tags.length > 3 && (
        <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded-lg text-xs">
          +{user.tags.length - 3}
        </span>
      )}
    </div>
  </div>
);

// Post Card Component
const PostCard = ({
  post,
  onLike,
  onBookmark,
  onClick,
  onAuthorClick,
  formatNumber,
  getTimeAgo,
  getCategoryIcon,
}: any) => (
  <div
    className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 cursor-pointer group"
    onClick={() => onClick(post)}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div
          className="w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer"
          onClick={(e) => onAuthorClick(post.author.id, e)}
        >
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            post.author.name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3
              className="font-semibold text-white hover:text-purple-400 transition-colors duration-200 cursor-pointer"
              onClick={(e) => onAuthorClick(post.author.id, e)}
            >
              {post.author.name}
            </h3>
            {post.author.isVerified && (
              <span className="text-blue-400 text-sm" title="Verified">
                ✓
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-slate-400 text-sm">
            <span>@{post.author.username}</span>
            <span>•</span>
            <span>{getTimeAgo(post.createdAt)}</span>
            <span>•</span>
            <span>{post.readTime} min read</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs flex items-center space-x-1">
          <span>{getCategoryIcon(post.category)}</span>
          <span>{post.category}</span>
        </span>
      </div>
    </div>

    <div className="mb-4">
      <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors duration-200">
        {post.title}
      </h2>
      <p className="text-slate-300 line-clamp-3">{post.excerpt}</p>
    </div>

    <div className="flex flex-wrap gap-2 mb-4">
      {post.tags.map((tag: string) => (
        <span
          key={tag}
          className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs"
        >
          #{tag}
        </span>
      ))}
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
      <div className="flex items-center space-x-6 text-slate-400">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(post.id);
          }}
          className={`flex items-center space-x-2 transition-all duration-200 ${
            post.isLiked ? "text-red-500" : "hover:text-red-400"
          }`}
        >
          <span className="text-lg">{post.isLiked ? "❤️" : "🤍"}</span>
          <span>{formatNumber(post.likes)}</span>
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center space-x-2 hover:text-blue-400 transition-all duration-200"
        >
          <span className="text-lg">💬</span>
          <span>{formatNumber(post.comments)}</span>
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center space-x-2 hover:text-green-400 transition-all duration-200"
        >
          <span className="text-lg">🔄</span>
          <span>{formatNumber(post.shares)}</span>
        </button>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBookmark(post.id);
        }}
        className={`p-2 rounded-xl transition-all duration-200 ${
          post.isBookmarked
            ? "text-yellow-500 bg-yellow-500/20 border border-yellow-500/30"
            : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-500/10"
        }`}
      >
        {post.isBookmarked ? "🔖" : "📑"}
      </button>
    </div>
  </div>
);
