import React, { useState, useEffect } from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type?: any;
  itemName?: string;
  title?: string;
  message?: string;
  isLoading?: boolean;
  requiresConfirmation?: boolean;
  confirmationText?: string;
}

const DeleteModal2: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type = "post",
  itemName,
  title,
  message,
  isLoading = false,
  requiresConfirmation = false,
  confirmationText = "DELETE",
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Reset confirmation input when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDeleteConfirm("");
      setIsMounted(true);
    } else {
      // Delay unmounting for animation
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Generate default content based on type
  const getDefaultContent = () => {
    switch (type) {
      case "post":
        return {
          title: "Delete Post",
          message: itemName
            ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
            : "Are you sure you want to delete this post? This action cannot be undone.",
          icon: (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          ),
          buttonText: "Delete Post",
          loadingText: "Deleting...",
        };
      case "community":
        return {
          title: "Delete Community",
          message: itemName
            ? `Are you sure you want to delete the "${itemName}" community? All posts and data will be permanently removed. This action cannot be undone.`
            : "Are you sure you want to delete this community? All posts and data will be permanently removed. This action cannot be undone.",
          icon: (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          ),
          buttonText: "Delete Community",
          loadingText: "Deleting...",
        };
      case "account":
        return {
          title: "Delete Account",
          message:
            "This will permanently delete your account and all associated data. This action cannot be undone.",
          icon: (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
          buttonText: "Delete Account",
          loadingText: "Deleting...",
          requiresConfirmation: true,
        };
      case "comment":
        return {
          title: "Delete Comment",
          message:
            "Are you sure you want to delete this comment? This action cannot be undone.",
          icon: (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          ),
          buttonText: "Delete Comment",
          loadingText: "Deleting...",
        };
      default:
        return {
          title: "Delete Item",
          message:
            "Are you sure you want to delete this item? This action cannot be undone.",
          icon: (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          ),
          buttonText: "Delete",
          loadingText: "Deleting...",
        };
    }
  };

  const defaultContent = getDefaultContent();
  const finalRequiresConfirmation =
    requiresConfirmation || defaultContent.requiresConfirmation || false;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // Handle confirm action
  const handleConfirm = () => {
    if (!finalRequiresConfirmation || deleteConfirm === confirmationText) {
      onConfirm();
    }
  };

  if (!isOpen && !isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-60" : "opacity-0"
        }`}
      />

      {/* Modal */}
      <div
        className={`relative bg-slate-800 rounded-2xl border border-red-500/30 max-w-md w-full p-6 transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-start space-x-3 mb-4">
          {/* Icon */}
          <div className="shrink-0 w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
            <div className="text-red-400">{defaultContent.icon}</div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">
              {title || defaultContent.title}
            </h3>
            <p className="text-slate-300 mt-2 text-sm leading-relaxed">
              {message || defaultContent.message}
            </p>
          </div>
        </div>

        {/* Confirmation Input (for account deletion and other critical actions) */}
        {finalRequiresConfirmation && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type "{confirmationText}" to confirm
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors duration-200"
              placeholder={confirmationText}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span>Cancel</span>
          </button>

          <button
            onClick={handleConfirm}
            disabled={
              isLoading ||
              (finalRequiresConfirmation && deleteConfirm !== confirmationText)
            }
            className="flex-1 px-4 py-3 bg-linear-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:from-red-800 disabled:to-red-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4 text-white"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{defaultContent.loadingText}</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>{defaultContent.buttonText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal2;
