import React, { useState, useRef, useEffect } from 'react';
import { getAllUsers } from '../api/user';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  onSave: (postId: string, updates: Partial<any>) => void;
  onCancel: () => void;
}

interface User {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  post,
  onSave,
  onCancel
}) => {
  const [editedContent, setEditedContent] = useState(post.content);
  const [taggedUsers, setTaggedUsers] = useState<User[]>(post.taggedUsers || []);
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [newTag, setNewTag] = useState('');
  const [showTagPeople, setShowTagPeople] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [privacy, setPrivacy] = useState(post.privacy || 'public');
  const [location, setLocation] = useState(post.location || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [tagUsers, setTagUsers] = useState<any[]>([]);

  const tagInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

console.log('taggedUsers', taggedUsers)

  const filteredUsers = tagUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(tagSearch.toLowerCase()) ||
      user.username.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // Reset form when post changes
  useEffect(() => {
    if (isOpen) {
      setEditedContent(post.content);
      setTaggedUsers(post.taggedUsers || []);
      setTags(post.tags || []);
      setPrivacy(post.privacy || 'public');
      setLocation(post.location || '');
    }
  }, [isOpen, post]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSave = async () => {
    if (!editedContent.trim()) return;

    setIsSubmitting(true);
    try {
      const updates: Partial<any> = {
        content: editedContent,
        taggedUsers,
        tags,
        privacy,
        location: location || undefined
      };

      await onSave(post._id, updates);
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    
    // Reset form
    setEditedContent(post.content);
    setTaggedUsers(post.taggedUsers || []);
    setTags(post.tags || []);
    setPrivacy(post.privacy || 'public');
    setLocation(post.location || '');
    setShowTagPeople(false);
    setTagSearch('');
    
    onCancel();
  };

  const handleTagUser = (user: User) => {
    if (!taggedUsers.find(u => u._id === user._id)) {
      setTaggedUsers([...taggedUsers, user]);
    }
    setTagSearch('');
    tagInputRef.current?.focus();
  };

  const handleRemoveTag = (userId: string) => {
    setTaggedUsers(taggedUsers.filter(user => user._id !== userId));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemovePostTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showTagPeople && tagSearch) {
        // Add first filtered user if available
        if (filteredUsers.length > 0) {
          handleTagUser(filteredUsers[0]);
        }
      } else if (newTag.trim()) {
        handleAddTag();
      } else {
        handleSave();
      }
    }
  };

   // Fetch users from API
      useEffect(() => {
          const fetchUsers = async () => {
              try {
                  const res = await getAllUsers();
                  if (res.data && Array.isArray(res.data)) {
                      setTagUsers(res.data);
                  }
              } catch (error) {
                  console.error('Error fetching users:', error);
              }
          };
  
          fetchUsers();
      }, [showTagPeople]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60  flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-fit overflow-hidden shadow-xl transform transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white">
            Edit Post
          </h2>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-5 custom-scrollbar flex flex-col gap-4">
          {/* Privacy and Location Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Privacy
              </label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="w-full bg-slate-800/30 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 resize-none disabled:opacity-50"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location..."
                className="w-full bg-slate-800/30 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 resize-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Post Content
            </label>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-slate-800/30 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 resize-none disabled:opacity-50"
              placeholder="What's on your mind?"
            />
          </div>

          {/* Tag People Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tag People
              </label>
              <button
                type="button"
                onClick={() => setShowTagPeople(!showTagPeople)}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                {showTagPeople ? 'Hide' : 'Tag People'}
              </button>
            </div>

            {/* Tagged Users Display */}
            {taggedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {taggedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center space-x-1 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full"
                  >
                    <img
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                      {user.username}
                    </span>
                    <button
                      onClick={() => handleRemoveTag(user._id)}
                      className="text-purple-500 hover:text-purple-700 ml-1 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showTagPeople && (
              <div className="space-y-3">
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="Search users to tag..."
                  className="w-full bg-slate-800/30 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 resize-none disabled:opacity-50"
                />

                {tagSearch && filteredUsers.length > 0 && (
                  <div className="max-h-32 overflow-y-auto border border-slate-600 rounded-lg bg-slate-900/60">
                    {filteredUsers.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => handleTagUser(user)}
                        className="w-full p-2 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center space-x-2 text-left"
                      >
                        <img
                          src={user.avatar || '/default-avatar.png'}
                          alt={user.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
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

          {/* Tags Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full"
                >
                  <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                    #{tag}
                  </span>
                  <button
                    onClick={() => handleRemovePostTag(tag)}
                    className="text-purple-500 hover:text-purple-700 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag..."
                className="w-full bg-slate-800/30 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 resize-none disabled:opacity-50"
              />
              <button
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

         
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between space-x-3 p-5 border-t border-slate-700 bg-slate-900">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!editedContent.trim() || isSubmitting}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
          >
            {isSubmitting && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;