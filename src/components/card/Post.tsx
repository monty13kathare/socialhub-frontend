import React, { useState, useRef, useEffect } from "react";
import type { UserPost } from "../../types/userPost";
import ShareModal from "../../model/ShareModal";
import { votePollAPI } from "../../api/post";
import { getUser } from "../../utils/userStorage";
import { useNavigate } from "react-router-dom";
import EditPostModal from "../../model/EditPostModal";
import CommentItem from "../comment/CommentItem";

interface PostProps {
  post: any;
  onUpdate: (postId: string, updates: Partial<UserPost>) => void;
  onDelete: (postId: string) => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
}

const Post: React.FC<PostProps> = ({
  post,
  onUpdate,
  onDelete,
  onLike,
  onComment,
}) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [showTagPeople, setShowTagPeople] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState<any[]>(post.taggedUsers || []);
  const [tagSearch, setTagSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const currentUser: any = getUser();

  const isAuthor = post.author?._id === currentUser?._id;
  const isLiked = post?.likes?.includes(currentUser._id);

  // Poll voting state - initialized from post data
  const [pollVotes, setPollVotes] = useState<{ [key: number]: number }>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Initialize poll state from post data
  useEffect(() => {
    if (post.poll) {
      // Convert Map to object for easier handling
      const votesObj: { [key: number]: number } = {};
      if (post.poll.votes && typeof post.poll.votes === "object") {
        Object.entries(post.poll.votes).forEach(([key, value]) => {
          votesObj[parseInt(key)] = value as number;
        });
      }

      setPollVotes(votesObj);
      setTotalVotes(post.poll.totalVotes || 0);

      // Check if current user has voted
      const userHasVoted =
        post.poll.userVoted?.includes(currentUser._id) ||
        post.poll.votedBy?.includes(currentUser._id);
      setHasVoted(userHasVoted);

      // Find which option user voted for (you might need to store this in your schema)
      // For now, we'll check if userVote exists, otherwise we'll need to track it differently
      setUserVote(post.poll.userVote || null);
    }
  }, [post.poll, currentUser._id]);

  // Poll voting handler
  const handleVote = async (optionIndex: number) => {
    if (hasVoted) return;

    try {
      const response = await votePollAPI(post._id, optionIndex);
      const updatedPoll = response.data;

      // Convert votes Map to object
      const updatedVotes: { [key: number]: number } = {};
      if (updatedPoll.votes) {
        Object.entries(updatedPoll.votes).forEach(([key, value]) => {
          updatedVotes[parseInt(key)] = value as number;
        });
      }

      setPollVotes(updatedVotes);
      setTotalVotes(updatedPoll.totalVotes || 0);
      setHasVoted(true);
      setUserVote(optionIndex);

      // Update parent component with new poll data
      onUpdate(post._id, {
        poll: {
          ...post.poll,
          votes: updatedPoll.votes,
          totalVotes: updatedPoll.totalVotes,
          userVoted: updatedPoll.userVoted,
          votedBy: updatedPoll.votedBy,
        },
      });
    } catch (error) {
      console.error("Voting failed:", error);
    }
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!post.poll?.endTime) return null;

    const endTime = new Date(post.poll.endTime);
    const now = new Date();
    const diffMs = endTime.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { expired: true, text: "Poll ended" };
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return { expired: false, text: `${days}d ${hours}h left` };
    } else if (hours > 0) {
      return { expired: false, text: `${hours}h ${minutes}m left` };
    } else {
      return { expired: false, text: `${minutes}m left` };
    }
  };

  // Calculate percentages for display
  const calculatePercentage = (optionIndex: number) => {
    if (totalVotes === 0) return 0;
    const votes = pollVotes[optionIndex] || 0;
    return Math.round((votes / totalVotes) * 100);
  };

  // Check if user has voted in this poll
  const userHasVoted =
    hasVoted ||
    post.poll?.userVoted?.includes(currentUser._id) ||
    post.poll?.votedBy?.includes(currentUser._id);

  const timeRemaining = getTimeRemaining();
  const isPollExpired = timeRemaining?.expired;
  const canVote = !userHasVoted && !isPollExpired;

  // Find the leading option (most votes)
  const findLeadingOption = () => {
    if (totalVotes === 0) return null;

    let maxVotes = -1;
    let leadingOption: number | null = null;

    Object.entries(pollVotes).forEach(([optionIndex, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        leadingOption = parseInt(optionIndex);
      }
    });

    return leadingOption;
  };

  const leadingOption = findLeadingOption();

  // Mock user data for tagging - replace with actual API call
  const suggestedUsers = [
    {
      _id: "1",
      name: "John Doe",
      username: "johndoe",
      avatar: "/default-avatar.png",
    },
    {
      _id: "2",
      name: "Jane Smith",
      username: "janesmith",
      avatar: "/default-avatar.png",
    },
    {
      _id: "3",
      name: "Mike Johnson",
      username: "mikej",
      avatar: "/default-avatar.png",
    },
    {
      _id: "4",
      name: "Sarah Wilson",
      username: "sarahw",
      avatar: "/default-avatar.png",
    },
  ];

  const filteredUsers = suggestedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(tagSearch.toLowerCase()) ||
      user.username.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleUpdate = () => {
    onUpdate(post._id, { content: editedContent, taggedUsers });
    setIsEditing(false);
    setShowTagPeople(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(post.content);
    setTaggedUsers(post.taggedUsers || []);
    setIsEditing(false);
    setShowTagPeople(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle image upload logic here
      console.log("Uploading image:", file);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onComment(post._id, newComment);
      setNewComment("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleTagUser = (user: any) => {
    if (!taggedUsers.find((u: any) => u._id === user._id)) {
      setTaggedUsers([...taggedUsers, user]);
    }
    setTagSearch("");
    tagInputRef.current?.focus();
  };

  const handleRemoveTag = (userId: string) => {
    setTaggedUsers(taggedUsers.filter((user: any) => user._id !== userId));
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(post.code?.code || "");
      setIsCopied(true);

      // Reset copied status after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = post.code?.code || "";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const redirectUser = (userId: string) => {
    navigate(`/user/${userId}`);
    window.scrollTo(0, 0);
  };

  // const handleDetailPost = (postId:string,post:any) => {
  //    navigate(`/post/${postId}`, {
  //   state: { post },  // pass post data here
  // });
  //   window.scrollTo(0, 0);
  // }

  const renderPostContent = () => {
    switch (post.type) {
      case "code":
        return (
          <div className="bg-linear-to-br from-gray-900 to-slate-900 rounded-xl p-4 mt-3 border border-gray-700/50 shadow-lg">
            {/* Header with language and copy button */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-medium text-gray-300 bg-gray-800/50 px-2 py-1 rounded-md border border-gray-700">
                  {post.code?.language || "Code"}
                </span>
                <button
                  onClick={handleCopyCode}
                  className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 font-medium ${
                    isCopied
                      ? "bg-green-500/20 text-green-400 border-green-500/30 shadow-sm"
                      : "bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50 hover:text-white hover:border-gray-500 active:scale-95"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code block */}
            <div className="relative">
              <pre className="text-gray-100 overflow-x-auto custom-scrollbar text-sm font-mono max-h-[400px] bg-gray-950/50 rounded-lg p-4 border border-gray-700/30">
                <code className="block whitespace-pre overflow-x-auto">
                  {post.code?.code}
                </code>
              </pre>
            </div>

            {/* File info footer */}
            <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
              <span className="flex items-center space-x-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Code Snippet</span>
              </span>
              <span>{post.code?.code.split("\n").length} lines</span>
            </div>
          </div>
        );

      case "poll":
        return (
          <div className="mt-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 shadow-sm">
            {post.image?.url && !isEditing && (
              <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden">
                <img
                  src={post.image.url}
                  alt="Post attachment"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
            {/* Poll Header */}
            <div className="flex items-start space-x-3 mb-4 sm:mb-6">
              {/* <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div> */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white leading-tight">
                      {post.poll?.question}
                    </h4>
                    {/* <p className="text-sm text-gray-400 mt-1.5">
                      {!userHasVoted && "Choose your preferred option"}
                    </p> */}
                  </div>
                  {timeRemaining && (
                    <div
                      className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border shrink-0 ${
                        isPollExpired
                          ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                          : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{timeRemaining.text}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Poll Options */}
            <div className="space-y-3 mb-4 sm:mb-6">
              {post.poll?.options.map((option: any, index: any) => {
                const percentage = calculatePercentage(index);
                const votesCount = pollVotes[index] || 0;
                const isUserVote = userHasVoted && userVote === index;
                const isLeading = leadingOption === index && totalVotes > 0;

                return (
                  <div key={index} className="relative group">
                    <button
                      onClick={() => canVote && handleVote(index)}
                      disabled={!canVote}
                      className={`w-full text-left rounded-xl p-4 transition-all duration-300 border-2 transform
                                    ${
                                      !canVote
                                        ? "cursor-default opacity-90"
                                        : "cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[1.01]"
                                    }
                                    ${
                                      isUserVote
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-md"
                                        : isLeading && userHasVoted
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                                        : isPollExpired
                                        ? "border-gray-150 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60"
                                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600"
                                    }
                                `}
                    >
                      <div className="flex  sm:justify-between sm:items-start gap-2 mb-3">
                        <span
                          className={`font-medium text-sm sm:text-base leading-relaxed flex-1
                                        ${
                                          isUserVote
                                            ? "text-indigo-700 dark:text-indigo-300"
                                            : isLeading && userHasVoted
                                            ? "text-emerald-700 dark:text-emerald-300"
                                            : isPollExpired
                                            ? "text-gray-600 dark:text-gray-400"
                                            : "text-gray-800 dark:text-gray-200"
                                        }`}
                        >
                          {option}
                        </span>

                        {(userHasVoted || isPollExpired) && (
                          <div className="flex items-center space-x-3">
                            <span
                              className={`text-sm font-semibold px-2 py-1 rounded-full
                                                ${
                                                  isUserVote
                                                    ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                                                    : isLeading
                                                    ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                }`}
                            >
                              {percentage}%
                            </span>
                            {isUserVote && (
                              <span className="text-indigo-500">
                                <svg
                                  className="w-4 h-4 sm:w-5 sm:h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Progress bar - show after voting or when poll ended */}
                      {(userHasVoted || isPollExpired) && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-1000 ease-out shadow-sm
                                                ${
                                                  isUserVote
                                                    ? "bg-linear-to-r from-indigo-500 to-purple-600"
                                                    : isLeading
                                                    ? "bg-linear-to-r from-emerald-500 to-green-600"
                                                    : isPollExpired
                                                    ? "bg-linear-to-r from-gray-400 to-gray-500"
                                                    : "bg-linear-to-r from-gray-400 to-gray-500"
                                                }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      )}

                      {/* Votes count and status */}
                      <div className="flex justify-between items-center mt-3">
                        {userHasVoted || isPollExpired ? (
                          <>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {votesCount} {votesCount === 1 ? "vote" : "votes"}
                            </span>
                            {isLeading && totalVotes > 0 && votesCount > 0 && (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {isPollExpired ? "Winner" : "Leading"}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">
                            {/* {canVote ? "Tap to vote" : "Voting closed"} */}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Poll footer */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600 dark:text-gray-300 font-semibold">
                  {totalVotes} {totalVotes === 1 ? "total vote" : "total votes"}
                </span>
                <span className="text-gray-400 hidden sm:block">•</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {userHasVoted || isPollExpired
                    ? `${post.poll?.userVoted?.length || 0} participants`
                    : "Be the first to vote!"}
                </span>
              </div>

              {userHasVoted ? (
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>You voted</span>
                </div>
              ) : isPollExpired ? (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-semibold text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Poll ended</span>
                </div>
              ) : (
                <div className="text-amber-600 dark:text-amber-400 font-semibold text-sm flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Cast your vote</span>
                </div>
              )}
            </div>

            {/* Voting instructions - only show when poll is active */}
            {!userHasVoted && !isPollExpired && (
              <div className="mt-4 p-3 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800/50">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shrink-0">
                    <svg
                      className="w-3 h-3 text-blue-600 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex-1">
                    Select one option to cast your vote. Voting is final and
                    cannot be changed.
                    {timeRemaining && ` Poll ends in ${timeRemaining.text}.`}
                  </p>
                </div>
              </div>
            )}

            {/* Final results notice when poll ends */}
            {isPollExpired && totalVotes > 0 && (
              <div className="mt-4 p-3 bg-linear-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center shrink-0">
                    <svg
                      className="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 flex-1">
                    Poll has ended. View final results below.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "achievement":
        return (
          <div className="bg-linear-to-br from-gray-900 via-purple-900 to-slate-900 rounded-2xl p-5 sm:p-6 mt-3 text-white shadow-xl relative overflow-hidden border border-gray-700/50">
            {/* Background pattern */}
            {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/50 to-transparent"></div> */}

            {/* Achievement content */}
            <div className="flex flex-col items-start  space-x-4 relative z-10">
              {/* Icon container */}
              <div className="bg-linear-to-br from-amber-800 to-yellow-300 rounded-2xl p-3 sm:p-4 shadow-lg mb-2">
                <div className="text-2xl sm:text-3xl drop-shadow-lg">
                  {"🏆"}
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight">
                      {post.achievement?.title}
                    </h4>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed mt-2 sm:mt-3">
                      {post.achievement?.description}
                    </p>
                  </div>

                  {/* Achievement badge */}
                  <div className="shrink-0 bg-amber-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-amber-400/30">
                    <span className="text-xs font-semibold text-amber-300">
                      ACHIEVEMENT
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gold shine effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-amber-400/20 to-transparent -skew-x-12 transform -translate-x-full animate-shine"></div>
          </div>
        );

      default:
        return (
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap wrap-break-words leading-relaxed">
            {post.content}
          </p>
        );
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-3 sm:p-4 mb-4 transition-colors">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <img
            src={post?.author?.avatar}
            alt={post.author?.name}
            onClick={() => redirectUser(post?.author?._id)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 shrink-0 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                {post.author?.username || post.author?.name}
              </h3>
              {/* {post?.author?.username && (
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  @{post.author?.username}
                </span>
              )} */}
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              <span>{formatTimeAgo(post.createdAt)}</span>
              <span>•</span>
              <span className="capitalize flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  {post.privacy === "public" && (
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z" />
                  )}
                  {post.privacy === "private" && (
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  )}
                  {post.privacy === "friends" && (
                    <path
                      fillRule="evenodd"
                      d="M10 2a8 8 0 00-8 8c0 1.846.634 3.543 1.688 4.897l.047.056L10 18l6.265-3.047.047-.056A7.953 7.953 0 0018 10a8 8 0 00-8-8zm0 14.5l-4.015-1.95A6.5 6.5 0 0110 3.5a6.5 6.5 0 014.015 11.05L10 16.5z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                {post.privacy}
              </span>
              {post.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative shrink-0" ref={optionsRef}>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showOptions && (
            <div className="absolute right-0 top-8 sm:top-10 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10 min-w-[140px]">
              {isAuthor ? (
                <>
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center space-x-2 text-sm sm:text-base"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(post._id);
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600 dark:text-red-400 flex items-center space-x-2 text-sm sm:text-base"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center space-x-2 text-sm sm:text-base">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>Report</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tagged Users */}
      {taggedUsers?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Tagged:
          </span>
          {taggedUsers.map((user: any) => (
            <div
              key={user._id}
              className="flex items-center space-x-1 primary-color px-2 py-1 rounded-full cursor-pointer hover:bg-slate-600/50 hover:text-white"
              onClick={() => redirectUser(user?._id)}
            >
              <img
                src={user.avatar || "/default-avatar.png"}
                alt={user.name}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                {user.username}
              </span>
              {isEditing && (
                <button
                  onClick={() => handleRemoveTag(user._id)}
                  className="text-purple-500 hover:text-purple-700 ml-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {/* {post.type !== "text" && (
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                    {post.content}
                </p>
            )} */}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          {post.tags.map((tag: any, index: any) => (
            <span
              key={index}
              className="inline-block primary-color text-xs px-2 py-1 rounded-full font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {post.type !== "image" && (
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap wrap-break-words leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
          {post.content}
        </p>
      )}

      {/* Post Content */}
      <div className="mb-3 sm:mb-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
              rows={4}
              placeholder="What's on your mind?"
            />

            {/* Tag People Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tag People
                </label>
                <button
                  type="button"
                  onClick={() => setShowTagPeople(!showTagPeople)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  {showTagPeople ? "Hide" : "Tag People"}
                </button>
              </div>

              {showTagPeople && (
                <div className="space-y-2">
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Search users to tag..."
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />

                  {tagSearch && filteredUsers.length > 0 && (
                    <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                      {filteredUsers.map((user) => (
                        <button
                          key={user._id}
                          onClick={() => handleTagUser(user)}
                          className="w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2 text-left"
                        >
                          <img
                            src={user.avatar || "/default-avatar.png"}
                            alt={user.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              @{user.username}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleUpdate}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex-1 font-medium text-sm sm:text-base"
              >
                Update
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors flex-1 font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          renderPostContent()
        )}
      </div>

      {/* Image */}
      {post.type !== "poll" && post.image?.url && !isEditing && (
        <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden">
          <img
            src={post.image.url}
            alt="Post attachment"
            loading="lazy"
            className="w-full h-fit  object-cover"
          />
        </div>
      )}

      {/* Image Upload during Edit */}
      {isEditing && (
        <div className="mb-3 sm:mb-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Change Image</span>
          </button>
        </div>
      )}

      {/* Stats */}
      {(post.likes?.length > 0 ||
        post.comments?.length > 0 ||
        post.shares?.length > 0) && (
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 px-1">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {post.likes?.length > 0 && (
              <span className="flex items-center space-x-1">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <span>{post.likes?.length || 0}</span>
              </span>
            )}
            {post.comments?.length > 0 && (
              <span>{post.comments?.length} comments</span>
            )}
            {post.shares?.length > 0 && (
              <span>{post.shares?.length} shares</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex border-t border-gray-200 dark:border-gray-700 pt-3">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center justify-center space-x-1 sm:space-x-2 flex-1 py-2 rounded-lg transition-colors font-medium text-xs sm:text-sm ${
            isLiked
              ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center space-x-1 sm:space-x-2 flex-1 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-xs sm:text-sm"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>Comment</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowShareModal(true);
          }}
          className="flex items-center justify-center space-x-1 sm:space-x-2 flex-1 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-xs sm:text-sm"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-8 bg-slate-900/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-white font-bold text-xl mb-6 pb-4 border-b border-slate-700/50">
            Comments ({post.comments?.length || 0})
          </h3>

          {/* Add Comment */}
          <div className="mb-8">
            <h4 className="text-white font-semibold mb-4">Add your comment</h4>
            <div className="flex space-x-4">
              <div className="w-8 h-8 lg:w-10 lg:h-10 shrink-0">
                <img
                  src={currentUser?.avatar}
                  alt="Your avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write a comment..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none  h-15 sm:h-20"
                  // rows={3}
                />
                <div className="flex justify-end items-center mt-3 space-x-3">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {post.comments?.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg">No comments yet</div>
                <p className="text-slate-500 mt-2">
                  Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              post.comments?.map((comment: any) => (
                <CommentItem
                  key={comment._id}
                  postId={post._id}
                  comment={comment}
                  currentUserId={currentUser._id}
                />
              ))
            )}
          </div>
        </div>
      )}

      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={post}
        />
      )}

      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={post}
          onSave={onUpdate}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default Post;
