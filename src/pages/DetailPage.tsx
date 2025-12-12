import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Post from "../components/card/Post";
import { toggleLike, addComment, addReply,  } from "../api/userPost";
import CommentForm from "../components/comment/CommentForm";
import CommentItem from "../components/comment/CommentItem";
import { getUser } from "../utils/userStorage";


// Main Component
export default function DetailPage() {
  const location = useLocation();
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const [activeReply, setActiveReply] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
  
  // In real app, get current user from auth context
  const currentUser:any = getUser();

  const postDetail = location.state?.post;

  useEffect(() => {
    if (postDetail) {
      setPost(postDetail);
    }
  }, [postId, postDetail]);

 

  const handleLikePost = async (postId: string) => {
    try {
      await toggleLike(postId);
      if (post) {
        setPost({
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? 
            post.likes.filter((id:any) => id !== currentUser._id) : 
            [...post.likes, currentUser._id]
        });
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !post) return;

    try {
      const response = await addComment(post._id, commentText);
      // const newComment: Comment = {
      //   _id: response.data._id,
      //   user: currentUser,
      //   text: commentText,
      //   createdAt: new Date().toISOString(),
      //   likes: [],
      //   replies: []
      // };

      setPost({
        ...post,
        // comments: [newComment, ...post.comments]
      });
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      // await likeComment(commentId);
      // Update local state
      if (post) {
        setPost({
          ...post,
          // comments: post.comments.map(comment => {
          //   if (comment._id === commentId) {
          //     const isLiked = comment.likes.includes(currentUser._id);
          //     return {
          //       ...comment,
          //       likes: isLiked ? 
          //         comment.likes.filter(id => id !== currentUser._id) : 
          //         [...comment.likes, currentUser._id]
          //     };
          //   }
          //   return comment;
          // })
        });
      }
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  // const handleAddReply = async (commentId: string, text: string) => {
  //   try {
  //     // const response = await addReply(commentId, text);
  //     const newReply: Reply = {
  //       // _id: response.data._id,
  //       user: currentUser,
  //       text,
  //       createdAt: new Date().toISOString(),
  //       likes: []
  //     };

  //     if (post) {
  //       setPost({
  //         ...post,
  //         comments: post.comments.map(comment => {
  //           if (comment._id === commentId) {
  //             return {
  //               ...comment,
  //               replies: [...comment.replies, newReply]
  //             };
  //           }
  //           return comment;
  //         })
  //       });
  //     }
  //   } catch (err) {
  //     console.error("Error adding reply:", err);
  //   }
  // };

   const handleAddReply = (commentId: string) => {
      setActiveReply((prev) => (prev === commentId ? null : commentId));
    };
  
    const submitReply = async (commentId: string) => {
      if (!replyText.trim()) return;
  
      try {
        const res = await addReply(post._id, commentId,replyText);
        console.log("res", res);
        setReplyText("");
        setActiveReply(null);
      } catch (error) {
        console.error("Reply error:", error);
      }
    };
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      // await deleteComment(commentId);
      if (post) {
        setPost({
          ...post,
          // comments: post.comments.filter(comment => comment._id !== commentId)
        });
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleBookmark = () => {
    if (post) {
      setPost({
        ...post,
        isBookmarked: !post.isBookmarked
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => navigate("/")}
          className="text-purple-400 hover:text-purple-300"
        >
          Go back home
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white">Post not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-5 px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        <span>Back to feed</span>
      </button>

      {/* Main Post */}
      <Post
        key={post._id}
        post={post}
        onUpdate={handleBookmark}
        onDelete={() => {}} // Add delete functionality
        onLike={() => handleLikePost(post._id)}
        onComment={() => {}} // This might not be needed here
      />

      {/* Comments Section */}
      <div className="mt-8 bg-slate-900/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
        <h3 className="text-white font-bold text-xl mb-6 pb-4 border-b border-slate-700/50">
          Comments ({post.comments?.length || 0})
        </h3>

        {/* Add Comment */}
        <div className="mb-8">
          <h4 className="text-white font-semibold mb-4">Add your comment</h4>
          <CommentForm
            userAvatar={currentUser.avatar}
            onSubmit={handleAddComment}
            placeholder="What are your thoughts on this post?"
          />
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {post.comments?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg">No comments yet</div>
              <p className="text-slate-500 mt-2">Be the first to share your thoughts!</p>
            </div>
          ) : (
            post.comments?.map((comment:any) => (
              // <CommentItem
              //   key={comment._id}
              //   comment={comment}
              //   currentUserId={currentUser._id}
              //   onLike={handleLikeComment}
              //   onReply={handleAddReply}
              //   onDelete={handleDeleteComment}
              // />

              <CommentItem
  key={comment._id}
  postId={post._id}
  comment={comment}
  currentUserId={currentUser._id}
  // onRefresh={fetchPostAgain}
/>
            ))
          )}
        </div>
      </div>
    </div>
  );
}