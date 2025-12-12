import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
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
        type: 'image' | 'video';
        url: string;
        thumbnail?: string;
    }[];
    readTime: number;
    isPublic: boolean;
}

interface SearchFilters {
    query: string;
    category: string;
    tags: string[];
    author: string;
    minLikes: number;
    maxLikes: number;
    dateRange: string; // 'any' | 'today' | 'week' | 'month' | 'year'
    sortBy: 'relevance' | 'popular' | 'recent' | 'likes' | 'comments';
    contentType: 'all' | 'text' | 'image' | 'video';
    readTime: string; // 'any' | 'short' | 'medium' | 'long'
}

export default function PostSearchPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
        category: 'all',
        tags: [],
        author: '',
        minLikes: 0,
        maxLikes: 100000,
        dateRange: 'any',
        sortBy: 'relevance',
        contentType: 'all',
        readTime: 'any'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const navigate = useNavigate();

    // Mock data - replace with actual API call
    useEffect(() => {
        const mockPosts: Post[] = [
            {
                id: '1',
                title: 'Getting Started with React and TypeScript',
                content: 'A comprehensive guide to setting up React with TypeScript, covering best practices and common patterns...',
                excerpt: 'Learn how to set up React with TypeScript and build type-safe applications',
                author: {
                    id: '1',
                    name: 'John Doe',
                    username: 'johndoe',
                    avatar: '',
                    isVerified: true
                },
                createdAt: '2024-01-15T10:30:00Z',
                updatedAt: '2024-01-15T10:30:00Z',
                likes: 1245,
                comments: 89,
                shares: 45,
                views: 12500,
                tags: ['react', 'typescript', 'webdev', 'frontend'],
                category: 'programming',
                isLiked: false,
                isBookmarked: false,
                readTime: 8,
                isPublic: true
            },
            {
                id: '2',
                title: 'The Future of Artificial Intelligence in 2024',
                content: 'Exploring the latest trends and developments in AI technology and what to expect in the coming year...',
                excerpt: 'Discover the cutting-edge advancements in AI and machine learning',
                author: {
                    id: '2',
                    name: 'Sarah Wilson',
                    username: 'sarahw',
                    avatar: '',
                    isVerified: true
                },
                createdAt: '2024-01-12T14:20:00Z',
                updatedAt: '2024-01-12T14:20:00Z',
                likes: 3200,
                comments: 156,
                shares: 289,
                views: 45000,
                tags: ['ai', 'machinelearning', 'technology', 'future'],
                category: 'technology',
                isLiked: true,
                isBookmarked: true,
                media: [
                    {
                        type: 'image',
                        url: '/ai-future.jpg',
                        thumbnail: '/ai-future-thumb.jpg'
                    }
                ],
                readTime: 12,
                isPublic: true
            },
            {
                id: '3',
                title: 'Healthy Eating Habits for Busy Professionals',
                content: 'Practical tips and meal prep ideas for maintaining a healthy diet while managing a busy schedule...',
                excerpt: 'Simple strategies to eat healthy even with a packed schedule',
                author: {
                    id: '3',
                    name: 'Mike Chen',
                    username: 'mikechen',
                    avatar: '',
                    isVerified: false
                },
                createdAt: '2024-01-10T09:15:00Z',
                updatedAt: '2024-01-10T09:15:00Z',
                likes: 890,
                comments: 67,
                shares: 34,
                views: 12000,
                tags: ['health', 'nutrition', 'wellness', 'lifestyle'],
                category: 'health',
                isLiked: false,
                isBookmarked: false,
                readTime: 6,
                isPublic: true
            },
            {
                id: '4',
                title: 'Building Scalable Microservices Architecture',
                content: 'A deep dive into designing and implementing microservices that can scale with your business needs...',
                excerpt: 'Learn the principles of building scalable microservices systems',
                author: {
                    id: '4',
                    name: 'Emma Davis',
                    username: 'emmad',
                    avatar: '',
                    isVerified: true
                },
                createdAt: '2024-01-08T16:45:00Z',
                updatedAt: '2024-01-08T16:45:00Z',
                likes: 2100,
                comments: 134,
                shares: 78,
                views: 28000,
                tags: ['microservices', 'architecture', 'backend', 'scalability'],
                category: 'programming',
                isLiked: false,
                isBookmarked: true,
                readTime: 15,
                isPublic: true
            },
            {
                id: '5',
                title: 'Travel Photography: Capturing the Perfect Shot',
                content: 'Essential techniques and gear recommendations for stunning travel photography...',
                excerpt: 'Master the art of travel photography with these expert tips',
                author: {
                    id: '5',
                    name: 'Alex Rodriguez',
                    username: 'alexr',
                    avatar: '',
                    isVerified: true
                },
                createdAt: '2024-01-05T11:20:00Z',
                updatedAt: '2024-01-05T11:20:00Z',
                likes: 1500,
                comments: 92,
                shares: 56,
                views: 18000,
                tags: ['photography', 'travel', 'art', 'creative'],
                category: 'photography',
                isLiked: true,
                isBookmarked: false,
                media: [
                    {
                        type: 'image',
                        url: '/travel-photo.jpg',
                        thumbnail: '/travel-photo-thumb.jpg'
                    }
                ],
                readTime: 7,
                isPublic: true
            },
            {
                id: '6',
                title: 'The Psychology of User Experience Design',
                content: 'Understanding how psychological principles can inform better UX design decisions...',
                excerpt: 'Explore the intersection of psychology and user experience design',
                author: {
                    id: '6',
                    name: 'Lisa Thompson',
                    username: 'lisat',
                    avatar: '',
                    isVerified: false
                },
                createdAt: '2024-01-03T13:10:00Z',
                updatedAt: '2024-01-03T13:10:00Z',
                likes: 980,
                comments: 45,
                shares: 23,
                views: 9500,
                tags: ['ux', 'design', 'psychology', 'usability'],
                category: 'design',
                isLiked: false,
                isBookmarked: false,
                readTime: 10,
                isPublic: true
            },
            {
                id: '7',
                title: 'Sustainable Living: Small Changes, Big Impact',
                content: 'Practical ways to reduce your environmental footprint and live more sustainably...',
                excerpt: 'Simple changes you can make today for a more sustainable lifestyle',
                author: {
                    id: '2',
                    name: 'Sarah Wilson',
                    username: 'sarahw',
                    avatar: '',
                    isVerified: true
                },
                createdAt: '2024-01-02T08:30:00Z',
                updatedAt: '2024-01-02T08:30:00Z',
                likes: 2100,
                comments: 178,
                shares: 345,
                views: 32000,
                tags: ['sustainability', 'environment', 'lifestyle', 'eco-friendly'],
                category: 'lifestyle',
                isLiked: true,
                isBookmarked: true,
                readTime: 9,
                isPublic: true
            },
            {
                id: '8',
                title: 'Advanced JavaScript Patterns and Techniques',
                content: 'Exploring advanced JavaScript patterns that can improve your code quality and performance...',
                excerpt: 'Level up your JavaScript skills with these advanced patterns',
                author: {
                    id: '1',
                    name: 'John Doe',
                    username: 'johndoe',
                    avatar: '',
                    isVerified: true
                },
                createdAt: '2024-01-01T15:45:00Z',
                updatedAt: '2024-01-01T15:45:00Z',
                likes: 1800,
                comments: 112,
                shares: 67,
                views: 22000,
                tags: ['javascript', 'programming', 'webdev', 'patterns'],
                category: 'programming',
                isLiked: false,
                isBookmarked: false,
                readTime: 14,
                isPublic: true
            }
        ];

        setPosts(mockPosts);
        setFilteredPosts(mockPosts);

        // Extract unique tags and categories
        const allTags = Array.from(new Set(mockPosts.flatMap(post => post.tags)));
        const allCategories = Array.from(new Set(mockPosts.map(post => post.category)));

        setAvailableTags(allTags);
        setAvailableCategories(allCategories);

        setIsLoading(false);
    }, []);

    // Filter and sort posts
    useMemo(() => {
        let result = [...posts];

        // Text search
        if (filters.query) {
            const query = filters.query.toLowerCase();
            result = result.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query)) ||
                post.author.name.toLowerCase().includes(query) ||
                post.author.username.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (filters.category !== 'all') {
            result = result.filter(post => post.category === filters.category);
        }

        // Tags filter
        if (filters.tags.length > 0) {
            result = result.filter(post =>
                filters.tags.some(tag => post.tags.includes(tag))
            );
        }

        // Author filter
        if (filters.author) {
            result = result.filter(post =>
                post.author.name.toLowerCase().includes(filters.author.toLowerCase()) ||
                post.author.username.toLowerCase().includes(filters.author.toLowerCase())
            );
        }

        // Likes range
        result = result.filter(post =>
            post.likes >= filters.minLikes &&
            post.likes <= filters.maxLikes
        );

        // Date range filter
        const now = new Date();
        if (filters.dateRange !== 'any') {
            result = result.filter(post => {
                const postDate = new Date(post.createdAt);
                const diffTime = Math.abs(now.getTime() - postDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch (filters.dateRange) {
                    case 'today': return diffDays <= 1;
                    case 'week': return diffDays <= 7;
                    case 'month': return diffDays <= 30;
                    case 'year': return diffDays <= 365;
                    default: return true;
                }
            });
        }

        // Content type filter
        if (filters.contentType !== 'all') {
            result = result.filter(post => {
                switch (filters.contentType) {
                    case 'text': return !post.media || post.media.length === 0;
                    case 'image': return post.media?.some(m => m.type === 'image');
                    case 'video': return post.media?.some(m => m.type === 'video');
                    default: return true;
                }
            });
        }

        // Read time filter
        if (filters.readTime !== 'any') {
            result = result.filter(post => {
                switch (filters.readTime) {
                    case 'short': return post.readTime <= 5;
                    case 'medium': return post.readTime > 5 && post.readTime <= 10;
                    case 'long': return post.readTime > 10;
                    default: return true;
                }
            });
        }

        // Sorting
        result.sort((a, b) => {
            switch (filters.sortBy) {
                case 'popular':
                    return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares);
                case 'recent':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'likes':
                    return b.likes - a.likes;
                case 'comments':
                    return b.comments - a.comments;
                case 'relevance':
                default:
                    return 0;
            }
        });

        setFilteredPosts(result);
    }, [posts, filters]);

    const handleFilterChange = (key: keyof SearchFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleTagToggle = (tag: string) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const clearAllFilters = () => {
        setFilters({
            query: '',
            category: 'all',
            tags: [],
            author: '',
            minLikes: 0,
            maxLikes: 100000,
            dateRange: 'any',
            sortBy: 'relevance',
            contentType: 'all',
            readTime: 'any'
        });
    };

    const handleLike = (postId: string) => {
        setPosts(prev => prev.map(post =>
            post.id === postId
                ? {
                    ...post,
                    isLiked: !post.isLiked,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1
                }
                : post
        ));
    };

    const handleBookmark = (postId: string) => {
        setPosts(prev => prev.map(post =>
            post.id === postId
                ? { ...post, isBookmarked: !post.isBookmarked }
                : post
        ));
    };

    const handlePostClick = (post: Post) => {
        setSelectedPost(post);
    };

    const handleAuthorClick = (authorId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/profile/${authorId}`);
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const getTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    const getCategoryIcon = (category: string): string => {
        const icons: { [key: string]: string } = {
            programming: '💻',
            technology: '🔧',
            health: '🏥',
            photography: '📸',
            design: '🎨',
            lifestyle: '🌟',
            business: '💼',
            science: '🔬'
        };
        return icons[category] || '📄';
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white pt-20 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Discover Posts</h1>
                    <p className="text-slate-400 mt-2">Find interesting content from across the platform</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-slate-800/50 rounded-2xl border border-purple-500/20 backdrop-blur-xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search posts by title, content, tags, or author..."
                                    value={filters.query}
                                    onChange={(e) => handleFilterChange('query', e.target.value)}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                                    🔍
                                </div>
                            </div>
                        </div>

                        {/* Filter Toggle Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:w-auto px-6 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl hover:bg-slate-600/50 transition-all duration-200 flex items-center space-x-2"
                        >
                            <span>Filters</span>
                            <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>

                        {/* Clear Filters */}
                        {(filters.query || filters.category !== 'all' || filters.tags.length > 0 || filters.author || filters.contentType !== 'all') && (
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
                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                    >
                                        <option value="all">All Categories</option>
                                        {availableCategories.map(category => (
                                            <option key={category} value={category}>
                                                {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Author */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Author
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search by author..."
                                        value={filters.author}
                                        onChange={(e) => handleFilterChange('author', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                    />
                                </div>

                                {/* Date Range */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Date Posted
                                    </label>
                                    <select
                                        value={filters.dateRange}
                                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
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
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                    >
                                        <option value="relevance">Relevance</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="recent">Most Recent</option>
                                        <option value="likes">Most Likes</option>
                                        <option value="comments">Most Comments</option>
                                    </select>
                                </div>

                                {/* Content Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Content Type
                                    </label>
                                    <select
                                        value={filters.contentType}
                                        onChange={(e) => handleFilterChange('contentType', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="text">Text Only</option>
                                        <option value="image">With Images</option>
                                        <option value="video">With Videos</option>
                                    </select>
                                </div>

                                {/* Read Time */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Read Time
                                    </label>
                                    <select
                                        value={filters.readTime}
                                        onChange={(e) => handleFilterChange('readTime', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                    >
                                        <option value="any">Any Length</option>
                                        <option value="short">Short (1-5 min)</option>
                                        <option value="medium">Medium (5-10 min)</option>
                                        <option value="long">Long (10+ min)</option>
                                    </select>
                                </div>

                                {/* Likes Range */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Likes: {formatNumber(filters.minLikes)} - {formatNumber(filters.maxLikes)}
                                    </label>
                                    <div className="flex space-x-4 items-center">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100000"
                                            step="1000"
                                            value={filters.minLikes}
                                            onChange={(e) => handleFilterChange('minLikes', parseInt(e.target.value))}
                                            className="flex-1"
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="100000"
                                            step="1000"
                                            value={filters.maxLikes}
                                            onChange={(e) => handleFilterChange('maxLikes', parseInt(e.target.value))}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tags Filter */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-slate-300 mb-3">
                                    Filter by Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => handleTagToggle(tag)}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${filters.tags.includes(tag)
                                                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                                                }`}
                                        >
                                            #{tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Filters */}
                {(filters.tags.length > 0 || filters.category !== 'all' || filters.contentType !== 'all') && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {filters.category !== 'all' && (
                            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-sm flex items-center space-x-1">
                                <span>{filters.category}</span>
                                <button
                                    onClick={() => handleFilterChange('category', 'all')}
                                    className="hover:text-blue-300"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {filters.tags.map(tag => (
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
                        {filters.contentType !== 'all' && (
                            <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full text-sm flex items-center space-x-1">
                                <span>{filters.contentType}</span>
                                <button
                                    onClick={() => handleFilterChange('contentType', 'all')}
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
                        Found <span className="text-white font-semibold">{filteredPosts.length}</span> posts
                        {filters.query && ` for "${filters.query}"`}
                    </p>
                </div>

                {/* Posts Grid */}
                {isLoading ? (
                    <div className="space-y-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 animate-pulse">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-700 rounded mb-2 w-1/3"></div>
                                        <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                                    </div>
                                </div>
                                <div className="h-5 bg-slate-700 rounded mb-3 w-3/4"></div>
                                <div className="h-3 bg-slate-700 rounded mb-2"></div>
                                <div className="h-3 bg-slate-700 rounded w-5/6"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
                        <p className="text-slate-400 mb-6">Try adjusting your search criteria or filters</p>
                        <button
                            onClick={clearAllFilters}
                            className="px-6 py-3 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600 transition-all duration-200"
                        >
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredPosts.map(post => (
                            <div
                                key={post.id}
                                className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 cursor-pointer group"
                                onClick={() => handlePostClick(post)}
                            >
                                {/* Post Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-10 h-10 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer"
                                            onClick={(e) => handleAuthorClick(post.author.id, e)}
                                        >
                                            {post.author.avatar ? (
                                                <img src={post.author.avatar} alt={post.author.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                post.author.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3
                                                    className="font-semibold text-white hover:text-purple-400 transition-colors duration-200 cursor-pointer"
                                                    onClick={(e) => handleAuthorClick(post.author.id, e)}
                                                >
                                                    {post.author.name}
                                                </h3>
                                                {post.author.isVerified && (
                                                    <span className="text-blue-400 text-sm" title="Verified">✓</span>
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

                                {/* Post Content */}
                                <div className="mb-4">
                                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors duration-200">
                                        {post.title}
                                    </h2>
                                    <p className="text-slate-300 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                </div>

                                {/* Media Preview */}
                                {post.media && post.media.length > 0 && (
                                    <div className="mb-4">
                                        <div className="grid grid-cols-2 gap-2 max-w-md">
                                            {post.media.slice(0, 2).map((media, index) => (
                                                <div key={index} className="aspect-video bg-slate-700/50 rounded-lg overflow-hidden">
                                                    {media.type === 'image' ? (
                                                        <div className="w-full h-full bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                                            <span className="text-2xl">🖼️</span>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                                                            <span className="text-2xl">🎥</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Post Stats and Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                    <div className="flex items-center space-x-6 text-slate-400">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLike(post.id);
                                            }}
                                            className={`flex items-center space-x-2 transition-all duration-200 ${post.isLiked ? 'text-red-500' : 'hover:text-red-400'
                                                }`}
                                        >
                                            <span className="text-lg">{post.isLiked ? '❤️' : '🤍'}</span>
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
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg">👁️</span>
                                            <span>{formatNumber(post.views)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBookmark(post.id);
                                        }}
                                        className={`p-2 rounded-xl transition-all duration-200 ${post.isBookmarked
                                                ? 'text-yellow-500 bg-yellow-500/20 border border-yellow-500/30'
                                                : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-500/10'
                                            }`}
                                    >
                                        {post.isBookmarked ? '🔖' : '📑'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Post Detail Modal */}
            {selectedPost && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPost(null)}
                >
                    <div
                        className="bg-slate-800 rounded-2xl border border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Modal content for post details */}
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-white">{selectedPost.title}</h2>
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="text-slate-400 hover:text-white transition-colors duration-200"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-slate-300 whitespace-pre-line">{selectedPost.content}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}