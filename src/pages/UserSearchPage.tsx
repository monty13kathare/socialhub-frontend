import { useState, useEffect, useMemo } from "react";
import { getAllUsers } from "../api/user";
import UserCard from "../components/card/UserCard";
import { ChevronDown, Search } from "lucide-react";

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bannerColor: string;
  bio: string;
  location: { country: string; state: string; city: string };
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

interface SearchFilters {
  query: string;
  location: string;
  tags: string[];
  minFollowers: number;
  maxFollowers: number;
  joinDate: string; // 'any' | 'week' | 'month' | 'year'
  sortBy: "relevance" | "followers" | "recent" | "name";
  verifiedOnly: boolean;
}

export default function UserSearchPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "",
    tags: [],
    minFollowers: 0,
    maxFollowers: 1000000,
    joinDate: "any",
    sortBy: "relevance",
    verifiedOnly: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Extract tags from user data
  const extractTagsFromUsers = (userList: User[]): string[] => {
    const tags = new Set<string>();

    userList.forEach((user) => {
      // Extract tags from bio
      const bioTags = user.bio?.match(/#[\w]+/g) || [];
      bioTags.forEach((tag) => tags.add(tag.replace("#", "")));

      // Add role as tag
      if (user.role && user.role !== "user") {
        tags.add(user.role);
      }

      // Add interests based on communities
      if (user.communities && user.communities.length > 0) {
        user.communities.forEach((community: any) => {
          if (community.name) {
            tags.add(community.name.toLowerCase());
          }
        });
      }
    });

    return Array.from(tags).slice(0, 20); // Limit to 20 tags
  };

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await getAllUsers();

        if (res.data && Array.isArray(res.data)) {
          setUsers(res.data);
          setFilteredUsers(res.data);
          console.log("res.data", res.data);
          // Extract available tags from all users
          const allTags = extractTagsFromUsers(res.data);
          setAvailableTags(allTags);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter and sort users
  useMemo(() => {
    let result = [...users];

    // Text search
    if (filters.query) {
      const query = filters.query?.toLowerCase();
      result = result.filter(
        (user) =>
          user?.name?.toLowerCase()?.includes(query) ||
          user?.username?.toLowerCase()?.includes(query) ||
          user?.bio?.toLowerCase()?.includes(query) ||
          user?.tags?.some((tag) => tag.toLowerCase()?.includes(query))
      );
    }

    // Location filter
    if (filters.location) {
      result = result.filter((user) => user?.location);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      result = result.filter((user) =>
        filters.tags.some((tag) => user.tags?.includes(tag))
      );
    }

    // Followers range
    // result = result.filter(user =>
    //   (user.followers || 0) >= filters.minFollowers &&
    //   (user.followers || 0) <= filters.maxFollowers
    // );

    // Join date filter
    const now = new Date();
    if (filters.joinDate !== "any") {
      result = result.filter((user) => {
        const joinDate = new Date(user.createdAt);
        const diffTime = Math.abs(now.getTime() - joinDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filters.joinDate) {
          case "week":
            return diffDays <= 7;
          case "month":
            return diffDays <= 30;
          case "year":
            return diffDays <= 365;
          default:
            return true;
        }
      });
    }

    // Verified only
    if (filters.verifiedOnly) {
      result = result.filter((user) => user.isVerified);
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "recent":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        case "relevance":
        default:
          return 0;
      }
    });

    setFilteredUsers(result);
  }, [users, filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      query: "",
      location: "",
      tags: [],
      minFollowers: 0,
      maxFollowers: 1000000,
      joinDate: "any",
      sortBy: "relevance",
      verifiedOnly: false,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-6 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Discover Users</h1>
          <p className="text-slate-400 mt-2">
            Find and connect with amazing people
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
                  placeholder="Search users by name, username, bio, or tags..."
                  value={filters.query}
                  onChange={(e) => handleFilterChange("query", e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <Search/>
                </div>
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-fit lg:w-auto px-6 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl hover:bg-slate-600/50 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Filters</span>
              <span
                className={`transform transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              >
                <ChevronDown/>
              </span>
            </button>

            {/* Clear Filters */}
            {(filters.query ||
              filters.location ||
              filters.tags.length > 0 ||
              filters.verifiedOnly) && (
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

                {/* Join Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Joined
                  </label>
                  <select
                    value={filters.joinDate}
                    onChange={(e) =>
                      handleFilterChange("joinDate", e.target.value)
                    }
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  >
                    <option value="any">Any Time</option>
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
                    <option value="followers">Most Followers</option>
                    <option value="recent">Most Recent</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
              </div>

              {/* Tags Filter */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Filter by Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        filters.tags.includes(tag)
                          ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Filter */}
              <div className="mt-6 flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) =>
                      handleFilterChange("verifiedOnly", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  <span className="ml-3 text-sm font-medium text-slate-300">
                    Verified Users Only
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {(filters.tags.length > 0 || filters.verifiedOnly) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-full text-sm flex items-center space-x-1"
              >
                <span>{tag}</span>
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
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-400">
            Found{" "}
            <span className="text-white font-semibold">
              {filteredUsers.length}
            </span>{" "}
            users
            {filters.query && ` for "${filters.query}"`}
          </p>
        </div>

        {/* Users Grid */}
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
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No users found
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
