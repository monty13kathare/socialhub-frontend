import React, { useState } from "react";
import { formatTimeAgo } from "../../utils/helper";
import CommentForm from "./CommentForm";
import { addReply, deleteComment, likeComment } from "../../api/userPost";
import { ChevronDown, ChevronUp, CircleChevronDown, CircleChevronUp, Heart, Reply, X } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CommentItemProps {
  postId: string;
  comment: any;
  currentUserId: string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  postId,
  comment,
  currentUserId,
  // onRefresh,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isLiked, setIsLiked] = useState(
    comment?.likes?.includes(currentUserId)
  );
  const [likeCount, setLikeCount] = useState(comment?.likes?.length || 0);


  // 🔥 API IMPORTS
  // -------------------------------

  // ⭐ LIKE COMMENT
  const handleLike = async () => {
    try {
      await likeComment(postId, comment?._id);
      setIsLiked(!isLiked);
      setLikeCount((prev: any) => (isLiked ? prev - 1 : prev + 1));
      // onRefresh();
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  // ⭐ REPLY COMMENT
  const handleReply = async (text: string) => {
    try {
      await addReply(postId, comment._id, text);
      setShowReplyForm(false);
      // await onRefresh();
    } catch (error) {
      console.error("Error replying:", error);
    }
  };

  // ⭐ DELETE COMMENT
  const handleDeleteComment = async () => {
    try {
      await deleteComment(postId, comment?._id);
       toast.success("Comment deleted successfully!");
      // await onRefresh();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* MAIN COMMENT */}
      <div className="flex space-x-4 p-4 rounded-2xl bg-slate-800/30 hover:bg-slate-800/50 transition-all">
        <div className="w-7 h-7 lg:h-10 lg:w-10">
          <img
            src={comment.user.avatar}
            alt={comment.user.name}
            className="w-full h-full rounded-full object-cover border-2 border-purple-500/30"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            {/* USER INFO */}
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-white text-sm sm:text-base font-medium sm:font-semibold">{comment.user.name}</h4>
                {/* <span className="text-slate-400 text-sm">@{comment.user.username}</span> */}
              </div>

              <span className="text-slate-500 text-xs">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>

            {/* DELETE COMMENT */}
            {currentUserId === comment.user._id && (
              <button
                onClick={handleDeleteComment}
                className="text-slate-400 hover:text-red-500 px-2 py-1 rounded text-sm"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* TEXT */}
          <p className="text-white mt-2">{comment.text}</p>

          {/* ACTION BUTTONS */}
          <div className="flex items-center space-x-6 mt-3">
            {/* LIKE */}


            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 ${isLiked ? "text-red-500" : "text-slate-400 hover:text-red-500"
                }`}
            >
              <Heart size={16} className={isLiked ? "fill-red-500 text-red-500" : ""} />
              <span className="text-sm">{likeCount}</span>
            </button>

            {/* REPLY */}
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-slate-400 hover:text-purple-400 text-sm flex items-center space-x-1"
            >
              <Reply size={16} />
              <span className="hidden lg:flex">Reply</span>
            </button>

            {/* SHOW/HIDE REPLIES */}
            {comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-slate-400 hover:text-purple-400 text-sm flex items-center space-x-1"
              >
                {showReplies ? <CircleChevronDown size={16} /> : <CircleChevronUp size={16} />}
                <span>
                  {comment.replies.length}{" "}
                  {comment.replies.length === 1 ? "reply" : "replies"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* REPLY FORM */}
      {showReplyForm && (
        <div className="ml-1 sm:ml-12">
          <CommentForm
            commentId={comment?._id}
            postId={postId}
            onSubmit={handleReply}
            placeholder="Write a reply..."
            buttonText="Reply"
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* REPLIES */}
      {showReplies && (
        <div className="ml-3 lg:ml-12 space-y-4 border-l-2 border-slate-700/50 pl-4 lg:pl-6">
          {comment.replies.map((reply: any) => (
            <div key={reply._id} className="flex space-x-2">
              <div className="w-6 h-6 lg:h-8 lg:w-8">
                <img
                  src={reply.user.avatar}
                  alt={reply.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-white text-sm font-medium">
                    {reply.user.name}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {formatTimeAgo(reply.createdAt)}
                  </span>
                </div>

                <p className="text-slate-300 text-sm">{reply.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
