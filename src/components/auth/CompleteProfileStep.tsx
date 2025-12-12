import React, { useState, useRef } from 'react';
import type { CompleteProfileData } from '../../types/auth';
import { FormField } from '../ui/form';
import { Button } from '../ui/button';

interface CompleteProfileStepProps {
  onSubmit: (data: CompleteProfileData) => void;
  loading: boolean;
}

// Available banner colors with Tailwind CSS classes
const BANNER_COLORS = [
  { name: 'Purple', value: 'bg-gradient-to-r from-purple-500 to-purple-700' },
  { name: 'Pink', value: 'bg-gradient-to-r from-pink-500 to-pink-700' },
  { name: 'Blue', value: 'bg-gradient-to-r from-blue-500 to-blue-700' },
  { name: 'Green', value: 'bg-gradient-to-r from-green-500 to-green-700' },
  { name: 'Orange', value: 'bg-gradient-to-r from-orange-500 to-orange-700' },
  { name: 'Teal', value: 'bg-gradient-to-r from-teal-500 to-teal-700' },
  { name: 'Indigo', value: 'bg-gradient-to-r from-indigo-500 to-indigo-700' },
  { name: 'Rose', value: 'bg-gradient-to-r from-rose-500 to-rose-700' },
  { name: 'Sky', value: 'bg-gradient-to-r from-sky-500 to-sky-700' },
  { name: 'Fuchsia', value: 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-700' },
  { name: 'Violet', value: 'bg-gradient-to-r from-violet-500 to-violet-700' },
  { name: 'Amber', value: 'bg-gradient-to-r from-amber-500 to-amber-700' },
];

export const CompleteProfileStep: React.FC<CompleteProfileStepProps> = ({
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<CompleteProfileData>({
    email: '',
    username: '',
    bio: '',
    bannerColor: BANNER_COLORS[0].value,
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log('formData', formData)
  console.log('avatar', avatar)
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowColorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // const file = e.target.files?.[0];
    // if (file) {
    //   setAvatar(file);
    //   const reader = new FileReader();
    //   reader.onloadend = () => setAvatarPreview(reader.result as string);
    //   reader.readAsDataURL(file);
    // }
      if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleBannerColorSelect = (colorValue: string) => {
    setFormData(prev => ({
      ...prev,
      bannerColor: colorValue,
    }));
    setShowColorDropdown(false);
  };

  const handlePreview = () => {
    if (formData.username.trim()) {
      setShowPreview(true);
    }
  };

  const handleEdit = () => {
    setShowPreview(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showPreview) {
      // Final submission
      onSubmit({
        ...formData,
        avatar: avatar || undefined,
      });
    } else {
      // Show preview first
      handlePreview();
    }
  };

  // Render the form for editing
  const renderEditForm = () => (
    <div className="space-y-6">
      {/* Avatar Upload - Compact Version */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-gray-800 shadow-lg">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 bg-linear-to-r from-purple-600 to-pink-600 text-white p-1.5 rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-xs"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <p className="text-sm text-gray-400 mt-2">Upload profile picture</p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Banner Color Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Banner Color
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowColorDropdown(!showColorDropdown)}
              className="w-full px-4 py-3 bg-gray-900/60 backdrop-blur-sm border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 focus:ring-offset-1 transition-all duration-200 outline-none text-white text-left flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-lg ${formData.bannerColor}`} />
                <span className="text-white">
                  {BANNER_COLORS.find(color => color.value === formData.bannerColor)?.name}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showColorDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showColorDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl backdrop-blur-sm max-h-60 overflow-y-auto">
                <div className="p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BANNER_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleBannerColorSelect(color.value)}
                      className={`flex items-center space-x-2 p-3 rounded-lg transition-all duration-200 hover:bg-gray-700/50 ${formData.bannerColor === color.value ? 'bg-gray-700/70 ring-1 ring-purple-500' : ''
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-lg ${color.value}`} />
                      <span className="text-white text-sm font-medium whitespace-nowrap">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <FormField
          label="Username"
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          placeholder="Choose a username"
          disabled={loading}
        />

        <div className="space-y-2">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900/60 backdrop-blur-sm border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 focus:ring-offset-1 transition-all duration-200 outline-none placeholder-gray-500 text-white resize-none"
            placeholder="Tell us about yourself..."
            disabled={loading}
          />
        </div>


      </div>

      {/* Preview Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={!formData.username.trim()}
      >
        Preview Profile
      </Button>
    </div>
  );

  // Render the preview mode
  const renderPreview = () => (
    <div className="space-y-6">
      {/* Profile Preview Card */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 backdrop-blur-sm shadow-2xl">
        {/* Banner */}
        <div className={`h-32 ${formData.bannerColor} transition-all duration-500`} />

        {/* Profile Content */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Avatar */}
            <div className="relative -mt-16 sm:-mt-20">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-gray-800 shadow-xl">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-12 h-12 sm:w-14 sm:h-14" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white mb-2 wrap-break-words">
                {formData.username}
              </h1>
              {formData.bio && (
                <p className="text-gray-300 text-lg leading-relaxed wrap-break-words">
                  {formData.bio}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium">
                  <div className={`w-2 h-2 rounded-full mr-2 ${formData.bannerColor}`} />
                  {BANNER_COLORS.find(color => color.value === formData.bannerColor)?.name} Theme
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth
          onClick={handleEdit}
          disabled={loading}
        >
          Edit Profile
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          {loading ? 'Saving...' : 'Done'}
        </Button>
      </div>

      {/* Quick Info */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Profile Ready!</h3>
        <p className="text-gray-400 text-sm">
          Your profile looks great! Click "Done" to save your profile and start using the platform.
        </p>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {showPreview ? 'Profile Preview' : 'Complete Your Profile'}
        </h2>
        <p className="text-gray-400">
          {showPreview
            ? 'Review your profile before saving'
            : 'Add your personal information to get started'
          }
        </p>
      </div>

      {/* Content */}
      {showPreview ? renderPreview() : renderEditForm()}
    </form>
  );
};