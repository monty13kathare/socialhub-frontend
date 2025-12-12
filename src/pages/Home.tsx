import { useState, useEffect, useRef } from "react";
import CreateUserPost from "../components/CreateUserPost";
import { getUser } from "../utils/userStorage";
import {
  deletePost,
  getAllPosts,
  toggleLike,
  updatePost,
} from "../api/userPost";
import Post from "../components/card/Post";
import type { UserPost } from "../types/userPost";
import { addComment } from "../api/post";
import DeleteModal from "../model/DeleteModal";

export default function HomeFeed() {
  const [posts, setPosts] = useState<any[]>([]);
const [cursor, setCursor] = useState(null);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    postId: string | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    postId: null,
    isLoading: false,
  });

  // Open delete modal
  const handleDeleteClick = (postId: string) => {
    setDeleteModal({
      isOpen: true,
      postId,
      isLoading: false,
    });
  };

  // Close delete modal
  const handleCloseModal = () => {
    if (!deleteModal.isLoading) {
      setDeleteModal({
        isOpen: false,
        postId: null,
        isLoading: false,
      });
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteModal.postId) return;

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      await deletePost(deleteModal.postId);
      setPosts((prev) =>
        prev.filter((post) => post._id !== deleteModal.postId)
      );

      // Close modal after successful deletion
      setDeleteModal({
        isOpen: false,
        postId: null,
        isLoading: false,
      });
    } catch (err) {
      console.error("Error deleting post:", err);
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const currentUser = getUser();



  const fetchPosts = async () => {
  if (loading || !hasMore) return;

  setLoading(true);

  try {
    const res = await getAllPosts(2, cursor);
    const newPosts = res.data.posts;

    // Prevent duplicates by filtering out posts already in state
    setPosts(prev => {
      const ids = new Set(prev.map(p => p._id));
      const filteredPosts = newPosts.filter((p:any) => !ids.has(p._id));
      return [...prev, ...filteredPosts];
    });

    setCursor(res.data.nextCursor);
    setHasMore(res.data.hasMore);
  } catch (error) {
    console.error("Error fetching posts:", error);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  fetchPosts();
}, []);


const loadMoreRef = useRef(null);

useEffect(() => {
  if (!loadMoreRef.current) return;

  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchPosts();
      }
    },
    { threshold: 1 }
  );

  observer.observe(loadMoreRef.current);

  return () => observer.disconnect();
}, [loadMoreRef, hasMore, loading]);



  const handlePostCreated = (newPost: any) => {
    console.log("New post created:", newPost);
    setPosts((prev) => [newPost, ...prev]);
    setShowCreatePost(false);
  };

  const handleCancelPost = () => {
    setShowCreatePost(false);
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await toggleLike(postId);
      const updatedPost = res.data?.post;

      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleComment = async (postId: string, text: string) => {
    try {
      const res = await addComment(postId, text);
      const updatedPost = res.data?.post;

      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // ✅ Update post (title/content etc.)
  const handleUpdate = async (postId: string, updates: Partial<UserPost>) => {
    try {
      const res = await updatePost(postId, updates);
      const updatedPost = res.data?.post;

      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex space-x-4">
        <div className="flex-1 w-full mt-4">
          {/* Create Post Trigger Button */}
          {!showCreatePost && (
            <div
              onClick={() => setShowCreatePost(true)}
              className="bg-white dark:bg-slate-800/50 rounded-2xl p-4  shadow-lg border border-slate-200 dark:border-slate-700/50 cursor-pointer hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={currentUser?.avatar || "/default-avatar.png"}
                  alt={currentUser?.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                />
                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full py-3 px-4 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  What's on your mind, {currentUser?.name.split(" ")[0]}?
                </div>
              </div>
              <div className="flex-1 flex gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex-wrap">
                <button className="w-fit flex items-center justify-center space-x-2 py-2 px-4 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <span>🖼️</span>
                  <span>Image</span>
                </button>

                <button className="w-fit flex items-center justify-center space-x-2 py-2 px-4 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <span>💻</span>
                  <span>Code</span>
                </button>
                <button className="w-fit flex items-center justify-center space-x-2 py-2 px-4 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <span>📊</span>
                  <span>Poll</span>
                </button>
                <button className="w-fit flex items-center justify-center space-x-2 py-2 px-4 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <span>🎉</span>
                  <span>Achievement</span>
                </button>
              </div>
            </div>
          )}

          {/* Create Post Component */}
          {showCreatePost && (
            <CreateUserPost
              currentUser={currentUser}
              onPostCreated={handlePostCreated}
              onCancel={handleCancelPost}
            />
          )}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Post
           key={post._id + post.createdAt}
            post={post}
            onUpdate={handleUpdate}
            onDelete={handleDeleteClick}
            onLike={handleLike}
            onComment={handleComment}
          />
        ))}

        <div ref={loadMoreRef} style={{ height: "auto" }}>
  {loading && <div className="flex items-center justify-center p-8">
  <div className="relative w-16 h-16">
    <div className="absolute w-full h-full rounded-full border-4 border-dotted border-gray-300 opacity-20"></div>
    <div className="absolute w-full h-full rounded-full border-4 border-dotted border-purple-500 border-t-transparent animate-spin"></div>
  </div>
</div>}
</div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModal.isLoading}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </div>
  );
}
