import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Community } from "../types/types";
import {
  getAllCommunities,
  joinCommunity,
  leaveCommunity,
} from "../api/community";
import { CommunityActionModal } from "../model/CommunityActionModal";
import CommunityCard from "../components/card/CommunityCard";
import { ChevronDown, Search } from "lucide-react";

interface CommunityCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface SearchFilters {
  query: string;
  category: string;
  tags: string[];
  minMembers: number;
  maxMembers: number;
  createdDate: string; // 'any' | 'week' | 'month' | 'year'
  sortBy: "popular" | "newest" | "active" | "name";
  hasTags: boolean;
}

export default function Communities() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<any[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<any[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "all",
    tags: [],
    minMembers: 0,
    maxMembers: 1000000,
    createdDate: "any",
    sortBy: "popular",
    hasTags: false,
  });
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"join" | "leave">("join");
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Extract tags from communities data
  const extractTagsFromCommunities = (communityList: any[]): string[] => {
    const tags = new Set<string>();

    communityList.forEach((community) => {
      // Extract from community tags
      if (community.tags && Array.isArray(community.tags)) {
        community.tags.forEach((tag: string) => {
          if (tag && typeof tag === "string") {
            tags.add(tag.toLowerCase());
          }
        });
      }

      // Add category as tag
      if (community.category && community.category !== "uncategorized") {
        tags.add(community.category.toLowerCase());
      }
    });

    return Array.from(tags).slice(0, 20); // Limit to 20 tags
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await getAllCommunities();
        const communitiesData = res.data?.communities || [];
        setCommunities(communitiesData);
        setFilteredCommunities(communitiesData);

        // Extract available tags from all communities
        const allTags = extractTagsFromCommunities(communitiesData);
        setAvailableTags(allTags);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };

    fetchCommunities();
  }, []);

  // Filter and sort communities
  useMemo(() => {
    let result = [...communities];

    // Text search
    if (filters.query) {
      const query = filters.query?.toLowerCase();
      result = result.filter(
        (community) =>
          community.name?.toLowerCase().includes(query) ||
          community.description?.toLowerCase().includes(query) ||
          community.tags?.some((tag: string) =>
            tag.toLowerCase().includes(query)
          )
      );
    }

    // Category filter
    if (filters.category !== "all") {
      result = result.filter(
        (community) => community.category === filters.category
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      result = result.filter((community) =>
        filters.tags.some(
          (tag) => community.tags?.includes(tag) || community.category === tag
        )
      );
    }

    // Members range
    result = result.filter(
      (community) =>
        (community.membersCount || community.members?.length || 0) >=
          filters.minMembers &&
        (community.membersCount || community.members?.length || 0) <=
          filters.maxMembers
    );

    // Created date filter
    const now = new Date();
    if (filters.createdDate !== "any") {
      result = result.filter((community) => {
        const createdDate = new Date(community.createdAt);
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filters.createdDate) {
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

    // Has tags filter
    if (filters.hasTags) {
      result = result.filter(
        (community) => community.tags && community.tags.length > 0
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        case "active":
          return (
            (b.onlineMembers || b.online || 0) -
            (a.onlineMembers || a.online || 0)
          );
        case "popular":
        default:
          return (
            (b.membersCount || b.members?.length || 0) -
            (a.membersCount || a.members?.length || 0)
          );
      }
    });

    setFilteredCommunities(result);
  }, [communities, filters]);

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
      category: "all",
      tags: [],
      minMembers: 0,
      maxMembers: 1000000,
      createdDate: "any",
      sortBy: "popular",
      hasTags: false,
    });
  };

  const handleJoinCommunity = (community: Community) => {
    setSelectedCommunity(community);
    setModalType("join");
    setIsModalOpen(true);
  };

  const confirmJoin = async (communityId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (modalType === "join") {
        await joinCommunity(communityId);
      } else {
        await leaveCommunity(communityId);
      }

      // Refresh communities data
      const res = await getAllCommunities();
      setCommunities(res.data?.communities || []);
      return true;
    } catch (error) {
      console.error(`Error ${modalType}ing community:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCommunity = () => {
    navigate("create");
  };

  // Category icon map
  const categoryIcons: Record<string, string> = {
    technology: "💻",
    gaming: "🎮",
    art: "🎨",
    music: "🎵",
    sports: "⚽",
    science: "🔬",
    business: "💼",
  };

  // Generate dynamic categories based on communities data
  const categoryMap: Record<string, number> = communities.reduce(
    (acc, community) => {
      const category = community.category || "uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const categories: CommunityCategory[] = [
    {
      id: "all",
      name: "All Communities",
      icon: "🌐",
      count: communities.length,
    },
    ...Object.entries(categoryMap).map(([id, count]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      icon: categoryIcons[id] || "🏷️",
      count,
    })),
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-6 pb-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Discover Communities
            </h1>
            <p className="text-slate-400 mt-2">
              Find and join communities that match your interests
            </p>
          </div>
          <button
            onClick={handleCreateCommunity}
            className="mt-4 lg:mt-0 bg-linear-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            Create Community
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-slate-800/50 rounded-2xl border border-purple-500/20 backdrop-blur-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search communities by name, description, or tags..."
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
              className=" w-fit lg:w-auto px-6 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl hover:bg-slate-600/50 transition-all duration-200 flex items-center space-x-2"
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
              filters.category !== "all" ||
              filters.tags.length > 0 ||
              filters.hasTags) && (
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
                {/* Category Filter */}
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
                    {categories
                      .filter((cat) => cat.id !== "all")
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.count})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Members Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Min Members
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minMembers}
                    onChange={(e) =>
                      handleFilterChange(
                        "minMembers",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  />
                </div>

                {/* Created Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Created
                  </label>
                  <select
                    value={filters.createdDate}
                    onChange={(e) =>
                      handleFilterChange("createdDate", e.target.value)
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
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest</option>
                    <option value="active">Most Active</option>
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

              {/* Has Tags Filter */}
              <div className="mt-6 flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasTags}
                    onChange={(e) =>
                      handleFilterChange("hasTags", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  <span className="ml-3 text-sm font-medium text-slate-300">
                    Has Tags Only
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {(filters.tags.length > 0 ||
          filters.hasTags ||
          filters.category !== "all") && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.category !== "all" && (
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-sm flex items-center space-x-1">
                <span>
                  Category:{" "}
                  {categories.find((c) => c.id === filters.category)?.name}
                </span>
                <button
                  onClick={() => handleFilterChange("category", "all")}
                  className="hover:text-blue-300"
                >
                  ×
                </button>
              </span>
            )}
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
            {filters.hasTags && (
              <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full text-sm flex items-center space-x-1">
                <span>Has Tags</span>
                <button
                  onClick={() => handleFilterChange("hasTags", false)}
                  className="hover:text-green-300"
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
              {filteredCommunities.length}
            </span>{" "}
            communities
            {filters.query && ` for "${filters.query}"`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Communities Grid */}
          <div className="flex-1">
            {filteredCommunities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No communities found
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCommunities.map((community) => (
                  <CommunityCard
                    community={community}
                    toggleJoinCommunity={handleJoinCommunity}
                    key={community?._id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Community Action Modal */}
      <CommunityActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        community={selectedCommunity}
        type={modalType}
        onConfirm={confirmJoin}
        isLoading={isLoading}
      />
    </div>
  );
}
