import { useState } from "react";
import type { ModalType } from "../types/types";
import { getUser } from "../utils/userStorage";

interface CommunityActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: any;
  type: ModalType;
  onConfirm: (communityId: any) => Promise<boolean | void>;
  isLoading?: boolean;
}

export const CommunityActionModal: React.FC<CommunityActionModalProps> = ({
  isOpen,
  onClose,
  community,
  type,
  onConfirm,
  isLoading = false,
}) => {
  const currentUser = getUser();
  const isOwner = currentUser?._id === community?.createdBy?._id;
  const [error, setError] = useState("");

  if (!isOpen || !community) return null;

  const isJoin = type === "join";
  const actionColor = isJoin
    ? "from-purple-600 to-pink-600"
    : "from-red-600 to-orange-600";
  const actionHoverColor = isJoin
    ? "from-purple-500 to-pink-500"
    : "from-red-500 to-orange-500";
  const icon = isJoin ? "👋" : "🚪";
  const actionText = isJoin ? "Join" : "Leave";
  const title = `${actionText} ${community.name}`;

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    setError("");
    try {
      const success = await onConfirm(community._id);
      console.log("success", success);
      if (success) {
        handleClose();
      } else {
        setError(`Failed to ${type} community. Please try again.`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `An error occurred while ${type}ing the community`
      );
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getDescription = () => {
    if (isJoin) {
      return "By joining this community, you agree to follow the community rules and can start posting.";
    }
    return "Are you sure you want to leave this community? You'll lose access to all community content and discussions.";
  };

  const getFeatures = () => {
    if (isJoin) {
      return [
        "Create posts and share content",
        "Comment on other posts",
        "Participate in discussions",
        "Share code and ask questions",
      ];
    }
    return [
      "Lose access to all posts and content",
      "No longer able to comment or post",
      "Will be removed from member list",
      "Can rejoin anytime if public",
    ];
  };

  const getWarning = () => {
    if (!isJoin && isOwner) {
      return "⚠️ You are the creator of this community. Leaving may transfer ownership or delete the community.";
    }
    return null;
  };

  const warning = getWarning();

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-800 rounded-3xl border border-slate-700/50 p-6 max-w-md w-full max-h-[90vh] lg:h-fit custom-scrollbar overflow-scroll lg:overflow-hidden transform transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">{icon}</div>
          <h3 className="text-white font-bold text-xl mb-2">{title}</h3>
          <p className="text-slate-400 text-sm">{getDescription()}</p>
        </div>

        {/* Warning Message */}
        {warning && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4">
            <p className="text-yellow-400 text-sm text-center">{warning}</p>
          </div>
        )}

        {/* Community Info */}
        <div className="bg-slate-700/30 rounded-xl p-4 mb-4 border border-slate-600/50">
          <div className="flex items-center space-x-3 mb-3">
            {/* {community.image && (
              <img
                src={community.image}
                alt={community.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            )} */}
            <div className="flex-1">
              <h4 className="text-white font-semibold">{community.name}</h4>
              <p className="text-slate-400 text-sm">
                {community.members?.length || 0} members
              </p>
            </div>
          </div>
          {community.description && (
            <p className="text-slate-300 text-sm italic">
              "{community?.description}"
            </p>
          )}
        </div>

        {/* Features List */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50">
          <h4 className="text-white font-semibold mb-3 text-center">
            {isJoin ? "You'll be able to:" : "You will:"}
          </h4>
          <ul className="space-y-2 text-slate-300 text-sm">
            {getFeatures().map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className={isJoin ? "text-green-400" : "text-red-400"}>
                  {isJoin ? "✓" : "✗"}
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col md:flex-row space-x-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 bg-linear-to-r ${actionColor} text-white rounded-xl font-semibold hover:${actionHoverColor} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isJoin ? "Joining..." : "Leaving..."}
              </>
            ) : (
              `${actionText} Community`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
