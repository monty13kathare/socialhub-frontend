import React, { useRef, useEffect, useState } from "react";
import { sharePost } from "../api/userPost";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, post }) => {
  const [isSharing, setIsSharing] = useState(false);
  const shareModalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shareModalRef.current &&
        !shareModalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Get post image from various possible properties
  const postImage = post.image?.url;

  // Helper function to get high-quality Cloudinary image URL
  const getHighQualityImageUrl = (imageUrl: string) => {
    if (!imageUrl) return null;

    // If it's a Cloudinary URL, we can optimize it for better quality
    if (imageUrl.includes("cloudinary.com")) {
      // Remove any existing transformations and add quality transformation
      const baseUrl = imageUrl.split("/upload/")[0];
      const imagePath = imageUrl.split("/upload/")[1];

      // Return high quality version with auto-format
      return `${baseUrl}/upload/q_auto:good,f_auto/${imagePath}`;
    }

    return imageUrl;
  };

  // Helper function to download image with proper quality
  const downloadImage = async (imageUrl: string) => {
    try {
      // Get high quality version for download
      const highQualityUrl = getHighQualityImageUrl(imageUrl) || imageUrl;

      const response = await fetch(highQualityUrl);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // Create a meaningful filename
      const fileName = `post-${post._id}-${Date.now()}.${
        blob.type.split("/")[1] || "jpg"
      }`;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Error downloading image:", error);
      return false;
    }
  };

  // Helper function to copy Cloudinary image URL to clipboard
  const copyImageUrlToClipboard = async (imageUrl: string) => {
    try {
      // Get the optimized Cloudinary URL for sharing
      const shareableUrl = getHighQualityImageUrl(imageUrl) || imageUrl;
      await navigator.clipboard.writeText(shareableUrl);
      return true;
    } catch (error) {
      console.error("Error copying image URL:", error);
      return false;
    }
  };

  // Share functionality
  const handleShare = async (platform: string) => {
    if (isSharing) return;

    setIsSharing(true);
    try {
      // Generate share URL and text
      const postUrl = `${window.location.origin}/post/${post._id}`;
      const shareText = `Check out this post by ${post.author.name}`;
      const fullText = `${shareText}: ${post.content?.substring(0, 100)}${
        post.content && post.content.length > 100 ? "..." : ""
      }`;

      let shareUrl = "";
      let successMessage = "";

      switch (platform) {
        case "whatsapp":
          shareUrl = `https://wa.me/?text=${encodeURIComponent(
            fullText + " " + postUrl
          )}`;
          break;

        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            postUrl
          )}&quote=${encodeURIComponent(shareText)}`;
          break;

        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            fullText
          )}&url=${encodeURIComponent(postUrl)}`;
          break;

        case "pinterest":
          if (postImage) {
            shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
              postUrl
            )}&media=${encodeURIComponent(
              postImage
            )}&description=${encodeURIComponent(fullText)}`;
          } else {
            shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
              postUrl
            )}&description=${encodeURIComponent(fullText)}`;
          }
          break;

        case "linkedin":
          // Enhanced LinkedIn sharing with post content
          const linkedinTitle = `Post by ${post.author.name}`;
          const linkedinSummary =
            post.content || "Check out this interesting post";
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            postUrl
          )}&title=${encodeURIComponent(
            linkedinTitle
          )}&summary=${encodeURIComponent(
            linkedinSummary
          )}&source=${encodeURIComponent(window.location.origin)}`;
          break;

        case "reddit":
          shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(
            postUrl
          )}&title=${encodeURIComponent(fullText)}`;
          break;

        case "telegram":
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
            postUrl
          )}&text=${encodeURIComponent(fullText)}`;
          break;

        case "email":
          const emailSubject = `Check out this post by ${post.author.name}`;
          const emailBody = `${fullText}\n\nView the full post: ${postUrl}`;
          shareUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(
            emailSubject
          )}&body=${encodeURIComponent(emailBody)}`;
          break;

        case "instagram":
          await navigator.clipboard.writeText(postUrl);
          successMessage =
            "Post link copied to clipboard! You can now share it on Instagram.";
          break;

        case "copy":
          const copyText = `${fullText}\n${postUrl}`;
          await navigator.clipboard.writeText(copyText);
          successMessage = "Post content and link copied to clipboard!";
          break;

        case "copy-image-url":
          if (postImage) {
            const copied = await copyImageUrlToClipboard(postImage);
            successMessage = copied
              ? "Image URL copied to clipboard!"
              : "Failed to copy image URL.";
          } else {
            successMessage = "No image available to copy.";
          }
          break;

        case "download-image":
          if (postImage) {
            const downloaded = await downloadImage(postImage);
            successMessage = downloaded
              ? "Image download started!"
              : "Failed to download image.";
          } else {
            successMessage = "No image available to download.";
          }
          break;

        default:
          break;
      }

      // Show success message for copy/download operations
      if (successMessage) {
        showNotification(successMessage);
      }

      // Open share URL for platforms that support it
      if (
        platform !== "instagram" &&
        platform !== "copy" &&
        platform !== "copy-image-url" &&
        platform !== "download-image" &&
        shareUrl
      ) {
        if (platform === "email") {
          // Open Gmail in a new tab
          window.open(shareUrl, "_blank", "width=600,height=600");
        } else {
          window.open(shareUrl, "_blank", "width=600,height=400");
        }
      }

      // Record the share in backend (except for copy/download operations)
      if (platform !== "copy-image-url" && platform !== "download-image") {
        await sharePost(post._id);
      }

      // Close modal after a short delay for certain platforms
      if (
        platform !== "email" &&
        platform !== "copy-image-url" &&
        platform !== "download-image"
      ) {
        setTimeout(() => {
          onClose();
          setIsSharing(false);
        }, 1000);
      } else {
        setIsSharing(false);
      }
    } catch (error) {
      console.error("Error sharing post:", error);
      setIsSharing(false);
      showNotification("Error sharing post. Please try again.", "error");
    }
  };

  // Notification function
  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    // You can replace this with a proper toast notification library
    if (type === "success") {
      alert(message);
    } else {
      alert(message);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={shareModalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md transform transition-all"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Share Post
            </h3>
            <button
              onClick={onClose}
              disabled={isSharing}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-6 h-6 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Post Preview */}
          <div className="flex items-start space-x-3">
            {postImage && (
              <div className="shrink-0">
                <img
                  src={postImage}
                  alt="Post preview"
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {post.content || "Check out this post"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                By {post.author.name}
                {post.author.username && ` (@${post.author.username})`}
              </p>
            </div>
          </div>
        </div>

        {/* Share Options Grid */}
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* WhatsApp */}
            <ShareButton
              platform="whatsapp"
              label="WhatsApp"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893-.001-3.189-1.262-6.209-3.553-8.485" />
                </svg>
              }
              color="bg-green-500"
              hoverColor="group-hover:bg-green-600"
              onClick={() => handleShare("whatsapp")}
              disabled={isSharing}
            />

            {/* Facebook */}
            <ShareButton
              platform="facebook"
              label="Facebook"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              }
              color="bg-blue-600"
              hoverColor="group-hover:bg-blue-700"
              onClick={() => handleShare("facebook")}
              disabled={isSharing}
            />

            {/* Twitter */}
            <ShareButton
              platform="twitter"
              label="Twitter"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.543l-.047-.02z" />
                </svg>
              }
              color="bg-black"
              hoverColor="group-hover:bg-gray-800"
              onClick={() => handleShare("twitter")}
              disabled={isSharing}
            />

            {/* Instagram */}
            <ShareButton
              platform="instagram"
              label="Instagram"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              }
              color="bg-gradient-to-r from-purple-500 to-pink-500"
              hoverColor="group-hover:from-purple-600 group-hover:to-pink-600"
              onClick={() => handleShare("instagram")}
              disabled={isSharing}
            />

            {/* Copy Link */}
            <ShareButton
              platform="copy"
              label="Copy Link"
              icon={
                <svg
                  className="w-6 h-6 text-white"
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
              }
              color="bg-gray-500"
              hoverColor="group-hover:bg-gray-600"
              onClick={() => handleShare("copy")}
              disabled={isSharing}
            />

            {/* Copy Image URL */}
            {postImage && (
              <ShareButton
                platform="copy-image-url"
                label="Copy Image URL"
                icon={
                  <svg
                    className="w-6 h-6 text-white"
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                }
                color="bg-indigo-500"
                hoverColor="group-hover:bg-indigo-600"
                onClick={() => handleShare("copy-image-url")}
                disabled={isSharing}
              />
            )}

            {/* Download Image */}
            {postImage && (
              <ShareButton
                platform="download-image"
                label="Save Image"
                icon={
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                }
                color="bg-green-500"
                hoverColor="group-hover:bg-green-600"
                onClick={() => handleShare("download-image")}
                disabled={isSharing}
              />
            )}

            {/* Pinterest */}
            <ShareButton
              platform="pinterest"
              label="Pinterest"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.017 12.014 0 12.017 0z" />
                </svg>
              }
              color="bg-red-600"
              hoverColor="group-hover:bg-red-700"
              onClick={() => handleShare("pinterest")}
              disabled={isSharing}
            />

            {/* LinkedIn */}
            <ShareButton
              platform="linkedin"
              label="LinkedIn"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              }
              color="bg-blue-700"
              hoverColor="group-hover:bg-blue-800"
              onClick={() => handleShare("linkedin")}
              disabled={isSharing}
            />

            {/* Telegram */}
            <ShareButton
              platform="telegram"
              label="Telegram"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              }
              color="bg-blue-500"
              hoverColor="group-hover:bg-blue-600"
              onClick={() => handleShare("telegram")}
              disabled={isSharing}
            />

            {/* Gmail */}
            <ShareButton
              platform="email"
              label="Gmail"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-5.727V12.91L12 16.636l-4.636-3.727V21H1.636A1.636 1.636 0 0 1 0 19.364V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.546l6.545-4.906 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                </svg>
              }
              color="bg-red-600"
              hoverColor="group-hover:bg-red-700"
              onClick={() => handleShare("email")}
              disabled={isSharing}
            />
          </div>

          {/* Loading State */}
          {isSharing && (
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Sharing...
              </span>
            </div>
          )}

          {/* Cancel Button */}
          <button
            onClick={onClose}
            disabled={isSharing}
            className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable ShareButton component
interface ShareButtonProps {
  platform: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  onClick: () => void;
  disabled: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  label,
  icon,
  color,
  hoverColor,
  onClick,
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
    aria-label={`Share on ${label}`}
  >
    <div
      className={`w-12 h-12 ${color} rounded-full flex items-center justify-center transition-colors ${hoverColor}`}
    >
      {icon}
    </div>
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
      {label}
    </span>
  </button>
);

export default ShareModal;
