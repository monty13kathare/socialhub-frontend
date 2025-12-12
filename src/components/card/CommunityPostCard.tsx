import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreVertical,
  Award,
  Code,
  BarChart3,
  Image as ImageIcon,
  FileText,
  Copy,
  Check,
  Globe,
  Lock,
  Users,
  Clock,
  Zap,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/helper';

interface CommunityPostCardProps {
  post: any;
  isAdmin: any;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onVote?: (postId: string, optionIndex: number) => void;
  onFollow?: (communityName: string) => void;
}

const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  post,
  isAdmin,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onVote,
  onFollow
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Post type configurations
  const postTypeConfig:any = {
    text: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    image: { icon: ImageIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    code: { icon: Code, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    poll: { icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    achievement: { icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    link: { icon: ExternalLink, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
  };

  // Role configurations
  const roleConfig = {
    admin: { label: 'Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    moderator: { label: 'Mod', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    creator: { label: 'Creator', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    member: { label: 'Member', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
  };

  // Format time
//   const formatTime = (dateString: string) => {
//     return formatDistanceToNow(new Date(dateString), { addSuffix: true });
//   };

  // Handle code copy
  const handleCopyCode = async () => {
    if (post.code) {
      await navigator.clipboard.writeText(post.code.code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Render post type badge
  const PostTypeBadge = () => {
    const { icon: Icon, color, bg } = postTypeConfig[post?.type] || postTypeConfig.text;
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bg} border border-transparent`}>
        <Icon size={14} className={color} />
        <span className={`text-xs font-medium ${color} capitalize`}>{post.type}</span>
      </div>
    );
  };

  // Render community badge
  const CommunityBadge = () => (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <div className="w-6 h-6 rounded-md overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
        {post.community.avatar ? (
          <img src={post.community.avatar} alt={post.community.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
            {/* {post.community.name.charAt(0)} */}
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-white">{post.community.name}</span>
      {post.community.isPrivate ? (
        <Lock size={12} className="text-slate-400" />
      ) : (
        <Globe size={12} className="text-slate-400" />
      )}
    </div>
  );

  // Render author role badge
  const RoleBadge = () => {
    const role = isAdmin ? "admin" : 'member';
    const { label, color } = roleConfig[role as keyof typeof roleConfig] || roleConfig.member;
    return (
      <span className={`px-2 py-0.5 text-xs rounded-md border ${color}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="group relative">
      {/* Featured/Pinned Indicator */}
      {(post.isPinned || post.isFeatured) && (
        <div className="absolute -top-3 -left-3 z-10">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${post.isPinned ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-purple-500/20 border border-purple-500/30'}`}>
            <Zap size={12} className={post.isPinned ? 'text-amber-400' : 'text-purple-400'} />
            <span className={`text-xs font-medium ${post.isPinned ? 'text-amber-400' : 'text-purple-400'}`}>
              {post.isPinned ? '📌 Pinned' : '✨ Featured'}
            </span>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3 flex-1">
            {/* Author Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-500">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {post.author.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Author Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="text-white font-semibold">{post.author.name}</h4>
                <RoleBadge />
                <PostTypeBadge />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <span>{formatTimeAgo(post.createdAt)}</span>
                {/* {post.updatedAt && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500">Edited</span>
                  </>
                )} */}
                {post.views !== undefined && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {post.views.toLocaleString()} views
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Community & Actions */}
          <div className="flex items-center gap-3">
            <CommunityBadge />
            <div className="relative">
              <button
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <MoreVertical size={18} />
              </button>
              {showMoreOptions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-50">
                  <button className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 text-left">
                    Report Post
                  </button>
                  <button className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 text-left">
                    Save to Collection
                  </button>
                  <button className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 text-left">
                    Hide Post
                  </button>
                  <div className="border-t border-slate-700 my-1"></div>
                  <button className="w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700 text-left">
                    Block Author
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          {/* Text Content */}
          <p className="text-slate-200 leading-relaxed whitespace-pre-line mb-4">
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag:any, index:any) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full border border-slate-600/50 hover:border-purple-500/50 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Image Content */}
          {post.image && (
            <div className="rounded-xl overflow-hidden mb-4 border border-slate-700/50">
              <img
                src={post.image.url}
                alt={post.image.alt || 'Post image'}
                className="w-full h-auto max-h-96 object-cover cursor-pointer hover:scale-[1.01] transition-transform duration-300"
              />
            </div>
          )}

          {/* Code Content */}
          {post.code && (
            <div className="mb-4 rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/50">
              {/* Code Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-300">
                    {post.code.language}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 ${isCopied
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-600/50 hover:text-white'
                    }`}
                >
                  {isCopied ? (
                    <>
                      <Check size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy Code
                    </>
                  )}
                </button>
              </div>

              {/* Code Block */}
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm text-slate-200 font-mono whitespace-pre">
                  <code>{post.code.code}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Poll Content */}
          {post.poll && (
            <div className="mb-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-white font-semibold text-lg">{post.poll.question}</h5>
                {post.poll.endsAt && (
                  <div className="flex items-center gap-1 text-sm text-amber-400">
                    <Clock size={14} />
                    <span>Ends {formatTimeAgo(post.poll.endsAt)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {post.poll.options.map((option:any, index:any) => (
                  <button
                    key={index}
                    onClick={() => onVote?.(post._id, index)}
                    disabled={post.poll?.userVoted}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 relative overflow-hidden ${post.poll?.userVoted
                        ? 'bg-slate-700/50 border-slate-600'
                        : 'hover:border-purple-500/50 border-slate-700/50 hover:bg-slate-700/30'
                      }`}
                  >
                    {post.poll?.userVoted && (
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                        style={{ width: `${option.percentage}%` }}
                      ></div>
                    )}
                    <div className="relative flex items-center justify-between">
                      <span className="text-slate-200">{option.text}</span>
                      {post.poll?.userVoted && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 text-sm">{option.votes} votes</span>
                          <span className="text-white font-semibold bg-slate-700/50 px-2 py-1 rounded text-xs">
                            {option.percentage}%
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
                <span className="text-slate-400 text-sm">
                  {post.poll.totalVotes.toLocaleString()} votes
                </span>
                {post.poll.userVoted ? (
                  <span className="flex items-center gap-1 text-sm text-green-400">
                    <Check size={14} />
                    You voted
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">Click to vote</span>
                )}
              </div>
            </div>
          )}

          {/* Achievement Content */}
          {post.achievement && (
            <div className="mb-4 p-4 rounded-xl border border-slate-700/50 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white text-xl">
                  🏆
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-white font-semibold">{post.achievement.title}</h5>
                    {post.achievement.level && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">
                        {post.achievement.level}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm mb-3">{post.achievement.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.achievement.tags.map((tag:any, index:any) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-lg border border-yellow-500/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Link Content */}
          {post.link && (
            <div className="mb-4 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-colors">
              <div className="flex flex-col md:flex-row">
                {post.link.image && (
                  <div className="md:w-48 flex-shrink-0">
                    <img
                      src={post.link.image}
                      alt={post.link.title}
                      className="w-full h-32 md:h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-4">
                  <div className="text-sm text-slate-400 mb-1">{post.link.domain || new URL(post.link.url).hostname}</div>
                  <h5 className="text-white font-semibold mb-2 hover:text-blue-400 transition-colors">
                    {post.link.title}
                  </h5>
                  <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                    {post.link.description}
                  </p>
                  <a
                    href={post.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Visit Link
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats & Actions */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Stats */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onLike?.(post._id)}
                className={`flex items-center gap-2 transition-all duration-200 ${post.isLiked
                    ? 'text-red-500 hover:text-red-400'
                    : 'text-slate-400 hover:text-red-400'
                  }`}
              >
                <Heart size={20} fill={post.isLiked ? 'currentColor' : 'none'} />
                <span className="text-sm font-medium">{post.likes.toLocaleString()}</span>
              </button>

              <button
                onClick={() => onComment?.(post._id)}
                className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"
              >
                <MessageCircle size={20} />
                <span className="text-sm font-medium">{post.comments.toLocaleString()}</span>
              </button>

              <button
                onClick={() => onShare?.(post._id)}
                className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <Share2 size={20} />
                <span className="text-sm font-medium">{post.shares.toLocaleString()}</span>
              </button>

              <button
                onClick={() => onBookmark?.(post._id)}
                className={`flex items-center gap-2 transition-colors ${post.isBookmarked
                    ? 'text-yellow-500 hover:text-yellow-400'
                    : 'text-slate-400 hover:text-yellow-400'
                  }`}
              >
                <Bookmark size={20} fill={post.isBookmarked ? 'currentColor' : 'none'} />
                {/* <span className="text-sm font-medium">{post.bookmarks.toLocaleString()}</span> */}
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                Follow Post
              </button>
              <button
                onClick={() => onFollow?.(post.community.name)}
                className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 hover:text-white hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all"
              >
                Follow Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Eye icon component
const Eye = ({ size = 16, ...props }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

export default CommunityPostCard;