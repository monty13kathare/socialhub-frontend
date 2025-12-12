// components/EditCommunityModal.tsx
import { useState, useEffect } from "react";
import { updateCommunity } from "../api/community";
import { BANNER_COLORS, mainCategories } from "../content/data";

interface CommunityForm {
  name: string;
  description: string;
  category: string;
  privacy: "public" | "private" | "restricted";
  tags: string[];
  rules: string[];
  bannerColor: string;
  allowImages: boolean;
  allowVideos: boolean;
  allowLinks: boolean;
  requireApproval: boolean;
}

interface EditCommunityModalProps {
  community: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedCommunity: any) => void;
}

export default function EditCommunityModal({
  community,
  isOpen,
  onClose,
}: EditCommunityModalProps) {
  const [formData, setFormData] = useState<CommunityForm>({
    name: "",
    description: "",
    category: "",
    privacy: "public",
    tags: [],
    rules: [],
    bannerColor: "from-blue-500 to-cyan-500",
    allowImages: true,
    allowVideos: true,
    allowLinks: true,
    requireApproval: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [ruleInput, setRuleInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (community && isOpen) {
      setFormData({
        name: community.name || "",
        description: community.description || "",
        category: community.category || "",
        privacy: community.privacy || "public",
        tags: community.tags || [],
        rules: community.rules || [],
        bannerColor: community.bannerColor || "from-blue-500 to-cyan-500",
        allowImages: community.allowImages ?? true,
        allowVideos: community.allowVideos ?? true,
        allowLinks: community.allowLinks ?? true,
        requireApproval: community.requireApproval ?? false,
      });
    }
  }, [community, isOpen]);

  const handleInputChange = (field: keyof CommunityForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 5) {
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        handleInputChange("tags", [...formData.tags, newTag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleAddRule = () => {
    if (ruleInput.trim() && formData.rules.length < 10) {
      handleInputChange("rules", [...formData.rules, ruleInput.trim()]);
      setRuleInput("");
    }
  };

  const handleRemoveRule = (indexToRemove: number) => {
    handleInputChange(
      "rules",
      formData.rules.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateCommunity(community._id, formData);
      // onUpdate(updatedCommunity);
      window.location.reload();
      onClose();
    } catch (error) {
      console.error("Error updating community:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white">Edit Community</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Basic Information
            </h3>

            {/* Community Name */}
            <div className="mb-4">
              <label className="block text-white font-medium mb-2">
                Community Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter community name"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-white font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Enter community description"
                required
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-white font-medium mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="option-dark">
                  Select a category
                </option>
                {mainCategories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    className="option-dark"
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Privacy Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: "public", label: "Public", desc: "Anyone can join" },
                {
                  value: "restricted",
                  label: "Restricted",
                  desc: "Approve to post",
                },
                { value: "private", label: "Private", desc: "Invite only" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.privacy === option.value
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="privacy"
                    value={option.value}
                    checked={formData.privacy === option.value}
                    onChange={(e) =>
                      handleInputChange("privacy", e.target.value)
                    }
                    className="hidden"
                  />
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-slate-400 text-sm">{option.desc}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-purple-300 hover:text-white"
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
                placeholder="Add a tag"
                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={20}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || formData.tags.length >= 5}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Rules */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Community Rules
            </h3>
            <div className="space-y-2 mb-3">
              {formData.rules.map((rule, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg border border-slate-600"
                >
                  <span className="text-white text-sm">{rule}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(index)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={ruleInput}
                onChange={(e) => setRuleInput(e.target.value)}
                placeholder="Add a rule"
                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={200}
              />
              <button
                type="button"
                onClick={handleAddRule}
                disabled={!ruleInput.trim() || formData.rules.length >= 10}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Banner Color */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Banner Color
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {BANNER_COLORS.slice(0, 8).map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange("bannerColor", color.value)}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    formData.bannerColor === color.value
                      ? "border-purple-500 ring-2 ring-purple-500/50"
                      : "border-slate-600 hover:border-slate-500"
                  } ${color.value}`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col md:flex-row justify-end gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
