import React, { useState } from 'react'
import { getUser } from '../../utils/userStorage';
import { addReply } from '../../api/userPost';

interface CommentFormProps {
  commentId:any;
  postId:any;
  onSubmit: (text: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  initialValue?: string;
  onCancel?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
  placeholder = "Add a comment...",
  buttonText = "Comment",
  onCancel,
  commentId,
  postId
}) => {
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
const currentUser:any = getUser();


  const handleSubmit = async () => {
    if (!replyText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addReply(postId,commentId, replyText);
      setReplyText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('commentId', commentId)
  console.log('postId', postId)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex space-x-4">
      <div className="w-6 h-6 sm:w-10 sm:h-10 shrink-0">
        <img 
          src={currentUser?.avatar} 
          alt="Your avatar" 
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="flex-1">
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none  h-14 sm:h-16"
          // rows={2}
        />
        <div className="flex justify-end items-center mt-3 space-x-2 sm:space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className=" px-3 py-1 sm:px-4 sm:py-2 text-slate-400 text-sm sm:text-base hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!replyText.trim() || isSubmitting}
            className="px-4 py-1 sm:px-6 sm:py-2 text-sm sm:text-base bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Posting...</span>
              </>
            ) : (
              <span>{buttonText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentForm