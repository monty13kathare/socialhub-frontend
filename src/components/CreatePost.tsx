import { useState } from 'react';
import type {Post, User } from '../types/types';
import { createCommunityPost } from '../api/communityPost';

interface CreatePostProps {
    community: any;
    currentUser: User;
    onPostCreated: (post: Post) => void;
    onCancel: () => void;
}

interface NewPostState {
    content: string;
    type: 'image' | 'code' | 'achievement' | 'poll';
    code: { language: string; code: string };
    poll: { question: string; options: string[] };
    achievement: { title: string; description: string; tags: string[] };
    achievementTagInput: string;
}

export default function CreatePost({ community, currentUser, onPostCreated, onCancel }: CreatePostProps) {
    const [newPost, setNewPost] = useState<NewPostState>({
        content: '',
        type: 'image',
        code: { language: 'javascript', code: '' },
        poll: { question: '', options: ['', ''] },
        achievement: { title: '', description: '', tags: [] },
        achievementTagInput: ''
    });
    console.log('newPost', newPost)

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Image Upload Handler
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            setSelectedImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove Image Handler
    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    // Link Attachment Handler
    const handleAttachLink = () => {
        if (!linkUrl.trim()) {
            setShowLinkInput(false);
            return;
        }

        // Validate URL format
        try {
            new URL(linkUrl);
        } catch {
            alert('Please enter a valid URL');
            return;
        }

        // Add link to post content
        setNewPost(prev => ({
            ...prev,
            content: prev.content + `\n\n🔗 ${linkUrl}`
        }));

        setLinkUrl('');
        setShowLinkInput(false);
    };

    // Poll Option Handlers
    const handleAddPollOption = () => {
        if (newPost.poll.options.length < 6) {
            setNewPost(prev => ({
                ...prev,
                poll: {
                    ...prev.poll,
                    options: [...prev.poll.options, '']
                }
            }));
        }
    };

    const handleRemovePollOption = (index: number) => {
        if (newPost.poll.options.length > 2) {
            setNewPost(prev => ({
                ...prev,
                poll: {
                    ...prev.poll,
                    options: prev.poll.options.filter((_, i) => i !== index)
                }
            }));
        }
    };

    const handlePollOptionChange = (index: number, value: string) => {
        setNewPost(prev => ({
            ...prev,
            poll: {
                ...prev.poll,
                options: prev.poll.options.map((opt, i) => i === index ? value : opt)
            }
        }));
    };

    // Achievement Tag Handlers
    const handleAddAchievementTag = () => {
        if (newPost.achievementTagInput.trim() && !newPost.achievement.tags.includes(newPost.achievementTagInput.trim())) {
            setNewPost(prev => ({
                ...prev,
                achievement: {
                    ...prev.achievement,
                    tags: [...prev.achievement.tags, newPost.achievementTagInput.trim()]
                },
                achievementTagInput: ''
            }));
        }
    };

    const handleRemoveAchievementTag = (tagToRemove: string) => {
        setNewPost(prev => ({
            ...prev,
            achievement: {
                ...prev.achievement,
                tags: prev.achievement.tags.filter(tag => tag !== tagToRemove)
            }
        }));
    };



    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!newPost.content.trim() && !selectedImage) {
                alert("Post cannot be empty!");
                setIsSubmitting(false);
                return;
            }

            // Prepare form data
            const formData = new FormData();
            formData.append("content", newPost.content);
            formData.append("type", newPost.type);
            formData.append("communityId", community?._id); // ✅ Include community ID
            formData.append("author", currentUser?._id); // ✅ Backend expects author/user ID

            // Attach optional data
            if (selectedImage) formData.append("image", selectedImage); // matches backend cloudinary upload

            if (newPost.type === "code") {
                formData.append("code", JSON.stringify(newPost.code));
            }

            if (newPost.type === "poll") {
                formData.append("poll", JSON.stringify(newPost.poll));
            }

            if (newPost.type === "achievement") {
                formData.append("achievement", JSON.stringify(newPost.achievement));
            }

            // ✅ API CALL
            const response = await createCommunityPost(formData);

            console.log("✅ Post created:", response.data);

            // Update UI
            onPostCreated(response.data.post); // assuming backend returns { post }
            handleCancel(); // reset form
        } catch (error: any) {
            console.error("❌ Error creating post:", error);
            alert(error.response?.data?.message || "Failed to create post.");
        } finally {
            setIsSubmitting(false);
        }
    };


    // Reset Form Handler
    const handleCancel = () => {
        setNewPost({
            content: '',
            type: 'image',
            code: { language: 'javascript', code: '' },
            poll: { question: '', options: ['', ''] },
            achievement: { title: '', description: '', tags: [] },
            achievementTagInput: ''
        });
        setSelectedImage(null);
        setImagePreview(null);
        setLinkUrl('');
        setShowLinkInput(false);
        onCancel();
    };

    // Helper function to get post type options
    const getPostTypeOptions = () => [
        { type: 'image', label: 'Image', icon: '🖼️' },
        { type: 'code', label: 'Code', icon: '💻' },
        { type: 'achievement', label: 'Achievement', icon: '🎉' },
        { type: 'poll', label: 'Poll', icon: '📊' }
    ];

    return (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Create Post in {community.name}</h3>
                <button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="text-slate-400 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-700/50 rounded-lg disabled:opacity-50"
                >
                    ✕
                </button>
            </div>

            <form onSubmit={handleCreatePost}>
                {/* Post Type Selection */}
               <div className="flex flex-wrap gap-2 mb-4">
    {getPostTypeOptions().map((item) => {
        // Determine if this specific post type is allowed in the community
        const isAllowed = community[`allow${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`];
        
        return (
            <button
                key={item.type}
                type="button"
                onClick={() => setNewPost(prev => ({ ...prev, type: item.type as any }))}
                disabled={isSubmitting || !isAllowed}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${newPost.type === item.type
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
            </button>
        );
    })}
</div>

                {/* Main Content */}
                <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder={
                        newPost.type === 'code' ? 'Describe your code...' :
                                newPost.type === 'achievement' ? 'Share your achievement...' :
                                    newPost.type === 'poll' ? 'Ask your poll question...' :
                                        'Share your thoughts...'
                    }
                    rows={4}
                    disabled={isSubmitting}
                    className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 resize-none mb-4 disabled:opacity-50"
                />

                {/* Image Preview and Link Input Section */}
                <div className="space-y-4 mb-4">
                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Post preview"
                                className="rounded-xl max-h-64 object-cover w-full border border-slate-700/50"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                disabled={isSubmitting}
                                className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-all duration-200 disabled:opacity-50"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Link Input */}
                    {showLinkInput && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="Paste your link here..."
                                disabled={isSubmitting}
                                className="flex-1 bg-slate-800/30 border border-slate-700/50 rounded-xl py-2 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAttachLink())}
                            />
                            <button
                                type="button"
                                onClick={handleAttachLink}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 hover:text-white transition-all duration-200 disabled:opacity-50"
                            >
                                Attach
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowLinkInput(false)}
                                disabled={isSubmitting}
                                className="p-2 text-slate-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

                {/* Code Block Input */}
                {newPost.type === 'code' && (
                    <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-2">
                            Code
                        </label>
                        <select
                            value={newPost.code.language}
                            onChange={(e) => setNewPost(prev => ({
                                ...prev,
                                code: { ...prev.code, language: e.target.value }
                            }))}
                            disabled={isSubmitting}
                            className="bg-slate-800/30 border border-slate-700/50 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 mb-2 disabled:opacity-50"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="cpp">HTML</option>
                            <option value="cpp">CSS</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                        </select>
                        <textarea
                            value={newPost.code.code}
                            onChange={(e) => setNewPost(prev => ({
                                ...prev,
                                code: { ...prev.code, code: e.target.value }
                            }))}
                            placeholder="Paste your code here..."
                            rows={6}
                            disabled={isSubmitting}
                            className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 resize-none font-mono text-sm disabled:opacity-50"
                        />
                    </div>
                )}

                {/* Poll Input */}
                {newPost.type === 'poll' && (
                    <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-2">
                            Poll Question
                        </label>
                        <input
                            type="text"
                            value={newPost.poll.question}
                            onChange={(e) => setNewPost(prev => ({
                                ...prev,
                                poll: { ...prev.poll, question: e.target.value }
                            }))}
                            placeholder="Enter your poll question..."
                            disabled={isSubmitting}
                            className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl py-2 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 mb-4 disabled:opacity-50"
                        />
                        <label className="block text-white text-sm font-medium mb-2">
                            Poll Options
                        </label>
                        {newPost.poll.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handlePollOptionChange(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-slate-800/30 border border-slate-700/50 rounded-xl py-2 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                                />
                                {newPost.poll.options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePollOption(index)}
                                        disabled={isSubmitting}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        {newPost.poll.options.length < 6 && (
                            <button
                                type="button"
                                onClick={handleAddPollOption}
                                disabled={isSubmitting}
                                className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1 disabled:opacity-50"
                            >
                                <span>+</span>
                                <span>Add Option</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Achievement Input */}
                {newPost.type === 'achievement' && (
                    <div className="mb-4 space-y-4">
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                Achievement Title
                            </label>
                            <input
                                type="text"
                                value={newPost.achievement.title}
                                onChange={(e) => setNewPost(prev => ({
                                    ...prev,
                                    achievement: { ...prev.achievement, title: e.target.value }
                                }))}
                                placeholder="e.g., Launched New Feature"
                                disabled={isSubmitting}
                                className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl py-2 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                Description
                            </label>
                            <textarea
                                value={newPost.achievement.description}
                                onChange={(e) => setNewPost(prev => ({
                                    ...prev,
                                    achievement: { ...prev.achievement, description: e.target.value }
                                }))}
                                placeholder="Describe your achievement..."
                                rows={3}
                                disabled={isSubmitting}
                                className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl py-2 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 resize-none disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {newPost.achievement.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center space-x-1 bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30"
                                    >
                                        <span>#{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAchievementTag(tag)}
                                            disabled={isSubmitting}
                                            className="text-purple-300 hover:text-white ml-1 disabled:opacity-50"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newPost.achievementTagInput}
                                    onChange={(e) => setNewPost(prev => ({ ...prev, achievementTagInput: e.target.value }))}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievementTag())}
                                    placeholder="Add a tag..."
                                    disabled={isSubmitting}
                                    className="flex-1 bg-slate-800/30 border border-slate-700/50 rounded-xl py-2 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddAchievementTag}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 hover:text-white transition-all duration-200 disabled:opacity-50"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                    <div className="flex space-x-2">
                        {/* Image Upload Button */}
                        {community.allowImage && (
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isSubmitting}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    id="image-upload"
                                />
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                >
                                    📷
                                </button>
                            </div>
                        )}

                        {/* Link Attachment Button */}
                        {community.allowLink && (
                            <button
                                type="button"
                                onClick={() => setShowLinkInput(true)}
                                disabled={isSubmitting}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50"
                            >
                                🔗
                            </button>
                        )}

                       
                    </div>
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={(!newPost.content.trim() && !selectedImage) || isSubmitting}
                            className="px-6 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isSubmitting && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            )}
                            <span>{isSubmitting ? 'Publishing...' : 'Publish Post'}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}