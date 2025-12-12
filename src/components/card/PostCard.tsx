import { useNavigate } from 'react-router-dom';

interface Post {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

export default function PostCard({ post, onLike, onBookmark, onComment, onShare }: PostCardProps) {
  const showComments = false;
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`post/${post.id}`)} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
      {/* User Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {post.user.avatar}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-semibold">{post.user.name}</h3>
              {post.user.verified && (
                <span className="text-blue-400" title="Verified">✓</span>
              )}
            </div>
            <p className="text-slate-400 text-sm">{post.user.username} · {post.timestamp}</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all">
          ⋮
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-white leading-relaxed">{post.content}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="mb-4 rounded-2xl overflow-hidden">
          <img 
            src={post.image} 
            alt="Post content" 
            className="w-full h-auto object-cover rounded-2xl hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center space-x-6 text-slate-400 text-sm mb-4">
        <span>{post.likes} likes</span>
        <span>{post.comments} comments</span>
        <span>{post.shares} shares</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-slate-700/50 pt-4">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            post.isLiked 
              ? 'text-red-500 bg-red-500/10' 
              : 'text-slate-400 hover:text-red-500 hover:bg-slate-700/50'
          }`}
        >
          <span className="text-lg">{post.isLiked ? '❤️' : '🤍'}</span>
          <span>Like</span>
        </button>

        <button
          onClick={() => onComment(post.id)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 transition-all"
        >
          <span className="text-lg">💬</span>
          <span>Comment</span>
        </button>

        <button
          onClick={() => onShare(post.id)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-400 hover:text-green-400 hover:bg-slate-700/50 transition-all"
        >
          <span className="text-lg">🔄</span>
          <span>Share</span>
        </button>

        <button
          onClick={() => onBookmark(post.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            post.isBookmarked 
              ? 'text-yellow-500 bg-yellow-500/10' 
              : 'text-slate-400 hover:text-yellow-500 hover:bg-slate-700/50'
          }`}
        >
          <span className="text-lg">{post.isBookmarked ? '📑' : '📄'}</span>
          <span>Save</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="space-y-3">
            {/* Mock comments */}
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-linear-to-r from-green-500 to-emerald-500 rounded-full shrink-0"></div>
              <div className="flex-1 bg-slate-700/30 rounded-2xl p-3">
                <p className="text-white text-sm"><strong>Alex Chen</strong> Great post! Really insightful.</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-linear-to-r from-orange-500 to-red-500 rounded-full shrink-0"></div>
              <div className="flex-1 bg-slate-700/30 rounded-2xl p-3">
                <p className="text-white text-sm"><strong>Maria Garcia</strong> Thanks for sharing this! 🚀</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}