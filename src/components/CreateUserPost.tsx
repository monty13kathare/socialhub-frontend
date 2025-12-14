import { useState, useRef, useCallback, useEffect } from 'react';
import type { User, Post, PrivacyType } from '../types/types';
import { createUserPost } from '../api/userPost';
import { getAllUsers } from '../api/user';
import { X } from 'lucide-react';

interface CreateUserPostProps {
    currentUser: any;
    onPostCreated: (post: Post) => void;
    onCancel: () => void;
}

interface NewPostState {
    content: string;
    type:  'image' | 'code' | 'achievement' | 'poll';
    code: { language: string; code: string };
    poll: { question: string; options: string[] };
    achievement: { title: string; description: string; };
    achievementTagInput: string;
    privacy: PrivacyType;
    location: string | null;
    taggedUsers: any[];
    image: string;
    tags: string[];
}

interface TagUserSearchResult {
    _id: string;
    name: string;
    avatar?: string;
    username: string;
}

export default function CreateUserPost({ currentUser, onPostCreated, onCancel }: CreateUserPostProps) {
    const [newPost, setNewPost] = useState<NewPostState>({
        content: '',
        image: "",
        type: 'image',
        code: { language: 'javascript', code: '' },
        poll: { question: '', options: ['', ''] },
        achievement: { title: '', description: '' },
        achievementTagInput: '',
        privacy: 'public',
        location: '',
        taggedUsers: [],
        tags: []
    });

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTagUsers, setShowTagUsers] = useState(false);
    const [tagUsers, setTagUsers] = useState<any[]>([]);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const [showlocation, setShowlocation] = useState(false);
    const [tagInput, setTagInput] = useState('');

    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userSearchResults, setUserSearchResults] = useState<TagUserSearchResult[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Validation function
    const validatePost = () => {
        const errors: Record<string, string> = {};

        // Basic content validation for all types
        if (!newPost.content.trim() && newPost.type !== 'image') {
            errors.content = 'Content is required';
        }

        // Type-specific validations
        switch (newPost.type) {
            case 'image':
                if (!selectedImage && !imagePreview) {
                    errors.image = 'Image is required for image posts';
                }
                break;
            
            case 'code':
                if (!newPost.code.code.trim()) {
                    errors.code = 'Code content is required';
                }
                break;
            
            case 'poll':
                if (!newPost.poll.question.trim()) {
                    errors.pollQuestion = 'Poll question is required';
                }
                if (newPost.poll.options.some(opt => !opt.trim())) {
                    errors.pollOptions = 'All poll options must be filled';
                }
                if (new Set(newPost.poll.options.map(opt => opt.trim())).size !== newPost.poll.options.length) {
                    errors.pollOptions = 'Poll options must be unique';
                }
                break;
            
            case 'achievement':
                if (!newPost.achievement.title.trim()) {
                    errors.achievementTitle = 'Achievement title is required';
                }
                if (!newPost.achievement.description.trim()) {
                    errors.achievementDescription = 'Achievement description is required';
                }
                break;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Image Upload Handler
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setSelectedImage(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target?.result as string;
            setImagePreview(imageData);
            setNewPost(prev => ({
                ...prev,
                image: imageData
            }));
            
            // Clear image validation error when image is selected
            if (validationErrors.image) {
                setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.image;
                    return newErrors;
                });
            }
        };
        reader.readAsDataURL(file);
    };

    // Remove Image Handler
    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setNewPost(prev => ({
            ...prev,
            image: ""
        }));
    };

    // Link Attachment Handler
    const handleAttachLink = () => {
        if (!linkUrl.trim()) {
            setShowLinkInput(false);
            return;
        }

        try {
            new URL(linkUrl);
        } catch {
            alert('Please enter a valid URL');
            return;
        }

        setNewPost(prev => ({
            ...prev,
            content: prev.content + `\n🔗 ${linkUrl}`
        }));

        setLinkUrl('');
        setShowLinkInput(false);
    };

    // User Search with debouncing
    const handleSearchUsers = useCallback(async (query: string) => {
        if (!query.trim()) {
            setUserSearchResults([]);
            return;
        }

        setIsSearchingUsers(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const filteredUsers = tagUsers?.filter(user =>
                user.name?.toLowerCase()?.includes(query?.toLowerCase()) ||
                user?.username?.toLowerCase()?.includes(query?.toLowerCase())
            );
            setUserSearchResults(filteredUsers?.slice(0, 5));
        } catch (error) {
            console.error('Error searching users:', error);
            setUserSearchResults([]);
        } finally {
            setIsSearchingUsers(false);
        }
    }, [tagUsers]);

    const handleTagUser = (user: TagUserSearchResult) => {
        if (!newPost.taggedUsers?.find(u => u._id === user._id)) {
            setNewPost(prev => ({
                ...prev,
                taggedUsers: [...prev.taggedUsers, user as User]
            }));
        }
        setUserSearchQuery('');
        setUserSearchResults([]);
        setShowTagUsers(false);
    };

    const handleRemoveTaggedUser = (userId: string) => {
        setNewPost(prev => ({
            ...prev,
            taggedUsers: prev.taggedUsers.filter(user => user._id !== userId)
        }));
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
            
            // Clear validation errors when removing options
            if (validationErrors.pollOptions) {
                setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.pollOptions;
                    return newErrors;
                });
            }
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
        
        // Clear validation errors when user starts typing
        if (validationErrors.pollOptions) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.pollOptions;
                return newErrors;
            });
        }
    };

    // Tag Handlers
    const handleAddTag = () => {
        if (tagInput.trim() && !newPost.tags.includes(tagInput.trim())) {
            setNewPost(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setNewPost(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    // Main Post Creation Handler
    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate before submitting
        if (!validatePost()) {
            alert("Please fill all required fields correctly.");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("content", newPost.content);
            formData.append("type", newPost.type);
            formData.append("author", currentUser._id);
            formData.append("privacy", newPost.privacy);

            if (newPost.tags && newPost.tags.length > 0) {
                formData.append("tags", JSON.stringify(newPost.tags));
            }
            if (selectedImage) formData.append("image", selectedImage);
            if (newPost.location) formData.append("location", newPost.location);
            if (newPost.taggedUsers.length > 0) {
                formData.append("taggedUsers", JSON.stringify(newPost.taggedUsers.map(u => u._id)));
            }

            if (newPost.type === "code") {
                formData.append("code", JSON.stringify(newPost.code));
            }
            
             if (newPost.type === "achievement") {
                formData.append("achievement", JSON.stringify(newPost.achievement));
            }

            if (newPost.type === "poll") {
                formData.append("poll", JSON.stringify(newPost.poll));
            }

           

            const response = await createUserPost(formData);
            onPostCreated(response?.data?.post)
            handleCancel();
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
            image: '',
            tags: [],
            type: 'image',
            code: { language: 'javascript', code: '' },
            poll: { question: '', options: ['', ''] },
            achievement: { title: '', description: '' },
            achievementTagInput: '',
            privacy: 'public',
            location: "",
            taggedUsers: []
        });
        setSelectedImage(null);
        setImagePreview(null);
        setLinkUrl('');
        setShowLinkInput(false);
        setShowTagUsers(false);
        setUserSearchQuery('');
        setUserSearchResults([]);
        setValidationErrors({});
        onCancel();
    };

    const handleLocationInputChange = useCallback((value: string) => {
        setNewPost(prev => ({ ...prev, location: value }));
    }, []);

    // Clear validation errors when content changes
    const handleContentChange = (content: string) => {
        setNewPost(prev => ({ ...prev, content }));
        if (validationErrors.content) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.content;
                return newErrors;
            });
        }
    };

    // Clear validation errors when post type changes
    const handlePostTypeChange = (type: NewPostState['type']) => {
        setNewPost(prev => ({ ...prev, type }));
        setValidationErrors({}); // Clear all validation errors when type changes
    };

    // Clear specific validation errors when fields change
    const handleCodeChange = (code: string) => {
        setNewPost(prev => ({ ...prev, code: { ...prev.code, code } }));
        if (validationErrors.code) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.code;
                return newErrors;
            });
        }
    };

    const handlePollQuestionChange = (question: string) => {
        setNewPost(prev => ({ ...prev, poll: { ...prev.poll, question } }));
        if (validationErrors.pollQuestion) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.pollQuestion;
                return newErrors;
            });
        }
    };

    const handleAchievementTitleChange = (title: string) => {
        setNewPost(prev => ({ ...prev, achievement: { ...prev.achievement, title } }));
        if (validationErrors.achievementTitle) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.achievementTitle;
                return newErrors;
            });
        }
    };

    const handleAchievementDescriptionChange = (description: string) => {
        setNewPost(prev => ({ ...prev, achievement: { ...prev.achievement, description } }));
        if (validationErrors.achievementDescription) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.achievementDescription;
                return newErrors;
            });
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
    }, [showTagUsers]);

    // Helper function to get post type options
    const getPostTypeOptions = () => [
        { type: 'image', label: 'Image', icon: '🖼️' },
        { type: 'code', label: 'Code', icon: '💻' },
        { type: 'achievement', label: 'Achievement', icon: '🎉' },
        { type: 'poll', label: 'Poll', icon: '📊' }
    ];

    const privacyOptions: { value: PrivacyType; label: string; icon: string }[] = [
        { value: 'public', label: 'Public', icon: '🌍' },
        { value: 'friends', label: 'Friends', icon: '👥' },
        { value: 'private', label: 'Private', icon: '🔒' }
    ];

    // Check if form can be submitted
    const canSubmit = () => {
        switch (newPost.type) {
            case 'image':
                return !!selectedImage || !!imagePreview;
            case 'code':
                return !!newPost.code.code.trim();
            case 'poll':
                return !!newPost.poll.question.trim() && 
                       newPost.poll.options.every(opt => !!opt.trim()) &&
                       new Set(newPost.poll.options.map(opt => opt.trim())).size === newPost.poll.options.length;
            case 'achievement':
                return !!newPost.achievement.title.trim() && !!newPost.achievement.description.trim();
            default:
                return !!newPost.content.trim();
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-4 md:p-6 mb-6 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-800 dark:text-white font-semibold text-lg">Create Post</h3>
                <button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors duration-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg disabled:opacity-50"
                >
                    {/* ✕ */}
                    <X/>
                </button>
            </div>

            {/* Author Info */}
            <div className="flex items-center space-x-3 mb-4">
                <img
                    src={currentUser.avatar || '/default-avatar.png'}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                />
                <div>
                    <p className="text-slate-800 dark:text-white font-medium">{currentUser.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                        <select
                            value={newPost.privacy}
                            onChange={(e) => setNewPost(prev => ({ ...prev, privacy: e.target.value as PrivacyType }))}
                            disabled={isSubmitting}
                            className="text-xs bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-1 px-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                        >
                            {privacyOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.icon} {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <form onSubmit={handleCreatePost}>
                {/* Post Type Selection */}
                <div className="flex overflow-x-auto gap-2 mb-4 pb-2 scrollbar-hide">
                    {getPostTypeOptions().map((item) => (
                        <button
                            key={item.type}
                            type="button"
                            onClick={() => handlePostTypeChange(item.type as any)}
                            disabled={isSubmitting}
                            className={`shrink-0 flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 ${newPost.type === item.type
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <span className="text-sm">{item.icon}</span>
                            <span className="text-sm whitespace-nowrap">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Validation Errors Summary */}
                {Object.keys(validationErrors).length > 0 && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
                        <p className="text-red-700 dark:text-red-300 text-sm font-medium mb-1">
                            Please fix the following errors:
                        </p>
                        <ul className="text-red-600 dark:text-red-400 text-sm list-disc list-inside">
                            {Object.values(validationErrors).map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Main Content */}
                    <div className="mb-4">
                        <textarea
                            value={newPost.content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            placeholder={
                                newPost.type === 'code' ? 'Describe your code...' :
                                newPost.type === 'achievement' ? 'Share your achievement...' :
                                newPost.type === 'poll' ? 'Ask your poll question...' :
                                `What's on your mind, ${currentUser.name.split(' ')[0]}?`
                            }
                            rows={4}
                            disabled={isSubmitting}
                            className={`w-full bg-slate-800/30 border rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 resize-none disabled:opacity-50 ${
                                validationErrors.content 
                                    ? 'border-red-500 dark:border-red-400' 
                                    : 'border-slate-300 dark:border-slate-700/50'
                            }`}
                        />
                        {validationErrors.content && (
                            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{validationErrors.content}</p>
                        )}
                    </div>

                {/* Image Preview and Link Input Section */}
                <div className="space-y-4 mb-4">
                    {/* Image Upload Section - Required for image type */}
                    {newPost.type === 'image' && (
                        <div className="mb-4">
                            <label className="block text-slate-700 dark:text-white text-sm font-medium mb-2">
                                Image <span className="text-red-500">*</span>
                            </label>
                            {!imagePreview ? (
                                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                                    validationErrors.image 
                                        ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20' 
                                        : 'border-slate-300 dark:border-slate-600 hover:border-purple-500 dark:hover:border-purple-400'
                                }`}>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={isSubmitting}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                        disabled={isSubmitting}
                                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors duration-200 disabled:opacity-50"
                                    >
                                        <div className="text-4xl mb-2">📷</div>
                                        <p className="text-sm">Click to upload an image</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Post preview"
                                        className="rounded-xl max-h-64 object-cover w-full border border-slate-300 dark:border-slate-700/50"
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
                            {validationErrors.image && (
                                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{validationErrors.image}</p>
                            )}
                        </div>
                    )}

                    {/* Optional image upload for other types */}
                    {newPost.type !== 'image' && imagePreview && (
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Post preview"
                                className="rounded-xl max-h-64 object-cover w-full border border-slate-300 dark:border-slate-700/50"
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
                                className="flex-1 bg-white dark:bg-slate-800/30 border border-slate-300 dark:border-slate-700/50 rounded-xl py-2 px-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAttachLink())}
                            />
                            <button
                                type="button"
                                onClick={handleAttachLink}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-white transition-all duration-200 disabled:opacity-50"
                            >
                                Attach
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowLinkInput(false)}
                                disabled={isSubmitting}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors duration-200 disabled:opacity-50"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

              

                {/* Code Block Input */}
                {newPost.type === 'code' && (
                    <div className="mb-4">
                        <label className="block text-slate-700 dark:text-white text-sm font-medium mb-2">
                            Code <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={newPost.code.language}
                            onChange={(e) => setNewPost(prev => ({
                                ...prev,
                                code: { ...prev.code, language: e.target.value }
                            }))}
                            disabled={isSubmitting}
                            className=" bg-slate-800/30 border border-slate-700/50 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 mb-2 disabled:opacity-50"
                        >
                            <option value="javascript"  className='option-dark'>JavaScript</option>
                            <option value="typescript"  className='option-dark'>TypeScript</option>
                            <option value="python"  className='option-dark'>Python</option>
                            <option value="java"  className='option-dark'>Java</option>
                            <option value="cpp"  className='option-dark'>C++</option>
                            <option value="html"  className='option-dark'>HTML</option>
                            <option value="css"  className='option-dark'>CSS</option>
                        </select>
                        <textarea
                            value={newPost.code.code}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            placeholder="Paste your code here..."
                            rows={6}
                            disabled={isSubmitting}
                            className={`w-full bg-slate-900 border rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 resize-none font-mono text-sm disabled:opacity-50 ${
                                validationErrors.code 
                                    ? 'border-red-500 dark:border-red-400' 
                                    : 'border-slate-300 dark:border-slate-700/50'
                            }`}
                        />
                        {validationErrors.code && (
                            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{validationErrors.code}</p>
                        )}
                    </div>
                )}

                {/* Poll Input */}
                {newPost.type === 'poll' && (
                    <div className="mb-4">
                        <label className="block text-slate-700 dark:text-white text-sm font-medium mb-2">
                            Poll Question <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={newPost.poll.question}
                            onChange={(e) => handlePollQuestionChange(e.target.value)}
                            placeholder="Enter your poll question..."
                            disabled={isSubmitting}
                            className={`w-full bg-white dark:bg-slate-800/30 border rounded-xl py-2 px-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 mb-4 disabled:opacity-50 ${
                                validationErrors.pollQuestion 
                                    ? 'border-red-500 dark:border-red-400' 
                                    : 'border-slate-300 dark:border-slate-700/50'
                            }`}
                        />
                        {validationErrors.pollQuestion && (
                            <p className="text-red-500 dark:text-red-400 text-xs -mt-3 mb-3">{validationErrors.pollQuestion}</p>
                        )}

                        <label className="block text-slate-700 dark:text-white text-sm font-medium mb-2">
                            Poll Options <span className="text-red-500">*</span>
                        </label>
                        {newPost.poll.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handlePollOptionChange(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    disabled={isSubmitting}
                                    className={`flex-1 bg-white dark:bg-slate-800/30 border rounded-xl py-2 px-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 disabled:opacity-50 ${
                                        validationErrors.pollOptions 
                                            ? 'border-red-500 dark:border-red-400' 
                                            : 'border-slate-300 dark:border-slate-700/50'
                                    }`}
                                />
                                {newPost.poll.options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePollOption(index)}
                                        disabled={isSubmitting}
                                        className="p-2 text-red-500 hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        {validationErrors.pollOptions && (
                            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{validationErrors.pollOptions}</p>
                        )}
                        {newPost.poll.options.length < 6 && (
                            <button
                                type="button"
                                onClick={handleAddPollOption}
                                disabled={isSubmitting}
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 text-sm flex items-center space-x-1 disabled:opacity-50"
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
                            <label className="block text-slate-700 dark:text-white text-sm font-medium mb-2">
                                Achievement Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={newPost.achievement.title}
                                onChange={(e) => handleAchievementTitleChange(e.target.value)}
                                placeholder="e.g., Launched New Feature"
                                disabled={isSubmitting}
                                className={`w-full bg-white dark:bg-slate-800/30 border rounded-xl py-2 px-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 disabled:opacity-50 ${
                                    validationErrors.achievementTitle 
                                        ? 'border-red-500 dark:border-red-400' 
                                        : 'border-slate-300 dark:border-slate-700/50'
                                }`}
                            />
                            {validationErrors.achievementTitle && (
                                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{validationErrors.achievementTitle}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-slate-700 dark:text-white text-sm font-medium mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={newPost.achievement.description}
                                onChange={(e) => handleAchievementDescriptionChange(e.target.value)}
                                placeholder="Describe your achievement..."
                                rows={3}
                                disabled={isSubmitting}
                                className={`w-full bg-white dark:bg-slate-800/30 border rounded-xl py-2 px-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 resize-none disabled:opacity-50 ${
                                    validationErrors.achievementDescription 
                                        ? 'border-red-500 dark:border-red-400' 
                                        : 'border-slate-300 dark:border-slate-700/50'
                                }`}
                            />
                            {validationErrors.achievementDescription && (
                                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{validationErrors.achievementDescription}</p>
                            )}
                        </div>
                    </div>
                )}

                  {/* Post Tags */}
                <div className='mb-4'>
                    <label className="block text-slate-700 dark:text-white text-sm font-medium mb-2">
                        Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {newPost.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center space-x-1 bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-300 dark:border-purple-500/30"
                            >
                                <span>#{tag}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    disabled={isSubmitting}
                                    className="text-purple-500 dark:text-purple-300 hover:text-purple-700 dark:hover:text-white ml-1 disabled:opacity-50"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            placeholder="Add a tag..."
                            disabled={isSubmitting}
                            className="flex-1 bg-white dark:bg-slate-800/30 border border-slate-300 dark:border-slate-700/50 rounded-xl py-2 px-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={handleAddTag}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-white transition-all duration-200 disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Location Section */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-slate-700 dark:text-white text-sm font-medium">
                            Location
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowlocation(!showlocation)}
                            disabled={isSubmitting}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 disabled:opacity-50"
                        >
                            {showlocation ? 'Cancel' : 'Add Location'}
                        </button>
                    </div>
                    {showlocation && (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={newPost.location || ''}
                                onChange={(e) => handleLocationInputChange(e.target.value)}
                                placeholder="Enter your location..."
                                disabled={isSubmitting}
                                className="w-full bg-white dark:bg-slate-800/30 border border-slate-300 dark:border-slate-700/50 rounded-xl py-2 px-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                            />
                        </div>
                    )}
                </div>

                {/* Tag People Section */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-slate-700 dark:text-white text-sm font-medium">
                            Tag People
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowTagUsers(!showTagUsers)}
                            disabled={isSubmitting}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 disabled:opacity-50"
                        >
                            {showTagUsers ? 'Cancel' : 'Tag People'}
                        </button>
                    </div>

                    {/* Tagged Users Display */}
                    {newPost.taggedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {newPost.taggedUsers.map(user => (
                                <span
                                    key={user._id}
                                    className="inline-flex items-center space-x-1 bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs border border-purple-300 dark:border-purple-500/30"
                                >
                                    <span>@{user.username}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTaggedUser(user._id)}
                                        disabled={isSubmitting}
                                        className="text-purple-500 dark:text-purple-300 hover:text-purple-700 dark:hover:text-white ml-1 disabled:opacity-50"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* User Search */}
                    {showTagUsers && (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={userSearchQuery}
                                onChange={(e) => {
                                    setUserSearchQuery(e.target.value);
                                    handleSearchUsers(e.target.value);
                                }}
                                placeholder="Search users to tag..."
                                disabled={isSubmitting}
                                className="w-full bg-white dark:bg-slate-800/30 border border-slate-300 dark:border-slate-700/50 rounded-xl py-2 px-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                            />
                            {isSearchingUsers && (
                                <div className="text-center text-slate-500 dark:text-slate-400 text-sm">
                                    Searching...
                                </div>
                            )}
                            {userSearchResults.length > 0 && (
                                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                    {userSearchResults.map(user => (
                                        <button
                                            key={user._id}
                                            type="button"
                                            onClick={() => handleTagUser(user)}
                                            className="w-full flex items-center space-x-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-200 border-b border-slate-200 dark:border-slate-700 last:border-b-0"
                                        >
                                            <img
                                                src={user.avatar || '/default-avatar.png'}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <div className="text-left">
                                                <p className="text-slate-800 dark:text-white text-sm font-medium">
                                                    {user.name}
                                                </p>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs">
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

                {/* Form Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-300 dark:border-slate-700/50">
                    <div className="flex space-x-2">
                        {/* Image Upload Button - Only show for non-image types */}
                        {newPost.type !== 'image' && (
                            <div className="relative cursor-pointer p-2 hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isSubmitting}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    id="image-upload-optional"
                                />
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50"
                                    onClick={() => document.getElementById('image-upload-optional')?.click()}
                                >
                                    📷
                                </button>
                            </div>
                        )}

                        {/* Link Attachment Button */}
                        <button
                            type="button"
                            onClick={() => setShowLinkInput(true)}
                            disabled={isSubmitting}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50"
                        >
                            🔗
                        </button>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit() || isSubmitting}
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